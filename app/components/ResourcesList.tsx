"use client";
import TrackedLink from "./TrackedLink";

type Item = { title: string; url: string; tags: string[] };

export default function ResourcesList({ ranked }: { ranked: Item[] }) {
  if (ranked.length === 0) {
    return (
      <p className="text-sm text-body">
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
          className="rounded-lg border-2 border-subtle p-4 hover:bg-slate-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md block"
          eventName="plan_resource_click"
        >
          <div className="font-semibold text-primary mb-1">{r.title}</div>
          <div className="text-xs text-muted">{(r.tags || []).join(" · ")}</div>
        </TrackedLink>
      ))}
    </div>
  );
}

