"use client";

import { useState } from 'react';
import ContentModal from '@/app/components/ui/ContentModal';

type Props = {
  title: string;
  summary: string;
  fullContent: string;
  slug?: string;
  status?: 'incomplete'|'complete';
  topics?: string[];
  priority?: 'high'|'medium'|'low';
};

export default function TaskCard({ title, summary, fullContent, slug, status = 'incomplete', topics = [], priority = 'low' }: Props) {
  const [complete, setComplete] = useState(status === 'complete');
  const [open, setOpen] = useState(false);

  async function toggleComplete() {
    const next = !complete;
    setComplete(next);
    if (!slug) return;
    try {
      await fetch('/api/task-status', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, status: next ? 'complete' : 'incomplete' })
      });
    } catch {}
  }

  const borderColor = priority === 'high' ? 'border-amber-300' : 'border-slate-200';
  const accentBg = priority === 'high' ? 'bg-amber-50' : 'bg-white';

  return (
    <div className={`rounded-2xl border ${borderColor} ${accentBg} ${complete ? 'opacity-70' : ''} p-4 flex items-start gap-4 relative`}>
      {priority === 'high' && !complete && (
        <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
          Priority
        </div>
      )}
      <button onClick={toggleComplete} aria-pressed={complete} className={`h-6 w-6 mt-1 rounded-full border flex items-center justify-center ${complete ? 'bg-emerald-600 border-emerald-600' : 'border-slate-400'}`}>
        {complete ? <span className="text-white text-xs">✓</span> : null}
      </button>
      <div className="flex-1 min-w-0">
        <div className={`font-semibold ${complete ? 'line-through text-slate-500' : 'text-slate-900'}`}>{title}</div>
        <div className="text-sm text-slate-600 mt-1">{summary}</div>
        {topics.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {topics.slice(0, 6).map((t) => (
              <span key={t} className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700">{t}</span>
            ))}
          </div>
        )}
      </div>
      <button onClick={() => setOpen(true)} className="text-sm font-medium text-indigo-700 hover:text-indigo-800">View Details</button>

      <ContentModal open={open} onOpenChange={setOpen} title={title} htmlContent={fullContent} />
    </div>
  );
}


