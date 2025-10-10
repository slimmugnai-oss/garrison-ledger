"use client";
import { useEffect, useState } from "react";
import { SignedIn, SignedOut, SignIn } from "@clerk/nextjs";
import Header from "@/app/components/Header";
import { usePremiumStatus } from "@/lib/hooks/usePremiumStatus";

type Provider = {
  id: number;
  name: string;
  business_name: string | null;
  type: string;
  location: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  military_friendly: boolean;
  description: string | null;
  specialties: string[] | null;
};

export default function DirectoryPage() {
  const { isPremium, loading: premiumLoading } = usePremiumStatus();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchLocation, setSearchLocation] = useState("");

  useEffect(() => {
    if (!isPremium || premiumLoading) return;
    
    async function fetchProviders() {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType !== "all") params.set("type", filterType);
      if (searchLocation) params.set("location", searchLocation);
      
      const res = await fetch(`/api/providers?${params}`);
      const data = await res.json();
      setProviders(data.providers || []);
      setLoading(false);
    }
    
    fetchProviders();
  }, [isPremium, premiumLoading, filterType, searchLocation]);

  return (
    <>
      <Header />
      <div className="min-h-screen" style={{ backgroundColor: '#FDFDFB' }}>
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-3">Vetted Pros Directory</h1>
            <p className="text-lg text-gray-600">
              Agents, lenders, and property managers familiar with military families.
            </p>
          </div>

          <SignedOut>
            <div className="bg-white rounded-xl p-6 border border-gray-200" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
              <p className="mb-4 text-gray-700">Please sign in to view the directory.</p>
              <SignIn />
            </div>
          </SignedOut>

          <SignedIn>
            {!premiumLoading && !isPremium && (
              <div className="bg-white rounded-xl p-8 text-center border border-gray-200" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                <div className="text-6xl mb-4">🔒</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Premium Directory</h2>
                <p className="text-gray-600 mb-6">
                  Unlock access to our vetted network of military-friendly professionals.
                </p>
                <a
                  href="/dashboard/upgrade"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Upgrade to Premium
                </a>
              </div>
            )}

            {isPremium && (
              <>
                {/* Filters */}
                <div className="bg-white rounded-xl p-6 border border-gray-200" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Provider Type
                      </label>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      >
                        <option value="all">All Types</option>
                        <option value="agent">Real Estate Agent</option>
                        <option value="lender">Lender</option>
                        <option value="property_manager">Property Manager</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search Location
                      </label>
                      <input
                        type="text"
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        placeholder="City or State..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Providers List */}
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading providers...</p>
                  </div>
                ) : providers.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 text-center border border-gray-200" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Providers Found</h3>
                    <p className="text-gray-600">
                      Try adjusting your filters or check back soon as we add more providers to the directory.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {providers.map((provider) => (
                      <div
                        key={provider.id}
                        className="bg-white rounded-xl p-6 border border-gray-200 card-hover"
                        style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{provider.name}</h3>
                            {provider.business_name && (
                              <p className="text-sm text-gray-600">{provider.business_name}</p>
                            )}
                          </div>
                          {provider.military_friendly && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              🎖️ Military-Friendly
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm">
                            <span className="font-medium text-gray-700 w-20">Type:</span>
                            <span className="text-gray-600 capitalize">{provider.type.replace('_', ' ')}</span>
                          </div>
                          {provider.location && (
                            <div className="flex items-center text-sm">
                              <span className="font-medium text-gray-700 w-20">Location:</span>
                              <span className="text-gray-600">{provider.location}</span>
                            </div>
                          )}
                          {provider.specialties && provider.specialties.length > 0 && (
                            <div className="flex items-start text-sm">
                              <span className="font-medium text-gray-700 w-20">Focus:</span>
                              <span className="text-gray-600">{provider.specialties.join(", ")}</span>
                            </div>
                          )}
                        </div>

                        {provider.description && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3">{provider.description}</p>
                        )}

                        <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-4">
                          {provider.phone && (
                            <a
                              href={`tel:${provider.phone}`}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              📞 Call
                            </a>
                          )}
                          {provider.email && (
                            <a
                              href={`mailto:${provider.email}`}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              ✉️ Email
                            </a>
                          )}
                          {provider.website && (
                            <a
                              href={provider.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              🌐 Website
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </SignedIn>
        </div>
      </div>
    </>
  );
}

