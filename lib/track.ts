export async function track(name: string, props: Record<string, unknown> = {}) {
  try {
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ name, path: typeof window !== "undefined" ? window.location.pathname : "", props })
    });
  } catch {}
}

