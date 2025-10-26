"use client";

import { useEffect, useState } from "react";

export default function SupabaseDebugger() {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const info = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      environment: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Present" : "Missing",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Present" : "Missing",
      },
      window: {
        location: window.location.href,
        origin: window.location.origin,
      },
      supabase: {
        // Check if supabase is available
        available: typeof window !== "undefined" && (window as any).supabase ? "Yes" : "No",
      }
    };

    console.log("🔍 SupabaseDebugger Info:", info);
    setDebugInfo(info);

    // Listen for any Supabase-related errors
    const errorHandler = (event: ErrorEvent) => {
      if (event.error && event.error.message && event.error.message.includes("supabaseKey")) {
        console.error("🚨 SUPABASE ERROR CAUGHT BY DEBUGGER!");
        console.error("  - Error:", event.error.message);
        console.error("  - Stack:", event.error.stack);
        console.error("  - Event:", event);
      }
    };

    window.addEventListener("error", errorHandler);

    return () => {
      window.removeEventListener("error", errorHandler);
    };
  }, []);

  if (process.env.NODE_ENV !== "development") {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg bg-red-100 p-4 shadow-lg">
      <h3 className="font-bold text-red-800">Supabase Debug Info</h3>
      <pre className="text-xs text-red-700">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
}
