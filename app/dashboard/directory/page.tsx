"use client";
import { SignedIn, SignedOut, SignIn } from "@clerk/nextjs";
import { useEffect, useMemo, useState } from "react";

import DirectoryFilters from "@/app/components/directory/DirectoryFilters";
import Header from "@/app/components/Header";
import { track } from "@/lib/track";

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
        <div key={i} className="rounded border bg-surface p-4 shadow-sm animate-pulse">
          <div className="h-6 bg-surface-hover rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-surface-hover rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-surface-hover rounded w-full mb-2"></div>
          <div className="h-4 bg-surface-hover rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );

  const Card = ({ p }: { p: Provider }) => {
    // Check if provider has created_at for "New" badge
    const providerData = p as Provider & { created_at?: string };
    const showNewBadge = providerData.created_at && isNew(providerData.created_at);

    return (
      <div className="rounded-lg border bg-surface p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:border-info">
        {/* Header with badges */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg sm:text-xl font-semibold text-primary break-words">
                {p.business_name || p.name || "Provider"}
              </h3>
              {showNewBadge && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success-subtle text-success px-2 py-0.5 text-xs font-medium whitespace-nowrap">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  New
                </span>
              )}
            </div>
            <div className="text-xs sm:text-sm text-muted mt-1 capitalize">
              {(p.type || "").replace("_", " ")} 
              {(p.city || p.state) && <span> · {p.city || ""}{p.city && p.state ? ", " : ""}{p.state || ""}</span>}
            </div>
          </div>
        </div>

        {/* Attribute badges */}
        <div className="flex gap-2 flex-wrap mb-3">
          {p.military_friendly && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success-subtle text-success border border-success px-2.5 py-1 text-xs font-medium">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Military-friendly
            </span>
          )}
          {p.va_expert && (
            <span className="inline-flex items-center gap-1 rounded-full bg-info-subtle text-info border border-info px-2.5 py-1 text-xs font-medium">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              VA Expert
            </span>
          )}
          {p.spouse_owned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 text-xs font-medium">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              Spouse-owned
            </span>
          )}
        </div>

        {/* Details */}
        {(p.notes || (p.stations && p.stations.length > 0) || (p.coverage_states && p.coverage_states.length > 0) || p.license_id) && (
          <div className="text-sm space-y-1.5 mb-3 pb-3 border-b">
            {p.notes && <p className="text-body leading-relaxed">{p.notes}</p>}
            {p.stations && p.stations.length > 0 && (
              <p className="text-body">
                <span className="font-medium">Stations:</span> {p.stations.join(", ")}
              </p>
            )}
            {p.coverage_states && p.coverage_states.length > 0 && (
              <p className="text-body">
                <span className="font-medium">Coverage:</span> {p.coverage_states.join(", ")}
              </p>
            )}
            {p.license_id && (
              <p className="text-body">
                <span className="font-medium">License:</span> {p.license_id}
              </p>
            )}
          </div>
        )}

        {/* Contact buttons */}
        <div className="flex flex-wrap gap-2">
          {p.website && (
            <a 
              className="inline-flex items-center gap-1.5 rounded-md bg-info text-white px-3 py-2 text-sm font-medium hover:bg-info transition-colors" 
              href={p.website} 
              target="_blank" 
              rel="noreferrer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Website
            </a>
          )}
          {p.email && (
            <a 
              className="inline-flex items-center gap-1.5 rounded-md border border-default bg-surface text-body px-3 py-2 text-sm font-medium hover:bg-surface-hover transition-colors" 
              href={`mailto:${p.email}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </a>
          )}
          {p.phone && (
            <a 
              className="inline-flex items-center gap-1.5 rounded-md border border-default bg-surface text-body px-3 py-2 text-sm font-medium hover:bg-surface-hover transition-colors" 
              href={`tel:${p.phone}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call
            </a>
          )}
          {p.calendly && (
            <a 
              className="inline-flex items-center gap-1.5 rounded-md bg-success text-white px-3 py-2 text-sm font-medium hover:bg-success transition-colors" 
              href={p.calendly} 
              target="_blank" 
              rel="noreferrer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Book
            </a>
          )}
        </div>
      </div>
    );
  };


  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Vetted Pros Directory</h1>
        <p className="text-body">Agents, lenders, and property managers who understand military families and VA loans.</p>

        <SignedOut>
          <div className="rounded border bg-surface p-6 shadow-sm">
            <p className="mb-4">Please sign in to view the directory.</p>
            <SignIn />
          </div>
        </SignedOut>

        <SignedIn>
          <DirectoryFilters
            search={q}
            onSearchChange={setQ}
            onSearchKeyDown={(e) => e.key === 'Enter' && load(1)}
            type={type}
            onTypeChange={setType}
            state={state}
            onStateChange={setState}
            militaryFriendly={mil}
            onMilitaryFriendlyChange={setMil}
            onSearch={() => load(1)}
            onClearFilters={clearFilters}
            loading={loading}
            totalCount={total}
            hasSearched={!initialLoad}
          />

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
            <div className="text-center py-8 text-muted">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div className="mt-2">Searching providers...</div>
            </div>
          )}

          {/* Empty states */}
          {!loading && !initialLoad && items.length === 0 && (
            <div className="rounded-lg border bg-surface p-8 text-center shadow-sm">
              <div className="text-4xl mb-3">🔍</div>
              {total === 0 && !q && !type && !state ? (
                // No providers in database at all
                <>
                  <h3 className="text-lg font-semibold mb-2">No providers yet</h3>
                  <p className="text-body text-sm">
                    We&apos;re actively building our directory of vetted military-friendly providers.
                    Check back soon!
                  </p>
                </>
              ) : (
                // No results for current filters
                <>
                  <h3 className="text-lg font-semibold mb-2">No providers match your search</h3>
                  <p className="text-body text-sm mb-4">
                    Try adjusting your filters or search term.
                  </p>
                  <button 
                    onClick={clearFilters}
                    className="text-info hover:text-info text-sm font-medium"
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
                className="px-4 py-2 rounded border bg-surface hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <div className="text-sm text-body">
                Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{pages}</span>
              </div>
              <button 
                disabled={page >= pages} 
                onClick={() => load(page + 1)} 
                className="px-4 py-2 rounded border bg-surface hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}

          {/* Disclaimer */}
          {!initialLoad && (
            <div className="text-xs text-muted text-center mt-6">
              Listings are informational and not endorsements. Verify licenses independently.
            </div>
          )}
        </SignedIn>
      </div>
    </>
  );
}

