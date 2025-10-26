import { currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

function isAllowed(email?: string | null) {
  const list = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return !!email && list.includes(email.toLowerCase());
}

export default async function AdminAssessments() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;
  if (!isAllowed(email)) return <div className="p-6">Not authorized.</div>;

  const { data, error } = await supabaseAdmin
    .from("assessments")
    .select("user_id, updated_at, answers")
    .order("updated_at", { ascending: false })
    .limit(200);

  if (error) return <div className="p-6">Error: {String(error.message)}</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">Assessments (latest)</h1>
      <div className="bg-surface overflow-auto rounded border">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left">User</th>
              <th className="px-3 py-2 text-left">Updated</th>
              <th className="px-3 py-2 text-left">Answers</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              type AssessmentRow = { user_id: string; updated_at: string; answers: unknown };
              const rows: AssessmentRow[] = (data ?? []) as AssessmentRow[];
              return rows.map((r) => (
                <tr key={`${r.user_id}-${r.updated_at}`} className="border-t align-top">
                  <td className="px-3 py-2">{r.user_id}</td>
                  <td className="px-3 py-2">{new Date(r.updated_at).toLocaleString()}</td>
                  <td className="whitespace-pre-wrap px-3 py-2">
                    {JSON.stringify(r.answers, null, 2)}
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
}
