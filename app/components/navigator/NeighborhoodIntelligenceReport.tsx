/**
 * NEIGHBORHOOD INTELLIGENCE REPORT
 *
 * Comprehensive guide-style report for top 3 neighborhoods
 * Military audience: Professional, factual, actionable
 */

"use client";

import Icon from "@/app/components/ui/Icon";
import type { NeighborhoodCard } from "@/app/types/navigator";

interface Props {
  neighborhood: NeighborhoodCard;
  rank: number;
  baseName: string;
}

export default function NeighborhoodIntelligenceReport({ neighborhood, rank, baseName }: Props) {
  const intel = neighborhood.payload.intelligence;
  const enhanced = neighborhood.payload.enhanced_amenities;

  // If no enhanced data, return null (show standard view)
  if (!intel || !enhanced) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* BLUF - Bottom Line Up Front */}
      <div className="rounded-lg border-2 border-blue-600 bg-blue-50 p-6">
        <div className="mb-3 flex items-center gap-2">
          <Icon name="Info" className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-bold text-blue-900">Bottom Line Up Front (BLUF)</h3>
        </div>
        <p className="mb-4 text-lg leading-relaxed text-gray-900">{intel.quick_verdict}</p>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Icon name="TrendingUp" className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-gray-700">
              Confidence: {intel.confidence_score}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Star" className="h-5 w-5 text-yellow-600" />
            <span className="font-semibold text-gray-700">
              Rank #{rank} of {neighborhood.family_fit_score >= 70 ? "excellent" : "good"} options
            </span>
          </div>
        </div>
      </div>

      {/* Key Strengths */}
      {intel.key_strengths.length > 0 && (
        <div className="rounded-lg border border-green-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <Icon name="CheckCircle" className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-bold text-gray-900">Key Strengths</h3>
          </div>
          <ul className="space-y-3">
            {intel.key_strengths.map((strength, i) => (
              <li key={i} className="flex items-start gap-3">
                <Icon name="Plus" className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <span className="text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Considerations */}
      {intel.considerations.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <Icon name="AlertCircle" className="h-6 w-6 text-amber-600" />
            <h3 className="text-lg font-bold text-gray-900">Considerations</h3>
          </div>
          <ul className="space-y-3">
            {intel.considerations.map((consideration, i) => (
              <li key={i} className="flex items-start gap-3">
                <Icon name="AlertTriangle" className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                <span className="text-gray-700">{consideration}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Lifestyle Profile */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Icon name="Home" className="h-6 w-6 text-indigo-600" />
          <h3 className="text-lg font-bold text-gray-900">Lifestyle Profile</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 text-sm font-semibold text-gray-700">Neighborhood Character</div>
            <div className="rounded-lg bg-gray-50 p-3 text-gray-900">
              {intel.lifestyle.character.charAt(0).toUpperCase() + intel.lifestyle.character.slice(1)}
            </div>
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold text-gray-700">Walkability</div>
            <div className="flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-blue-600"
                  style={{ width: `${intel.lifestyle.walkability_score}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {intel.lifestyle.walkability_score}/100
              </span>
            </div>
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold text-gray-700">Family Friendliness</div>
            <div className="flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-green-600"
                  style={{ width: `${intel.lifestyle.family_friendliness}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {intel.lifestyle.family_friendliness}/100
              </span>
            </div>
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold text-gray-700">Dining Scene</div>
            <div className="rounded-lg bg-gray-50 p-3 text-gray-900">
              {intel.lifestyle.dining_scene.charAt(0).toUpperCase() + intel.lifestyle.dining_scene.slice(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Amenities Guide */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Icon name="MapPin" className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Comprehensive Amenities Guide</h3>
        </div>
        <p className="mb-6 text-gray-700">{intel.amenities_summary}</p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Essentials */}
          <AmenitySection
            title="Essentials"
            icon="ShoppingCart"
            category={enhanced.essentials}
            color="blue"
          />

          {/* Family Activities */}
          <AmenitySection
            title="Family & Kids"
            icon="Users"
            category={enhanced.family_activities}
            color="green"
          />

          {/* Healthcare */}
          <AmenitySection
            title="Healthcare"
            icon="Heart"
            category={enhanced.healthcare}
            color="red"
          />

          {/* Dining */}
          <AmenitySection title="Dining" icon="ShoppingCart" category={enhanced.dining} color="orange" />

          {/* Fitness */}
          <AmenitySection
            title="Fitness & Recreation"
            icon="Heart"
            category={enhanced.fitness}
            color="purple"
          />

          {/* Services */}
          <AmenitySection
            title="Services"
            icon="Briefcase"
            category={enhanced.services}
            color="gray"
          />

          {/* Spouse Employment */}
          <AmenitySection
            title="Spouse Employment"
            icon="Briefcase"
            category={enhanced.spouse_employment}
            color="indigo"
          />
        </div>

        <div className="mt-6 rounded-lg bg-gray-50 p-4">
          <div className="text-sm font-semibold text-gray-700">
            Total: {enhanced.total_amenities} amenities within 3 miles
          </div>
        </div>
      </div>

      {/* Schools Intelligence */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Icon name="GraduationCap" className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-bold text-gray-900">Schools Intelligence</h3>
        </div>
        <p className="text-gray-700">{intel.schools_summary}</p>
      </div>

      {/* Commute Intelligence */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Icon name="Truck" className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Commute Intelligence</h3>
        </div>
        <p className="text-gray-700">{intel.commute_summary}</p>
      </div>

      {/* Quality of Life */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Icon name="Sun" className="h-6 w-6 text-orange-600" />
          <h3 className="text-lg font-bold text-gray-900">Quality of Life</h3>
        </div>
        <p className="text-gray-700">{intel.quality_of_life_summary}</p>
      </div>

      {/* Bottom Line Recommendation */}
      <div
        className={`rounded-lg border-2 p-6 ${
          intel.bottom_line.startsWith("RECOMMEND")
            ? "border-green-600 bg-green-50"
            : intel.bottom_line.startsWith("CONSIDER")
              ? "border-blue-600 bg-blue-50"
              : intel.bottom_line.startsWith("MARGINAL")
                ? "border-amber-600 bg-amber-50"
                : "border-red-600 bg-red-50"
        }`}
      >
        <div className="mb-3 flex items-center gap-2">
          <Icon
            name={
              intel.bottom_line.startsWith("RECOMMEND")
                ? "CheckCircle"
                : intel.bottom_line.startsWith("CONSIDER")
                  ? "Info"
                  : "AlertTriangle"
            }
            className={`h-6 w-6 ${
              intel.bottom_line.startsWith("RECOMMEND")
                ? "text-green-600"
                : intel.bottom_line.startsWith("CONSIDER")
                  ? "text-blue-600"
                  : intel.bottom_line.startsWith("MARGINAL")
                    ? "text-amber-600"
                    : "text-red-600"
            }`}
          />
          <h3 className="text-lg font-bold text-gray-900">Final Recommendation</h3>
        </div>
        <p className="text-lg font-semibold text-gray-900">{intel.bottom_line}</p>
      </div>
    </div>
  );
}

/**
 * Amenity Section Component
 */
function AmenitySection({
  title,
  icon,
  category,
  color,
}: {
  title: string;
  icon: string;
  category: { count: number; top_picks: any[]; note: string };
  color: string;
}) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    red: "text-red-600 bg-red-50",
    orange: "text-orange-600 bg-orange-50",
    purple: "text-purple-600 bg-purple-50",
    gray: "text-gray-600 bg-gray-50",
    indigo: "text-indigo-600 bg-indigo-50",
  };

  const classes = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <div className={`rounded-lg ${classes.split(" ")[1]} p-4`}>
      <div className="mb-3 flex items-center gap-2">
        <Icon name={icon as any} className={`h-5 w-5 ${classes.split(" ")[0]}`} />
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <span className="ml-auto text-sm font-bold text-gray-700">{category.count}</span>
      </div>
      <p className="mb-3 text-sm text-gray-700">{category.note}</p>
      {category.top_picks.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-gray-600">Top Picks:</div>
          {category.top_picks.slice(0, 3).map((place, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
              <Icon name="MapPin" className="mt-0.5 h-3 w-3 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{place.name}</div>
                {place.rating && (
                  <div className="flex items-center gap-1">
                    <Icon name="Star" className="h-3 w-3 text-yellow-500" />
                    <span>
                      {place.rating.toFixed(1)}/5.0
                      {place.user_ratings_total && ` (${place.user_ratings_total} reviews)`}
                    </span>
                    {place.distance_mi && <span className="ml-1">• {place.distance_mi}mi</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

