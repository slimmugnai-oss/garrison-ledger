"use client";
import { useEffect, useMemo, useState } from "react";
import { SignedIn, SignedOut, SignIn } from "@clerk/nextjs";
import { track } from "@/lib/track";
import Header from "@/app/components/Header";

type Provider = {
  id: string;
  type: string;
  name: string | null;
  business_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  calendly: string | null;
  state: string | null;
  city: string | null;
  zip: string | null;
  stations: string[] | null;
  coverage_states: string[] | null;
  military_friendly: boolean | null;
  spouse_owned: boolean | null;
  va_expert: boolean | null;
  notes: string | null;
  license_id: string | null;
};

export default function DirectoryPage() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [state, setState] = useState("");
  const [mil, setMil] = useState(true);
  const [items, setItems] = useState<Provider[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => { track("directory_view"); }, []);

  async function load(p = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (type) params.set("type", type);
      if (state) params.set("state", state);
      if (mil) params.set("mil", "1");
      params.set("page", String(p));
      params.set("size", "20");
      const res = await fetch(`/api/directory/providers?${params.toString()}`);
      if (!res.ok) {
        setItems([]);
        setTotal(0);
        return;
      }
      const j = await res.json();
      setItems(j.items || []);
      setTotal(j.total || 0);
      setPage(j.page || 1);
      track("directory_search", { q, type, state, mil });
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }

  // Clear all filters
  function clearFilters() {
    setQ("");
    setType("");
    setState("");
    setMil(true);
    load(1);
  }

  // Auto-search on filter change (with debounce for text input)
  useEffect(() => {
    if (initialLoad) return; // Skip on first render
    const timer = setTimeout(() => {
      load(1);
    }, q ? 500 : 0); // Debounce text search, instant for dropdowns
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, state, mil]);

  useEffect(() => { 
    load(1); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pages = useMemo(() => Math.max(1, Math.ceil(total / 20)), [total]);

  // Check if provider is new (< 30 days old)
  const isNew = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays < 30;
  };

  const LoadingSkeleton = () => (
    <div className="grid gap-4 sm:grid-cols-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded border bg-white p-4 shadow-sm animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );

  const Card = ({ p }: { p: Provider }) => (
    <div className="rounded border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">{p.business_name || p.name || "Provider"}</div>
          <div className="text-xs text-gray-500">{(p.type || "").replace("_", " ")} · {p.city || ""}{p.city && p.state ? ", " : ""}{p.state || ""}</div>
        </div>
        <div className="flex gap-2 text-xs flex-wrap justify-end">
          {p.military_friendly && <span className="rounded bg-green-100 text-green-700 px-2 py-1">Military-friendly</span>}
          {p.va_expert && <span className="rounded bg-blue-100 text-blue-700 px-2 py-1">VA-savvy</span>}
          {p.spouse_owned && <span className="rounded bg-purple-100 text-purple-700 px-2 py-1">Spouse-owned</span>}
        </div>
      </div>
      <div className="mt-2 text-sm">
        {p.notes && <p className="text-gray-700">{p.notes}</p>}
        {p.stations && p.stations.length > 0 && <p className="text-gray-500 mt-1">Stations: {p.stations.join(", ")}</p>}
        {p.coverage_states && p.coverage_states.length > 0 && <p className="text-gray-500">Coverage: {p.coverage_states.join(", ")}</p>}
        {p.license_id && <p className="text-gray-500">License: {p.license_id}</p>}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        {p.website && <a className="underline text-blue-600 hover:text-blue-700" href={p.website} target="_blank" rel="noreferrer">Website</a>}
        {p.email && <a className="underline text-blue-600 hover:text-blue-700" href={`mailto:${p.email}`}>Email</a>}
        {p.phone && <a className="underline text-blue-600 hover:text-blue-700" href={`tel:${p.phone}`}>Call</a>}
        {p.calendly && <a className="underline text-blue-600 hover:text-blue-700" href={p.calendly} target="_blank" rel="noreferrer">Book</a>}
      </div>
    </div>
  );

  const Filters = (
    <div className="rounded border bg-white p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-5">
        <input 
          placeholder="Search name, city, notes…" 
          value={q} 
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load(1)} 
          className="border rounded px-3 py-2 sm:col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
        />
        <select value={type} onChange={e => setType(e.target.value)} className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Any type</option>
          <option value="agent">Agent</option>
          <option value="lender">Lender</option>
          <option value="property_manager">Property Manager</option>
          <option value="other">Other</option>
        </select>
        <input 
          placeholder="State (e.g., TX)" 
          maxLength={2} 
          value={state} 
          onChange={e => setState(e.target.value.toUpperCase())} 
          className="border rounded px-3 py-2 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500" 
        />
        <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={mil} onChange={e => setMil(e.target.checked)} className="w-4 h-4" />
          Military-friendly
        </label>
      </div>
      <div className="mt-3 flex gap-2">
        <button 
          onClick={() => load(1)} 
          disabled={loading}
          className="rounded bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Searching…" : "Search"}
        </button>
        <button 
          onClick={clearFilters} 
          disabled={loading}
          className="rounded border border-gray-300 text-gray-700 px-4 py-2 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Vetted Pros Directory</h1>
        <p className="text-gray-600">Agents, lenders, and property managers who understand military families and VA loans.</p>

        <SignedOut>
          <div className="rounded border bg-white p-6 shadow-sm">
            <p className="mb-4">Please sign in to view the directory.</p>
            <SignIn />
          </div>
        </SignedOut>

        <SignedIn>
          {Filters}

          {/* Provider count */}
          {!initialLoad && !loading && total > 0 && (
            <div className="text-sm text-gray-600">
              Found <span className="font-semibold">{total}</span> {total === 1 ? 'provider' : 'providers'}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && initialLoad && <LoadingSkeleton />}

          {/* Results */}
          {!loading && items.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {items.map(p => <Card key={p.id} p={p} />)}
            </div>
          )}

          {/* Loading indicator for subsequent searches */}
          {loading && !initialLoad && (
            <div className="text-center py-8 text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div className="mt-2">Searching providers...</div>
            </div>
          )}

          {/* Empty states */}
          {!loading && !initialLoad && items.length === 0 && (
            <div className="rounded-lg border bg-white p-8 text-center shadow-sm">
              <div className="text-4xl mb-3">🔍</div>
              {total === 0 && !q && !type && !state ? (
                // No providers in database at all
                <>
                  <h3 className="text-lg font-semibold mb-2">No providers yet</h3>
                  <p className="text-gray-600 text-sm">
                    We're actively building our directory of vetted military-friendly providers.
                    Check back soon!
                  </p>
                </>
              ) : (
                // No results for current filters
                <>
                  <h3 className="text-lg font-semibold mb-2">No providers match your search</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Try adjusting your filters or search term.
                  </p>
                  <button 
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Clear all filters
                  </button>
                </>
              )}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && !loading && items.length > 0 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <button 
                disabled={page <= 1} 
                onClick={() => load(page - 1)} 
                className="px-4 py-2 rounded border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <div className="text-sm text-gray-600">
                Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{pages}</span>
              </div>
              <button 
                disabled={page >= pages} 
                onClick={() => load(page + 1)} 
                className="px-4 py-2 rounded border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}

          {/* Disclaimer */}
          {!initialLoad && (
            <div className="text-xs text-gray-500 text-center mt-6">
              Listings are informational and not endorsements. Verify licenses independently.
            </div>
          )}
        </SignedIn>
      </div>
    </>
  );
}

