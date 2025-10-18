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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showMobileList, setShowMobileList] = useState<boolean>(false);
  const [comparisonCount, setComparisonCount] = useState<number>(0);

  // Memoized filtered bases for performance
  const filteredBases = useMemo(() => {
    let filtered = basesData;
    
    if (selectedBranch !== 'All') {
      filtered = filtered.filter(base => base.branch === selectedBranch);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(base =>
        base.title.toLowerCase().includes(query) ||
        base.state.toLowerCase().includes(query) ||
        base.city.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [selectedBranch, searchQuery]);

  // Initialize D3 map
  useEffect(() => {
    if (!svgRef.current || showMobileList) return;

    const W = 960;
    const H = 560;
    const svg = d3.select(svgRef.current);
    
    // Clear previous content
    svg.selectAll('*').remove();

    // Fetch US map data
    fetch('https://unpkg.com/us-atlas@3/states-10m.json')
      .then(response => response.json())
      .then((us: any) => {
        // Filter out Alaska (02), Hawaii (15), Puerto Rico (72)
        const featureCollection = topojson.feature(us, us.objects.states) as any;
        const states = featureCollection.features
          .filter((f: any) => !['02', '15', '72'].includes(f.id));
        
        const projection = d3.geoAlbersUsa().fitSize([W, H], {
          type: 'FeatureCollection',
          features: states
        });
        const path = d3.geoPath(projection);

        // Draw states
        svg.selectAll('.state')
          .data(states)
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
            .style('cursor', 'pointer');

          // Pin circle with mobile-optimized size
          pinGroup.append('circle')
            .attr('r', 10) // Increased from 8px to 10px for better mobile tap
            .attr('fill', branchColors[base.branch as keyof typeof branchColors])
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 2)
            .attr('class', 'transition-all hover:scale-150');

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

        {!showMobileList && (
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
          
          {comparisonCount >= 2 && (
            <button
              onClick={() => {
                const comparisonList = getComparisonList();
                const baseIds = comparisonList.map(b => b.baseId).join(',');
                window.open(`/base-guides/compare?bases=${baseIds}`, '_blank');
              }}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Compare Now
            </button>
          )}
        </div>
      )}

      {/* Base Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBases.length > 0 ? (
          filteredBases.map(base => (
            <div
              key={base.id}
              id={`base-card-${base.id}`}
              className="relative bg-slate-50 rounded-xl shadow-md hover:shadow-xl transition-all group"
            >
              {/* Featured Badge */}
              {base.featured && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="inline-flex items-center gap-1 bg-warning-subtle text-warning text-xs font-bold px-2 py-1 rounded-full">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Featured
                  </span>
                </div>
              )}

              {/* Add to Comparison Button */}
              <button
                onClick={(e) => handleAddToComparison(base, e)}
                className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-surface border border-default text-body text-xs font-semibold px-2 py-1 rounded-full hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-700 transition-all shadow-sm"
                title="Add to comparison"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Compare
              </button>

              <a
                href={base.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-6 hover:-translate-y-1 transition-all"
                onMouseDown={() => handleCardClick(base)}
              >
                <div className="flex items-start justify-between mb-2 mt-4">
                  <h3 className="text-xl font-bold text-slate-800 group-hover:text-info transition-colors pr-16">
                    {base.title}
                  </h3>
                  <span className={`flex-shrink-0 inline-block px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${badgeColors[base.branch as keyof typeof badgeColors]}`}>
                    {base.branch}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-500 mb-4">
                  {base.city}, {base.state}
                </p>
                {/* Size indicator */}
                {base.size && (
                  <p className="text-xs text-muted mb-3">
                    Installation Size: <span className="font-semibold">{base.size}</span>
                  </p>
                )}
                <span className="inline-flex items-center text-info group-hover:text-info font-semibold transition-colors text-sm">
                  View Full Guide
                  <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              </a>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <div className="text-center py-16 bg-surface-hover rounded-xl border-2 border-dashed border-default">
              <svg className="mx-auto h-12 w-12 text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-body mb-2">No bases match your search</h3>
              <p className="text-muted mb-4">Try adjusting your filters or search terms</p>
              <button
                onClick={() => {
                  setSelectedBranch('All');
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* OCONUS Bases Section */}
      <div className="mt-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full mb-4">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
            </svg>
            <span className="font-bold text-sm">OCONUS & INTERNATIONAL</span>
          </div>
          <h3 className="text-3xl font-serif font-black text-primary mb-4">
            Overseas Duty Stations
          </h3>
          <p className="text-lg text-body max-w-2xl mx-auto">
            Researching an overseas move? We&apos;re expanding to major OCONUS installations. Check back soon for comprehensive guides!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {oconusBases.map(base => (
            <div
              key={base.id}
              className="block bg-slate-50 rounded-xl shadow-md p-6 opacity-70 cursor-not-allowed relative overflow-hidden"
            >
              {/* Coming Soon Badge */}
              <div className="absolute top-0 right-0">
                <div className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  Coming Soon
                </div>
              </div>

              <div className="flex items-start justify-between mb-2 mt-4">
                <h4 className="text-xl font-bold text-slate-800">
                  {base.title}
                </h4>
                <span className={`flex-shrink-0 inline-block px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${badgeColors[base.branch as keyof typeof badgeColors]}`}>
                  {base.branch}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500 mb-2">
                {base.city}, {base.country}
              </p>
              {base.size && (
                <p className="text-xs text-muted mb-4">
                  Installation Size: <span className="font-semibold">{base.size}</span>
                </p>
              )}
              <div className="inline-flex items-center text-slate-500 font-semibold text-sm">
                Guide In Progress
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
