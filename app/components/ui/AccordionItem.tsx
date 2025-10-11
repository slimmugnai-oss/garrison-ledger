"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  title: string;
  content?: string; // rich HTML (optional if children provided)
  icon?: string;
  defaultOpen?: boolean;
  children?: React.ReactNode;
};

export default function AccordionItem({ title, content, icon, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState<boolean>(defaultOpen);
  const [maxHeight, setMaxHeight] = useState<number>(0);
  const [renderedOpen, setRenderedOpen] = useState<boolean>(defaultOpen);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setRenderedOpen(true);
      requestAnimationFrame(() => {
        if (innerRef.current) setMaxHeight(innerRef.current.scrollHeight);
      });
    } else {
      if (innerRef.current) setMaxHeight(innerRef.current.scrollHeight);
      // allow frame paint then collapse
      requestAnimationFrame(() => setMaxHeight(0));
    }
  }, [open, content]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <button
        type="button"
        className="w-full text-left px-5 py-3 flex items-center justify-between hover:bg-slate-50"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 font-semibold text-slate-900">
          {icon ? <span className="text-lg">{icon}</span> : null}
          <span>{title}</span>
        </span>
        <span className="text-slate-500">{open ? '⌄' : '›'}</span>
      </button>
      <div
        style={{
          maxHeight: renderedOpen ? maxHeight : 0,
          opacity: open ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 200ms ease, opacity 200ms ease',
        }}
        onTransitionEnd={() => {
          if (!open) setRenderedOpen(false);
        }}
      >
        <div ref={innerRef} className="px-5 pb-4">
          {children ? (
            children
          ) : (
            <article className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: content || '' }} />
          )}
        </div>
      </div>
    </div>
  );
}


