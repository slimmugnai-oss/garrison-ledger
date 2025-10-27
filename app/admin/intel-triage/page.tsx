/**
 * ADMIN INTEL TRIAGE
 *
 * Review and fix content flags
 * - Filter by severity, flag type, domain
 * - Mark flags as resolved
 * - Quick-edit content
 */

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import Badge from "@/app/components/ui/Badge";
import Icon from "@/app/components/ui/Icon";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function IntelTriagePage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // Get flagged content blocks
  const { data: flags } = await supabaseAdmin
    .from("content_flags")
    .select(
      `
      *,
      content_blocks!inner(id, title, slug, domain, status)
    `
    )
    .is("resolved_at", null)
    .order("severity", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(100);

  // Define proper types for block and flag data
  interface ContentBlock {
    id: string;
    title: string;
    slug: string | null;
    domain: string | null;
    status: string;
  }

  interface ContentFlag {
    id: string;
    severity: string;
    flag_type: string;
    sample: string;
    recommendation: string;
    content_blocks: ContentBlock;
  }

  // Group by block
  const flaggedBlocks = new Map<
    string,
    {
      block: ContentBlock;
      flags: ContentFlag[];
      criticalCount: number;
      highCount: number;
    }
  >();

  for (const flag of (flags as ContentFlag[]) || []) {
    const block = flag.content_blocks;
    const existing = flaggedBlocks.get(block.id);

    if (existing) {
      existing.flags.push(flag);
      if (flag.severity === "critical") existing.criticalCount++;
      if (flag.severity === "high") existing.highCount++;
    } else {
      flaggedBlocks.set(block.id, {
        block,
        flags: [flag],
        criticalCount: flag.severity === "critical" ? 1 : 0,
        highCount: flag.severity === "high" ? 1 : 0,
      });
    }
  }

  const blocksArray = Array.from(flaggedBlocks.values());

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-lora mb-3 text-4xl font-bold text-gray-900">Intel Triage</h1>
            <p className="text-lg text-gray-600">Review and resolve content flags</p>
          </div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm text-gray-600">Total Blocks</p>
                  <p className="text-3xl font-bold text-gray-900">{blocksArray.length}</p>
                </div>
                <Icon name="File" className="h-8 w-8 text-gray-400" />
              </div>
            </div>

            <div className="rounded-lg border border-red-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm text-gray-600">Critical Flags</p>
                  <p className="text-3xl font-bold text-red-600">
                    {blocksArray.reduce((sum, b) => sum + b.criticalCount, 0)}
                  </p>
                </div>
                <Icon name="AlertCircle" className="h-8 w-8 text-red-400" />
              </div>
            </div>

            <div className="rounded-lg border border-yellow-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm text-gray-600">High Priority</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {blocksArray.reduce((sum, b) => sum + b.highCount, 0)}
                  </p>
                </div>
                <Icon name="AlertTriangle" className="h-8 w-8 text-yellow-400" />
              </div>
            </div>

            <div className="rounded-lg border border-green-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm text-gray-600">Auto-Fixable</p>
                  <p className="text-3xl font-bold text-green-600">
                    {flags?.filter(
                      (f) =>
                        f.flag_type === "MISSING_DISCLAIMER" || f.flag_type === "GUARANTEE_LANGUAGE"
                    ).length || 0}
                  </p>
                </div>
                <Icon name="CheckCircle" className="h-8 w-8 text-green-400" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-4">
              <Icon name="Info" className="h-5 w-5 flex-shrink-0 text-blue-600" />
              <div className="flex-1">
                <p className="mb-1 text-sm font-medium text-blue-900">
                  Automated Remediation Available
                </p>
                <p className="text-sm text-blue-700">
                  Run{" "}
                  <code className="rounded bg-blue-100 px-2 py-0.5">npm run content:autofix</code>{" "}
                  to automatically fix MISSING_DISCLAIMER and GUARANTEE_LANGUAGE flags.
                </p>
              </div>
            </div>
          </div>

          {/* Flagged Blocks List */}
          {blocksArray.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <Icon name="CheckCircle" className="mx-auto mb-4 h-16 w-16 text-green-600" />
              <h3 className="mb-2 text-xl font-semibold text-gray-900">All Clear!</h3>
              <p className="text-gray-600">No unresolved content flags. Great work!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {blocksArray.map(({ block, flags, criticalCount, highCount }) => (
                <div key={block.id} className="rounded-lg border border-gray-200 bg-white p-6">
                  {/* Block Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {String(block.title)}
                        </h3>
                        <Badge variant={block.status === "published" ? "success" : "warning"}>
                          {String(block.status)}
                        </Badge>
                        {block.domain && <Badge variant="info">{String(block.domain)}</Badge>}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>
                          {flags.length} flag{flags.length > 1 ? "s" : ""}
                        </span>
                        {criticalCount > 0 && (
                          <span className="font-medium text-red-600">{criticalCount} critical</span>
                        )}
                        {highCount > 0 && (
                          <span className="font-medium text-yellow-600">{highCount} high</span>
                        )}
                      </div>
                    </div>

                    <a
                      href={`/dashboard/ask/${block.slug || block.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      View Content →
                    </a>
                  </div>

                  {/* Flags */}
                  <div className="space-y-3">
                    {flags.map((flag) => (
                      <div
                        key={flag.id}
                        className={`rounded-lg border-l-4 p-4 ${
                          flag.severity === "critical"
                            ? "border-red-500 bg-red-50"
                            : flag.severity === "high"
                              ? "border-yellow-500 bg-yellow-50"
                              : "border-blue-500 bg-blue-50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                              <Badge
                                variant={
                                  flag.severity === "critical"
                                    ? "danger"
                                    : flag.severity === "high"
                                      ? "warning"
                                      : "info"
                                }
                              >
                                {String(flag.severity)}
                              </Badge>
                              <span className="text-sm font-medium text-gray-700">
                                {String(flag.flag_type)}
                              </span>
                            </div>
                            <p className="mb-2 text-sm text-gray-700">
                              <strong>Sample:</strong> {String(flag.sample)}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Fix:</strong> {String(flag.recommendation)}
                            </p>
                          </div>

                          <form action="/api/admin/resolve-flag" method="post">
                            <input
                              id="flagId"
                              type="hidden"
                              name="flagId"
                              value={String(flag.id)}
                            />
                            <button
                              type="submit"
                              className="rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
                            >
                              Mark Resolved
                            </button>
                          </form>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
