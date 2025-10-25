'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

import Icon from '@/app/components/ui/Icon';

interface CalculatorData {
  tsp_balance?: number;
  sdp_savings?: number;
  house_equity?: number;
  annual_savings?: number;
  target_salary?: number;
}

export default function FinancialOverview() {
  const [data, setData] = useState<CalculatorData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      // Fetch aggregated data from saved calculator states
      const response = await fetch('/api/financial-overview');
      const result = await response.json();
      setData(result);
    } catch {
      // Non-critical: Failed to fetch financial data - shows placeholder
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-blue-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-blue-100 rounded"></div>
        </div>
      </div>
    );
  }

  // Calculate totals
  const tspBalance = data.tsp_balance || 0;
  const sdpSavings = data.sdp_savings || 0;
  const houseEquity = data.house_equity || 0;
  const totalAssets = tspBalance + sdpSavings + houseEquity;
  const annualSavings = data.annual_savings || 0;
  const targetSalary = data.target_salary || 0;

  // Asset allocation for pie chart
  const assetData = [
    { name: 'TSP', value: tspBalance, color: '#3b82f6' },
    { name: 'SDP', value: sdpSavings, color: '#10b981' },
    { name: 'Home Equity', value: houseEquity, color: '#f59e0b' }
  ].filter(item => item.value > 0);

  // Savings breakdown for bar chart
  const savingsData = [
    { category: 'On-Base', amount: annualSavings * 0.4 },
    { category: 'Tax Benefits', amount: annualSavings * 0.3 },
    { category: 'Cashback', amount: annualSavings * 0.3 }
  ];

  const fmt = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (totalAssets === 0 && annualSavings === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon name="BarChart" className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-bold text-blue-900">Financial Overview</h3>
        </div>
        <p className="text-blue-800">
          Use our calculators to build your personalized financial dashboard. Start with TSP or Savings calculators!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Icon name="BarChart" className="h-6 w-6 text-blue-600" />
        <h3 className="text-xl font-bold text-blue-900">Financial Overview</h3>
      </div>

      {/* Net Worth Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-blue-300 md:col-span-1">
          <p className="text-sm text-blue-700 mb-1">Total Assets</p>
          <p className="text-3xl font-bold text-blue-900">{fmt(totalAssets)}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-blue-300">
          <p className="text-sm text-blue-700 mb-1">TSP Balance</p>
          <p className="text-2xl font-bold text-blue-900">{fmt(tspBalance)}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-success">
          <p className="text-sm text-success mb-1">SDP Savings</p>
          <p className="text-2xl font-bold text-success">{fmt(sdpSavings)}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-warning">
          <p className="text-sm text-warning mb-1">Home Equity</p>
          <p className="text-2xl font-bold text-warning">{fmt(houseEquity)}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Asset Allocation Pie Chart */}
        {assetData.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">Asset Allocation</h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={assetData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  label={(entry: any) => `${entry.name}: ${((entry.value / totalAssets) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => fmt(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Annual Savings Breakdown */}
        {annualSavings > 0 && (
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">Annual Savings: {fmt(annualSavings)}</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={savingsData}>
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value: number) => fmt(value)} />
                <Bar dataKey="amount" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Career Projection */}
      {targetSalary > 0 && (
        <div className="mt-6 bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 mb-1">Career Target Salary</p>
              <p className="text-2xl font-bold text-purple-900">{fmt(targetSalary)}</p>
            </div>
            <Icon name="Target" className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      )}

      <p className="text-xs text-blue-700 mt-4">
        <Icon name="Info" className="h-3 w-3 inline mr-1" />
        Data aggregated from your calculator usage. Update any calculator to refresh this overview.
      </p>
    </div>
  );
}

