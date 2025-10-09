"use client";
import { useRef, useState } from "react";

export default function Explainer({ payload }: { payload: Record<string, unknown> }) {
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function run() {
    if (loading) return;
    setText("");
    setLoading(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    
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
        setText(prev => prev + decoder.decode(value, { stream: true }));
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error streaming explanation:', error);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      <button
        onClick={run}
        disabled={loading}
        className="rounded bg-slate-800 text-white px-3 py-2 text-sm hover:bg-slate-900 disabled:opacity-50 transition-colors"
      >
        {loading ? "Explaining…" : "✨ Explain these results"}
      </button>
      {text && (
        <div className="mt-3 whitespace-pre-line text-sm leading-relaxed rounded border bg-white p-4 shadow-sm text-gray-700 font-sans">
          {text}
        </div>
      )}
    </div>
  );
}

