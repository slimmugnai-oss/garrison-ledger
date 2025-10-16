'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

interface BaseData {
  id: string;
  title: string;
  branch: string;
  state: string;
  city: string;
  url: string;
  lat: number;
  lng: number;
}

const basesData: BaseData[] = [
  { id: 'jblm', title: "Joint Base Lewis-McChord", branch: "Army", state: "WA", city: "Tacoma", url: "https://familymedia.com/article/base-guides-joint-base-lewis-mcchord", lat: 47.11, lng: -122.55 },
  { id: 'fort-carson', title: "Fort Carson", branch: "Army", state: "CO", city: "Colorado Springs", url: "https://familymedia.com/article/base-guides-fort-carson", lat: 38.737, lng: -104.79 },
  { id: 'jbsa', title: "Joint Base San Antonio", branch: "Army", state: "TX", city: "San Antonio", url: "https://familymedia.com/article/base-guides-joint-base-san-antonio", lat: 29.383, lng: -98.613 },
  { id: 'fort-stewart', title: "Fort Stewart", branch: "Army", state: "GA", city: "Hinesville", url: "https://familymedia.com/article/base-guides-fort-stewart", lat: 31.869, lng: -81.613 },
  { id: 'fort-belvoir', title: "Fort Belvoir", branch: "Army", state: "VA", city: "Fairfax County", url: "https://familymedia.com/article/base-guides-fort-belvoir", lat: 38.711, lng: -77.145 },
  { id: 'fort-liberty', title: "Fort Liberty", branch: "Army", state: "NC", city: "Fayetteville", url: "https://familymedia.com/article/base-guides-fort-liberty", lat: 35.141, lng: -79.006 },
  { id: 'fort-cavazos', title: "Fort Cavazos", branch: "Army", state: "TX", city: "Killeen", url: "https://familymedia.com/article/base-guides-fort-cavazos", lat: 31.134, lng: -97.77 },
  { id: 'fort-moore', title: "Fort Moore", branch: "Army", state: "GA", city: "Columbus", url: "https://familymedia.com/article/base-guides-fort-moore", lat: 32.35, lng: -84.97 },
  { id: 'fort-campbell', title: "Fort Campbell", branch: "Army", state: "KY/TN", city: "Hopkinsville/Clarksville", url: "https://familymedia.com/article/base-guides-fort-campbell", lat: 36.653, lng: -87.46 },
  { id: 'fort-drum', title: "Fort Drum", branch: "Army", state: "NY", city: "Watertown", url: "https://familymedia.com/article/base-guides-fort-drum", lat: 44.05, lng: -75.79 },
  { id: 'fort-eisenhower', title: "Fort Eisenhower", branch: "Army", state: "GA", city: "Augusta", url: "https://familymedia.com/article/base-guides-fort-eisenhower", lat: 33.417, lng: -82.141 },
  { id: 'fort-novosel', title: "Fort Novosel", branch: "Army", state: "AL", city: "Dale County", url: "https://familymedia.com/article/base-guides-fort-novosel", lat: 31.319, lng: -85.713 },
  { id: 'fort-johnson', title: "Fort Johnson", branch: "Army", state: "LA", city: "Leesville", url: "https://familymedia.com/article/base-guides-fort-johnson", lat: 31.044, lng: -93.191 },
  { id: 'fort-gregg-adams', title: "Fort Gregg-Adams", branch: "Army", state: "VA", city: "Prince George", url: "https://familymedia.com/article/base-guides-fort-gregg-adams", lat: 37.244, lng: -77.335 },
  { id: 'fort-walker', title: "Fort Walker", branch: "Army", state: "VA", city: "Caroline County", url: "https://familymedia.com/article/base-guides-fort-walker", lat: 38.07, lng: -77.35 },
  { id: 'fort-bliss', title: "Fort Bliss", branch: "Army", state: "TX", city: "El Paso", url: "https://familymedia.com/article/base-guides-fort-bliss", lat: 31.813, lng: -106.42 },
  { id: 'eglin-afb', title: "Eglin AFB", branch: "Air Force", state: "FL", city: "Valparaiso", url: "https://familymedia.com/article/base-guides-eglin-air-force-base", lat: 30.46, lng: -86.55 },
  { id: 'nellis-afb', title: "Nellis AFB", branch: "Air Force", state: "NV", city: "Las Vegas", url: "https://familymedia.com/article/base-guides-nellis-air-force-base", lat: 36.246, lng: -115.033 },
  { id: 'edwards-afb', title: "Edwards AFB", branch: "Air Force", state: "CA", city: "Kern County", url: "https://familymedia.com/article/base-guides-edwards-air-force-base", lat: 34.913, lng: -117.936 },
  { id: 'hill-afb', title: "Hill AFB", branch: "Air Force", state: "UT", city: "Ogden", url: "https://familymedia.com/article/base-guides-hill-air-force-base", lat: 41.125, lng: -111.973 },
  { id: 'travis-afb', title: "Travis AFB", branch: "Air Force", state: "CA", city: "Fairfield", url: "https://familymedia.com/article/base-guides-travis-air-force-base", lat: 38.272, lng: -121.93 },
  { id: 'camp-pendleton', title: "MCB Camp Pendleton", branch: "Marine Corps", state: "CA", city: "Oceanside", url: "https://familymedia.com/article/base-guides-marine-corps-base-camp-pendleton", lat: 33.304, lng: -117.304 },
  { id: 'camp-lejeune', title: "MCB Camp Lejeune", branch: "Marine Corps", state: "NC", city: "Jacksonville", url: "https://familymedia.com/article/base-guides-marine-corps-base-camp-lejeune", lat: 34.639, lng: -77.321 },
  { id: 'mcas-miramar', title: "MCAS Miramar", branch: "Marine Corps", state: "CA", city: "San Diego", url: "https://familymedia.com/article/base-guides-marine-corps-air-station-miramar", lat: 32.868, lng: -117.142 },
  { id: 'ns-norfolk', title: "Naval Station Norfolk", branch: "Navy", state: "VA", city: "Norfolk", url: "https://familymedia.com/article/base-guides-naval-station-norfolk", lat: 36.943, lng: -76.305 },
  { id: 'nb-san-diego', title: "Naval Base San Diego", branch: "Navy", state: "CA", city: "San Diego", url: "https://familymedia.com/article/base-guides-naval-base-san-diego", lat: 32.676, lng: -117.141 },
];

