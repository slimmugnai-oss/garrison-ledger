'use client';

import { useState, useEffect } from 'react';
import Icon from '@/app/components/ui/Icon';
import { usePremiumStatus } from '@/lib/hooks/usePremiumStatus';
import { track } from '@/lib/track';

interface Scenario {
  id: string;
  name: string;
  input: Record<string, any>;
  output: Record<string, any>;
  created_at: string;
}

interface ComparisonModeProps {
  tool: string;
  currentInput: Record<string, any>;
  currentOutput: Record<string, any>;
  renderComparison: (scenarios: Scenario[]) => React.ReactNode;
  onLoadScenario?: (input: Record<string, any>) => void; // Callback to load scenario into calculator
}

export default function ComparisonMode({ 
  tool, 
  currentInput, 
  currentOutput,
  renderComparison,
  onLoadScenario
}: ComparisonModeProps) {
  const { isPremium } = usePremiumStatus();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [saving, setSaving] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // Load scenarios on mount
  useEffect(() => {
    loadScenarios();
  }, [tool]);

  async function loadScenarios() {
    try {
      const response = await fetch(`/api/calculator-scenarios?tool=${tool}`);
      const data = await response.json();
      
      if (data.success) {
        setScenarios(data.scenarios || []);
      }
    } catch (error) {
      console.error('Error loading scenarios:', error);
    }
  }

  async function saveScenario() {
    if (!scenarioName.trim()) {
      alert('Please enter a scenario name');
      return;
    }

    setSaving(true);
    track(`${tool}_save_scenario`);

    try {
      const response = await fetch('/api/calculator-scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool,
          name: scenarioName,
          input: currentInput,
          output: currentOutput
        })
      });

      const data = await response.json();

      if (response.status === 403) {
        // Free user hit limit
        alert(data.error || 'Upgrade to Premium for unlimited scenarios!');
      } else if (response.status === 500 && data.error?.includes('function')) {
        // Migration not deployed
        alert('⚠️ Database migration required! Please contact support or check DEPLOYMENT_GUIDE.md');
      } else if (data.success) {
        await loadScenarios();
        setScenarioName('');
        setShowSaveDialog(false);
        alert('✅ Scenario saved! You can now compare it with other scenarios.');
      } else {
        alert('Failed to save scenario. Please try again or check if database migrations are deployed.');
      }
    } catch (error) {
      console.error('Error saving scenario:', error);
      alert('Failed to save scenario. This feature requires database migration deployment. Check DEPLOYMENT_GUIDE.md');
    } finally {
      setSaving(false);
    }
  }

  async function deleteScenario(scenarioId: string) {
    if (!confirm('Are you sure you want to delete this scenario?')) {
      return;
    }

    track(`${tool}_delete_scenario`);

    try {
      const response = await fetch(`/api/calculator-scenarios?id=${scenarioId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadScenarios();
        alert('✅ Scenario deleted');
      } else {
        alert('Failed to delete scenario');
      }
    } catch (error) {
      console.error('Error deleting scenario:', error);
      alert('Failed to delete scenario');
    }
  }

  // Don't show if no results yet
  if (!currentOutput || Object.keys(currentOutput).length === 0) {
    return null;
  }

  return (
    <div className="mt-8 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-purple-900 mb-1">
            Scenario Comparison
          </h3>
          <p className="text-sm text-purple-700">
            Save multiple scenarios and compare them side-by-side
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSaveDialog(true)}
            className="btn-primary px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2"
          >
            <Icon name="Plus" className="h-4 w-4" />
            Save Scenario
          </button>
          
          {scenarios.length >= 2 && (
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2"
            >
              <Icon name="BarChart" className="h-4 w-4" />
              {showComparison ? 'Hide' : 'Compare'} ({scenarios.length})
            </button>
          )}
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="bg-white border-2 border-purple-300 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-bold text-primary mb-3">Save Current Scenario</h4>
          <input
            type="text"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            placeholder="Enter scenario name (e.g., 'Conservative', 'Aggressive')"
            className="w-full px-4 py-2 border-2 border-default rounded-lg focus:border-purple-600 focus:outline-none mb-4"
            onKeyDown={(e) => e.key === 'Enter' && saveScenario()}
          />
          <div className="flex gap-3">
            <button
              onClick={saveScenario}
              disabled={saving}
              className="btn-primary px-6 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Scenario'}
            </button>
            <button
              onClick={() => {
                setShowSaveDialog(false);
                setScenarioName('');
              }}
              className="px-6 py-2 border-2 border-default rounded-lg font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
          
          {!isPremium && scenarios.length >= 1 && (
            <p className="text-sm text-warning mt-3">
              ⚠️ Free users can save 1 scenario per tool. <a href="/dashboard/upgrade" className="link">Upgrade to Premium</a> for unlimited scenarios.
            </p>
          )}
        </div>
      )}

      {/* Saved Scenarios List */}
      {scenarios.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-purple-900 mb-3">
            Saved Scenarios ({scenarios.length}{!isPremium && ' / 1 free'})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="bg-white border border-purple-200 rounded-lg p-4 hover:shadow-md hover:border-purple-400 transition-all cursor-pointer"
                onClick={() => {
                  if (onLoadScenario) {
                    onLoadScenario(scenario.input);
                    alert(`✅ Loaded scenario: ${scenario.name}`);
                  }
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-bold text-primary">{scenario.name}</h5>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering card click
                      deleteScenario(scenario.id);
                    }}
                    className="text-muted hover:text-danger"
                    title="Delete scenario"
                  >
                    <Icon name="Trash2" className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-muted mb-1">
                  Saved {new Date(scenario.created_at).toLocaleDateString()}
                </p>
                <p className="text-xs text-info font-medium">
                  Click to load →
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison View */}
      {showComparison && scenarios.length >= 2 && (
        <div className="bg-white border-2 border-purple-300 rounded-lg p-6">
          <h4 className="text-lg font-bold text-primary mb-4">
            Scenario Comparison
          </h4>
          {renderComparison(scenarios)}
        </div>
      )}

      {/* Empty State */}
      {scenarios.length === 0 && (
        <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-purple-300">
          <Icon name="BarChart" className="h-12 w-12 text-purple-400 mx-auto mb-3" />
          <p className="text-purple-700 font-medium mb-2">
            No scenarios saved yet
          </p>
          <p className="text-sm text-purple-600">
            Save your current calculation to start comparing different scenarios
          </p>
        </div>
      )}

      {/* Upgrade CTA for free users */}
      {!isPremium && scenarios.length >= 2 && (
        <div className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-6 text-center">
          <Icon name="Crown" className="h-8 w-8 mx-auto mb-3 text-yellow-300" />
          <h4 className="text-xl font-bold mb-2">Unlock Unlimited Scenarios</h4>
          <p className="text-white/90 mb-4">
            Premium members can save unlimited scenarios and compare as many as they want
          </p>
          <a
            href="/dashboard/upgrade"
            className="inline-block bg-white text-indigo-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-bold transition-colors"
          >
            Upgrade to Premium - $9.99/month
          </a>
        </div>
      )}
    </div>
  );
}

