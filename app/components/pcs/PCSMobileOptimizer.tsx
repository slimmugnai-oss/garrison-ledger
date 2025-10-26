"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Badge } from "@/app/components/ui/Badge";
import { Icon } from "@/app/components/ui/Icon";

interface MobileTestResult {
  component: string;
  status: "pass" | "fail" | "warning";
  issues: string[];
  recommendations: string[];
}

/**
 * Mobile optimization testing and debugging component
 */
export function PCSMobileOptimizer() {
  const [testResults, setTestResults] = useState<MobileTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateScreenSize();
    window.addEventListener("resize", updateScreenSize);
    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  const runMobileTests = async () => {
    setIsRunning(true);
    const results: MobileTestResult[] = [];

    // Test 1: Touch Target Sizes
    const touchTargets = document.querySelectorAll("button, a, input, select");
    const smallTargets = Array.from(touchTargets).filter(
      (el) => el.getBoundingClientRect().height < 44
    );

    results.push({
      component: "Touch Targets",
      status: smallTargets.length > 0 ? "fail" : "pass",
      issues: smallTargets.length > 0 
        ? [`${smallTargets.length} elements below 44px minimum`]
        : [],
      recommendations: smallTargets.length > 0
        ? ["Increase button/input heights to minimum 44px"]
        : ["All touch targets meet accessibility standards"],
    });

    // Test 2: Text Readability
    const textElements = document.querySelectorAll("p, span, div");
    const smallText = Array.from(textElements).filter((el) => {
      const computed = window.getComputedStyle(el);
      const fontSize = parseFloat(computed.fontSize);
      return fontSize < 14;
    });

    results.push({
      component: "Text Readability",
      status: smallText.length > 0 ? "warning" : "pass",
      issues: smallText.length > 0 
        ? [`${smallText.length} text elements below 14px`]
        : [],
      recommendations: smallText.length > 0
        ? ["Increase font sizes for better mobile readability"]
        : ["Text sizes are mobile-optimized"],
    });

    // Test 3: Horizontal Scrolling
    const bodyWidth = document.body.scrollWidth;
    const viewportWidth = window.innerWidth;
    const hasHorizontalScroll = bodyWidth > viewportWidth;

    results.push({
      component: "Horizontal Scrolling",
      status: hasHorizontalScroll ? "fail" : "pass",
      issues: hasHorizontalScroll 
        ? ["Content overflows viewport width"]
        : [],
      recommendations: hasHorizontalScroll
        ? ["Fix responsive layout to prevent horizontal scrolling"]
        : ["Layout is properly contained"],
    });

    // Test 4: Form Field Accessibility
    const formInputs = document.querySelectorAll("input, select, textarea");
    const unlabeledInputs = Array.from(formInputs).filter((input) => {
      const id = input.getAttribute("id");
      const ariaLabel = input.getAttribute("aria-label");
      const ariaLabelledBy = input.getAttribute("aria-labelledby");
      return !id && !ariaLabel && !ariaLabelledBy;
    });

    results.push({
      component: "Form Accessibility",
      status: unlabeledInputs.length > 0 ? "fail" : "pass",
      issues: unlabeledInputs.length > 0 
        ? [`${unlabeledInputs.length} form inputs lack proper labels`]
        : [],
      recommendations: unlabeledInputs.length > 0
        ? ["Add proper labels or aria-labels to all form inputs"]
        : ["All form inputs are properly labeled"],
    });

    // Test 5: Loading Performance
    const images = document.querySelectorAll("img");
    const unoptimizedImages = Array.from(images).filter((img) => {
      const src = img.getAttribute("src");
      return src && !src.includes("w_") && !src.includes("h_");
    });

    results.push({
      component: "Image Optimization",
      status: unoptimizedImages.length > 0 ? "warning" : "pass",
      issues: unoptimizedImages.length > 0 
        ? [`${unoptimizedImages.length} images not optimized for mobile`]
        : [],
      recommendations: unoptimizedImages.length > 0
        ? ["Implement responsive image sizing"]
        : ["Images are mobile-optimized"],
    });

    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return "CheckCircle";
      case "fail":
        return "XCircle";
      case "warning":
        return "AlertTriangle";
      default:
        return "Info";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pass":
        return "text-green-600 bg-green-50 border-green-200";
      case "fail":
        return "text-red-600 bg-red-50 border-red-200";
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Mobile Optimization Tester</h3>
            <Badge variant="info">
              {screenSize.width} × {screenSize.height}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={runMobileTests}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <Icon name={isRunning ? "Loader" : "Play"} className="h-4 w-4" />
              {isRunning ? "Running Tests..." : "Run Mobile Tests"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setTestResults([])}
              className="flex items-center gap-2"
            >
              <Icon name="RefreshCw" className="h-4 w-4" />
              Clear Results
            </Button>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Test Results</h4>
              {testResults.map((result, index) => (
                <Card key={index} className={`border ${getStatusColor(result.status)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Icon
                        name={getStatusIcon(result.status)}
                        className={`h-5 w-5 mt-0.5 ${
                          result.status === "pass"
                            ? "text-green-600"
                            : result.status === "fail"
                              ? "text-red-600"
                              : "text-yellow-600"
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-medium">{result.component}</h5>
                          <Badge
                            variant={
                              result.status === "pass"
                                ? "success"
                                : result.status === "fail"
                                  ? "danger"
                                  : "warning"
                            }
                          >
                            {result.status.toUpperCase()}
                          </Badge>
                        </div>

                        {result.issues.length > 0 && (
                          <div className="mb-2">
                            <p className="text-sm font-medium text-gray-700 mb-1">Issues:</p>
                            <ul className="text-sm text-gray-600 list-disc list-inside">
                              {result.issues.map((issue, i) => (
                                <li key={i}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {result.recommendations.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Recommendations:</p>
                            <ul className="text-sm text-gray-600 list-disc list-inside">
                              {result.recommendations.map((rec, i) => (
                                <li key={i}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-sm text-gray-600">
            <p><strong>Screen Size:</strong> {screenSize.width} × {screenSize.height}</p>
            <p><strong>Device Type:</strong> {screenSize.width < 768 ? "Mobile" : screenSize.width < 1024 ? "Tablet" : "Desktop"}</p>
            <p><strong>Touch Support:</strong> {navigator.maxTouchPoints > 0 ? "Yes" : "No"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Mobile-specific form optimizations
 */
export function PCSMobileFormOptimizer({ children }: { children: React.ReactNode }) {
  return (
    <div className="mobile-form-optimizer">
      <style jsx>{`
        .mobile-form-optimizer input,
        .mobile-form-optimizer select,
        .mobile-form-optimizer textarea {
          min-height: 44px;
          font-size: 16px; /* Prevents zoom on iOS */
        }
        
        .mobile-form-optimizer button {
          min-height: 44px;
          min-width: 44px;
        }
        
        .mobile-form-optimizer .form-group {
          margin-bottom: 1rem;
        }
        
        .mobile-form-optimizer .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
      `}</style>
      {children}
    </div>
  );
}

/**
 * Mobile navigation component
 */
export function PCSMobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        <span>PCS Copilot Menu</span>
        <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} className="h-4 w-4" />
      </Button>
      
      {isOpen && (
        <div className="mt-2 space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            <Icon name="File" className="h-4 w-4 mr-2" />
            New Claim
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Icon name="List" className="h-4 w-4 mr-2" />
            Claims Library
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Icon name="Calculator" className="h-4 w-4 mr-2" />
            Cost Comparison
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Icon name="MapPin" className="h-4 w-4 mr-2" />
            Assignment Planner
          </Button>
        </div>
      )}
    </div>
  );
}
