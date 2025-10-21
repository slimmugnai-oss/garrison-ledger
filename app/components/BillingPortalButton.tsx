"use client";
import { useState } from "react";

export default function BillingPortalButton() {
  const [busy, setBusy] = useState(false);
  
  async function goPortal() {
    setBusy(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Unknown error' }));
        if (error.error === "No Stripe customer found") {
          alert("No active subscription found. Please upgrade to a premium plan first.");
        } else {
          alert("Could not open billing portal. Please contact support.");
        }
        setBusy(false);
        return;
      }
      const j = await res.json();
      if (j?.url) {
        window.location.href = j.url;
      } else {
        alert("Could not open billing portal. Please contact support.");
        setBusy(false);
      }
    } catch (error) {
      alert("Error opening billing portal. Please try again.");
      setBusy(false);
    }
  }

  return (
    <button 
      onClick={goPortal} 
      disabled={busy}
      className="rounded-lg bg-slate-700 text-white px-6 py-3 font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
    >
      {busy ? "Opening portal..." : "💳 Manage Billing"}
    </button>
  );
}

