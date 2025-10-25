'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

import AnimatedCard from '../../components/ui/AnimatedCard';
import Icon from '../../components/ui/Icon';
import { badgeColors } from '../../data/bases';
import { removeFromComparison } from '../../lib/base-analytics';

interface BaseComparisonData {
  id: string;
  title: string;
  branch: string;
  state: string;
  city: string;
  size?: string;
  region?: string;
  url: string;
  // Comparison metrics
  bahRates: {
    e5WithDependents: number;
    e5WithoutDependents: number;
    o3WithDependents: number;
    o3WithoutDependents: number;
  };
  housing: {
    onBaseAvailable: boolean;
    waitlistMonths: number;
    offBaseOptions: string[];
    averageRent: number;
  };
  schools: {
    doDeaRating: number;
    publicSchoolRating: number;
    topSchoolDistrict: string;
  };
  lifestyle: {
    commuteTime: string;
    amenities: string[];
    weather: string;
    costOfLiving: number;
  };
  pcs: {
    movingCosts: number;
    popularNeighborhoods: string[];
    militaryFriendly: boolean;
  };
}

// Fetch comparison data from API
const fetchComparisonData = async (baseIds: string[]): Promise<BaseComparisonData[]> => {
  try {
    const response = await fetch(`/api/base-guides/compare?bases=${baseIds.join(',')}`);
    if (!response.ok) throw new Error('Failed to fetch comparison data');
    
    const data = await response.json();
    return data.bases || [];
  } catch {
    return [];
  }
};

