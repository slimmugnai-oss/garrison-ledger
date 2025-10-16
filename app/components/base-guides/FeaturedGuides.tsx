'use client';

import { getFeaturedBases, badgeColors } from '@/app/data/bases';

export default function FeaturedGuides() {
  const featuredBases = getFeaturedBases();

  if (featuredBases.length === 0) return null;

  return (
    <div className="mb-16">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full mb-4">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="font-bold text-sm">FEATURED GUIDES</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-serif font-black text-gray-900 mb-4">
          Most Popular Duty Stations
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Get started with comprehensive guides for the most common PCS destinations. Housing insights, school ratings, and local area intel from military families who&apos;ve been there.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {featuredBases.map((base) => (
          <a
            key={base.id}
            href={base.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-gray-200"
          >
            {/* Featured Star Badge */}
            <div className="absolute top-3 right-3 z-10">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>

            {/* Branch Color Bar */}
            <div className={`h-2 ${badgeColors[base.branch as keyof typeof badgeColors]}`}></div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors leading-tight">
                  {base.title}
                </h3>
                <p className="text-sm font-medium text-gray-500">
                  {base.city}, {base.state}
                </p>
              </div>

              {/* Branch Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${badgeColors[base.branch as keyof typeof badgeColors]}`}>
                  {base.branch}
                </span>
                {base.size && (
                  <span className="text-xs font-semibold text-gray-500">
                    {base.size}
                  </span>
                )}
              </div>

              {/* CTA */}
              <div className="flex items-center justify-between text-blue-600 group-hover:text-blue-700 font-semibold text-sm">
                <span>View Guide</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none"></div>
          </a>
        ))}
      </div>

      {/* Divider */}
      <div className="mt-16 flex items-center gap-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">All Installations Below</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </div>
    </div>
  );
}

