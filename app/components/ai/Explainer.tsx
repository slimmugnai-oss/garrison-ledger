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
    <div className="mt-6">
      <button
        onClick={run}
        disabled={loading}
        className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {loading ? "✨ Generating explanation..." : "✨ Explain these results"}
      </button>
      {text && (
        <div 
          className="mt-4 rounded-lg border-2 border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30 p-5 shadow-md text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ 
            __html: text
              .split('\n')
              .map(line => {
                const trimmed = line.trim();
                if (!trimmed) return '<div style="height: 16px;"></div>';
                if (trimmed.endsWith(':')) return `<div class="font-bold text-gray-900 text-base mt-4 mb-2">${line}</div>`;
                if (trimmed.startsWith('•')) return `<div class="ml-4 text-gray-700 mb-1">${line}</div>`;
                return `<div class="text-gray-700 mb-2">${line}</div>`;
              })
              .join('')
          }}
        />
      )}
    </div>
  );
}

