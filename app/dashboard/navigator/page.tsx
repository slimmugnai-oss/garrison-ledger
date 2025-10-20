/**
 * BASE NAVIGATOR - MAIN PAGE
 * 
 * Select a base to analyze neighborhoods
 */

import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Icon from '@/app/components/ui/Icon';
import Badge from '@/app/components/ui/Badge';
import AnimatedCard from '@/app/components/ui/AnimatedCard';
import bases from '@/lib/data/bases-seed.json';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Base Navigator | Garrison Ledger',
  description: 'Find the best neighborhoods near military bases. Compare schools, housing costs vs BAH, commute times, and weather.',
};

export default async function BaseNavigatorMainPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  // Group bases by region
  const conusBases = bases.filter(b => b.region === 'CONUS');
  const oconusBases = bases.filter(b => b.region === 'OCONUS');

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 font-lora mb-4">
              Base Navigator
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find the best neighborhoods near military bases. Compare schools, housing costs vs BAH, 
              commute times, and weather to make informed decisions.
            </p>
          </div>

          {/* CONUS Bases */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Icon name="MapPin" className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">CONUS Bases</h2>
              <Badge variant="info">{conusBases.length} bases</Badge>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {conusBases.map((base, index) => (
                <AnimatedCard key={base.code} delay={index * 0.05}>
                  <a
                    href={`/dashboard/navigator/${base.code.toLowerCase()}`}
                    className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-blue-300 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {base.name}
                        </h3>
                        <p className="text-sm text-gray-600">{base.code}</p>
                      </div>
                      <Icon name="ArrowRight" className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      {base.state && `${base.state}, `}{base.country}
                    </div>
                    
                    {base.bah && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-500">E-5 BAH</div>
                        <div className="text-sm font-semibold text-green-600">
                          ${base.bah.toLocaleString()}/mo
                        </div>
                      </div>
                    )}
                  </a>
                </AnimatedCard>
              ))}
            </div>
          </div>

          {/* OCONUS Bases */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Icon name="Globe" className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">OCONUS Bases</h2>
              <Badge variant="warning">{oconusBases.length} bases</Badge>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {oconusBases.map((base, index) => (
                <AnimatedCard key={base.code} delay={index * 0.05}>
                  <a
                    href={`/dashboard/navigator/${base.code.toLowerCase()}`}
                    className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-purple-300 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {base.name}
                        </h3>
                        <p className="text-sm text-gray-600">{base.code}</p>
                      </div>
                      <Icon name="ArrowRight" className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      {base.state && `${base.state}, `}{base.country}
                    </div>
                    
                    {base.bah && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-500">E-5 BAH</div>
                        <div className="text-sm font-semibold text-green-600">
                          ${base.bah.toLocaleString()}/mo
                        </div>
                      </div>
                    )}
                  </a>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
