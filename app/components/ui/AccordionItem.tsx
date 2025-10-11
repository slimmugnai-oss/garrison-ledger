"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  title: string;
  content?: string; // rich HTML (optional if children provided)
  icon?: string;
  defaultOpen?: boolean;
  children?: React.ReactNode;
};

export default function AccordionItem({ title, content, icon, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState<boolean>(defaultOpen);

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
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-5 pb-4">
              {children ? (
                children
              ) : (
                <article className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: content || '' }} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