const branchColors = {
  'Army': '#1e293b',
  'Air Force': '#2563eb',
  'Navy': '#1e3a8a',
  'Marine Corps': '#dc2626',
  'Joint': '#059669'
};

const badgeColors = {
  'Army': 'bg-slate-900',
  'Air Force': 'bg-blue-600',
  'Navy': 'bg-blue-800',
  'Marine Corps': 'bg-red-600',
  'Joint': 'bg-emerald-600'
};

export default function BaseMapSelector() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredBases, setFilteredBases] = useState<BaseData[]>(basesData);

  // Filter bases based on branch and search
  useEffect(() => {
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
    
    setFilteredBases(filtered);
  }, [selectedBranch, searchQuery]);

  // Initialize D3 map
  useEffect(() => {
    if (!svgRef.current) return;

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

          // Pin circle
          pinGroup.append('circle')
            .attr('r', 8)
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
              .attr('r', 12);
            
            tooltip
              .transition()
              .duration(200)
              .style('opacity', 1);
          }).on('mouseleave', function() {
            d3.select(this).select('circle')
              .transition()
              .duration(200)
              .attr('r', 8);
            
            tooltip
              .transition()
              .duration(200)
              .style('opacity', 0);
          }).on('click', () => {
            scrollToCard(base.id);
          });
        });
      });
  }, [filteredBases]);

  const scrollToCard = (baseId: string) => {
    const element = document.getElementById(`base-card-${baseId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('ring-4', 'ring-emerald-500');
      setTimeout(() => {
        element.classList.remove('ring-4', 'ring-emerald-500');
      }, 2000);
    }
  };

  return (
    <div className="space-y-12">
      {/* Map Container */}
      <div className="bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-black text-gray-900 mb-4">
            Interactive Base Map
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore 25+ military installations across the United States. Click a base to view details and guide links.
          </p>
        </div>

        <div className="relative mx-auto max-w-6xl">
          <svg
            ref={svgRef}
            className="w-full h-auto block mx-auto"
            viewBox="0 0 960 560"
            preserveAspectRatio="xMidYMid meet"
          />
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col items-center gap-6">
        {/* Branch Filters */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <span className="text-sm font-medium text-slate-600">Filter by Branch:</span>
          {['All', 'Army', 'Air Force', 'Navy', 'Marine Corps', 'Joint'].map(branch => (
            <button
              key={branch}
              onClick={() => setSelectedBranch(branch)}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${
                selectedBranch === branch
                  ? 'bg-slate-800 text-white shadow-lg scale-105'
                  : 'border border-slate-300 bg-white text-gray-700 hover:border-slate-400'
              }`}
            >
              {branch}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-lg">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by base name, state, or city…"
            className="w-full px-6 py-3 border border-slate-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Base Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBases.length > 0 ? (
          filteredBases.map(base => (
            <a
              key={base.id}
              id={`base-card-${base.id}`}
              href={base.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-slate-50 rounded-xl shadow-md p-6 hover:shadow-xl transition-all hover:-translate-y-1 group"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {base.title}
                </h3>
                <span className={`flex-shrink-0 inline-block px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${badgeColors[base.branch as keyof typeof badgeColors]}`}>
                  {base.branch}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500 mb-4">
                {base.city}, {base.state}
              </p>
              <span className="inline-flex items-center text-blue-600 group-hover:text-blue-800 font-semibold transition-colors text-sm">
                View Guide
                <svg className="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </a>
          ))
        ) : (
          <div className="col-span-full text-center text-slate-500 py-12">
            No bases match your search criteria.
          </div>
        )}
      </div>
    </div>
  );
}

