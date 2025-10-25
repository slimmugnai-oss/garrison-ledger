"use client";

/**
 * ASK ASSISTANT - Template Questions
 *
 * Dynamic question chips with personalization based on user profile
 */

import { useState, useEffect } from "react";

import Badge from "@/app/components/ui/Badge";
import Icon from "@/app/components/ui/Icon";

interface TemplateQuestion {
  id: string;
  text: string;
  category: string;
  personalized: boolean;
}

interface TemplateQuestionsProps {
  onTemplateClick?: (text: string, id: string) => void;
  mode?: "grid" | "dropdown";
}

export default function TemplateQuestions({
  onTemplateClick,
  mode = "grid",
}: TemplateQuestionsProps) {
  const [templates, setTemplates] = useState<TemplateQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/ask/templates");
      const result = await response.json();

      if (result.success) {
        setTemplates(result.templates);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: "all", label: "All", count: templates.length },
    { id: "BAH", label: "BAH", count: templates.filter((t) => t.category === "BAH").length },
    { id: "TSP", label: "TSP", count: templates.filter((t) => t.category === "TSP").length },
    { id: "PCS", label: "PCS", count: templates.filter((t) => t.category === "PCS").length },
    {
      id: "Deployment",
      label: "Deployment",
      count: templates.filter((t) => t.category === "Deployment").length,
    },
    {
      id: "Career",
      label: "Career",
      count: templates.filter((t) => t.category === "Career").length,
    },
    {
      id: "Insurance",
      label: "Insurance",
      count: templates.filter((t) => t.category === "Insurance").length,
    },
    {
      id: "Taxes",
      label: "Taxes",
      count: templates.filter((t) => t.category === "Taxes").length,
    },
  ];

  const filteredTemplates =
    selectedCategory === "all"
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "BAH":
        return "bg-green-100 text-green-800 border-green-200";
      case "TSP":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PCS":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Deployment":
        return "bg-red-100 text-red-800 border-red-200";
      case "Career":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Insurance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Taxes":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "Pay":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Benefits":
        return "bg-pink-100 text-pink-800 border-pink-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-20 animate-pulse rounded-lg bg-gray-200"></div>
          ))}
        </div>
        <div className="grid gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-200"></div>
          ))}
        </div>
      </div>
    );
  }

  // Dropdown mode for compact layout
  if (mode === "dropdown") {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <Icon name="Lightbulb" className="h-4 w-4" />
          Need inspiration? Browse {templates.length} templates
          <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} className="h-4 w-4" />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-10 mt-2 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
            {/* Category Pills */}
            <div className="mb-3 flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedCategory === category.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category.label} ({category.count})
                </button>
              ))}
            </div>

            {/* Template List */}
            <div className="space-y-1">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => {
                    onTemplateClick?.(template.text, template.id);
                    setIsOpen(false);
                  }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex-1">{template.text}</span>
                    {template.personalized && (
                      <Badge variant="info" className="text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="py-4 text-center text-sm text-gray-500">
                No templates for this category
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Grid mode (original layout)
  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">Quick Questions</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* Template Questions */}
      <div className="grid gap-2">
        {filteredTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onTemplateClick?.(template.text, template.id)}
            className={`rounded-lg border p-3 text-left transition-colors hover:shadow-sm ${getCategoryColor(
              template.category
            )}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-sm font-medium">{template.text}</span>
                  {template.personalized && (
                    <Badge variant="info" className="text-xs">
                      <Icon name="User" className="mr-1 h-3 w-3" />
                      Personalized
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="info" className="text-xs">
                    {template.category}
                  </Badge>
                  <Icon name="ArrowRight" className="h-3 w-3 text-gray-500" />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* No Templates Message */}
      {filteredTemplates.length === 0 && (
        <div className="py-4 text-center text-gray-500">
          <Icon name="MessageCircle" className="mx-auto mb-2 h-8 w-8 text-gray-300" />
          <p className="text-sm">No questions available for this category.</p>
        </div>
      )}

      {/* Help Text */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
        <div className="flex items-start gap-2">
          <Icon name="Info" className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
          <div className="text-xs text-blue-700">
            <p className="mb-1 font-medium">Personalized questions</p>
            <p>
              Questions marked with "Personalized" are customized based on your profile (rank, base,
              dependents).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