export default function BaseComparisonClient({ baseIds }: { baseIds: string[] }) {
  const [comparisonBases, setComparisonBases] = useState<BaseComparisonData[]>([]);
  const [selectedBases, setSelectedBases] = useState<string[]>(baseIds);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load comparison data from API
    const loadComparison = async () => {
      if (selectedBases.length === 0) {
        setLoading(false);
        return;
      }
      
      const bases = await fetchComparisonData(selectedBases);
      setComparisonBases(bases);
      setLoading(false);
    };

    loadComparison();
  }, [selectedBases]);

  const handleRemoveBase = (baseId: string) => {
    removeFromComparison(baseId);
    setSelectedBases(prev => prev.filter(id => id !== baseId));
  };

  const getComparisonScore = (base: BaseComparisonData) => {
    let score = 0;
    
    // BAH rates (higher is better)
    score += (base.bahRates.e5WithDependents / 2000) * 25;
    
    // Housing availability (on-base available is better)
    score += base.housing.onBaseAvailable ? 20 : 10;
    
    // School ratings (higher is better)
    score += (base.schools.doDeaRating / 10) * 20;
    score += (base.schools.publicSchoolRating / 10) * 15;
    
    // Cost of living (lower is better)
    score += Math.max(0, 20 - (base.lifestyle.costOfLiving - 100) / 10);
    
    return Math.round(score);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (comparisonBases.length === 0) {
    return (
      <AnimatedCard delay={0}>
        <div className="text-center py-20">
          <Icon name="MapPin" className="h-16 w-16 text-muted mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-primary mb-4">No Bases Selected</h2>
          <p className="text-body mb-8 max-w-2xl mx-auto">
            Select up to 3 military bases to compare their housing options, BAH rates, school ratings, and PCS considerations.
          </p>
          <Link
            href="/base-guides"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
          >
            <Icon name="Search" className="h-5 w-5" />
            Browse Base Guides
          </Link>
        </div>
      </AnimatedCard>
    );
  }

  return (
    <div className="space-y-8">
      {/* DATA DISCLAIMER - CRITICAL */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-600 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Icon name="AlertTriangle" className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-amber-900 dark:text-amber-300 text-lg mb-2">⚠️ Estimated Data Notice</h3>
            <p className="text-sm text-amber-800 dark:text-amber-200 mb-3 leading-relaxed">
              This comparison tool currently uses <strong>estimated data</strong> based on regional averages and base characteristics. 
              We are actively collecting official data from government sources to provide 100% accurate information.
            </p>
            <div className="space-y-1.5 text-xs text-amber-700 dark:text-amber-300">
              <p><strong>For Official Information:</strong></p>
              <ul className="space-y-1 ml-4">
                <li>• <strong>BAH Rates:</strong> <a href="https://www.defensetravel.dod.mil/site/bahCalc.cfm" target="_blank" rel="noopener" className="underline hover:text-amber-900 dark:hover:text-amber-100">DFAS BAH Calculator</a></li>
                <li>• <strong>School Ratings:</strong> <a href="https://www.greatschools.org" target="_blank" rel="noopener" className="underline hover:text-amber-900 dark:hover:text-amber-100">GreatSchools.org</a> & <a href="https://www.dodea.edu" target="_blank" rel="noopener" className="underline hover:text-amber-900 dark:hover:text-amber-100">DoDEA</a></li>
                <li>• <strong>Housing:</strong> Contact base housing office directly</li>
              </ul>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 font-semibold">
              Always verify information with official base resources before making PCS decisions.
            </p>
          </div>
        </div>
      </div>

      {/* Base Selection Header */}
      <AnimatedCard delay={0}>
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-primary">Compare {comparisonBases.length} Base{comparisonBases.length !== 1 ? 's' : ''}</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">Selected:</span>
              <span className="font-bold text-emerald-600">{comparisonBases.length}/3</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {comparisonBases.map((base) => (
              <div
                key={base.id}
                className="flex items-center gap-2 bg-white border border-emerald-200 rounded-full px-4 py-2"
              >
                <span className={`w-3 h-3 rounded-full ${badgeColors[base.branch as keyof typeof badgeColors]}`}></span>
                <span className="font-medium text-primary">{base.title}</span>
                <button
                  onClick={() => handleRemoveBase(base.id)}
                  className="text-muted hover:text-danger transition-colors"
                >
                  <Icon name="X" className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            {comparisonBases.length < 3 && (
              <Link
                href="/base-guides"
                className="flex items-center gap-2 bg-emerald-600 text-white rounded-full px-4 py-2 hover:bg-emerald-700 transition-colors"
              >
                <Icon name="Plus" className="h-4 w-4" />
                Add Base
              </Link>
            )}
          </div>
        </div>
      </AnimatedCard>

      {/* Overall Comparison Scores */}
      <AnimatedCard delay={100}>
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-primary mb-6">Overall Comparison Score</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {comparisonBases.map((base) => {
              const score = getComparisonScore(base);
              const scoreColor = score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
              const bgColor = score >= 80 ? 'bg-emerald-50' : score >= 60 ? 'bg-yellow-50' : 'bg-red-50';
              
              return (
                <div key={base.id} className={`${bgColor} rounded-xl p-4 text-center`}>
                  <div className={`text-3xl font-black ${scoreColor} mb-2`}>{score}</div>
                  <div className="text-sm font-medium text-primary">{base.title}</div>
                  <div className="text-xs text-muted mt-1">
                    {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Fair'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AnimatedCard>

      {/* BAH Rates Comparison */}
      <AnimatedCard delay={200}>
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
            <Icon name="DollarSign" className="h-6 w-6 text-emerald-600" />
            BAH Rates Comparison
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left py-3 px-4 font-bold text-primary">Base</th>
                  <th className="text-right py-3 px-4 font-bold text-primary">E-5 w/ Dependents</th>
                  <th className="text-right py-3 px-4 font-bold text-primary">E-5 w/o Dependents</th>
                  <th className="text-right py-3 px-4 font-bold text-primary">O-3 w/ Dependents</th>
                  <th className="text-right py-3 px-4 font-bold text-primary">O-3 w/o Dependents</th>
                </tr>
              </thead>
              <tbody>
                {comparisonBases.map((base) => (
                  <tr key={base.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${badgeColors[base.branch as keyof typeof badgeColors]}`}></span>
                        <span className="font-medium text-primary">{base.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">
                      ${base.bahRates.e5WithDependents.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">
                      ${base.bahRates.e5WithoutDependents.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">
                      ${base.bahRates.o3WithDependents.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">
                      ${base.bahRates.o3WithoutDependents.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> BAH rates are estimates based on 2024 data. Use the official DoD BAH calculator for exact rates for your rank, dependency status, and zip code.
            </p>
          </div>
        </div>
      </AnimatedCard>

      {/* Housing Comparison */}
      <AnimatedCard delay={300}>
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
            <Icon name="Home" className="h-6 w-6 text-blue-600" />
            Housing Options Comparison
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {comparisonBases.map((base) => (
              <div key={base.id} className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`w-3 h-3 rounded-full ${badgeColors[base.branch as keyof typeof badgeColors]}`}></span>
                  <h4 className="font-bold text-primary">{base.title}</h4>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-primary">On-Base Housing</span>
                      <span className={`text-sm font-bold ${base.housing.onBaseAvailable ? 'text-emerald-600' : 'text-red-600'}`}>
                        {base.housing.onBaseAvailable ? 'Available' : 'Limited'}
                      </span>
                    </div>
                    {base.housing.onBaseAvailable && (
                      <div className="text-xs text-muted">
                        Waitlist: {base.housing.waitlistMonths} months
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-primary mb-1">Off-Base Options</div>
                    <div className="text-xs text-muted">
                      {base.housing.offBaseOptions.join(', ')}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-primary mb-1">Average Rent</div>
                    <div className="text-sm font-bold text-emerald-600">
                      ${base.housing.averageRent.toLocaleString()}/month
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedCard>

      {/* Schools Comparison */}
      <AnimatedCard delay={400}>
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
            <Icon name="BookOpen" className="h-6 w-6 text-purple-600" />
            School Ratings Comparison
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {comparisonBases.map((base) => (
              <div key={base.id} className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`w-3 h-3 rounded-full ${badgeColors[base.branch as keyof typeof badgeColors]}`}></span>
                  <h4 className="font-bold text-primary">{base.title}</h4>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-primary mb-1">DoDEA Schools (On-Base)</div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Icon
                            key={i}
                            name="Star"
                            className={`h-4 w-4 ${i < base.schools.doDeaRating ? 'text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-primary">{base.schools.doDeaRating}/10</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-primary mb-1">Public Schools (Off-Base)</div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Icon
                            key={i}
                            name="Star"
                            className={`h-4 w-4 ${i < base.schools.publicSchoolRating ? 'text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-primary">{base.schools.publicSchoolRating}/10</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-primary mb-1">Top District</div>
                    <div className="text-xs text-muted">{base.schools.topSchoolDistrict}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedCard>

      {/* Lifestyle & PCS Comparison */}
      <AnimatedCard delay={500}>
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
            <Icon name="MapPin" className="h-6 w-6 text-orange-600" />
            Lifestyle & PCS Considerations
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {comparisonBases.map((base) => (
              <div key={base.id} className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`w-3 h-3 rounded-full ${badgeColors[base.branch as keyof typeof badgeColors]}`}></span>
                  <h4 className="font-bold text-primary">{base.title}</h4>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-primary mb-1">Commute Time</div>
                    <div className="text-sm text-muted">{base.lifestyle.commuteTime}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-primary mb-1">Weather</div>
                    <div className="text-sm text-muted">{base.lifestyle.weather}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-primary mb-1">Cost of Living</div>
                    <div className="text-sm font-bold text-emerald-600">{base.lifestyle.costOfLiving}% of national average</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-primary mb-1">PCS Moving Costs</div>
                    <div className="text-sm font-bold text-emerald-600">${base.pcs.movingCosts.toLocaleString()}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-primary mb-1">Popular Neighborhoods</div>
                    <div className="text-xs text-muted">
                      {base.pcs.popularNeighborhoods.join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedCard>

      {/* Decision Tools */}
      <AnimatedCard delay={600}>
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white text-center">
          <h3 className="text-2xl md:text-3xl font-serif font-black mb-6">
            Ready to Make Your Decision?
          </h3>
          <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
            Use our personalized tools to get custom recommendations based on your specific situation and priorities.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Link
              href="/dashboard/assessment"
              className="bg-white text-slate-900 rounded-xl p-6 hover:shadow-2xl transition-all hover:-translate-y-1 text-left group"
            >
              <Icon name="Sparkles" className="h-8 w-8 text-emerald-600 mb-3" />
              <h4 className="text-xl font-bold mb-2 group-hover:text-emerald-600 transition-colors">Get Personalized Guidance</h4>
              <p className="text-sm text-slate-600">
                Take our assessment to get custom base recommendations based on your family situation, career goals, and preferences.
              </p>
            </Link>
            
            <Link
              href="/dashboard/tools/pcs-planner"
              className="bg-white text-slate-900 rounded-xl p-6 hover:shadow-2xl transition-all hover:-translate-y-1 text-left group"
            >
              <Icon name="Calculator" className="h-8 w-8 text-blue-600 mb-3" />
              <h4 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">PCS Financial Planner</h4>
              <p className="text-sm text-slate-600">
                Calculate the true cost of your PCS move and compare the financial impact of each base option.
              </p>
            </Link>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
}
