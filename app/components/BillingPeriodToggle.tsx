"use client";

interface BillingPeriodToggleProps {
  period: "monthly" | "annual";
  onChange: (period: "monthly" | "annual") => void;
}

export default function BillingPeriodToggle({ period, onChange }: BillingPeriodToggleProps) {
  return (
    <div className="mb-6 flex items-center justify-center gap-3">
      <button
        onClick={() => onChange("monthly")}
        className={`rounded-lg px-6 py-2 font-semibold transition-colors ${
          period === "monthly"
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        Monthly
      </button>
      <button
        onClick={() => onChange("annual")}
        className={`rounded-lg px-6 py-2 font-semibold transition-colors ${
          period === "annual"
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        Annual
        <span className="ml-2 rounded bg-green-500 px-2 py-0.5 text-xs text-white">Save $20</span>
      </button>
    </div>
  );
}
