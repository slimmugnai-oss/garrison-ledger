/**
 * RATE-BADGE COMPONENT
 *
 * Prominent display of dynamic rate data with provenance
 * Server component - fetches and displays rate in a highlighted badge
 */

import { resolveDataRef } from "@/lib/dynamic/registry";
import type { DataRefParams } from "@/lib/dynamic/types";

import Icon from "../ui/Icon";

type RateBadgeProps = Omit<DataRefParams, "source"> & {
  source: DataRefParams["source"];
  label?: string; // Custom label (defaults to source name)
};

export default async function RateBadge(props: RateBadgeProps) {
  const { label, ...refParams } = props;

  let result;
  try {
    // Resolve data from providers
    result = await resolveDataRef(refParams);
  } catch {
    return (
      <div className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2.5">
        <Icon name="AlertCircle" className="h-5 w-5 text-red-600" />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-red-900">{label || refParams.source}</span>
          <span className="text-xs text-red-700">Error loading rate</span>
        </div>
      </div>
    );
  }

  if (!result.data) {
    // Data not available
    return (
      <div className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-4 py-2.5">
        <Icon name="AlertCircle" className="h-5 w-5 text-gray-500" />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-600">{label || refParams.source}</span>
          <span className="text-xs text-gray-500">{result.error || "Data unavailable"}</span>
        </div>
      </div>
    );
  }

  const { displayValue, sourceName, sourceUrl, asOf, format } = result.data;

  // Determine badge color based on format
  const colorClasses =
    format === "money"
      ? "bg-green-50 border-green-300 text-green-900"
      : "bg-blue-50 border-blue-300 text-blue-900";

  return (
    <div className={`inline-flex items-center gap-3 rounded-lg border px-4 py-3 ${colorClasses}`}>
      <div className="flex-shrink-0">
        <Icon name="DollarSign" className="h-6 w-6" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-medium uppercase tracking-wide opacity-75">
          {label || sourceName}
        </span>
        <span className="text-2xl font-bold leading-tight">{displayValue}</span>
        <span className="mt-0.5 text-xs opacity-60">
          As of{" "}
          {new Date(asOf).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
          {sourceUrl && (
            <>
              {" • "}
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Source
              </a>
            </>
          )}
        </span>
      </div>
    </div>
  );
}
