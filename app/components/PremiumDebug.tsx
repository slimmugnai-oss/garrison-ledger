'use client';

import { useState } from 'react';

import { usePremiumStatus } from '@/lib/hooks/usePremiumStatus';

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
    <div className="bg-surface rounded-lg shadow-lg p-6 border border-subtle max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-primary mb-4">🔍 Premium Status Debug</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="p-4 bg-surface-hover rounded-lg">
          <h3 className="font-semibold text-primary mb-2">Hook Status</h3>
          <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
          <p><strong>Is Premium:</strong> {isPremium ? 'Yes' : 'No'}</p>
        </div>
        
        <div className="p-4 bg-info-subtle rounded-lg">
          <h3 className="font-semibold text-info mb-2">Actions</h3>
          <button
            onClick={testPremiumAPI}
            disabled={testing}
            className="bg-info text-white px-4 py-2 rounded-lg hover:bg-info disabled:opacity-50"
          >
            {testing ? 'Testing...' : 'Test Premium API'}
          </button>
        </div>
      </div>

      {testResult && (
        <div className="p-4 bg-surface-hover rounded-lg">
          <h3 className="font-semibold text-primary mb-2">API Test Results</h3>
          <pre className="text-sm text-body overflow-auto">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
