'use client';

import { usePremiumStatus } from '@/lib/hooks/usePremiumStatus';
import { useState } from 'react';

export default function PremiumDebug() {
  const { isPremium, loading } = usePremiumStatus();
  const [testResult, setTestResult] = useState<Record<string, unknown> | null>(null);
  const [testing, setTesting] = useState(false);

  const testPremiumAPI = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/test-premium');
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">🔍 Premium Status Debug</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Hook Status</h3>
          <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
          <p><strong>Is Premium:</strong> {isPremium ? 'Yes' : 'No'}</p>
        </div>
        
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Actions</h3>
          <button
            onClick={testPremiumAPI}
            disabled={testing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {testing ? 'Testing...' : 'Test Premium API'}
          </button>
        </div>
      </div>

      {testResult && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">API Test Results</h3>
          <pre className="text-sm text-gray-700 overflow-auto">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
