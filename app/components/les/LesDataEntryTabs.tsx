"use client";

/**
 * LES DATA ENTRY TABS
 * 
 * Tabbed interface for entering LES data by category
 * Horizontal tabs on desktop, vertical on mobile
 */

import React, { useState } from "react";
import Icon from "@/app/components/ui/Icon";
import type { DynamicLineItem, LesSection } from "@/app/types/les";

interface LesDataEntryTabsProps {
  lineItems: DynamicLineItem[];
  onLineItemsChange: (items: DynamicLineItem[]) => void;
  onAddItem: (section: LesSection) => void;
  onEditItem: (item: DynamicLineItem) => void;
  onDeleteItem: (id: string) => void;
  allowEdit?: boolean;
}

type TabId = "allowances" | "taxes" | "deductions" | "other";

const TABS: Array<{
  id: TabId;
  label: string;
  icon: string;
  sections: LesSection[];
  description: string;
}> = [
  {
    id: "allowances",
    label: "Pay & Allowances",
    icon: "DollarSign",
    sections: ["ALLOWANCE"],
    description: "Base pay, BAH, BAS, special pays, COLA"
  },
  {
    id: "taxes",
    label: "Taxes",
    icon: "Landmark",
    sections: ["TAX"],
    description: "Federal, state, FICA, Medicare"
  },
  {
    id: "deductions",
    label: "Deductions",
    icon: "Calculator",
    sections: ["DEDUCTION"],
    description: "SGLI, TSP, insurance, garnishments"
  },
  {
    id: "other",
    label: "Allotments & Other",
    icon: "Banknote",
    sections: ["ALLOTMENT", "DEBT", "ADJUSTMENT", "OTHER"],
    description: "Allotments, debts, adjustments"
  }
];

const SECTION_LABELS: Record<LesSection, string> = {
  ALLOWANCE: "Allowances",
  TAX: "Taxes",
  DEDUCTION: "Deductions",
  ALLOTMENT: "Allotments",
  DEBT: "Debts",
  ADJUSTMENT: "Adjustments",
  OTHER: "Other",
};

const SECTION_COLORS: Record<LesSection, string> = {
  ALLOWANCE: "border-green-200 bg-green-50",
  TAX: "border-red-200 bg-red-50",
  DEDUCTION: "border-orange-200 bg-orange-50",
  ALLOTMENT: "border-blue-200 bg-blue-50",
  DEBT: "border-gray-200 bg-gray-50",
  ADJUSTMENT: "border-purple-200 bg-purple-50",
  OTHER: "border-gray-200 bg-gray-50",
};

