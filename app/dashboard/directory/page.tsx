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
    }
  }

  useEffect(() => { 
    load(1); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pages = useMemo(() => Math.max(1, Math.ceil(total / 20)), [total]);

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
        <input placeholder="Search name, city, notes…" value={q} onChange={e => setQ(e.target.value)} className="border rounded px-2 py-2 sm:col-span-2" />
        <select value={type} onChange={e => setType(e.target.value)} className="border rounded px-2 py-2">
          <option value="">Any type</option>
          <option value="agent">Agent</option>
          <option value="lender">Lender</option>
          <option value="property_manager">Property Manager</option>
          <option value="other">Other</option>
        </select>
        <input placeholder="State (e.g., TX)" maxLength={2} value={state} onChange={e => setState(e.target.value.toUpperCase())} className="border rounded px-2 py-2" />
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={mil} onChange={e => setMil(e.target.checked)} />
          Military-friendly
        </label>
      </div>
      <div className="mt-3">
        <button onClick={() => load(1)} disabled={loading}
          className="rounded bg-slate-800 text-white px-4 py-2 hover:bg-slate-900 disabled:opacity-50">
          {loading ? "Searching…" : "Search"}
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

          {items.length === 0 && !loading ? (
            <div className="text-sm text-gray-600">No results yet. Try broadening your search.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {items.map(p => <Card key={p.id} p={p} />)}
            </div>
          )}

          {pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <button disabled={page <= 1} onClick={() => load(page - 1)} className="px-3 py-1 rounded border disabled:opacity-50">Prev</button>
              <div className="text-sm text-gray-600">Page {page} of {pages}</div>
              <button disabled={page >= pages} onClick={() => load(page + 1)} className="px-3 py-1 rounded border disabled:opacity-50">Next</button>
            </div>
          )}
          <div className="text-xs text-gray-500 mt-4">Listings are informational and not endorsements. Verify licenses independently.</div>
        </SignedIn>
      </div>
    </>
  );
}

