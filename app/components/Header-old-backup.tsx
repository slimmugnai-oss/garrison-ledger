"use client";

import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";


import Icon from "./ui/Icon";

export default function Header() {
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const pathname = usePathname();

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !showSearch) {
        e.preventDefault();
        setShowSearch(true);
        const searchInput = document.getElementById("nav-search");
        if (searchInput) searchInput.focus();
      }
      if (e.key === "Escape") {
        setShowSearch(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showSearch]);

  const isActivePath = (path: string) => {
    if (!pathname) return false;
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/dashboard/library?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="bg-surface border-subtle sticky top-0 z-50 border-b shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link
              href="/"
              className="hover:text-info dark:hover:text-info flex items-center text-xl font-bold text-primary transition-colors dark:text-white"
            >
              <Icon name="BarChart" className="mr-2 h-5 w-5" />
              <span className="hidden sm:inline">Garrison Ledger</span>
              <span className="sm:hidden">GL</span>
            </Link>
          </div>

          {/* Navigation - Desktop - Enhanced with active states */}
          <nav className="hidden items-center space-x-6 lg:flex">
            <Link
              href="/"
              className={`relative font-medium transition-colors ${
                isActivePath("/")
                  ? "font-semibold text-blue-600 dark:text-blue-400"
                  : "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              }`}
            >
              Home
              {isActivePath("/") && (
                <div className="bg-info dark:bg-info absolute -bottom-6 left-0 right-0 h-0.5 rounded-full" />
              )}
            </Link>
            <SignedIn>
              {/* Command Center Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => {
                  if (closeTimeout) clearTimeout(closeTimeout);
                  setDashboardOpen(true);
                }}
                onMouseLeave={() => {
                  const t = setTimeout(() => setDashboardOpen(false), 200);
                  setCloseTimeout(t);
                }}
              >
                <button
                  className={`relative flex items-center font-medium transition-colors ${
                    isActivePath("/dashboard")
                      ? "font-semibold text-blue-600 dark:text-blue-400"
                      : "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  }`}
                >
                  Command Center
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  {isActivePath("/dashboard") && (
                    <div className="bg-info dark:bg-info absolute -bottom-6 left-0 right-0 h-0.5 rounded-full" />
                  )}
                </button>
                {dashboardOpen && (
                  <div
                    className="bg-surface border-subtle absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border py-3 shadow-xl"
                    onMouseEnter={() => {
                      if (closeTimeout) clearTimeout(closeTimeout);
                      setDashboardOpen(true);
                    }}
                    onMouseLeave={() => {
                      const t = setTimeout(() => setDashboardOpen(false), 200);
                      setCloseTimeout(t);
                    }}
                  >
                    <div className="flex items-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted">
                      <Icon name="LayoutDashboard" className="mr-1 h-3 w-3" />
                      Your Command Center
                    </div>
                    <Link
                      href="/dashboard"
                      className={`flex items-center px-4 py-2.5 font-medium transition-colors ${
                        pathname === "/dashboard"
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon name="LayoutDashboard" className="text-info mr-3 h-4 w-4" />
                      Dashboard Overview
                    </Link>
                    <Link
                      href="/dashboard/plan"
                      className={`flex items-center px-4 py-2.5 font-medium transition-colors ${
                        isActivePath("/dashboard/plan")
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon name="Sparkles" className="mr-3 h-4 w-4 text-indigo-500" />
                      Your AI Plan
                    </Link>
                    <Link
                      href="/dashboard/assessment"
                      className={`flex items-center px-4 py-2.5 font-medium transition-colors ${
                        isActivePath("/dashboard/assessment")
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon name="ClipboardCheck" className="mr-3 h-4 w-4 text-green-500" />
                      Military Assessment
                    </Link>
                    <Link
                      href="/dashboard/binder"
                      className={`flex items-center px-4 py-2.5 font-medium transition-colors ${
                        isActivePath("/dashboard/binder")
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon name="FolderOpen" className="mr-3 h-4 w-4 text-purple-500" />
                      My Binder
                    </Link>
                  </div>
                )}
              </div>

              {/* Search Button */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="text-body hover:bg-surface-hover rounded-lg p-2 transition-colors hover:text-primary"
                title="Search (Press /)"
              >
                <Icon name="Search" className="h-5 w-5" />
              </button>

              {/* Tools Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => {
                  if (closeTimeout) clearTimeout(closeTimeout);
                  setToolsOpen(true);
                }}
                onMouseLeave={() => {
                  const t = setTimeout(() => setToolsOpen(false), 200);
                  setCloseTimeout(t);
                }}
              >
                <button
                  className={`relative flex items-center font-medium transition-colors ${
                    isActivePath("/dashboard/tools")
                      ? "font-semibold text-blue-600 dark:text-blue-400"
                      : "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  }`}
                >
                  Tools
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  {isActivePath("/dashboard/tools") && (
                    <div className="bg-info absolute -bottom-6 left-0 right-0 h-0.5 rounded-full" />
                  )}
                </button>
                {toolsOpen && (
                  <div
                    className="bg-surface border-subtle absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border py-3 shadow-xl"
                    onMouseEnter={() => {
                      if (closeTimeout) clearTimeout(closeTimeout);
                      setToolsOpen(true);
                    }}
                    onMouseLeave={() => {
                      const t = setTimeout(() => setToolsOpen(false), 200);
                      setCloseTimeout(t);
                    }}
                  >
                    <div className="flex items-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted">
                      <Icon name="TrendingUp" className="mr-1 h-3 w-3" />
                      Financial Tools
                    </div>
                    <Link
                      href="/dashboard/tools/tsp-modeler"
                      className="text-body hover:bg-surface-hover flex items-center px-4 py-2.5 font-medium transition-colors"
                    >
                      <Icon name="BarChart" className="text-info mr-3 h-4 w-4" />
                      TSP Modeler
                    </Link>
                    <Link
                      href="/dashboard/tools/sdp-strategist"
                      className="text-body hover:bg-surface-hover flex items-center px-4 py-2.5 font-medium transition-colors"
                    >
                      <Icon name="PiggyBank" className="mr-3 h-4 w-4 text-green-500" />
                      SDP Strategist
                    </Link>
                    <Link
                      href="/dashboard/tools/house-hacking"
                      className="text-body hover:bg-surface-hover flex items-center px-4 py-2.5 font-medium transition-colors"
                    >
                      <Icon name="Home" className="mr-3 h-4 w-4 text-purple-500" />
                      House Hacking
                    </Link>
                    <div className="border-subtle my-2 border-t"></div>
                    <div className="flex items-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted">
                      <Icon name="MapPin" className="mr-1 h-3 w-3" />
                      Planning Tools
                    </div>
                    <Link
                      href="/dashboard/tools/pcs-planner"
                      className="text-body hover:bg-surface-hover flex items-center px-4 py-2.5 font-medium transition-colors"
                    >
                      <Icon name="Truck" className="mr-3 h-4 w-4 text-indigo-500" />
                      PCS Financial Planner
                    </Link>
                    <Link
                      href="/dashboard/tools/on-base-savings"
                      className="text-body hover:bg-surface-hover flex items-center px-4 py-2.5 font-medium transition-colors"
                    >
                      <Icon name="ShoppingCart" className="mr-3 h-4 w-4 text-orange-500" />
                      Annual Savings Center
                    </Link>
                    <Link
                      href="/dashboard/tools/salary-calculator"
                      className="text-body hover:bg-surface-hover flex items-center px-4 py-2.5 font-medium transition-colors"
                    >
                      <Icon name="Briefcase" className="mr-3 h-4 w-4 text-emerald-500" />
                      Career Opportunity Analyzer
                    </Link>
                  </div>
                )}
              </div>

              {/* Resources Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => {
                  if (closeTimeout) clearTimeout(closeTimeout);
                  setResourcesOpen(true);
                }}
                onMouseLeave={() => {
                  const t = setTimeout(() => setResourcesOpen(false), 200);
                  setCloseTimeout(t);
                }}
              >
                <button
                  className={`relative flex items-center font-medium transition-colors ${
                    isActivePath("/pcs-hub") ||
                    isActivePath("/career-hub") ||
                    isActivePath("/deployment") ||
                    isActivePath("/on-base-shopping") ||
                    isActivePath("/base-guides")
                      ? "font-semibold text-blue-600"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  Resources
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  {(isActivePath("/pcs-hub") ||
                    isActivePath("/career-hub") ||
                    isActivePath("/deployment") ||
                    isActivePath("/on-base-shopping") ||
                    isActivePath("/base-guides")) && (
                    <div className="bg-info absolute -bottom-6 left-0 right-0 h-0.5 rounded-full" />
                  )}
                </button>
                {resourcesOpen && (
                  <div
                    className="bg-surface border-subtle absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border py-3 shadow-xl"
                    onMouseEnter={() => {
                      if (closeTimeout) clearTimeout(closeTimeout);
                      setResourcesOpen(true);
                    }}
                    onMouseLeave={() => {
                      const t = setTimeout(() => setResourcesOpen(false), 200);
                      setCloseTimeout(t);
                    }}
                  >
                    <div className="flex items-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted">
                      <Icon name="BookOpen" className="mr-1 h-3 w-3" />
                      Resource Hubs
                    </div>
                    <a
                      href="/pcs-hub"
                      className="text-body hover:bg-surface-hover flex items-center px-4 py-2.5 font-medium transition-colors"
                    >
                      <Icon name="Truck" className="text-info mr-3 h-4 w-4" />
                      PCS Hub
                    </a>
                    <a
                      href="/career-hub"
                      className="text-body hover:bg-surface-hover flex items-center px-4 py-2.5 font-medium transition-colors"
                    >
                      <Icon name="Briefcase" className="mr-3 h-4 w-4 text-green-500" />
                      Career Hub
                    </a>
                    <a
                      href="/deployment"
                      className="text-body hover:bg-surface-hover flex items-center px-4 py-2.5 font-medium transition-colors"
                    >
                      <Icon name="Shield" className="mr-3 h-4 w-4 text-red-500" />
                      Deployment Guide
                    </a>
                    <a
                      href="/on-base-shopping"
                      className="text-body hover:bg-surface-hover flex items-center px-4 py-2.5 font-medium transition-colors"
                    >
                      <Icon name="ShoppingCart" className="mr-3 h-4 w-4 text-orange-500" />
                      On-Base Shopping
                    </a>
                    <a
                      href="/base-guides"
                      className="text-body hover:bg-surface-hover flex items-center px-4 py-2.5 font-medium transition-colors"
                    >
                      <Icon name="MapPin" className="mr-3 h-4 w-4 text-purple-500" />
                      Base Guides
                    </a>
                  </div>
                )}
              </div>

              <Link
                href="/dashboard/library"
                className={`relative font-medium transition-colors ${
                  isActivePath("/dashboard/library")
                    ? "font-semibold text-blue-600 dark:text-blue-400"
                    : "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                }`}
              >
                Intel Library
                {isActivePath("/dashboard/library") && (
                  <div className="bg-info dark:bg-info absolute -bottom-6 left-0 right-0 h-0.5 rounded-full" />
                )}
              </Link>
              <Link
                href="/dashboard/listening-post"
                className={`relative font-medium transition-colors ${
                  isActivePath("/dashboard/listening-post")
                    ? "font-semibold text-blue-600 dark:text-blue-400"
                    : "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                }`}
              >
                Listening Post
                {isActivePath("/dashboard/listening-post") && (
                  <div className="bg-info dark:bg-info absolute -bottom-6 left-0 right-0 h-0.5 rounded-full" />
                )}
              </Link>
              <Link
                href="/dashboard/referrals"
                className={`relative font-medium transition-colors ${
                  isActivePath("/dashboard/referrals")
                    ? "font-semibold text-blue-600 dark:text-blue-400"
                    : "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                }`}
              >
                Referrals
                {isActivePath("/dashboard/referrals") && (
                  <div className="bg-info dark:bg-info absolute -bottom-6 left-0 right-0 h-0.5 rounded-full" />
                )}
              </Link>
              <Link
                href="/dashboard/directory"
                className={`relative font-medium transition-colors ${
                  isActivePath("/dashboard/directory")
                    ? "font-semibold text-blue-600 dark:text-blue-400"
                    : "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                }`}
              >
                Directory
                {isActivePath("/dashboard/directory") && (
                  <div className="bg-info dark:bg-info absolute -bottom-6 left-0 right-0 h-0.5 rounded-full" />
                )}
              </Link>
              <Link
                href="/dashboard/referrals"
                className={`relative font-medium transition-colors ${
                  isActivePath("/dashboard/referrals")
                    ? "font-semibold text-blue-600"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                Refer & Earn
                {isActivePath("/dashboard/referrals") && (
                  <div className="bg-info absolute -bottom-6 left-0 right-0 h-0.5 rounded-full" />
                )}
              </Link>
              <Link
                href="/dashboard/upgrade"
                className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 font-semibold text-white transition-all hover:scale-105 hover:shadow-lg"
              >
                Upgrade
              </Link>
            </SignedIn>
          </nav>

          {/* Search Overlay */}
          {showSearch && (
            <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 pt-20">
              <div className="bg-surface mx-4 w-full max-w-2xl rounded-xl shadow-2xl">
                <form onSubmit={handleSearch} className="p-6">
                  <div className="flex items-center gap-4">
                    <Icon name="Search" className="h-6 w-6 text-muted" />
                    <input
                      id="nav-search"
                      type="text"
                      placeholder="Search Intel Library... (Press / to focus)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 border-none bg-transparent text-lg outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowSearch(false)}
                      className="hover:text-body p-2 text-muted"
                    >
                      <Icon name="X" className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-4 text-sm text-muted">
                    Press <kbd className="bg-surface-hover rounded px-2 py-1 text-xs">Enter</kbd> to
                    search or <kbd className="bg-surface-hover rounded px-2 py-1 text-xs">Esc</kbd>{" "}
                    to close
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-body p-2 hover:text-primary lg:hidden"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Authentication Buttons - Desktop Only */}
          <div className="hidden items-center space-x-4 lg:flex">
            <SignedOut>
              <div className="flex items-center space-x-2">
                <SignInButton mode="modal">
                  <button className="text-body font-medium transition-colors hover:text-primary">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-info hover:bg-info rounded-md px-4 py-2 font-medium text-white transition-colors">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>

            <SignedIn>
              <div className="flex items-center space-x-2">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                    },
                  }}
                />
              </div>
            </SignedIn>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-subtle bg-surface border-t dark:border-slate-700 dark:bg-slate-900 lg:hidden">
            <nav className="flex flex-col">
              {/* Search in Mobile */}
              <div className="border-subtle border-b px-4 py-3">
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <Icon name="Search" className="h-5 w-5 text-muted" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 border-none bg-transparent text-base outline-none"
                  />
                </form>
              </div>

              {/* Main Navigation */}
              <div className="space-y-1 px-4 py-3">
                <Link
                  href="/"
                  className={`flex items-center rounded-lg px-3 py-2 font-medium transition-colors ${
                    isActivePath("/")
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon name="Home" className="mr-3 h-5 w-5" />
                  Home
                </Link>
                <SignedIn>
                  {/* Command Center Section */}
                  <div className="px-3 py-2">
                    <p className="mb-2 flex items-center text-xs font-semibold uppercase tracking-wider text-muted">
                      <Icon name="LayoutDashboard" className="mr-1 h-3 w-3" />
                      Command Center
                    </p>
                    <div className="space-y-1">
                      <Link
                        href="/dashboard"
                        className={`flex items-center rounded-lg px-3 py-2 font-medium transition-colors ${
                          pathname === "/dashboard"
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon name="LayoutDashboard" className="text-info mr-3 h-4 w-4" />
                        Dashboard Overview
                      </Link>
                      <Link
                        href="/dashboard/plan"
                        className={`flex items-center rounded-lg px-3 py-2 font-medium transition-colors ${
                          isActivePath("/dashboard/plan")
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon name="Sparkles" className="mr-3 h-4 w-4 text-indigo-500" />
                        Your AI Plan
                      </Link>
                      <Link
                        href="/dashboard/assessment"
                        className={`flex items-center rounded-lg px-3 py-2 font-medium transition-colors ${
                          isActivePath("/dashboard/assessment")
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon name="ClipboardCheck" className="mr-3 h-4 w-4 text-green-500" />
                        Military Assessment
                      </Link>
                      <Link
                        href="/dashboard/binder"
                        className={`flex items-center rounded-lg px-3 py-2 font-medium transition-colors ${
                          isActivePath("/dashboard/binder")
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon name="FolderOpen" className="mr-3 h-4 w-4 text-purple-500" />
                        My Binder
                      </Link>
                    </div>
                  </div>
                  {/* Tools Section */}
                  <div className="px-3 py-2">
                    <p className="mb-2 flex items-center text-xs font-semibold uppercase tracking-wider text-muted">
                      <Icon name="TrendingUp" className="mr-1 h-3 w-3" />
                      Financial Tools
                    </p>
                    <div className="space-y-1">
                      <Link
                        href="/dashboard/tools/tsp-modeler"
                        className="text-body hover:bg-surface-hover flex items-center rounded-lg px-3 py-2 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon name="BarChart" className="text-info mr-3 h-4 w-4" />
                        TSP Modeler
                      </Link>
                      <Link
                        href="/dashboard/tools/sdp-strategist"
                        className="text-body hover:bg-surface-hover flex items-center rounded-lg px-3 py-2 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon name="PiggyBank" className="mr-3 h-4 w-4 text-green-500" />
                        SDP Strategist
                      </Link>
                      <Link
                        href="/dashboard/tools/house-hacking"
                        className="text-body hover:bg-surface-hover flex items-center rounded-lg px-3 py-2 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon name="Home" className="mr-3 h-4 w-4 text-purple-500" />
                        House Hacking
                      </Link>
                    </div>
                  </div>

                  <div className="px-3 py-2">
                    <p className="mb-2 flex items-center text-xs font-semibold uppercase tracking-wider text-muted">
                      <Icon name="MapPin" className="mr-1 h-3 w-3" />
                      Planning Tools
                    </p>
                    <div className="space-y-1">
                      <Link
                        href="/dashboard/tools/pcs-planner"
                        className="text-body hover:bg-surface-hover flex items-center rounded-lg px-3 py-2 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon name="Truck" className="mr-3 h-4 w-4 text-indigo-500" />
                        PCS Financial Planner
                      </Link>
                      <Link
                        href="/dashboard/tools/on-base-savings"
                        className="text-body hover:bg-surface-hover flex items-center rounded-lg px-3 py-2 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon name="ShoppingCart" className="mr-3 h-4 w-4 text-orange-500" />
                        Annual Savings Center
                      </Link>
                      <Link
                        href="/dashboard/tools/salary-calculator"
                        className="text-body hover:bg-surface-hover flex items-center rounded-lg px-3 py-2 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon name="Briefcase" className="mr-3 h-4 w-4 text-emerald-500" />
                        Career Opportunity Analyzer
                      </Link>
                    </div>
                  </div>

                  {/* Resources Section */}
                  <div className="px-3 py-2">
                    <p className="mb-2 flex items-center text-xs font-semibold uppercase tracking-wider text-muted">
                      <Icon name="BookOpen" className="mr-1 h-3 w-3" />
                      Resource Hubs
                    </p>
                    <div className="space-y-1">
                      <a
                        href="/pcs-hub"
                        className="text-body hover:bg-surface-hover flex items-center rounded-lg px-3 py-2 transition-colors"
                      >
                        <Icon name="Truck" className="text-info mr-3 h-4 w-4" />
                        PCS Hub
                      </a>
                      <a
                        href="/career-hub"
                        className="text-body hover:bg-surface-hover flex items-center rounded-lg px-3 py-2 transition-colors"
                      >
                        <Icon name="Briefcase" className="mr-3 h-4 w-4 text-green-500" />
                        Career Hub
                      </a>
                      <a
                        href="/deployment"
                        className="text-body hover:bg-surface-hover flex items-center rounded-lg px-3 py-2 transition-colors"
                      >
                        <Icon name="Shield" className="mr-3 h-4 w-4 text-red-500" />
                        Deployment Guide
                      </a>
                      <a
                        href="/on-base-shopping"
                        className="text-body hover:bg-surface-hover flex items-center rounded-lg px-3 py-2 transition-colors"
                      >
                        <Icon name="ShoppingCart" className="mr-3 h-4 w-4 text-orange-500" />
                        On-Base Shopping
                      </a>
                      <a
                        href="/base-guides"
                        className="text-body hover:bg-surface-hover flex items-center rounded-lg px-3 py-2 transition-colors"
                      >
                        <Icon name="MapPin" className="mr-3 h-4 w-4 text-purple-500" />
                        Base Guides
                      </a>
                    </div>
                  </div>

                  {/* Additional Links */}
                  <Link
                    href="/dashboard/library"
                    className={`flex items-center rounded-lg px-3 py-2 font-medium transition-colors ${
                      isActivePath("/dashboard/library")
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon name="Library" className="mr-3 h-5 w-5" />
                    Intel Library
                  </Link>
                  <Link
                    href="/dashboard/listening-post"
                    className={`flex items-center rounded-lg px-3 py-2 font-medium transition-colors ${
                      isActivePath("/dashboard/listening-post")
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-700"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon name="Radio" className="mr-3 h-5 w-5" />
                    Listening Post
                  </Link>
                  <Link
                    href="/dashboard/directory"
                    className={`flex items-center rounded-lg px-3 py-2 font-medium transition-colors ${
                      isActivePath("/dashboard/directory")
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon name="Users" className="mr-3 h-5 w-5" />
                    Directory
                  </Link>
                  <Link
                    href="/dashboard/referrals"
                    className={`flex items-center rounded-lg px-3 py-2 font-medium transition-colors ${
                      isActivePath("/dashboard/referrals")
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon name="Gift" className="mr-3 h-5 w-5" />
                    Refer & Earn
                  </Link>

                  {/* Upgrade Button */}
                  <div className="px-3 py-2">
                    <Link
                      href="/dashboard/upgrade"
                      className="block w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-center font-semibold text-white transition-all hover:shadow-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Upgrade to Premium
                    </Link>
                  </div>
                </SignedIn>
              </div>

              {/* Mobile Auth Buttons */}
              <div className="border-subtle mt-2 border-t px-2 py-2 pt-4">
                <SignedOut>
                  <div className="flex flex-col space-y-2">
                    <SignInButton mode="modal">
                      <button className="text-body border-default w-full rounded-lg border py-2 text-center font-medium transition-colors hover:text-primary">
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="bg-info hover:bg-info w-full rounded-lg py-2 font-medium text-white transition-colors">
                        Sign Up
                      </button>
                    </SignUpButton>
                  </div>
                </SignedOut>

                <SignedIn>
                  <div className="flex items-center justify-between">
                    <span className="text-body text-sm">Your Account</span>
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "w-8 h-8",
                        },
                      }}
                    />
                  </div>
                </SignedIn>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
