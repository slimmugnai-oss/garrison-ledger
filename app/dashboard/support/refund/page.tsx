"use client";
import { useState } from "react";

import Header from "@/app/components/Header";

export default function RefundPage() {
  const [reason, setReason] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    const res = await fetch("/api/support/refund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason })
    });
    setBusy(false);
    if (res.ok) setOk(true);
  }

  if (ok) {
    return (
      <>
        <Header />
        <div className="max-w-xl mx-auto p-6">
          <div className="rounded-lg border-2 border-success bg-success-subtle p-6 text-center">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-success mb-2">Refund Request Submitted</h2>
            <p className="text-success">
              Thanks — we&apos;ve logged your refund request. We honor 7-day refunds in full. 
              You&apos;ll receive confirmation at your registered email within 24 hours.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold">Request a Refund</h1>
        <div className="rounded-lg border border-info bg-info-subtle p-4">
          <p className="text-sm text-info">
            <strong>Refund Policy:</strong> If you&apos;re not satisfied with your purchase, 
            we&apos;ll work with you to resolve any issues or provide a refund as appropriate.
          </p>
        </div>
        
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm font-medium text-body">
              Tell us why you&apos;re canceling (optional)
            </span>
            <textarea 
              value={reason} 
              onChange={e => setReason(e.target.value)} 
              rows={5}
              className="mt-1 w-full border border-default rounded-lg p-3 text-primary focus:ring-2 focus:ring-blue-500 focus:border-info" 
              placeholder="Your feedback helps us improve..."
            />
          </label>
          
          <button 
            onClick={submit} 
            disabled={busy}
            className="w-full rounded-lg bg-slate-800 text-white px-4 py-3 font-semibold hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {busy ? "Submitting..." : "Submit Refund Request"}
          </button>
        </div>
        
        <p className="text-xs text-muted text-center">
          Your request will be processed within 24 hours. Refunds typically appear in 5-10 business days.
        </p>
      </div>
    </>
  );
}

