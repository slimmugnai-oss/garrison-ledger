/**
 * AMENITIES INTELLIGENCE SECTION
 * Displays comprehensive amenities analysis (30+ categories)
 */

"use client";

import Icon from "@/app/components/ui/Icon";
import type { NeighborhoodCard } from "@/app/types/navigator";

interface Props {
  neighborhood: NeighborhoodCard;
}

export default function AmenitiesIntelligenceSection({ neighborhood }: Props) {
  const enhanced = neighborhood.payload.enhanced_amenities;

  if (!enhanced) {
    return (
      <div className="rounded-lg bg-gray-50 p-8 text-center">
        <Icon name="MapPin" className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <p className="text-gray-600">Amenities intelligence not available for this neighborhood.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lifestyle Scores */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-6">
          <div className="mb-2 text-sm text-slate-600">Walkability</div>
          <div className="mb-2 text-4xl font-bold text-indigo-600">{enhanced.walkability_score}</div>
          <div className="text-xs text-slate-500">out of 100</div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600"
              style={{ width: `${enhanced.walkability_score}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-6">
          <div className="mb-2 text-sm text-slate-600">Family-Friendliness</div>
          <div className="mb-2 text-4xl font-bold text-green-600">{enhanced.family_friendliness_score}</div>
          <div className="text-xs text-slate-500">out of 100</div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600"
              style={{ width: `${enhanced.family_friendliness_score}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6">
          <div className="mb-2 text-sm text-slate-600">Overall Amenities</div>
          <div className="mb-2 text-4xl font-bold text-slate-700">{enhanced.overall_score}</div>
          <div className="text-xs text-slate-500">out of 100</div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-slate-600 to-slate-700"
              style={{ width: `${enhanced.overall_score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Total Amenities Summary */}
      <div className="rounded-lg border-2 border-slate-200 bg-white p-6">
        <div className="text-center">
          <div className="text-5xl font-bold text-slate-900">{enhanced.total_amenities}</div>
          <div className="mt-2 text-lg text-slate-600">Total Amenities Within 3 Miles</div>
        </div>
      </div>

      {/* Amenity Categories */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-slate-900">Categories</h4>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {renderAmenityCategory("Essentials", enhanced.essentials, "ShoppingCart")}
          {renderAmenityCategory("Family Activities", enhanced.family_activities, "Users")}
          {renderAmenityCategory("Healthcare", enhanced.healthcare, "Heart")}
          {renderAmenityCategory("Dining", enhanced.dining, "Coffee")}
          {renderAmenityCategory("Fitness", enhanced.fitness, "Zap")}
          {renderAmenityCategory("Services", enhanced.services, "Briefcase")}
          {renderAmenityCategory("Spouse Employment", enhanced.spouse_employment, "TrendingUp")}
          {renderAmenityCategory("Pets", enhanced.pets, "Home")}
          {renderAmenityCategory("Community", enhanced.community, "Users")}
          {renderAmenityCategory("Home & Auto", enhanced.home_auto, "Settings")}
        </div>
      </div>
    </div>
  );
}

// Amenity Category Renderer
function renderAmenityCategory(title: string, category: any, iconName: string) {
  if (!category || category.count === 0) return null;

  return (
    <div className="rounded-lg border-2 border-slate-200 bg-white p-4 transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name={iconName as any} className="h-5 w-5 text-slate-700" />
          <span className="font-bold text-slate-900">{title}</span>
        </div>
        <span className="text-2xl font-bold text-slate-700">{category.count}</span>
      </div>
      {category.top_picks && category.top_picks.length > 0 && (
        <div className="space-y-2">
          {category.top_picks.slice(0, 3).map((place: any, i: number) => (
            <a
              key={i}
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                place.name + (place.address ? " " + place.address : "")
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded border border-slate-100 bg-slate-50 p-3 text-sm transition-colors hover:bg-blue-50 hover:border-blue-200"
            >
              <div className="mb-1 flex items-start justify-between gap-2">
                <span className="line-clamp-1 font-semibold text-slate-900">{place.name}</span>
                {place.rating && (
                  <span className="flex-shrink-0 font-bold text-amber-600">{place.rating.toFixed(1)}</span>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{place.distance_mi?.toFixed(1)} mi away</span>
                {place.reviews && <span>{place.reviews} reviews</span>}
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-600">
                <span>Open in Google Maps</span>
                <Icon name="ExternalLink" className="h-3 w-3" />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

