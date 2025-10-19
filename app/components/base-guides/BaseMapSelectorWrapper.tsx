'use client';

import dynamic from 'next/dynamic';

// Dynamically import BaseMapSelector with no SSR to prevent build hanging with D3/topojson
const BaseMapSelector = dynamic(() => import('./BaseMapSelector'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading interactive map...</p>
      </div>
    </div>
  )
});

export default function BaseMapSelectorWrapper() {
  return <BaseMapSelector />;
}

