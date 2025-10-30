/**
 * SCHOOLS INTELLIGENCE SECTION
 * Displays comprehensive schools analysis for a neighborhood
 */

"use client";

import Icon from "@/app/components/ui/Icon";
import type { NeighborhoodCard } from "@/app/types/navigator";

interface Props {
  neighborhood: NeighborhoodCard;
}

export default function SchoolsIntelligenceSection({ neighborhood }: Props) {
  const schoolsIntel = neighborhood.payload.schools_intelligence;

  if (!schoolsIntel) {
    return (
      <div className="rounded-lg bg-gray-50 p-8 text-center">
        <Icon name="GraduationCap" className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <p className="text-gray-600">Schools intelligence not available for this neighborhood.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="rounded-lg border-l-4 border-blue-600 bg-blue-50 p-6">
        <div className="mb-2 font-semibold text-blue-900">Executive Summary</div>
        <p className="leading-relaxed text-slate-700">{schoolsIntel.executive_summary}</p>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border-2 border-slate-200 bg-white p-6">
          <div className="text-sm text-slate-600">Total Schools</div>
          <div className="text-4xl font-bold text-blue-600">{schoolsIntel.total_schools}</div>
        </div>
        <div className="rounded-lg border-2 border-slate-200 bg-white p-6">
          <div className="text-sm text-slate-600">Average Rating</div>
          <div className="text-4xl font-bold text-blue-600">{schoolsIntel.overall_avg_rating.toFixed(1)}</div>
          <div className="text-xs text-slate-500">out of 10</div>
        </div>
      </div>

      {/* Grade Level Breakdown */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-slate-900">Schools by Grade Level</h4>
        
        <div className="grid gap-4 md:grid-cols-2">
          {schoolsIntel.by_grade.elementary.count > 0 && (
            <GradeLevelCard
              level="Elementary (K-5)"
              count={schoolsIntel.by_grade.elementary.count}
              avgRating={schoolsIntel.by_grade.elementary.avg_rating}
              topSchools={schoolsIntel.by_grade.elementary.top_picks}
            />
          )}
          {schoolsIntel.by_grade.middle.count > 0 && (
            <GradeLevelCard
              level="Middle (6-8)"
              count={schoolsIntel.by_grade.middle.count}
              avgRating={schoolsIntel.by_grade.middle.avg_rating}
              topSchools={schoolsIntel.by_grade.middle.top_picks}
            />
          )}
          {schoolsIntel.by_grade.high.count > 0 && (
            <GradeLevelCard
              level="High (9-12)"
              count={schoolsIntel.by_grade.high.count}
              avgRating={schoolsIntel.by_grade.high.avg_rating}
              topSchools={schoolsIntel.by_grade.high.top_picks}
            />
          )}
        </div>
      </div>

      {/* Data Attribution */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-center gap-2 text-sm text-blue-800">
          <Icon name="Info" className="h-4 w-4" />
          <span>
            <strong>Data Source:</strong> SchoolDigger • Updated daily •{" "}
            <a
              href="https://www.schooldigger.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-900"
            >
              View on SchoolDigger
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}

// Grade Level Card Component
interface GradeLevelCardProps {
  level: string;
  count: number;
  avgRating: number;
  topSchools: Array<{ name: string; rating: number; distance_mi?: number }>;
}

function GradeLevelCard({ level, count, avgRating, topSchools }: GradeLevelCardProps) {
  return (
    <div className="rounded-lg border-2 border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="font-bold text-slate-900">{level}</div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-600">{avgRating.toFixed(1)}</div>
          <div className="text-xs text-slate-500">avg rating</div>
        </div>
      </div>
      <div className="mb-4 text-sm text-slate-600">{count} schools available</div>
      {topSchools.length > 0 && (
        <div className="space-y-3 border-t border-slate-200 pt-4">
          <div className="text-xs font-semibold uppercase text-slate-700">Top Picks:</div>
          {topSchools.slice(0, 3).map((school, i) => (
            <div key={i} className="rounded-lg bg-slate-50 p-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-semibold text-slate-900">{school.name}</span>
                <span className="text-lg font-bold text-blue-600">{school.rating.toFixed(1)}</span>
              </div>
              <div className="text-xs text-slate-500">
                {school.distance_mi ? `${school.distance_mi.toFixed(1)} mi away` : "Nearby"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

