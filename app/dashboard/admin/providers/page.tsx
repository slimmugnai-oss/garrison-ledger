"use client";
import { useEffect, useState } from "react";
import Header from "@/app/components/Header";

export default function AdminProviders() {

  const [form, setForm] = useState<Record<string, unknown>>({
    type: "agent", name: "", business_name: "", email: "", phone: "",
    website: "", calendly: "", state: "", city: "", zip: "",
    stations: "", coverage_states: "", military_friendly: true, spouse_owned: false, va_expert: false,
    license_id: "", notes: ""
  });
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  type Provider = {
    id: string;
    type: string;
    name: string | null;
    business_name: string | null;
    city: string | null;
    state: string | null;
  };

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/directory/providers?state=&type=&page=1&size=50");
      if (res.status === 402 || res.status === 403) {
        setAuthError(true);
        return;
      }
      const j = await res.json();
      setRows(j.items || []);
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => { 
    load(); 
  }, []);

  async function add() {
    setBusy(true);
    try {
      const payload = {
        ...form,
        stations: form.stations ? String(form.stations).split(",").map((s: string) => s.trim()).filter(Boolean) : [],
        coverage_states: form.coverage_states ? String(form.coverage_states).split(",").map((s: string) => s.trim().toUpperCase()).filter(Boolean) : []
      };
      const res = await fetch("/api/directory/admin", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload) 
      });
      
      if (res.status === 403) {
        alert("You are not authorized to add providers. Contact the administrator.");
        return;
      }
      
      if (res.ok) {
        setForm({ 
          ...form, 
          name: "", business_name: "", email: "", phone: "", website: "", calendly: "", 
          state: "", city: "", zip: "", stations: "", coverage_states: "", license_id: "", notes: "" 
        });
        await load();
      }
    } finally {
      setBusy(false);
    }
  }

  async function approve(id: string) {
    await fetch("/api/directory/admin", { 
      method: "PATCH", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ id, status: "approved" }) 
    });
    await load();
  }

  if (authError) {
    return (
      <>
        <Header />
        <div className="p-6 max-w-4xl mx-auto">
          <div className="bg-danger-subtle border border-danger rounded-lg p-6 text-center">
            <div className="text-danger text-xl font-bold mb-2">🔒 Access Denied</div>
            <p className="text-danger">You are not authorized to manage providers. Contact the administrator if you believe this is an error.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Providers Admin</h1>

        <div className="rounded border bg-surface p-4 shadow-sm space-y-2">
          <h2 className="font-semibold mb-4">Add New Provider</h2>
          <div className="grid gap-2 sm:grid-cols-3">
            <select value={String(form.type)} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="border rounded px-2 py-2">
              <option value="agent">Agent</option>
              <option value="lender">Lender</option>
              <option value="property_manager">Property Manager</option>
              <option value="other">Other</option>
            </select>
            <input placeholder="Business name" value={String(form.business_name)} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} className="border rounded px-2 py-2" />
            <input placeholder="Contact name" value={String(form.name)} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="border rounded px-2 py-2" />
            <input placeholder="Email" value={String(form.email)} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="border rounded px-2 py-2" />
            <input placeholder="Phone" value={String(form.phone)} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="border rounded px-2 py-2" />
            <input placeholder="Website" value={String(form.website)} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} className="border rounded px-2 py-2" />
            <input placeholder="Calendly" value={String(form.calendly)} onChange={e => setForm(f => ({ ...f, calendly: e.target.value }))} className="border rounded px-2 py-2" />
            <input placeholder="State (TX)" value={String(form.state)} onChange={e => setForm(f => ({ ...f, state: e.target.value.toUpperCase() }))} className="border rounded px-2 py-2" />
            <input placeholder="City" value={String(form.city)} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="border rounded px-2 py-2" />
            <input placeholder="ZIP" value={String(form.zip)} onChange={e => setForm(f => ({ ...f, zip: e.target.value }))} className="border rounded px-2 py-2" />
            <input placeholder="Stations (comma-separated)" value={String(form.stations)} onChange={e => setForm(f => ({ ...f, stations: e.target.value }))} className="border rounded px-2 py-2 sm:col-span-2" />
            <input placeholder="Coverage states (e.g., TX,OK,LA)" value={String(form.coverage_states)} onChange={e => setForm(f => ({ ...f, coverage_states: e.target.value }))} className="border rounded px-2 py-2 sm:col-span-2" />
            <input placeholder="License ID (NMLS, RE#)" value={String(form.license_id)} onChange={e => setForm(f => ({ ...f, license_id: e.target.value }))} className="border rounded px-2 py-2" />
            <textarea placeholder="Notes" value={String(form.notes)} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} className="border rounded px-2 py-2 sm:col-span-3" />
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm inline-flex items-center gap-2">
              <input type="checkbox" checked={Boolean(form.military_friendly)} onChange={e => setForm(f => ({ ...f, military_friendly: e.target.checked }))} />
              Military-friendly
            </label>
            <label className="text-sm inline-flex items-center gap-2">
              <input type="checkbox" checked={Boolean(form.spouse_owned)} onChange={e => setForm(f => ({ ...f, spouse_owned: e.target.checked }))} />
              Spouse-owned
            </label>
            <label className="text-sm inline-flex items-center gap-2">
              <input type="checkbox" checked={Boolean(form.va_expert)} onChange={e => setForm(f => ({ ...f, va_expert: e.target.checked }))} />
              VA-savvy
            </label>
          </div>
          <button onClick={add} disabled={busy} className="rounded bg-slate-800 text-white px-4 py-2 hover:bg-slate-900 disabled:opacity-50">
            {busy ? "Adding…" : "Add provider"}
          </button>
        </div>

        <div className="rounded border bg-surface p-4 shadow-sm">
          <h2 className="font-semibold mb-2">Latest providers</h2>
          {loading ? <div>Loading…</div> : (
            <div className="grid gap-3 sm:grid-cols-2">
              {rows.map(r => (
                <div key={r.id} className="border rounded p-3">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium">{r.business_name || r.name}</div>
                      <div className="text-xs text-muted">{r.type} · {r.city || ""}{r.city && r.state ? ", " : ""}{r.state || ""}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => approve(r.id)} className="text-xs rounded border px-2 py-1 hover:bg-success-subtle">Approve</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

