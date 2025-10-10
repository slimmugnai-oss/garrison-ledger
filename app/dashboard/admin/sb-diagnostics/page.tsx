import { currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

function isAllowed(email?: string | null) {
  const list = (process.env.ADMIN_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  // If no allowlist is configured, allow any signed-in user to view diagnostics
  if (list.length === 0) return !!email;
  return !!email && list.includes(email.toLowerCase());
}

async function runDiagnostics() {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  const results: Array<{ title: string; status: number | string; body: string }> = [];

  if (!base || !key) {
    results.push({ title: "Env", status: "error", body: "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" });
    return results;
  }

  try {
    const getUrl = `${base}/rest/v1/assessments?select=answers&limit=1`;
    const r1 = await fetch(getUrl, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Accept-Profile": "public" },
      cache: "no-store"
    });
    const t1 = await r1.text().catch(() => "<no-body>");
    results.push({ title: `GET assessments`, status: r1.status, body: t1 });
  } catch (e) {
    results.push({ title: "GET assessments (exception)", status: "exception", body: String(e) });
  }

  try {
    const rpcUrl = `${base}/rest/v1/rpc/assessments_save`;
    const r2 = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "Content-Profile": "public",
        Prefer: "params=single-object"
      },
      body: JSON.stringify({ p_user_id: "diag_admin_page", p_answers: { ok: true, ts: new Date().toISOString() } })
    });
    const t2 = await r2.text().catch(() => "<no-body>");
    results.push({ title: `POST rpc/assessments_save`, status: r2.status, body: t2 });
  } catch (e) {
    results.push({ title: "POST rpc/assessments_save (exception)", status: "exception", body: String(e) });
  }

  return results;
}

export default async function SupabaseDiagnosticsPage() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;
  if (!isAllowed(email)) return <div className="p-6">Not authorized.</div>;

  const res = await runDiagnostics();
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Supabase Diagnostics</h1>
      <div className="text-sm text-gray-600">Host: {(() => { try { return new URL(base).host; } catch { return base; } })()}</div>
      <div className="text-sm text-gray-600">Key length: {key.length}</div>

      {res.map((r, i) => (
        <div key={i} className="rounded border p-3 bg-white">
          <div className="font-medium">{r.title} — status: {String(r.status)}</div>
          <pre className="whitespace-pre-wrap text-xs mt-2">{r.body || "<empty>"}</pre>
        </div>
      ))}
    </div>
  );
}


