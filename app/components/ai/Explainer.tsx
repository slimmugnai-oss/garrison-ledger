"use client";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";

export default function Explainer({ payload }: { payload: Record<string, unknown> }) {
  const [text, setText] = useState<string>("");
  const [fullText, setFullText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Check premium status on mount
  useEffect(() => {
    async function checkPremium() {
      try {
        const res = await fetch('/api/user/premium-status');
        if (res.ok) {
          const data = await res.json();
          setIsPremium(data.isPremium);
        }
      } catch {
      }
    }
    checkPremium();
  }, []);

  async function run() {
    if (loading) return;
    setText("");
    setFullText("");
    setLoading(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    
    let accumulated = "";
    
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: ctrl.signal
      });
      
      if (!res.body) {
        setLoading(false);
        return;
      }
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        
        if (isPremium) {
          // Premium users see everything
          setText(accumulated);
        } else {
          // Free users see preview only (first 2-3 sentences)
          const sentences = accumulated.split(/[.!?]+/).filter(s => s.trim());
          const preview = sentences.slice(0, 3).join('. ') + (sentences.length > 3 ? '...' : '');
          setText(preview);
          setFullText(accumulated);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
      }
    } finally {
      setLoading(false);
    }
  }

  // Check if we have truncated content
  const isTruncated = !isPremium && fullText && fullText.split(/[.!?]+/).filter(s => s.trim()).length > 3;

  return (
    <div className="mt-6">
      <button
        onClick={run}
        disabled={loading}
        className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {loading ? "✨ Generating explanation..." : "✨ Explain these results"}
      </button>
      
      {text && (
        <div className="mt-4">
          <div 
            className="rounded-lg border-2 border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30 p-5 shadow-md text-sm leading-relaxed text-body"
            dangerouslySetInnerHTML={{ __html: text }}
          />
          
          {/* Upgrade CTA for free users */}
          {isTruncated && (
            <div className="mt-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2">Upgrade to Read Full AI Analysis</h3>
                  <p className="text-white/90 mb-4">
                    This is just a preview. Premium members get complete AI explanations for all calculator results, plus:
                  </p>
                  <ul className="space-y-2 text-sm text-white/95 mb-4">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-300">✓</span>
                      Full AI-curated financial plan (8-10 expert blocks)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-300">✓</span>
                      Unlimited assessments (3 per day)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-300">✓</span>
                      Unlimited library access (410+ articles)
                    </li>
                  </ul>
                  <Link
                    href="/dashboard/upgrade"
                    className="inline-block bg-surface text-info px-6 py-3 rounded-lg font-bold hover:bg-info-subtle transition-colors shadow-lg"
                  >
                    Upgrade to Premium - $9.99/month →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

