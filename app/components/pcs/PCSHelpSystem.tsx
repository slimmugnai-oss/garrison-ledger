"use client";

import { useState, useEffect } from "react";

import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import Card, { CardContent, CardHeader } from "@/app/components/ui/Card";
import Icon from "@/app/components/ui/Icon";

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  lastUpdated: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

interface PCSHelpSystemProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery?: string;
  category?: string;
}

/**
 * Comprehensive help system for PCS Copilot
 */
export function PCSHelpSystem({
  isOpen,
  onClose,
  searchQuery = "",
  category = "",
}: PCSHelpSystemProps) {
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [filteredArticles, setFilteredArticles] = useState<HelpArticle[]>([]);

  const helpArticles: HelpArticle[] = [
    {
      id: "getting-started",
      title: "Getting Started with PCS Copilot",
      content: `
# Getting Started with PCS Copilot

Welcome to PCS Copilot, your AI-powered assistant for maximizing PCS entitlements.

## Quick Start Guide

1. **Create Your First Claim**
   - Click "New Claim" to start
   - Enter your basic PCS information
   - Choose between Manual Entry or Mobile Wizard

2. **Upload Documents**
   - Upload PCS orders, receipts, and supporting documents
   - Our AI will extract key information automatically
   - Review and verify extracted data

3. **Review Calculations**
   - Check your entitlement calculations
   - Review confidence scores and data sources
   - Validate against JTR regulations

4. **Export and Submit**
   - Generate PDF and Excel claim packages
   - Submit to your finance office

## Key Features

- **AI-Powered Calculations**: Real-time DLA, TLE, MALT, and Per Diem calculations
- **JTR Validation**: Ensure compliance with current regulations
- **Document OCR**: Automatic extraction of receipt information
- **Export Packages**: Professional claim packages ready for submission
      `,
      category: "basics",
      tags: ["getting-started", "tutorial", "first-time"],
      lastUpdated: "2025-01-26",
      difficulty: "beginner",
    },
    {
      id: "calculations-explained",
      title: "Understanding PCS Calculations",
      content: `
# Understanding PCS Calculations

PCS Copilot calculates several types of entitlements based on current JTR regulations.

## DLA (Dislocation Allowance)
- **Purpose**: Reimbursement for moving expenses
- **Calculation**: Based on rank, dependents, and move type
- **2025 Rates**: E1-E4: $1,000-$1,500, E5-E6: $1,500-$2,000, E7+: $2,000+

## TLE (Temporary Lodging Expense)
- **Purpose**: Reimbursement for temporary lodging during PCS
- **Calculation**: Based on locality rates and number of nights
- **Limits**: 10 days at origin, 5 days at destination (with exceptions)

## MALT (Mileage Allowance in Lieu of Transportation)
- **Purpose**: Reimbursement for personally procured transportation
- **2025 Rate**: $0.22 per mile
- **Calculation**: Distance × rate × authorized passengers

## Per Diem
- **Purpose**: Daily allowance for meals and incidental expenses
- **Calculation**: Based on locality and number of travel days
- **Rates**: Vary by location (CONUS standard: $59/day)

## PPM (Personally Procured Move)
- **Purpose**: Reimbursement for self-move expenses
- **Calculation**: Based on weight allowance and distance
- **Benefits**: Often more cost-effective than government move
      `,
      category: "calculations",
      tags: ["dla", "tle", "malt", "per-diem", "ppm"],
      lastUpdated: "2025-01-26",
      difficulty: "intermediate",
    },
    {
      id: "document-upload",
      title: "Document Upload and OCR",
      content: `
# Document Upload and OCR

PCS Copilot uses AI to automatically extract information from your documents.

## Supported Document Types
- **Receipts**: Gas, lodging, meals, moving expenses
- **PCS Orders**: Official military orders
- **Weight Tickets**: For PPM moves
- **Lodging Receipts**: TLE documentation
- **Other**: Any PCS-related documents

## Upload Process
1. **Drag and Drop**: Simply drag files to the upload area
2. **File Selection**: Click to browse and select files
3. **AI Processing**: Documents are automatically processed
4. **Review**: Check extracted information for accuracy
5. **Edit**: Make corrections as needed

## OCR Accuracy
- **Receipts**: 95%+ accuracy for amounts, dates, vendors
- **Orders**: 90%+ accuracy for key information
- **Manual Review**: Always verify extracted data

## File Requirements
- **Formats**: PDF, JPG, PNG, TIFF
- **Size**: Up to 10MB per file
- **Quality**: Clear, readable text preferred
      `,
      category: "documents",
      tags: ["upload", "ocr", "receipts", "documents"],
      lastUpdated: "2025-01-26",
      difficulty: "beginner",
    },
    {
      id: "jtr-validation",
      title: "JTR Validation and Compliance",
      content: `
# JTR Validation and Compliance

Our AI validates your claim against current Joint Travel Regulations.

## Validation Categories

### DLA Validation
- **Rank Verification**: Ensures correct DLA rate for your rank
- **Dependent Status**: Validates dependent allowances
- **Move Type**: Confirms appropriate rate for move type

### TLE Validation
- **Night Limits**: Checks against maximum allowed nights
- **Rate Verification**: Validates against locality rates
- **Documentation**: Ensures proper receipt documentation

### MALT Validation
- **Distance Verification**: Validates claimed mileage
- **Rate Application**: Ensures correct per-mile rate
- **Route Optimization**: Suggests most efficient routes

### Per Diem Validation
- **Locality Rates**: Verifies correct per diem rates
- **Travel Days**: Validates number of travel days
- **Meal Deductions**: Checks for appropriate deductions

## Validation Results
- **Green Flags**: Compliant with JTR
- **Yellow Flags**: Potential issues or optimizations
- **Red Flags**: Non-compliant items requiring attention

## AI Explanations
- **Rule Citations**: Specific JTR references
- **Suggested Fixes**: Actionable recommendations
- **Optimization Tips**: Ways to maximize entitlements
      `,
      category: "validation",
      tags: ["jtr", "validation", "compliance", "regulations"],
      lastUpdated: "2025-01-26",
      difficulty: "advanced",
    },
    {
      id: "export-packages",
      title: "Export and Claim Packages",
      content: `
# Export and Claim Packages

Generate professional claim packages for finance office submission.

## PDF Export
- **Claim Summary**: Complete overview of entitlements
- **Calculation Breakdown**: Detailed calculations with sources
- **Document Index**: List of all supporting documents
- **Validation Report**: JTR compliance summary

## Excel Export
- **Itemized Breakdown**: Line-by-line expense details
- **Calculation Sheets**: Separate tabs for each entitlement type
- **Documentation**: Links to uploaded documents
- **Summary Totals**: Grand totals and subtotals

## Claim Package Contents
1. **Cover Sheet**: Claim summary and totals
2. **Calculation Details**: How each entitlement was calculated
3. **Supporting Documents**: All receipts and orders
4. **Validation Report**: JTR compliance verification
5. **Submission Checklist**: Items to verify before submitting

## Submission Tips
- **Review Everything**: Double-check all calculations
- **Organize Documents**: Arrange in logical order
- **Include Explanations**: Add notes for unusual items
- **Keep Copies**: Maintain digital and physical copies
      `,
      category: "export",
      tags: ["export", "pdf", "excel", "submission"],
      lastUpdated: "2025-01-26",
      difficulty: "intermediate",
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting Common Issues",
      content: `
# Troubleshooting Common Issues

Solutions to common problems and questions.

## Calculation Issues

### Incorrect DLA Amount
- **Check Rank**: Ensure correct rank is selected
- **Verify Dependents**: Confirm dependent status
- **Move Type**: Verify CONUS vs OCONUS classification

### Missing TLE Entitlement
- **Documentation**: Ensure lodging receipts are uploaded
- **Night Limits**: Check against maximum allowed nights
- **Locality Rates**: Verify correct per diem rates

### MALT Calculation Errors
- **Distance**: Verify mileage calculation
- **Route**: Ensure most direct route is used
- **Rate**: Confirm current per-mile rate

## Document Issues

### OCR Not Working
- **File Quality**: Ensure clear, readable documents
- **File Format**: Use supported formats (PDF, JPG, PNG)
- **File Size**: Check size limits (10MB max)
- **Manual Entry**: Use manual entry as fallback

### Missing Information
- **Review Extraction**: Check all extracted fields
- **Manual Correction**: Edit incorrect information
- **Re-upload**: Try uploading again if needed

## Technical Issues

### Slow Loading
- **Internet Connection**: Check connection speed
- **Browser**: Try refreshing or different browser
- **Cache**: Clear browser cache and cookies

### Export Problems
- **File Size**: Large exports may take time
- **Browser Settings**: Allow pop-ups for downloads
- **Retry**: Try export again if it fails
      `,
      category: "troubleshooting",
      tags: ["troubleshooting", "issues", "problems", "solutions"],
      lastUpdated: "2025-01-26",
      difficulty: "beginner",
    },
  ];

  const categories = [
    { id: "all", name: "All Topics", icon: "Grid" },
    { id: "basics", name: "Getting Started", icon: "Play" },
    { id: "calculations", name: "Calculations", icon: "Calculator" },
    { id: "documents", name: "Documents", icon: "File" },
    { id: "validation", name: "Validation", icon: "Shield" },
    { id: "export", name: "Export", icon: "Download" },
    { id: "troubleshooting", name: "Troubleshooting", icon: "HelpCircle" },
  ];

  useEffect(() => {
    let filtered = helpArticles;

    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter((article) => article.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredArticles(filtered);
  }, [selectedCategory, searchTerm]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "text-green-600 bg-green-50 border-green-200";
      case "intermediate":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "advanced":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="flex w-80 flex-col border-r border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Help Center</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <Icon name="X" className="h-4 w-4" />
              </Button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Icon
                name="Search"
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400"
              />
              <input
                type="text"
                placeholder="Search help articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Categories */}
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                    selectedCategory === category.id
                      ? "bg-blue-100 text-blue-700"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <Icon name={category.icon as any} className="h-4 w-4" />
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Articles List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {filteredArticles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    selectedArticle?.id === article.id
                      ? "border-blue-200 bg-blue-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-sm font-medium">{article.title}</h3>
                    <Badge
                      variant={
                        article.difficulty === "beginner"
                          ? "success"
                          : article.difficulty === "intermediate"
                            ? "warning"
                            : "danger"
                      }
                      className="text-xs"
                    >
                      {article.difficulty}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {article.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-white">
          {selectedArticle ? (
            <div className="p-6">
              <div className="max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{selectedArticle.title}</h1>
                    <div className="mt-2 flex items-center gap-4">
                      <Badge
                        variant={
                          selectedArticle.difficulty === "beginner"
                            ? "success"
                            : selectedArticle.difficulty === "intermediate"
                              ? "warning"
                              : "danger"
                        }
                      >
                        {selectedArticle.difficulty}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Updated {selectedArticle.lastUpdated}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedArticle(null)}>
                    <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
                    Back to List
                  </Button>
                </div>

                <div className="prose max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: selectedArticle.content.replace(/\n/g, "<br />"),
                    }}
                  />
                </div>

                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h3 className="mb-4 text-lg font-semibold">Related Articles</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {helpArticles
                      .filter(
                        (article) =>
                          article.category === selectedArticle.category &&
                          article.id !== selectedArticle.id
                      )
                      .slice(0, 4)
                      .map((article) => (
                        <button
                          key={article.id}
                          onClick={() => setSelectedArticle(article)}
                          className="rounded-lg border border-gray-200 p-4 text-left transition-colors hover:bg-gray-50"
                        >
                          <h4 className="font-medium text-gray-900">{article.title}</h4>
                          <p className="mt-1 text-sm text-gray-600">
                            {article.content.substring(0, 100)}...
                          </p>
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="max-w-4xl">
                <h1 className="mb-6 text-2xl font-bold text-gray-900">
                  {selectedCategory === "all"
                    ? "All Help Articles"
                    : categories.find((c) => c.id === selectedCategory)?.name}
                </h1>

                {filteredArticles.length === 0 ? (
                  <div className="py-12 text-center">
                    <Icon name="Search" className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-medium text-gray-900">No articles found</h3>
                    <p className="text-gray-600">
                      Try adjusting your search terms or category filter.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredArticles.map((article) => (
                      <div
                        key={article.id}
                        className="cursor-pointer transition-shadow hover:shadow-md"
                        onClick={() => setSelectedArticle(article)}
                      >
                        <Card>
                          <CardContent className="p-4">
                            <div className="mb-3 flex items-start justify-between">
                              <h3 className="font-semibold text-gray-900">{article.title}</h3>
                              <Badge
                                variant={
                                  article.difficulty === "beginner"
                                    ? "success"
                                    : article.difficulty === "intermediate"
                                      ? "warning"
                                      : "danger"
                                }
                                className="text-xs"
                              >
                                {article.difficulty}
                              </Badge>
                            </div>
                            <p className="mb-3 text-sm text-gray-600">
                              {article.content.substring(0, 150)}...
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {article.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Quick help widget for contextual assistance
 */
export function PCSQuickHelp({ context, onOpenHelp }: { context: string; onOpenHelp: () => void }) {
  const getContextualTips = (context: string) => {
    switch (context) {
      case "calculations":
        return [
          "DLA rates vary by rank and dependent status",
          "TLE is limited to 10 days at origin, 5 at destination",
          "MALT rate is $0.22 per mile for 2025",
        ];
      case "documents":
        return [
          "Upload clear, readable receipts for best OCR results",
          "Include PCS orders for automatic data extraction",
          "Review all extracted information for accuracy",
        ];
      case "validation":
        return [
          "Green flags indicate JTR compliance",
          "Yellow flags suggest optimizations",
          "Red flags require immediate attention",
        ];
      default:
        return [
          "Use the help system for detailed guidance",
          "Check JTR regulations for specific requirements",
          "Contact support for technical issues",
        ];
    }
  };

  const tips = getContextualTips(context);

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Icon name="Lightbulb" className="mt-0.5 h-5 w-5 text-blue-600" />
          <div className="flex-1">
            <h4 className="mb-2 font-medium text-blue-900">Quick Tips</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1 text-blue-600">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenHelp}
              className="mt-3 border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <Icon name="HelpCircle" className="mr-2 h-4 w-4" />
              More Help
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PCSHelpSystem;
