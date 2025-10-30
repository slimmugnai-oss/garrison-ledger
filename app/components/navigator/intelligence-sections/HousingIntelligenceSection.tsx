/**
 * HOUSING INTELLIGENCE SECTION
 * Displays comprehensive housing market analysis with property listings
 */

"use client";

import Icon from "@/app/components/ui/Icon";
import type { NeighborhoodCard } from "@/app/types/navigator";

interface Props {
  neighborhood: NeighborhoodCard;
}

export default function HousingIntelligenceSection({ neighborhood }: Props) {
  const housingIntel = neighborhood.payload.housing_intelligence;
  const listings = neighborhood.payload.sample_listings || [];

  if (!housingIntel) {
    return (
      <div className="rounded-lg bg-gray-50 p-8 text-center">
        <Icon name="Home" className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <p className="text-gray-600">Housing intelligence not available for this neighborhood.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* BAH Optimization Hero */}
      <div className="rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 p-6 text-white">
        <div className="mb-4">
          <div className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-300">
            BAH Optimization
          </div>
          <div className="text-3xl font-bold">
            {housingIntel.bah_analysis.properties_at_or_under_bah} Properties At/Under BAH
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white/10 p-4">
            <div className="mb-1 text-sm text-slate-300">Sweet Spot Range</div>
            <div className="font-bold">
              ${(housingIntel.bah_analysis.sweet_spot_range.min_cents / 100).toFixed(0)} - $
              {(housingIntel.bah_analysis.sweet_spot_range.max_cents / 100).toFixed(0)}
            </div>
          </div>
          <div className="rounded-lg bg-white/10 p-4">
            <div className="mb-1 text-sm text-slate-300">Avg Savings</div>
            <div className="font-bold">
              {housingIntel.bah_analysis.avg_savings_cents !== null
                ? housingIntel.bah_analysis.avg_savings_cents >= 0
                  ? `$${Math.abs(housingIntel.bah_analysis.avg_savings_cents / 100).toLocaleString()}/mo`
                  : `-$${Math.abs(housingIntel.bah_analysis.avg_savings_cents / 100).toLocaleString()}/mo`
                : "Varies"}
            </div>
          </div>
          <div className="rounded-lg bg-white/10 p-4">
            <div className="mb-1 text-sm text-slate-300">Strategy</div>
            <div className="text-sm font-bold">{housingIntel.bah_analysis.recommendation.split(".")[0]}</div>
          </div>
        </div>
      </div>

      {/* Sample Listings */}
      {listings.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-slate-900">Available Properties</h4>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing, i) => (
              <a
                key={i}
                href={listing.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group overflow-hidden rounded-lg border-2 border-slate-200 bg-white transition-all hover:border-blue-400 hover:shadow-lg"
              >
                {listing.photo && (
                  <div className="h-48 w-full overflow-hidden bg-gray-200">
                    <img
                      src={listing.photo}
                      alt={listing.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="mb-2 text-2xl font-bold text-blue-600">
                    ${(listing.price_cents / 100).toLocaleString()}/mo
                  </div>
                  <h5 className="mb-2 line-clamp-2 font-semibold text-slate-900">{listing.title}</h5>
                  {(listing.bedrooms || listing.bathrooms) && (
                    <div className="text-sm text-slate-600">
                      {listing.bedrooms && `${listing.bedrooms} bed`}
                      {listing.bedrooms && listing.bathrooms && " • "}
                      {listing.bathrooms && `${listing.bathrooms} bath`}
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-2 text-sm font-medium text-blue-600 group-hover:text-blue-700">
                    <span>View Listing</span>
                    <Icon name="ExternalLink" className="h-4 w-4" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Market Trends */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-slate-900">Market Analysis</h4>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border-2 border-slate-200 bg-white p-4">
            <div className="mb-1 text-sm text-slate-600">Price Trend</div>
            <div
              className={`mb-1 text-2xl font-bold ${
                housingIntel.market_trends.price_trend === "rising"
                  ? "text-red-600"
                  : housingIntel.market_trends.price_trend === "falling"
                    ? "text-green-600"
                    : "text-slate-900"
              }`}
            >
              {housingIntel.market_trends.price_trend.charAt(0).toUpperCase() +
                housingIntel.market_trends.price_trend.slice(1)}
            </div>
          </div>

          <div className="rounded-lg border-2 border-slate-200 bg-white p-4">
            <div className="mb-1 text-sm text-slate-600">Inventory</div>
            <div className="mb-1 text-2xl font-bold capitalize text-slate-900">
              {housingIntel.market_trends.inventory_level}
            </div>
          </div>

          <div className="rounded-lg border-2 border-slate-200 bg-white p-4">
            <div className="mb-1 text-sm text-slate-600">Your Leverage</div>
            <div className="mb-1 text-2xl font-bold capitalize text-slate-900">
              {housingIntel.market_trends.negotiation_leverage}
            </div>
          </div>
        </div>
      </div>

      {/* Property Types */}
      <div className="rounded-lg border-2 border-slate-200 bg-white p-6">
        <h4 className="mb-4 font-bold text-slate-900">Property Type Breakdown</h4>
        <div className="space-y-3">
          {Object.entries(housingIntel.property_types).map(([type, data]) => {
            const totalCount = Object.values(housingIntel.property_types).reduce((sum, t) => sum + t.count, 0);
            const percentage = totalCount > 0 ? Math.round((data.count / totalCount) * 100) : 0;
            const label = type
              .split("_")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");

            if (data.count === 0) return null;

            return (
              <div key={type}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{label}</span>
                  <span className="text-sm text-slate-600">
                    {data.count} available • {percentage}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-slate-600 to-slate-700"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Military-Friendly Features */}
      <div className="rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white">
        <div className="mb-4 flex items-center gap-2">
          <Icon name="Shield" className="h-6 w-6" />
          <h4 className="text-lg font-bold">Military-Friendly Features</h4>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="mb-1 text-sm text-slate-300">Pet-Friendly</div>
            <div className="text-2xl font-bold">{housingIntel.pet_friendly_count}</div>
            <div className="text-xs text-slate-400">properties</div>
          </div>
          <div>
            <div className="mb-1 text-sm text-slate-300">Utilities Included</div>
            <div className="text-2xl font-bold">{housingIntel.utilities_included_count}</div>
            <div className="text-xs text-slate-400">properties</div>
          </div>
          <div>
            <div className="mb-1 text-sm text-slate-300">With Yard</div>
            <div className="text-2xl font-bold">{housingIntel.yard_count}</div>
            <div className="text-xs text-slate-400">properties</div>
          </div>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="rounded-lg border-l-4 border-slate-600 bg-slate-50 p-6">
        <div className="mb-2 font-semibold text-slate-900">Bottom Line</div>
        <p className="leading-relaxed text-slate-700">{housingIntel.bottom_line}</p>
      </div>
    </div>
  );
}

