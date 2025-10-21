'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import PageHeader from '@/app/components/ui/PageHeader';
import Icon from '@/app/components/ui/Icon';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const ADMIN_USER_IDS = ['user_2qG7CqFtj5L8X2dRNJpW0kFYW8f'];

/**
 * Analytics Dashboard Types
 */
interface CalculatorRate {
  calculator_name: string;
  started_count: number;
  completed_count: number;
  completion_rate: number;
}

interface ConversionStage {
  stage: string;
  user_count: number;
  conversion_rate: number;
}

interface TopFeature {
  feature_name: string;
  usage_count: number;
}

export default function AnalyticsDashboard() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [calculatorRates, setCalculatorRates] = useState<CalculatorRate[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<ConversionStage[]>([]);
  const [topFeatures, setTopFeatures] = useState<TopFeature[]>([]);

  useEffect(() => {
    if (user && !ADMIN_USER_IDS.includes(user.id)) {
      router.push('/dashboard');
    } else if (user) {
      fetchAnalytics();
    }
  }, [user, router]);

  const fetchAnalytics = async () => {
    try {
      // Fetch calculator completion rates
      const ratesResponse = await fetch('/api/admin/analytics/calculator-rates');
      const { data: rates } = await ratesResponse.json();
      setCalculatorRates(rates || []);

      // Fetch conversion funnel
      const funnelResponse = await fetch('/api/admin/analytics/conversion-funnel');
      const { data: funnel } = await funnelResponse.json();
      setConversionFunnel(funnel || []);

      // Fetch top features
      const featuresResponse = await fetch('/api/admin/analytics/top-features');
      const { data: features } = await featuresResponse.json();
      setTopFeatures(features || []);

    } catch (error) {
      // Failed to load analytics data - show empty state
      setCalculatorRates([]);
      setConversionFunnel([]);
      setTopFeatures([]);
      
      if (process.env.NODE_ENV === 'development') {
        console.error('[AnalyticsDashboard] Failed to load analytics:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user || !ADMIN_USER_IDS.includes(user.id)) {
    return null;
  }

  if (loading) {
    return (
      <div>
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-100 rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <PageHeader
          title="Analytics Dashboard"
          subtitle="Platform engagement and conversion metrics"
          right={<Icon name="BarChart" className="h-10 w-10 text-primary" />}
        />

        {/* Calculator Completion Rates */}
        <div className="bg-surface rounded-xl border-2 border-default p-6 mb-8">
          <h2 className="text-2xl font-bold text-primary mb-6">Calculator Completion Rates</h2>
          
          {calculatorRates.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={calculatorRates}>
                  <XAxis dataKey="calculator_name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed_count" fill="#10b981" name="Completed" />
                  <Bar dataKey="started_count" fill="#3b82f6" name="Started" />
                </BarChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                {calculatorRates.map((calc, index) => (
                  <div key={index} className="bg-surface-hover rounded-lg p-4 border border-subtle">
                    <p className="text-sm font-semibold text-primary capitalize mb-2">
                      {calc.calculator_name}
                    </p>
                    <p className="text-3xl font-bold text-success">{calc.completion_rate}%</p>
                    <p className="text-xs text-muted mt-1">
                      {calc.completed_count} / {calc.started_count} completed
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-muted">No calculator data yet</p>
          )}
        </div>

        {/* Conversion Funnel */}
        <div className="bg-surface rounded-xl border-2 border-default p-6 mb-8">
          <h2 className="text-2xl font-bold text-primary mb-6">Conversion Funnel</h2>
          
          {conversionFunnel.length > 0 ? (
            <div className="space-y-4">
              {conversionFunnel.map((stage, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-primary">{stage.stage}</span>
                    <span className="text-sm text-muted">
                      {stage.user_count} users ({stage.conversion_rate}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-end px-3 text-white font-bold text-sm transition-all"
                      style={{ width: `${stage.conversion_rate}%` }}
                    >
                      {stage.conversion_rate}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No funnel data yet</p>
          )}
        </div>

        {/* Top Features */}
        <div className="bg-surface rounded-xl border-2 border-default p-6">
          <h2 className="text-2xl font-bold text-primary mb-6">Top Features by Usage</h2>
          
          {topFeatures.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={topFeatures as any}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => {
                      const entry = topFeatures[props.index];
                      return entry?.feature_name || '';
                    }}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="usage_count"
                    nameKey="feature_name"
                  >
                    {topFeatures.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-2">
                {topFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-surface-hover rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-semibold text-primary">{feature.feature_name}</span>
                    </div>
                    <span className="text-2xl font-bold text-info">{feature.usage_count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted">No feature usage data yet</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

