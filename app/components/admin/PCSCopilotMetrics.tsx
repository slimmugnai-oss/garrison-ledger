"use client";

import { useState } from "react";
import AnimatedCard from "@/app/components/ui/AnimatedCard";
import Badge from "@/app/components/ui/Badge";
import Icon from "@/app/components/ui/Icon";

interface PCSCopilotMetricsProps {
  metrics: any;
  recentClaims: any[];
  validationIssues: any[];
  rateHealth: any[];
}

export default function PCSCopilotMetrics({
  metrics,
  recentClaims,
  validationIssues,
  rateHealth,
}: PCSCopilotMetricsProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatedCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-50 p-3">
              <Icon name="FolderOpen" className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{metrics?.total_claims || 0}</div>
              <div className="text-sm text-slate-600">Total Claims</div>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-green-50 p-3">
              <Icon name="TrendingUp" className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">
                {metrics?.completion_rate || 0}%
              </div>
              <div className="text-sm text-slate-600">Completion Rate</div>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-yellow-50 p-3">
              <Icon name="DollarSign" className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">
                ${metrics?.avg_estimate?.toLocaleString() || "0"}
              </div>
              <div className="text-sm text-slate-600">Avg Estimate</div>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-purple-50 p-3">
              <Icon name="Star" className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">
                {metrics?.avg_readiness || 0}%
              </div>
              <div className="text-sm text-slate-600">Avg Readiness</div>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setTimeRange("7d")}
          className={`rounded-lg px-4 py-2 font-medium transition-colors ${
            timeRange === "7d"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          7 Days
        </button>
        <button
          onClick={() => setTimeRange("30d")}
          className={`rounded-lg px-4 py-2 font-medium transition-colors ${
            timeRange === "30d"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          30 Days
        </button>
        <button
          onClick={() => setTimeRange("90d")}
          className={`rounded-lg px-4 py-2 font-medium transition-colors ${
            timeRange === "90d"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          90 Days
        </button>
      </div>

      {/* Top Validation Issues */}
      <AnimatedCard className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Top Validation Issues</h3>
        <div className="space-y-3">
          {validationIssues.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No validation issues found</div>
          ) : (
            validationIssues.map((issue, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
              >
                <div className="flex items-center gap-3">
                  <Icon
                    name={issue.severity === "error" ? "AlertCircle" : "AlertTriangle"}
                    className={`h-5 w-5 ${
                      issue.severity === "error" ? "text-red-600" : "text-yellow-600"
                    }`}
                  />
                  <div>
                    <div className="font-medium text-slate-900">
                      {issue.check_category.replace(/_/g, " ")}
                    </div>
                    <div className="text-sm text-slate-600">{issue.severity}</div>
                  </div>
                </div>
                <Badge variant={issue.severity === "error" ? "danger" : "warning"}>
                  {issue.count} claims
                </Badge>
              </div>
            ))
          )}
        </div>
      </AnimatedCard>

      {/* Rate Health Check */}
      <AnimatedCard className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">JTR Rate Health</h3>
        <div className="space-y-3">
          {rateHealth.map((rate, index) => {
            const lastVerified = new Date(rate.last_verified);
            const hoursSince = Math.floor((Date.now() - lastVerified.getTime()) / (1000 * 60 * 60));
            const isStale = hoursSince > 24;

            return (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
              >
                <div className="flex items-center gap-3">
                  <Icon
                    name={isStale ? "AlertTriangle" : "CheckCircle"}
                    className={`h-5 w-5 ${isStale ? "text-yellow-600" : "text-green-600"}`}
                  />
                  <div>
                    <div className="font-medium text-slate-900">{rate.rate_type.toUpperCase()}</div>
                    <div className="text-sm text-slate-600">Last verified {hoursSince}h ago</div>
                  </div>
                </div>
                <Badge variant={rate.verification_status === "verified" ? "success" : "warning"}>
                  {rate.verification_status}
                </Badge>
              </div>
            );
          })}
        </div>
      </AnimatedCard>

      {/* Recent Claims */}
      <AnimatedCard className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Recent Claims</h3>
        <div className="space-y-3">
          {recentClaims.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No recent claims</div>
          ) : (
            recentClaims.map((claim) => (
              <div
                key={claim.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
              >
                <div>
                  <div className="font-medium text-slate-900">{claim.claim_name}</div>
                  <div className="text-sm text-slate-600">
                    {claim.user_profiles?.rank} {claim.user_profiles?.branch} •{" "}
                    {new Date(claim.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-900">
                      {claim.readiness_score}% ready
                    </div>
                    <div className="text-xs text-slate-600">
                      {claim.completion_percentage}% complete
                    </div>
                  </div>
                  <Badge
                    variant={
                      claim.status === "ready_to_submit"
                        ? "success"
                        : claim.status === "draft"
                          ? "secondary"
                          : "primary"
                    }
                  >
                    {claim.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </AnimatedCard>

      {/* Performance Metrics */}
      <div className="grid gap-4 sm:grid-cols-2">
        <AnimatedCard className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">User Engagement</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Claims Started</span>
              <span className="font-semibold text-slate-900">{metrics?.claims_started || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Claims Completed</span>
              <span className="font-semibold text-slate-900">{metrics?.claims_completed || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Avg Time to Complete</span>
              <span className="font-semibold text-slate-900">
                {metrics?.avg_completion_time || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Return Users</span>
              <span className="font-semibold text-slate-900">{metrics?.return_users || 0}%</span>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Business Impact</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Total Savings</span>
              <span className="font-semibold text-green-600">
                ${metrics?.total_savings?.toLocaleString() || "0"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Premium Conversions</span>
              <span className="font-semibold text-slate-900">
                {metrics?.premium_conversions || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">User Satisfaction</span>
              <span className="font-semibold text-slate-900">
                {metrics?.user_satisfaction || "N/A"}/5
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Support Tickets</span>
              <span className="font-semibold text-slate-900">{metrics?.support_tickets || 0}</span>
            </div>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
}
