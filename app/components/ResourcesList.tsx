"use client";
import TrackedLink from "./TrackedLink";

type Item = { title: string; url: string; tags: string[] };

export default function ResourcesList({ ranked }: { ranked: Item[] }) {
  if (ranked.length === 0) {
    return (
      <p className="text-sm text-gray-600">
        No resources matched yet — complete the assessment to get personalized recommendations.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {ranked.map((r: Item) => (
        <TrackedLink
          key={r.url}
          href={r.url}
          title={r.title}
          className="rounded-lg border-2 border-gray-200 p-4 hover:bg-slate-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md block"
          eventName="plan_resource_click"
        >
          <div className="font-semibold text-gray-900 mb-1">{r.title}</div>
          <div className="text-xs text-gray-500">{(r.tags || []).join(" · ")}</div>
        </TrackedLink>
      ))}
    </div>
  );
}

