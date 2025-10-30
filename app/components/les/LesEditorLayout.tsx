"use client";

/**
 * LES EDITOR LAYOUT
 * 
 * Responsive 2-column layout for LES Auditor
 * - Main column: Section cards with inline editing
 * - Sidebar: Sticky summary with live totals and actions
 * - Mobile: Single column, summary at top
 */

import React from "react";

interface LesEditorLayoutProps {
  children: React.ReactNode;
  summary: React.ReactNode;
}

export default function LesEditorLayout({ children, summary }: LesEditorLayoutProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Mobile: Summary first */}
      <div className="mb-6 lg:hidden">
        {summary}
      </div>

      {/* Desktop: 2-column grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Main content: Section cards */}
        <main className="space-y-6">
          {children}
        </main>

        {/* Desktop: Sticky summary sidebar */}
        <aside className="hidden lg:block lg:sticky lg:top-20 h-fit">
          {summary}
        </aside>
      </div>
    </div>
  );
}

