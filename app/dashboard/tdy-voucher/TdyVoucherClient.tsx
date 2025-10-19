/**
 * TDY VOUCHER CLIENT
 * 
 * Multi-step wizard for travel voucher building
 */

'use client';

import { useState } from 'react';
import Icon from '@/app/components/ui/Icon';
import Badge from '@/app/components/ui/Badge';
import TdyWizard from './TdyWizard';
import type { TdyTrip } from '@/app/types/tdy';

interface Props {
  isPremium: boolean;
  initialTrips: TdyTrip[];
}

export default function TdyVoucherClient({ isPremium, initialTrips }: Props) {
  const [trips, setTrips] = useState<TdyTrip[]>(initialTrips);
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const [showNewTrip, setShowNewTrip] = useState(false);

  // New trip form state
  const [purpose, setPurpose] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  const [creating, setCreating] = useState(false);

  /**
   * Create new trip
   */
  const createTrip = async () => {
    setCreating(true);

    try {
      const response = await fetch('/api/tdy/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purpose,
          origin,
          destination,
          depart_date: departDate,
          return_date: returnDate
        })
      });

      if (!response.ok) {
        const err = await response.json();
        alert(err.error || 'Failed to create trip');
        return;
      }

      const { tripId } = await response.json();

      // Refresh trips
      const tripsResponse = await fetch('/api/tdy/trips');
      const { trips: newTrips } = await tripsResponse.json();
      setTrips(newTrips);
      setSelectedTrip(tripId);
      setShowNewTrip(false);

      // Reset form
      setPurpose('');
      setOrigin('');
      setDestination('');
      setDepartDate('');
      setReturnDate('');

    } catch (error) {
      console.error('Failed to create trip:', error);
      alert('Error creating trip');
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 font-lora mb-3">
            TDY Voucher Copilot
          </h1>
          <p className="text-lg text-gray-600">
            Build compliant travel vouchers. Upload receipts → Auto-categorize → Validate → Submit.
          </p>
        </div>

        {/* Trip Selection or Creation */}
        {!selectedTrip && !showNewTrip && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Your Trips</h2>
              <button
                onClick={() => setShowNewTrip(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                + New Trip
              </button>
            </div>

            {trips.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <Icon name="MapPin" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Trips Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first TDY trip to start building your voucher.
                </p>
                <button
                  onClick={() => setShowNewTrip(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Create First Trip
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {trips.map(trip => {
                  const durationDays = Math.ceil(
                    (new Date(trip.return_date).getTime() - new Date(trip.depart_date).getTime()) / (1000 * 60 * 60 * 24)
                  ) + 1;

                  return (
                    <button
                      key={trip.id}
                      onClick={() => setSelectedTrip(trip.id)}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow text-left"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {trip.purpose}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {trip.destination}
                          </p>
                        </div>
                        <Badge variant="info">{durationDays} days</Badge>
                      </div>

                      <div className="text-sm text-gray-700">
                        <p>{new Date(trip.depart_date).toLocaleDateString()} →</p>
                        <p>{new Date(trip.return_date).toLocaleDateString()}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* New Trip Form */}
        {showNewTrip && (
          <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Create New Trip</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose
                </label>
                <select
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="TDY">TDY</option>
                  <option value="House-Hunting">House-Hunting</option>
                  <option value="ITA">ITA (In-Town Area)</option>
                  <option value="Conference">Conference</option>
                  <option value="Training">Training</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Origin (City, ST or ZIP)
                  </label>
                  <input
                    type="text"
                    value={origin}
                    onChange={e => setOrigin(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Fort Liberty, NC"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination (City, ST or ZIP)
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Norfolk, VA"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Depart Date
                  </label>
                  <input
                    type="date"
                    value={departDate}
                    onChange={e => setDepartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return Date
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={e => setReturnDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={createTrip}
                  disabled={creating || !purpose || !origin || !destination || !departDate || !returnDate}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {creating ? 'Creating...' : 'Create Trip'}
                </button>
                <button
                  onClick={() => setShowNewTrip(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Trip Editor - FULL WIZARD */}
        {selectedTrip && (
          <TdyWizard
            tripId={selectedTrip}
            isPremium={isPremium}
            onBack={() => setSelectedTrip(null)}
          />
        )}

        {/* Info Banner */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Icon name="Info" className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">TDY Copilot Features</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>✅ Backend API complete (create, upload, estimate, check, voucher)</li>
                <li>✅ PDF receipt parsing operational</li>
                <li>✅ GSA per-diem integration ready</li>
                <li>✅ Compliance checking (duplicates, caps, windows)</li>
                <li>⏳ Full wizard UI (coming next update)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

