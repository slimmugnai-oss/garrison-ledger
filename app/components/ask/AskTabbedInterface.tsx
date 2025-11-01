"use client";

import { useState } from "react";
import Icon from "@/app/components/ui/Icon";
import AskAssistantClient from "@/app/components/ask/AskAssistantClient";
import DocumentUpload from "@/app/components/ask/DocumentUpload";
import ComparisonToolFixed from "@/app/components/ask/ComparisonToolFixed";
import TimelineGeneratorFixed from "@/app/components/ask/TimelineGeneratorFixed";
import ConversationHistory from "@/app/components/ask/ConversationHistory";

type Tab = "ask" | "upload" | "compare" | "timeline" | "history";

interface TabConfig {
  id: Tab;
  label: string;
  icon: React.ComponentProps<typeof Icon>["name"];
  description: string;
}

const TABS: TabConfig[] = [
  {
    id: "ask",
    label: "Ask Question",
    icon: "MessageCircle",
    description: "Get instant expert answers to any military life question",
  },
  {
    id: "upload",
    label: "Upload Document",
    icon: "Upload",
    description: "Analyze LES, PCS orders, or other military documents",
  },
  {
    id: "compare",
    label: "Compare",
    icon: "BarChart",
    description: "Compare bases, benefits, or career paths side-by-side",
  },
  {
    id: "timeline",
    label: "Timeline",
    icon: "Calendar",
    description: "Generate personalized timelines for PCS, deployment, or transition",
  },
  {
    id: "history",
    label: "History",
    icon: "MessageCircle",
    description: "Review your past conversations and saved answers",
  },
];

export default function AskTabbedInterface() {
  const [activeTab, setActiveTab] = useState<Tab>("ask");

  const activeTabConfig = TABS.find((t) => t.id === activeTab);

  return (
    <div className="bg-white">
      {/* Tab Navigation - Prominent, Clean */}
      <div className="border-b border-slate-200 mb-6">
        <div className="flex overflow-x-auto -mb-px">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-6 py-4 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "border-slate-900 text-slate-900 bg-slate-50"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon name={tab.icon} className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content - Full Width, Clean */}
      <div>
        {activeTab === "ask" && <AskAssistantClient />}
        {activeTab === "upload" && <DocumentUpload />}
        {activeTab === "compare" && <ComparisonToolFixed />}
        {activeTab === "timeline" && <TimelineGeneratorFixed />}
        {activeTab === "history" && <ConversationHistory messages={[]} />}
      </div>
    </div>
  );
}