export default function LesDataEntryTabs({
  lineItems,
  onLineItemsChange,
  onAddItem,
  onEditItem,
  onDeleteItem,
  allowEdit = true,
}: LesDataEntryTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("allowances");

  // Filter line items by active tab sections
  const getTabItems = (tabId: TabId) => {
    const tab = TABS.find(t => t.id === tabId);
    if (!tab) return [];
    
    return lineItems.filter(item => tab.sections.includes(item.section));
  };

  // Get items by section within the active tab
  const getItemsBySection = (tabId: TabId): Record<LesSection, DynamicLineItem[]> => {
    const tab = TABS.find(t => t.id === tabId);
    if (!tab) {
      return {
        ALLOWANCE: [],
        TAX: [],
        DEDUCTION: [],
        ALLOTMENT: [],
        DEBT: [],
        ADJUSTMENT: [],
        OTHER: [],
      };
    }

    const items = getTabItems(tabId);
    const grouped: Record<LesSection, DynamicLineItem[]> = {
      ALLOWANCE: [],
      TAX: [],
      DEDUCTION: [],
      ALLOTMENT: [],
      DEBT: [],
      ADJUSTMENT: [],
      OTHER: [],
    };

    items.forEach(item => {
      grouped[item.section].push(item);
    });

    return grouped;
  };

  // Calculate totals by section
  const getSectionTotals = (tabId: TabId): Record<LesSection, number> => {
    const items = getTabItems(tabId);
    const totals: Record<LesSection, number> = {
      ALLOWANCE: 0,
      TAX: 0,
      DEDUCTION: 0,
      ALLOTMENT: 0,
      DEBT: 0,
      ADJUSTMENT: 0,
      OTHER: 0,
    };

    items.forEach(item => {
      totals[item.section] += item.amount_cents;
    });

    return totals;
  };

  const formatAmount = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const activeTabData = TABS.find(t => t.id === activeTab);
  const itemsBySection = getItemsBySection(activeTab);
  const sectionTotals = getSectionTotals(activeTab);

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        {/* Desktop: Horizontal tabs */}
        <nav className="hidden sm:flex -mb-px space-x-8 overflow-x-auto" aria-label="Data entry tabs">
          {TABS.map((tab) => {
            const tabItems = getTabItems(tab.id);
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                }`}
                aria-current={isActive ? "page" : undefined}
                tabIndex={0}
              >
                <Icon name={tab.icon as any} className="h-5 w-5" />
                <span>{tab.label}</span>
                {tabItems.length > 0 && (
                  <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    isActive 
                      ? "bg-blue-100 text-blue-600" 
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {tabItems.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Mobile: Vertical tabs */}
        <div className="sm:hidden space-y-2">
          {TABS.map((tab) => {
            const tabItems = getTabItems(tab.id);
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between rounded-lg border-2 px-4 py-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isActive
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
                aria-current={isActive ? "page" : undefined}
                tabIndex={0}
              >
                <div className="flex items-center gap-3">
                  <Icon name={tab.icon as any} className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {tabItems.length > 0 && (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      isActive 
                        ? "bg-blue-100 text-blue-600" 
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {tabItems.length}
                    </span>
                  )}
                  <Icon name="ChevronRight" className="h-4 w-4" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Tab Description */}
        <div className="rounded-lg bg-slate-50 p-4">
          <div className="flex items-center gap-2">
            <Icon name={activeTabData?.icon as any} className="h-5 w-5 text-slate-600" />
            <h3 className="font-semibold text-slate-800">{activeTabData?.label}</h3>
          </div>
          <p className="mt-1 text-sm text-slate-600">{activeTabData?.description}</p>
        </div>

        {/* Line Items by Section */}
        <div className="space-y-4">
          {activeTabData?.sections.map((section) => {
            const items = itemsBySection[section];
            const total = sectionTotals[section];
            
            if (items.length === 0) {
              return (
                <div key={section} className={`rounded-lg border-2 border-dashed p-8 text-center ${SECTION_COLORS[section]}`}>
                  <Icon name={tab.icon as any} className="mx-auto mb-3 h-8 w-8 text-slate-400" />
                  <h4 className="mb-2 font-semibold text-slate-700">No {SECTION_LABELS[section]} items</h4>
                  <p className="mb-4 text-sm text-slate-600">
                    Add your {SECTION_LABELS[section].toLowerCase()} from your LES
                  </p>
                  {allowEdit && (
                    <button
                      onClick={() => onAddItem(section)}
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                    >
                      <Icon name="Plus" className="h-4 w-4" />
                      Add {SECTION_LABELS[section]} Item
                    </button>
                  )}
                </div>
              );
            }

            return (
              <div key={section} className={`rounded-lg border ${SECTION_COLORS[section]}`}>
                {/* Section Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Icon name={tab.icon as any} className="h-5 w-5 text-slate-600" />
                    <span className="font-semibold text-slate-800">{SECTION_LABELS[section]}</span>
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">
                      {items.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    {total > 0 && (
                      <span className="text-lg font-bold text-slate-700">
                        {formatAmount(total)}
                      </span>
                    )}
                    {allowEdit && (
                      <button
                        onClick={() => onAddItem(section)}
                        className="inline-flex items-center gap-1 rounded-md bg-slate-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
                      >
                        <Icon name="Plus" className="h-3 w-3" />
                        Add
                      </button>
                    )}
                  </div>
                </div>

                {/* Items Table */}
                <div className="divide-y divide-slate-200">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-4 py-3 hover:bg-white/50">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-slate-800">
                            {item.line_code}
                          </span>
                          {item.isCustom && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                              Custom
                            </span>
                          )}
                          {item.isParsed && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                              Parsed
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 truncate">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-slate-800">
                          {formatAmount(item.amount_cents)}
                        </span>
                        {allowEdit && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onEditItem(item)}
                              className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                              aria-label={`Edit ${item.description}`}
                            >
                              <Icon name="Edit" className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onDeleteItem(item.id)}
                              className="rounded-md p-1.5 text-slate-600 hover:bg-red-100 hover:text-red-600"
                              aria-label={`Delete ${item.description}`}
                            >
                              <Icon name="Trash2" className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tab Summary */}
        {getTabItems(activeTab).length > 0 && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">
                Total {activeTabData?.label}
              </span>
              <span className="text-xl font-bold text-slate-800">
                {formatAmount(getTabItems(activeTab).reduce((sum, item) => sum + item.amount_cents, 0))}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
