import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import Header from "@/app/components/Header";

export const dynamic = "force-dynamic";

function isAllowed(email: string | undefined | null) {
  const list = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  return !!email && list.includes(email.toLowerCase());
}

export default async function AdminEvents() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;
  
  if (!isAllowed(email)) {
    return (
      <>
        <Header />
        <div className="p-6 max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 text-xl font-bold mb-2">🔒 Access Denied</div>
            <p className="text-red-700">You are not authorized to view this page.</p>
          </div>
        </div>
      </>
    );
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { data } = await sb
    .from("events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(400);

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Analytics Events (Latest 400)</h1>
        <div className="overflow-auto rounded border bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Time</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">User ID</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Event Name</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Path</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Props</th>
              </tr>
            </thead>
            <tbody>
              {(data || []).map((e: {
                id: number;
                created_at: string;
                user_id: string | null;
                name: string;
                path: string | null;
                props: Record<string, unknown> | null;
              }) => (
                <tr key={e.id} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-500 text-xs">
                    {new Date(e.created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-xs font-mono">
                    {e.user_id ? e.user_id.slice(0, 12) + '...' : '-'}
                  </td>
                  <td className="px-3 py-2 font-medium text-blue-600">{e.name}</td>
                  <td className="px-3 py-2 text-gray-600">{e.path || '-'}</td>
                  <td className="px-3 py-2 text-gray-600 text-xs">
                    {e.props ? JSON.stringify(e.props).slice(0, 100) : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

