"use client";

import { useEffect } from "react";

import Badge from "@/app/components/ui/Badge";
import Icon from "@/app/components/ui/Icon";

interface TabConfig {
  id: string;
  label: string;
  icon: "Shield" | "Users" | "BookOpen" | "Database" | "Map";
  shortcut: string;
  badge?: number;
}

interface AdminTabNavigationProps {
  activeTab: string;
  onChange: (tab: string) => void;
  badges?: {
    overview?: number;
    users?: number;
    content?: number;
    system?: number;
    sitemap?: number;
  };
}

const tabs: TabConfig[] = [
  { id: "overview", label: "Command Center", icon: "Shield", shortcut: "1" },
  { id: "users", label: "Personnel", icon: "Users", shortcut: "2" },
  { id: "content", label: "Assets", icon: "BookOpen", shortcut: "3" },
  { id: "system", label: "Ops Status", icon: "Database", shortcut: "4" },
  { id: "sitemap", label: "Sitemap", icon: "Map", shortcut: "5" },
];

export default function AdminTabNavigation({
  activeTab,
  onChange,
  badges = {},
}: AdminTabNavigationProps) {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if not in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const num = parseInt(e.key);
      if (num >= 1 && num <= 5) {
        const tab = tabs[num - 1];
        if (tab) {
          onChange(tab.id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [onChange]);

  return (
    <div className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto" aria-label="Admin Navigation">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const badgeCount = badges[tab.id as keyof typeof badges];

            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`group relative flex items-center gap-2 whitespace-nowrap border-b-2 px-6 py-4 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-primary/5 border-primary text-primary"
                    : "text-text-muted hover:text-text-body border-transparent hover:border-border"
                } `}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon name={tab.icon} className="h-5 w-5" />
                <span>{tab.label}</span>

                {badgeCount !== undefined && badgeCount > 0 && (
                  <Badge variant="warning" size="sm">
                    {badgeCount}
                  </Badge>
                )}

                {/* Keyboard shortcut hint */}
                <span className="bg-surface-hover text-text-muted group-hover:bg-surface group-hover:border-border-hover ml-2 hidden h-5 w-5 items-center justify-center rounded border border-border text-xs md:inline-flex">
                  {tab.shortcut}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
