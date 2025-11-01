"use client";

import { useState } from "react";
import Icon from "@/app/components/ui/Icon";
import AskAssistantClient from "@/app/components/ask/AskAssistantClient";
import DocumentUpload from "@/app/components/ask/DocumentUpload";
import ComparisonTool from "@/app/components/ask/ComparisonTool";
import TimelineGenerator from "@/app/components/ask/TimelineGenerator";
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
    icon: "GitCompare",
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
    icon: "History",
    description: "Review your past conversations and saved answers",
  },
];

export default function AskTabbedInterface() {
  const [activeTab, setActiveTab] = useState<Tab>("ask");

  const activeTabConfig = TABS.find((t) => t.id === activeTab);

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-lg">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900"
              }`}
            >
              <Icon name={tab.icon} className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Description */}
      {activeTabConfig && (
        <div className="border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-3">
          <p className="text-sm text-gray-700">{activeTabConfig.description}</p>
        </div>
      )}

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "ask" && <AskAssistantClient />}
        {activeTab === "upload" && <DocumentUpload />}
        {activeTab === "compare" && (
          <ComparisonTool
            type="bases"
            options={[
              { id: "fort-hood", name: "Fort Hood, TX", type: "bases" },
              { id: "fort-bragg", name: "Fort Bragg, NC", type: "bases" },
              { id: "ramstein", name: "Ramstein AB, Germany", type: "bases" },
            ]}
            onCompare={async (ids) => {
              const res = await fetch("/api/ask/compare", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "bases", itemIds: ids }),
              });
              return res.json();
            }}
          />
        )}
        {activeTab === "timeline" && (
          <TimelineGenerator
            onGenerate={async (type, eventDate, options) => {
              const res = await fetch("/api/ask/timeline", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, eventDate, options }),
              });
              return res.json();
            }}
          />
        )}
        {activeTab === "history" && <ConversationHistory messages={[]} />}
      </div>
    </div>
  );
}

