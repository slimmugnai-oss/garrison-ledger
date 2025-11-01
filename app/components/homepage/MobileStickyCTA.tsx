"use client";

import { SignedOut, SignUpButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

import { trackCTAClick } from "./HomepageAnalytics";

/**
 * Sticky CTA Bar for Mobile
 * Appears after user scrolls past hero section
 */
export default function MobileStickyCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA after scrolling past hero (approximately 600px)
      const scrolled = window.scrollY > 600;
      setIsVisible(scrolled);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <SignedOut>
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-blue-200 bg-white p-4 shadow-2xl lg:hidden">
        <SignUpButton mode="modal">
          <button
            onClick={() => trackCTAClick("mobile_sticky_cta", "Start Free Account")}
            className="w-full rounded-lg bg-blue-600 py-4 text-center text-base font-bold text-white shadow-lg transition-all active:scale-95"
            style={{ minHeight: "44px" }} // WCAG AAA touch target
          >
            Start Free Account →
          </button>
        </SignUpButton>
        <p className="mt-2 text-center text-xs text-gray-600">
          Free tier • No credit card required
        </p>
      </div>
    </SignedOut>
  );
}

