"use client";

/**
 * SMART TEMPLATE SELECTOR
 *
 * Quick-start templates for common LES scenarios
 */

import { useState } from "react";
import Icon from "@/app/components/ui/Icon";
import { TEMPLATES, templateToLineItems } from "@/lib/les/templates";
import type { DynamicLineItem } from "@/app/types/les";
import { generateLineItemId } from "@/lib/utils/line-item-ids";

interface Props {
  onSelect: (items: DynamicLineItem[]) => void;
}

export default function SmartTemplateSelector({ onSelect }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const templateItems = templateToLineItems(templateId);

    // Convert to DynamicLineItem with IDs
    const lineItems: DynamicLineItem[] = templateItems.map((item) => ({
      ...item,
      id: generateLineItemId(),
    }));

    onSelect(lineItems);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Quick Start Templates</h3>
        <p className="text-sm text-gray-600">
          Select a template to pre-populate common line items, then add or modify as needed.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => handleSelect(template.id)}
            className={`relative rounded-lg border-2 p-6 text-left transition-all ${
              selectedTemplate === template.id
                ? "border-blue-600 bg-blue-50 shadow-md"
                : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
            }`}
          >
            <div className="mb-3 flex items-center gap-3">
              <div
                className={`rounded-full p-2 ${
                  selectedTemplate === template.id ? "bg-blue-600" : "bg-gray-100"
                }`}
              >
                <Icon
                  name={template.icon as any}
                  className={`h-5 w-5 ${
                    selectedTemplate === template.id ? "text-white" : "text-gray-600"
                  }`}
                />
              </div>
              <h4 className="font-semibold text-gray-900">{template.name}</h4>
            </div>
            <p className="text-sm text-gray-600">{template.description}</p>
            {template.presetLines.length > 0 && (
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <Icon name="Check" className="h-3 w-3" />
                <span>{template.presetLines.length} line items</span>
              </div>
            )}
            {selectedTemplate === template.id && (
              <div className="absolute right-4 top-4">
                <Icon name="CheckCircle" className="h-5 w-5 text-blue-600" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
