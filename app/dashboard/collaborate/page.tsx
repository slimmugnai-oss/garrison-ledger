'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/app/components/ui/Icon';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

interface Connection {
  connection_id: string;
  spouse_id: string;
  status: string;
  connected_at: string;
}

interface SharedData {
  id: string;
  shared_by: string;
  calculator_name: string;
  inputs: any;
  outputs: any;
  notes: string;
  created_at: string;
}

export default function CollaboratePage() {
  const [connection, setConnection] = useState<Connection | null>(null);
  const [sharedData, setSharedData] = useState<SharedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);

  useEffect(() => {
    fetchCollaborationData();
  }, []);

  const fetchCollaborationData = async () => {
    try {
      const response = await fetch('/api/collaboration');
      const data = await response.json();
      
      if (data.hasConnection) {
        setConnection(data.connection);
        setSharedData(data.sharedData);
      }
    } catch (error) {
      console.error('Error fetching collaboration data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createInvitation = async () => {
    try {
      const response = await fetch('/api/collaboration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_invitation' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setInviteCode(data.code);
      }
    } catch (error) {
      console.error('Error creating invitation:', error);
    }
  };

  const useInviteCode = async () => {
    if (!codeInput || codeInput.length !== 6) {
      alert('Please enter a valid 6-digit code');
      return;
    }

    try {
      const response = await fetch('/api/collaboration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'use_code',
          code: codeInput 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Successfully connected!');
        fetchCollaborationData();
        setShowCodeInput(false);
        setCodeInput('');
      } else {
        alert(data.error || 'Failed to connect');
      }
    } catch (error) {
      console.error('Error using code:', error);
      alert('Failed to connect');
    }
  };

  const disconnect = async () => {
    if (!confirm('Are you sure you want to disconnect? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/collaboration', {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setConnection(null);
        setSharedData([]);
        alert('Disconnected successfully');
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-32 bg-gray-100 rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Spouse Collaboration</h1>
          <p className="text-body">
            Share calculator results and collaborate on financial planning with your spouse
          </p>
        </div>

        {/* No Connection - Show pairing options */}
        {!connection && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Create Invitation */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Icon name="UserPlus" className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-bold text-blue-900">Invite Your Spouse</h3>
              </div>
              
              {!inviteCode ? (
                <>
                  <p className="text-blue-800 mb-4">
                    Generate a 6-digit code to share with your spouse
                  </p>
                  <button
                    onClick={createInvitation}
                    className="btn-primary w-full"
                  >
                    Generate Invite Code
                  </button>
                </>
              ) : (
                <div>
                  <p className="text-blue-800 mb-3">Share this code with your spouse:</p>
                  <div className="bg-white rounded-lg p-4 border-2 border-blue-400 text-center mb-4">
                    <p className="text-4xl font-bold text-blue-600 tracking-widest">{inviteCode}</p>
                  </div>
                  <p className="text-xs text-blue-700">
                    <Icon name="Info" className="h-3 w-3 inline mr-1" />
                    Code expires in 7 days
                  </p>
                </div>
              )}
            </div>

            {/* Use Invite Code */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Icon name="Users" className="h-6 w-6 text-green-600" />
                <h3 className="text-xl font-bold text-green-900">Have a Code?</h3>
              </div>
              
              {!showCodeInput ? (
                <>
                  <p className="text-green-800 mb-4">
                    Enter the 6-digit code your spouse shared with you
                  </p>
                  <button
                    onClick={() => setShowCodeInput(true)}
                    className="btn-primary w-full bg-green-600 hover:bg-green-700"
                  >
                    Enter Code
                  </button>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-green-900 mb-2">
                    6-Digit Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full px-4 py-3 border-2 border-green-300 rounded-lg text-center text-2xl font-bold tracking-widest mb-4"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={useInviteCode}
                      className="btn-primary flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Connect
                    </button>
                    <button
                      onClick={() => {
                        setShowCodeInput(false);
                        setCodeInput('');
                      }}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Has Connection - Show shared data */}
        {connection && (
          <div className="space-y-6">
            {/* Connection Status */}
            <div className="bg-success-subtle border-2 border-success rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon name="CheckCircle" className="h-6 w-6 text-success" />
                  <div>
                    <h3 className="text-xl font-bold text-success">Connected</h3>
                    <p className="text-sm text-success">
                      Collaborating since {new Date(connection.connected_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={disconnect}
                  className="text-sm text-danger hover:underline"
                >
                  Disconnect
                </button>
              </div>
            </div>

            {/* Shared Calculators */}
            <div className="bg-surface rounded-xl border-2 border-default p-6">
              <h3 className="text-2xl font-bold text-primary mb-4">Shared Calculations</h3>
              
              {sharedData.length === 0 ? (
                <p className="text-muted">
                  No shared calculations yet. Complete a calculator and share the results!
                </p>
              ) : (
                <div className="space-y-4">
                  {sharedData.map((item) => (
                    <div key={item.id} className="bg-surface-hover rounded-lg p-4 border border-subtle">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-primary capitalize">
                            {item.calculator_name.replace('-', ' ')} Calculator
                          </h4>
                          <p className="text-sm text-muted">
                            Shared {new Date(item.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Link
                          href={`/dashboard/tools/${item.calculator_name}`}
                          className="text-sm text-info hover:underline"
                        >
                          View Calculator →
                        </Link>
                      </div>
                      {item.notes && (
                        <p className="text-sm text-body mt-2">
                          <strong>Note:</strong> {item.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

