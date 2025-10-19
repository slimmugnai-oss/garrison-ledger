'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { basesData, oconusBases, branchColors, badgeColors, type BaseData } from '@/app/data/bases';
import { trackBaseView, trackBaseSearch, trackFilterUsage, trackGuideClickthrough, addToComparison, getComparisonList } from '@/app/lib/base-analytics';
import { useAuth } from '@clerk/nextjs';

export default function BaseMapSelector() {
  const svgRef = useRef<SVGSVGElement>(null);
  const { userId } = useAuth();
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<'CONUS' | 'OCONUS'>('CONUS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showMobileList, setShowMobileList] = useState<boolean>(false);
  const [comparisonCount, setComparisonCount] = useState<number>(0);
  const [allExpanded, setAllExpanded] = useState<boolean>(true);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // Memoized filtered bases for performance
  const filteredBases = useMemo(() => {
    // Start with region-filtered data
    let filtered = selectedRegion === 'CONUS' ? basesData : oconusBases;
    
    if (selectedBranch !== 'All') {
      filtered = filtered.filter(base => base.branch === selectedBranch);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(base =>
        base.title.toLowerCase().includes(query) ||
        base.state.toLowerCase().includes(query) ||
        base.city.toLowerCase().includes(query) ||
        (base.country && base.country.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [selectedBranch, selectedRegion, searchQuery]);

  // Memoized display bases for List View (filtered by selectedGroup)
  const displayBases = useMemo(() => {
    if (!selectedGroup) return filteredBases;
    
    const groupKey = selectedRegion === 'CONUS' ? 'state' : 'country';
    const filtered = filteredBases.filter(base => {
      const baseValue = base[groupKey];
      return baseValue === selectedGroup;
    });
    
    
    return filtered;
  }, [filteredBases, selectedGroup, selectedRegion]);

  // Initialize D3 map (CONUS only)
  useEffect(() => {
    if (!svgRef.current || showMobileList || selectedRegion === 'OCONUS') return;

    const W = 960;
    const H = 560;
    const svg = d3.select(svgRef.current);
    
    // Clear previous content
    svg.selectAll('*').remove();

    // Fetch US map data
    fetch('https://unpkg.com/us-atlas@3/states-10m.json')
      .then(response => response.json())
      .then((us: any) => {
        // Separate Alaska (02), Hawaii (15), Puerto Rico (72) for insets
        const featureCollection = topojson.feature(us, us.objects.states) as any;
        const contiguousStates = featureCollection.features
          .filter((f: any) => !['02', '15', '72'].includes(f.id));
        const alaska = featureCollection.features.find((f: any) => f.id === '02');
        const hawaii = featureCollection.features.find((f: any) => f.id === '15');
        
        // Projection includes Alaska and Hawaii insets automatically
        const projection = d3.geoAlbersUsa().fitSize([W, H], {
          type: 'FeatureCollection',
          features: featureCollection.features // Use ALL features for proper AlbersUSA projection
        });
        const path = d3.geoPath(projection);

        // Draw all states (AlbersUSA projection handles AK and HI insets)
        svg.selectAll('.state')
          .data(featureCollection.features)
          .join('path')
          .attr('class', 'state')
          .attr('d', path as any)
          .attr('fill', '#f1f5f9')
          .attr('stroke', '#cbd5e1')
          .attr('stroke-width', 1);

        // Draw pins
        const pinsGroup = svg.append('g').attr('id', 'pins');
        
        filteredBases.forEach(base => {
          const coords = projection([base.lng, base.lat]);
          if (!coords) return;

          const pinGroup = pinsGroup.append('g')
            .attr('class', 'pin-group')
            .attr('transform', `translate(${coords[0]}, ${coords[1]})`)
            .style('cursor', 'pointer')
            .on('click', () => {
              // Filter to base's state/country and highlight
              setSelectedGroup(base[selectedRegion === 'CONUS' ? 'state' : 'country'] || null);
              
              setTimeout(() => {
                const cardElement = document.getElementById(`base-card-${base.id}`);
                if (cardElement) {
                  cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  // Flash highlight effect
                  cardElement.classList.add('bg-emerald-100', 'dark:bg-emerald-900/30');
                  setTimeout(() => {
                    cardElement.classList.remove('bg-emerald-100', 'dark:bg-emerald-900/30');
                  }, 2000);
                }
              }, 300);
            });

          // Pin circle with optimized size to prevent overlap
          const circle = pinGroup.append('circle')
            .attr('r', 5) // Base size
            .attr('fill', branchColors[base.branch as keyof typeof branchColors])
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 1.5);

          // Hover effects with D3 transitions (not CSS to prevent sticky state)
          pinGroup
            .on('mouseenter', function() {
              circle.transition().duration(200).attr('r', 10);
            })
            .on('mouseleave', function() {
              circle.transition().duration(200).attr('r', 5);
            });

          // Tooltip group
          const tooltip = pinGroup.append('g')
            .attr('class', 'tooltip')
            .style('opacity', 0)
            .style('pointer-events', 'none');

          const text = tooltip.append('text')
            .attr('y', -18)
            .attr('text-anchor', 'middle')
            .attr('fill', '#1e293b')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .text(base.title);

          const bbox = (text.node() as SVGTextElement).getBBox();
          tooltip.insert('rect', 'text')
            .attr('x', bbox.x - 8)
            .attr('y', bbox.y - 4)
            .attr('width', bbox.width + 16)
            .attr('height', bbox.height + 8)
            .attr('rx', 4)
            .attr('fill', 'white')
            .attr('stroke', '#cbd5e1')
            .attr('stroke-width', 1);

          // Hover interactions
          pinGroup.on('mouseenter', function() {
            d3.select(this).select('circle')
              .transition()
              .duration(200)
              .attr('r', 15); // Increased from 12px
            
            tooltip
              .transition()
              .duration(200)
              .style('opacity', 1);
          }).on('mouseleave', function() {
            d3.select(this).select('circle')
              .transition()
              .duration(200)
              .attr('r', 10);
            
            tooltip
              .transition()
              .duration(200)
              .style('opacity', 0);
          }).on('click', () => {
            scrollToCard(base.id, base.title);
          });
        });
      });
  }, [filteredBases, showMobileList]);

  // Load comparison count
  useEffect(() => {
    const updateCount = () => {
      setComparisonCount(getComparisonList().length);
    };
    
    updateCount();
    window.addEventListener('comparison-updated', updateCount);
    
    return () => window.removeEventListener('comparison-updated', updateCount);
  }, []);

  // Track search with debounce
  useEffect(() => {
    if (!searchQuery) return;
    
    const timer = setTimeout(() => {
      trackBaseSearch(searchQuery, filteredBases.length, userId || undefined);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery, filteredBases.length, userId]);

  const scrollToCard = (baseId: string, baseName: string) => {
    // Track base view
    trackBaseView(baseId, baseName, userId || undefined);
    
    const element = document.getElementById(`base-card-${baseId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('ring-4', 'ring-emerald-500');
      setTimeout(() => {
        element.classList.remove('ring-4', 'ring-emerald-500');
      }, 2000);
    }
  };

  const handleBranchFilter = (branch: string) => {
    setSelectedBranch(branch);
    trackFilterUsage('branch', branch, userId || undefined);
  };

  const handleAddToComparison = (base: BaseData, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const result = addToComparison(base.id, base.title, base.branch);
    if (result.success) {
      setComparisonCount(result.count || 0);
      window.dispatchEvent(new Event('comparison-updated'));
    } else {
      alert(result.message);
    }
  };

  const handleCardClick = (base: BaseData) => {
    trackGuideClickthrough(base.id, base.title, base.url, userId || undefined);
  };

  return (
    <div className="space-y-12">
      {/* Map Container */}
      <div className="bg-surface rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-black text-primary mb-4">
            Interactive Base Map
          </h2>
          <p className="text-lg text-body max-w-2xl mx-auto mb-4">
            Explore {basesData.length}+ military installations across the United States. Click a base to view details and guide links.
          </p>
          {/* Results Count */}
          <p className="text-sm font-medium text-emerald-600">
            {filteredBases.length === basesData.length 
              ? `Showing all ${basesData.length} bases` 
              : `Showing ${filteredBases.length} of ${basesData.length} bases`}
          </p>
        </div>

        {/* Map or Mobile List Toggle */}
        <div className="lg:hidden mb-6 flex justify-center gap-4">
          <button
            onClick={() => setShowMobileList(false)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              !showMobileList 
                ? 'bg-slate-800 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Map View
          </button>
          <button
            onClick={() => setShowMobileList(true)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              showMobileList 
                ? 'bg-slate-800 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            List View
          </button>
        </div>

        {selectedRegion === 'OCONUS' && !showMobileList && (
          <div className="mb-6">
            {/* World Map Visualization */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-8 mb-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 text-center">
                🌍 Worldwide Military Installations ({oconusBases.length} bases)
              </h3>
              
              {/* Interactive World Map with Country Outlines */}
              <div className="relative w-full bg-white dark:bg-slate-800 rounded-xl p-6 mb-6 border-2 border-slate-200 dark:border-slate-700">
                <svg viewBox="0 0 960 500" className="w-full h-auto">
                  {/* Ocean background */}
                  <rect x="0" y="0" width="960" height="500" fill="#bfdbfe" className="dark:fill-slate-900"/>
                  
                  {/* Simplified continental landmasses */}
                  {/* North America */}
                  <path d="M 80,100 L 240,80 L 260,200 L 220,240 L 100,250 L 80,200 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" className="dark:fill-slate-700 dark:stroke-slate-600"/>
                  
                  {/* South America */}
                  <path d="M 200,280 L 220,280 L 240,350 L 230,420 L 210,440 L 190,430 L 180,360 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" className="dark:fill-slate-700 dark:stroke-slate-600"/>
                  
                  {/* Europe */}
                  <path d="M 460,100 L 540,95 L 550,140 L 540,165 L 490,170 L 460,145 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" className="dark:fill-slate-700 dark:stroke-slate-600"/>
                  
                  {/* Africa */}
                  <path d="M 480,180 L 560,180 L 580,250 L 570,340 L 530,360 L 490,340 L 480,250 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" className="dark:fill-slate-700 dark:stroke-slate-600"/>
                  
                  {/* Asia */}
                  <path d="M 560,80 L 700,70 L 780,100 L 840,140 L 850,200 L 820,240 L 760,250 L 680,230 L 600,180 L 560,140 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" className="dark:fill-slate-700 dark:stroke-slate-600"/>
                  
                  {/* Australia */}
                  <path d="M 760,320 L 830,320 L 860,360 L 850,400 L 800,410 L 760,390 L 750,350 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" className="dark:fill-slate-700 dark:stroke-slate-600"/>
                  
                  {/* Plot OCONUS bases as pins with proper projection */}
                  {filteredBases.map(base => {
                    // Equirectangular projection for world map
                    const x = ((base.lng + 180) / 360) * 960;
                    const y = ((90 - base.lat) / 180) * 500;
                    
                    return (
                      <g key={base.id} className="pin-group">
                        <circle
                          cx={x}
                          cy={y}
                          r="7"
                          fill={branchColors[base.branch as keyof typeof branchColors]}
                          stroke="#ffffff"
                          strokeWidth="2"
                          className="cursor-pointer"
                          onMouseOver={(e) => {
                            const circle = e.currentTarget;
                            circle.setAttribute('r', '14');
                            
                            // Show tooltip
                            const tooltip = circle.nextElementSibling;
                            if (tooltip) {
                              tooltip.setAttribute('opacity', '1');
                            }
                          }}
                          onMouseOut={(e) => {
                            const circle = e.currentTarget;
                            circle.setAttribute('r', '7');
                            
                            // Hide tooltip
                            const tooltip = circle.nextElementSibling;
                            if (tooltip) {
                              tooltip.setAttribute('opacity', '0');
                            }
                          }}
                          onClick={() => {
                            // Filter to base's country and highlight
                            setSelectedGroup(base.country || null);
                            
                            setTimeout(() => {
                              const cardElement = document.getElementById(`base-card-${base.id}`);
                              if (cardElement) {
                                cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                cardElement.classList.add('bg-emerald-100', 'dark:bg-emerald-900/30');
                                setTimeout(() => {
                                  cardElement.classList.remove('bg-emerald-100', 'dark:bg-emerald-900/30');
                                }, 2000);
                              }
                            }, 300);
                          }}
                        />
                        
                        {/* Tooltip */}
                        <g opacity="0" style={{ pointerEvents: 'none' }}>
                          <rect
                            x={x - 60}
                            y={y - 35}
                            width="120"
                            height="25"
                            fill="rgba(0, 0, 0, 0.85)"
                            rx="4"
                          />
                          <text
                            x={x}
                            y={y - 17}
                            textAnchor="middle"
                            fill="white"
                            fontSize="11"
                            fontWeight="bold"
                          >
                            {base.title}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </svg>
                
                {/* Legend */}
                <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Click any pin to view base details</span>
                </div>
              </div>
              
              {/* Regional Breakdown Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Europe */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-700">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🇪🇺</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-900 dark:text-blue-300">Europe</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        {oconusBases.filter(b => ['Germany', 'Italy', 'Spain', 'United Kingdom'].includes(b.country || '')).length} bases
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    <li>🇩🇪 Germany ({oconusBases.filter(b => b.country === 'Germany').length})</li>
                    <li>🇮🇹 Italy ({oconusBases.filter(b => b.country === 'Italy').length})</li>
                    <li>🇬🇧 UK ({oconusBases.filter(b => b.country === 'United Kingdom').length})</li>
                    <li>🇪🇸 Spain ({oconusBases.filter(b => b.country === 'Spain').length})</li>
                  </ul>
                </div>

                {/* Asia-Pacific */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-emerald-200 dark:border-emerald-700">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🌏</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-900 dark:text-emerald-300">Asia-Pacific</h4>
                      <p className="text-sm text-emerald-700 dark:text-emerald-400">
                        {oconusBases.filter(b => ['Japan', 'South Korea', 'Guam'].includes(b.country || '')).length} bases
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-emerald-800 dark:text-emerald-200">
                    <li>🇯🇵 Japan ({oconusBases.filter(b => b.country === 'Japan').length})</li>
                    <li>🇰🇷 South Korea ({oconusBases.filter(b => b.country === 'South Korea').length})</li>
                    <li>🇬🇺 Guam ({oconusBases.filter(b => b.country === 'Guam').length})</li>
                  </ul>
                </div>

                {/* Other Regions */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-700">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🌐</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-purple-900 dark:text-purple-300">Other Regions</h4>
                      <p className="text-sm text-purple-700 dark:text-purple-400">
                        {oconusBases.filter(b => !['Germany', 'Italy', 'Spain', 'United Kingdom', 'Japan', 'South Korea', 'Guam'].includes(b.country || '')).length} bases
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
                    <li>🇹🇷 Turkey ({oconusBases.filter(b => b.country === 'Turkey').length})</li>
                    <li>🇬🇱 Greenland ({oconusBases.filter(b => b.country === 'Greenland').length})</li>
                    <li>🏝️ Diego Garcia ({oconusBases.filter(b => b.country === 'British Indian Ocean Territory').length})</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {!showMobileList && selectedRegion === 'CONUS' && (
          <>
            <div className="relative mx-auto max-w-6xl mb-6">
              <svg
                ref={svgRef}
                className="w-full h-auto block mx-auto"
                viewBox="0 0 960 560"
                preserveAspectRatio="xMidYMid meet"
              />
            </div>

            {/* Map Legend */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-subtle">
              <span className="text-sm font-medium text-body">Branch Colors:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-slate-900"></div>
                <span className="text-sm text-body">Army</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-info"></div>
                <span className="text-sm text-body">Air Force</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-info"></div>
                <span className="text-sm text-body">Navy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-danger"></div>
                <span className="text-sm text-body">Marine Corps</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-600"></div>
                <span className="text-sm text-body">Joint</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col items-center gap-6">
        {/* Region Toggle - CONUS vs Worldwide */}
        <div className="w-full">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-sm font-medium text-slate-600 hidden sm:inline">View:</span>
            <div className="inline-flex rounded-xl border-2 border-slate-200 bg-white p-1 shadow-md">
              <button
                onClick={() => setSelectedRegion('CONUS')}
                className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${
                  selectedRegion === 'CONUS'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                🇺🇸 US Bases ({basesData.length})
              </button>
              <button
                onClick={() => setSelectedRegion('OCONUS')}
                className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${
                  selectedRegion === 'OCONUS'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                🌍 Worldwide ({oconusBases.length})
              </button>
            </div>
          </div>
        </div>

        {/* Branch Filters - Responsive */}
        <div className="w-full">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm font-medium text-slate-600 hidden sm:inline">Filter by Branch:</span>
            {['All', 'Army', 'Air Force', 'Navy', 'Marine Corps', 'Joint'].map(branch => (
              <button
                key={branch}
                onClick={() => handleBranchFilter(branch)}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${
                  selectedBranch === branch
                    ? 'bg-slate-800 text-white shadow-lg scale-105'
                    : 'border border-slate-300 bg-white text-gray-700 hover:border-slate-400 hover:shadow-md'
                }`}
              >
                {branch}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-lg">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by base name, state, or city…"
              className="w-full px-6 py-3 pl-12 border border-slate-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-info transition"
            />
            <svg 
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-body"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pro Tip Callout */}
      <div className="bg-info-subtle border-l-4 border-info p-6 rounded-r-xl">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-info flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="font-bold text-blue-900 mb-1">💡 Pro Tip</h4>
            <p className="text-sm text-info">
              Click any base pin on the map to instantly jump to its detailed card below. Use filters to narrow down by military branch, or search by location to find bases near you!
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Counter & Action */}
      {comparisonCount > 0 && (
        <div className="flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-2 bg-emerald-100 border border-emerald-300 text-emerald-800 px-4 py-2 rounded-full shadow-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="font-bold text-sm">
              {comparisonCount} base{comparisonCount > 1 ? 's' : ''} added to comparison
            </span>
          </div>
          
          {/* Comparison feature removed - pending real data integration */}
        </div>
      )}

      {/* Sophisticated Base Browser */}
      {filteredBases.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
          {/* Header with View Toggle */}
          <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 border-b-2 border-slate-200 dark:border-slate-600 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Browse {filteredBases.length} {selectedRegion === 'CONUS' ? 'US' : 'Worldwide'} Bases
              </h3>
            </div>

            {/* Quick Select by Location */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedGroup(null)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  selectedGroup === null
                    ? 'bg-slate-800 text-white'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-50'
                }`}
              >
                All ({filteredBases.length})
              </button>
              {(() => {
                const groupKey = selectedRegion === 'CONUS' ? 'state' : 'country';
                const grouped = filteredBases.reduce((acc, base) => {
                  const key = base[groupKey] || 'Other';
                  if (!acc[key]) acc[key] = 0;
                  acc[key]++;
                  return acc;
                }, {} as Record<string, number>);
                
                return Object.entries(grouped)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .slice(0, 12) // Show top 12 most common
                  .map(([name, count]) => (
                    <button
                      key={name}
                      onClick={() => setSelectedGroup(name)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                        selectedGroup === name
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-emerald-50 hover:border-emerald-500'
                      }`}
                    >
                      <span>{name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        selectedGroup === name
                          ? 'bg-emerald-700'
                          : 'bg-slate-200 dark:bg-slate-600'
                      }`}>
                        {count}
                      </span>
                    </button>
                  ));
              })()}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {/* List view only */}
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-100 dark:bg-slate-700 border-b-2 border-slate-200 dark:border-slate-600">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-bold text-slate-900 dark:text-slate-100">Base Name</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-slate-900 dark:text-slate-100">Branch</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-slate-900 dark:text-slate-100">Location</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-slate-900 dark:text-slate-100">Size</th>
                      <th className="px-4 py-3 text-center text-sm font-bold text-slate-900 dark:text-slate-100">Guide</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
                    {displayBases.map(base => (
                      <tr 
                        key={base.id}
                        id={`base-card-${base.id}`}
                        className="hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 dark:text-slate-100">{base.title}</div>
                          {base.featured && (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">
                              ⭐ Featured
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold text-white ${badgeColors[base.branch as keyof typeof badgeColors]}`}>
                            {base.branch}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                          {base.city}, {base.state}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                          {base.size || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <a
                            href={base.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              if (base.comingSoon) {
                                e.preventDefault();
                              } else {
                                handleCardClick(base);
                              }
                            }}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                              base.comingSoon
                                ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-md'
                            }`}
                          >
                            {base.comingSoon ? 'Coming Soon' : 'View Guide'}
                            {!base.comingSoon && (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            )}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
