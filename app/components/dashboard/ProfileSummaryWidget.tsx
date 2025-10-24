"use client";

import Link from "next/link";
import Icon from "@/app/components/ui/Icon";
import AnimatedCard from "@/app/components/ui/AnimatedCard";
import {
  getProfileRecommendations,
  calculateProfileCompletion,
  getCompletionColor,
  getCompletionMessage,
  type UserProfile,
} from "@/lib/profile-recommendations";

interface ProfileSummaryWidgetProps {
  profile: UserProfile & {
    branch?: string | null;
    service_status?: string | null;
  };
  userName?: string;
}

export default function ProfileSummaryWidget({ profile, userName }: ProfileSummaryWidgetProps) {
  const completionPercentage = calculateProfileCompletion(profile);
  const recommendations = getProfileRecommendations(profile);
  const completionColor = getCompletionColor(completionPercentage);
  const completionMessage = getCompletionMessage(completionPercentage);

  // Get top 2 recommendations (1 incomplete + 1 ready/optional)
  const incompleteRec = recommendations.find((r) => r.status === "incomplete");
  const otherRec = recommendations.find((r) => r.status === "ready" || r.status === "optional");

  // Format rank display
  const rankDisplay = profile.paygrade
    ? `${profile.rank || profile.paygrade} (${profile.paygrade})`
    : profile.rank || "Not set";

  // Format base display
  const baseDisplay = profile.current_base
    ? profile.mha_code
      ? `${profile.current_base} (${profile.mha_code})`
      : profile.current_base
    : "Not set";

  // Dependents status
  const dependentsDisplay =
    profile.has_dependents === true
      ? "With dependents"
      : profile.has_dependents === false
        ? "No dependents"
        : "Not set";

  return (
    <AnimatedCard delay={0.05} className="overflow-hidden">
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              <Icon name="User" className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Your Profile</h2>
              <p className="text-sm text-gray-600">
                {completionPercentage}% complete • {completionMessage}
              </p>
            </div>
          </div>

          {/* Completion Ring - Desktop */}
          <div className="hidden md:block">
            <div className="relative h-20 w-20">
              <svg className="h-20 w-20 -rotate-90 transform">
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - completionPercentage / 100)}`}
                  className={`${completionColor} transition-all duration-500`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-lg font-bold ${completionColor}`}>
                  {completionPercentage}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Stats Grid */}
        <div className="mb-6 grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-3">
          {/* Rank */}
          <div>
            <div className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500">
              <Icon name="Shield" className="h-3 w-3" />
              Rank / Paygrade
            </div>
            <div className="text-sm font-semibold text-gray-900">{rankDisplay}</div>
          </div>

          {/* Base */}
          <div>
            <div className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500">
              <Icon name="MapPin" className="h-3 w-3" />
              Current Base
            </div>
            <div className="text-sm font-semibold text-gray-900">{baseDisplay}</div>
          </div>

          {/* Dependents */}
          <div>
            <div className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500">
              <Icon name="Users" className="h-3 w-3" />
              Family Status
            </div>
            <div className="text-sm font-semibold text-gray-900">{dependentsDisplay}</div>
          </div>
        </div>

        {/* Tool Recommendations */}
        {(incompleteRec || otherRec) && (
          <div className="mb-6 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Tool Readiness</h3>

            {/* Incomplete recommendation (priority) */}
            {incompleteRec && (
              <div className="flex items-start gap-3 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-3">
                <Icon name="AlertCircle" className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-yellow-900">{incompleteRec.tool}</div>
                  <div className="text-xs text-yellow-800">{incompleteRec.message}</div>
                </div>
              </div>
            )}

            {/* Ready or optional recommendation */}
            {otherRec && (
              <div
                className={`flex items-start gap-3 rounded-lg border-l-4 p-3 ${
                  otherRec.status === "ready"
                    ? "border-green-500 bg-green-50"
                    : "border-blue-500 bg-blue-50"
                }`}
              >
                <Icon
                  name={otherRec.status === "ready" ? "CheckCircle" : "Info"}
                  className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                    otherRec.status === "ready" ? "text-green-600" : "text-blue-600"
                  }`}
                />
                <div className="flex-1">
                  <div
                    className={`text-sm font-semibold ${
                      otherRec.status === "ready" ? "text-green-900" : "text-blue-900"
                    }`}
                  >
                    {otherRec.tool}
                  </div>
                  <div
                    className={`text-xs ${
                      otherRec.status === "ready" ? "text-green-800" : "text-blue-800"
                    }`}
                  >
                    {otherRec.message}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Profile CTA */}
        <Link
          href="/dashboard/profile/setup?from=dashboard"
          className="group flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg"
        >
          <Icon name="Edit" className="h-5 w-5" />
          <span>Edit Profile</span>
          <Icon
            name="ArrowRight"
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
          />
        </Link>

        {/* Mobile Completion Ring */}
        <div className="mt-4 flex items-center justify-center md:hidden">
          <div className="relative h-24 w-24">
            <svg className="h-24 w-24 -rotate-90 transform">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                className="text-gray-200"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionPercentage / 100)}`}
                className={`${completionColor} transition-all duration-500`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xl font-bold ${completionColor}`}>
                {completionPercentage}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}
