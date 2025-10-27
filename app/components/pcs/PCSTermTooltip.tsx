"use client";

import { ReactNode, useState } from "react";

import Icon from "@/app/components/ui/Icon";

interface PCSTermTooltipProps {
  term: string;
  children: ReactNode;
  citation?: string;
}

/**
 * Tooltip component for explaining military jargon in plain English
 * Provides hover explanations with optional JTR citations
 */
export default function PCSTermTooltip({ term, children, citation }: PCSTermTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center gap-1">
      <span className="font-medium">{term}</span>
      <button
        type="button"
        className="inline-flex items-center rounded-full p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Learn more about ${term}`}
      >
        <Icon name="HelpCircle" className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-xl">
          <div className="space-y-2">
            <div className="text-sm leading-relaxed text-gray-700">{children}</div>
            {citation && (
              <div className="border-t border-gray-100 pt-2">
                <p className="text-xs text-gray-500">
                  <Icon name="BookOpen" className="mr-1 inline h-3 w-3" />
                  {citation}
                </p>
              </div>
            )}
          </div>
          {/* Arrow pointing down */}
          <div className="absolute left-4 top-full h-2 w-2 -translate-y-1 rotate-45 border-b border-r border-gray-200 bg-white" />
        </div>
      )}
    </span>
  );
}
