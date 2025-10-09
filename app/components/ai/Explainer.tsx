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
        <div className="mt-4 rounded-lg border-2 border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30 p-5 shadow-md space-y-1">
          {text.split('\n').map((line, i) => {
            // Empty line = spacing
            if (!line.trim()) {
              return <div key={i} className="h-2"></div>;
            }
            
            // Section headers (lines ending with :)
            if (line.trim().endsWith(':')) {
              return (
                <div key={i} className="font-bold text-gray-900 mt-3 mb-1 text-base block">
                  {line}
                </div>
              );
            }
            
            // Bullet points
            if (line.trim().startsWith('•')) {
              return (
                <div key={i} className="ml-4 text-gray-700 text-sm block">
                  {line}
                </div>
              );
            }
            
            // Regular lines
            return (
              <div key={i} className="text-gray-700 text-sm leading-relaxed block">
                {line}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

