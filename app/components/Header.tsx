"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";

import Icon from "./ui/Icon";

export default function Header() {
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [premiumToolsOpen, setPremiumToolsOpen] = useState(false);
  const [coreToolsOpen, setCoreToolsOpen] = useState(false);
  const [intelligenceOpen, setIntelligenceOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const pathname = usePathname();

  // Dropdown close timers
  const [closeTimers, setCloseTimers] = useState<{ [key: string]: NodeJS.Timeout }>({});

  const handleDropdownMouseEnter = (dropdown: string, setter: (val: boolean) => void) => {
    if (closeTimers[dropdown]) {
      clearTimeout(closeTimers[dropdown]);
    }
    setter(true);
  };

  const handleDropdownMouseLeave = (dropdown: string, setter: (val: boolean) => void) => {
    const timer = setTimeout(() => setter(false), 300);
    setCloseTimers((prev) => ({ ...prev, [dropdown]: timer }));
  };

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
      } else if (e.key === "Escape") {
        setShowSearch(false);
        setDashboardOpen(false);
        setPremiumToolsOpen(false);
        setCoreToolsOpen(false);
        setIntelligenceOpen(false);
        setResourcesOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showSearch]);

  const isActivePath = (path: string) => {
    if (!pathname) return false;
    if (path === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* Premium Search Modal - Enhanced */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-gradient-to-br from-black/60 via-slate-900/40 to-black/60 px-4 pt-24 backdrop-blur-md">
          <div className="animate-in fade-in slide-in-from-top-4 w-full max-w-3xl overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-2xl duration-200 dark:border-slate-700 dark:bg-slate-800">
            {/* Search Header */}
            <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 dark:border-slate-600 dark:from-slate-800 dark:to-slate-700">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                  <Icon name="Search" className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <input
                  id="nav-search"
                  type="text"
                  placeholder="Search calculators, intel, resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-lg font-semibold text-slate-900 placeholder-gray-400 focus:outline-none dark:text-white dark:placeholder-gray-500"
                  autoFocus
                />
                <button
                  onClick={() => setShowSearch(false)}
                  className="rounded-lg p-2 transition-colors hover:bg-white/50 dark:hover:bg-slate-600/50"
                >
                  <Icon name="X" className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Search Shortcuts */}
            <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Quick Access:
                </span>
                <Link
                  href="/dashboard/ask"
                  onClick={() => setShowSearch(false)}
                  className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 dark:hover:bg-indigo-900/30"
                >
                  Ask Our Military Expert
                </Link>
                <Link
                  href="/dashboard/tools/tsp-modeler"
                  onClick={() => setShowSearch(false)}
                  className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
                >
                  TSP Calculator
                </Link>
                <Link
                  href="/dashboard/pcs-copilot"
                  onClick={() => setShowSearch(false)}
                  className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 transition-colors hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:hover:bg-orange-900/30"
                >
                  PCS Copilot
                </Link>
                <Link
                  href="/base-guides"
                  onClick={() => setShowSearch(false)}
                  className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
                >
                  Base Guides
                </Link>
              </div>
            </div>

            {/* Search Footer */}
            <div className="flex items-center justify-between bg-slate-50 px-6 py-3 dark:bg-slate-900">
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <kbd className="rounded border border-gray-200 bg-white px-2 py-1 font-mono text-xs dark:border-slate-600 dark:bg-slate-800">
                    ↵
                  </kbd>
                  <span>to select</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <kbd className="rounded border border-gray-200 bg-white px-2 py-1 font-mono text-xs dark:border-slate-600 dark:bg-slate-800">
                    ESC
                  </kbd>
                  <span>to close</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Icon name="Sparkles" className="h-3 w-3" />
                <span>Powered by AI</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header - Premium Design */}
      <header className="bg-white/98 dark:bg-slate-900/98 sticky top-0 z-[100] border-b-2 border-slate-200/50 shadow-sm backdrop-blur-xl dark:border-slate-700/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo - Premium Brand */}
            <Link href="/" className="group flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl sm:h-11 sm:w-11 sm:rounded-xl sm:shadow-lg">
                  <Icon name="Shield" className="h-5 w-5 text-white drop-shadow-md sm:h-6 sm:w-6" />
                </div>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 opacity-0 blur-md transition-all duration-300 group-hover:opacity-30 sm:rounded-xl" />
              </div>
              <div className="hidden sm:block">
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-lg font-bold text-transparent dark:from-white dark:via-slate-100 dark:to-white sm:text-xl">
                  Garrison Ledger
                </div>
                <div className="-mt-1 text-xs font-medium tracking-wide text-gray-500 dark:text-gray-400">
                  Military Financial Intelligence
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-1 lg:flex">
              <SignedIn>
                {/* Dashboard Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => handleDropdownMouseEnter("dashboard", setDashboardOpen)}
                  onMouseLeave={() => handleDropdownMouseLeave("dashboard", setDashboardOpen)}
                >
                  <button
                    className={`group relative flex items-center rounded-lg px-4 py-2 font-semibold transition-all ${
                      isActivePath("/dashboard")
                        ? "text-slate-900 dark:text-white"
                        : "text-gray-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white"
                    }`}
                  >
                    Dashboard
                    <Icon
                      name="ChevronDown"
                      className={`ml-1 h-4 w-4 transition-transform ${dashboardOpen ? "rotate-180" : ""}`}
                    />
                    {isActivePath("/dashboard") && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-slate-700 to-slate-900" />
                    )}
                  </button>
                  {dashboardOpen && (
                    <div
                      className="animate-in fade-in slide-in-from-top-2 absolute left-0 top-full z-50 mt-1 w-72 overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-2xl duration-200 dark:border-slate-700 dark:bg-slate-800"
                      onMouseEnter={() => handleDropdownMouseEnter("dashboard", setDashboardOpen)}
                      onMouseLeave={() => handleDropdownMouseLeave("dashboard", setDashboardOpen)}
                    >
                      <div className="p-3">
                        <Link
                          href="/dashboard"
                          className={`group flex items-start gap-3 rounded-lg px-3 py-3 transition-all ${
                            pathname === "/dashboard"
                              ? "bg-blue-50 dark:bg-blue-900/20"
                              : "hover:bg-gray-50 dark:hover:bg-slate-700/50"
                          }`}
                        >
                          <Icon
                            name="LayoutDashboard"
                            className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
                          />
                          <div>
                            <div
                              className={`text-sm font-semibold ${pathname === "/dashboard" ? "text-blue-600" : "text-slate-900 group-hover:text-blue-600 dark:text-white"}`}
                            >
                              Dashboard Home
                            </div>
                            <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                              Your mission overview
                            </div>
                          </div>
                        </Link>
                        <Link
                          href="/dashboard/binder"
                          className={`group flex items-start gap-3 rounded-lg px-3 py-3 transition-all ${
                            isActivePath("/dashboard/binder")
                              ? "bg-blue-50 dark:bg-blue-900/20"
                              : "hover:bg-gray-50 dark:hover:bg-slate-700/50"
                          }`}
                        >
                          <Icon
                            name="FolderOpen"
                            className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600"
                          />
                          <div>
                            <div
                              className={`text-sm font-semibold ${isActivePath("/dashboard/binder") ? "text-blue-600" : "text-slate-900 group-hover:text-purple-600 dark:text-white"}`}
                            >
                              Binder
                            </div>
                            <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                              Secure documents
                            </div>
                          </div>
                        </Link>
                        <Link
                          href="/dashboard/settings"
                          className={`group flex items-start gap-3 rounded-lg px-3 py-3 transition-all ${
                            isActivePath("/dashboard/settings")
                              ? "bg-blue-50 dark:bg-blue-900/20"
                              : "hover:bg-gray-50 dark:hover:bg-slate-700/50"
                          }`}
                        >
                          <Icon
                            name="Settings"
                            className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-600"
                          />
                          <div>
                            <div
                              className={`text-sm font-semibold ${isActivePath("/dashboard/settings") ? "text-blue-600" : "text-slate-900 group-hover:text-gray-600 dark:text-white"}`}
                            >
                              Settings
                            </div>
                            <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                              Profile & preferences
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Premium Tools Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => handleDropdownMouseEnter("premium", setPremiumToolsOpen)}
                  onMouseLeave={() => handleDropdownMouseLeave("premium", setPremiumToolsOpen)}
                >
                  <button
                    className={`group relative flex items-center rounded-lg px-4 py-2 font-semibold transition-all ${
                      isActivePath("/dashboard/les-auditor") ||
                      isActivePath("/dashboard/paycheck-audit") ||
                      isActivePath("/dashboard/pcs-copilot") ||
                      isActivePath("/dashboard/navigator") ||
                      isActivePath("/dashboard/tdy-copilot") ||
                      isActivePath("/dashboard/tdy-voucher") ||
                      isActivePath("/dashboard/intel")
                        ? "text-slate-900 dark:text-white"
                        : "text-gray-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white"
                    }`}
                  >
                    Premium Tools
                    <Icon
                      name="ChevronDown"
                      className={`ml-1 h-4 w-4 transition-transform ${premiumToolsOpen ? "rotate-180" : ""}`}
                    />
                    {(isActivePath("/dashboard/les-auditor") ||
                      isActivePath("/dashboard/paycheck-audit") ||
                      isActivePath("/dashboard/pcs-copilot") ||
                      isActivePath("/dashboard/navigator") ||
                      isActivePath("/dashboard/tdy-copilot") ||
                      isActivePath("/dashboard/tdy-voucher") ||
                      isActivePath("/dashboard/intel")) && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-slate-700 to-slate-900" />
                    )}
                  </button>
                  {premiumToolsOpen && (
                    <div
                      className="animate-in fade-in slide-in-from-top-2 absolute left-0 top-full z-50 mt-1 w-72 overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-2xl duration-200 dark:border-slate-700 dark:bg-slate-800"
                      onMouseEnter={() => handleDropdownMouseEnter("premium", setPremiumToolsOpen)}
                      onMouseLeave={() => handleDropdownMouseLeave("premium", setPremiumToolsOpen)}
                    >
                      <div className="p-3">
                        {/* LES Auditor */}
                        <Link
                          href="/dashboard/paycheck-audit"
                          className={`group flex items-start gap-3 rounded-lg px-3 py-3 transition-all ${
                            isActivePath("/dashboard/paycheck-audit") ||
                            isActivePath("/dashboard/les-auditor")
                              ? "bg-green-50 dark:bg-green-900/20"
                              : "hover:bg-gray-50 dark:hover:bg-slate-700/50"
                          }`}
                        >
                          <Icon
                            name="DollarSign"
                            className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                          />
                          <div>
                            <div
                              className={`text-sm font-semibold ${isActivePath("/dashboard/paycheck-audit") || isActivePath("/dashboard/les-auditor") ? "text-green-600" : "text-slate-900 group-hover:text-green-600 dark:text-white"}`}
                            >
                              LES Auditor
                              <span className="ml-2 rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                New
                              </span>
                            </div>
                            <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                              Catch pay errors automatically
                            </div>
                          </div>
                        </Link>

                        {/* PCS Copilot */}
                        <Link
                          href="/dashboard/pcs-copilot"
                          className={`group flex items-start gap-3 rounded-lg px-3 py-3 transition-all ${
                            isActivePath("/dashboard/pcs-copilot")
                              ? "bg-orange-50 dark:bg-orange-900/20"
                              : "hover:bg-gray-50 dark:hover:bg-slate-700/50"
                          }`}
                        >
                          <Icon
                            name="Truck"
                            className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600"
                          />
                          <div>
                            <div
                              className={`text-sm font-semibold ${isActivePath("/dashboard/pcs-copilot") ? "text-orange-600" : "text-slate-900 group-hover:text-orange-600 dark:text-white"}`}
                            >
                              PCS Copilot
                            </div>
                            <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                              Maximize DITY move profit
                            </div>
                          </div>
                        </Link>

                        {/* Base Navigator */}
                        <Link
                          href="/dashboard/navigator"
                          className={`group flex items-start gap-3 rounded-lg px-3 py-3 transition-all ${
                            isActivePath("/dashboard/navigator")
                              ? "bg-blue-50 dark:bg-blue-900/20"
                              : "hover:bg-gray-50 dark:hover:bg-slate-700/50"
                          }`}
                        >
                          <Icon
                            name="MapPin"
                            className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
                          />
                          <div>
                            <div
                              className={`text-sm font-semibold ${isActivePath("/dashboard/navigator") ? "text-blue-600" : "text-slate-900 group-hover:text-blue-600 dark:text-white"}`}
                            >
                              Base Navigator
                              <span className="ml-2 rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                New
                              </span>
                            </div>
                            <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                              Find perfect neighborhoods
                            </div>
                          </div>
                        </Link>

                        {/* TDY Copilot */}
                        <Link
                          href="/dashboard/tdy-voucher"
                          className={`group flex items-start gap-3 rounded-lg px-3 py-3 transition-all ${
                            isActivePath("/dashboard/tdy-voucher") ||
                            isActivePath("/dashboard/tdy-copilot")
                              ? "bg-purple-50 dark:bg-purple-900/20"
                              : "hover:bg-gray-50 dark:hover:bg-slate-700/50"
                          }`}
                        >
                          <Icon
                            name="File"
                            className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600"
                          />
                          <div>
                            <div
                              className={`text-sm font-semibold ${isActivePath("/dashboard/tdy-voucher") || isActivePath("/dashboard/tdy-copilot") ? "text-purple-600" : "text-slate-900 group-hover:text-purple-600 dark:text-white"}`}
                            >
                              TDY Copilot
                              <span className="ml-2 rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                New
                              </span>
                            </div>
                            <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                              Build travel vouchers fast
                            </div>
                          </div>
                        </Link>

                        {/* Ask Our Military Expert */}
                        <Link
                          href="/dashboard/ask"
                          className={`group flex items-start gap-3 rounded-lg px-3 py-3 transition-all ${
                            isActivePath("/dashboard/ask")
                              ? "bg-indigo-50 dark:bg-indigo-900/20"
                              : "hover:bg-gray-50 dark:hover:bg-slate-700/50"
                          }`}
                        >
                          <Icon
                            name="MessageCircle"
                            className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600"
                          />
                          <div>
                            <div
                              className={`text-sm font-semibold ${isActivePath("/dashboard/ask") ? "text-indigo-600" : "text-slate-900 group-hover:text-indigo-600 dark:text-white"}`}
                            >
                              Ask Our Military Expert
                              <span className="ml-2 rounded bg-indigo-100 px-1.5 py-0.5 text-xs text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                                Expert Mode
                              </span>
                            </div>
                            <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                              AI-powered military expertise
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Calculators Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => handleDropdownMouseEnter("calculators", setCoreToolsOpen)}
                  onMouseLeave={() => handleDropdownMouseLeave("calculators", setCoreToolsOpen)}
                >
                  <button
                    className={`group relative flex items-center rounded-lg px-4 py-2 font-semibold transition-all ${
                      isActivePath("/dashboard/tools")
                        ? "text-slate-900 dark:text-white"
                        : "text-gray-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white"
                    }`}
                  >
                    Calculators
                    <Icon
                      name="ChevronDown"
                      className={`ml-1 h-4 w-4 transition-transform ${coreToolsOpen ? "rotate-180" : ""}`}
                    />
                    {isActivePath("/dashboard/tools") && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-slate-700 to-slate-900" />
                    )}
                  </button>
                  {coreToolsOpen && (
                    <div
                      className="animate-in fade-in slide-in-from-top-2 absolute left-0 top-full z-50 mt-1 w-72 overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-2xl duration-200 dark:border-slate-700 dark:bg-slate-800"
                      onMouseEnter={() => handleDropdownMouseEnter("calculators", setCoreToolsOpen)}
                      onMouseLeave={() => handleDropdownMouseLeave("calculators", setCoreToolsOpen)}
                    >
                      <div className="p-3">
                        <Link
                          href="/dashboard/tools/tsp-modeler"
                          className={`group flex items-center gap-3 rounded-lg px-3 py-3 transition-all ${
                            isActivePath("/dashboard/tools/tsp-modeler")
                              ? "bg-emerald-50 dark:bg-emerald-900/20"
                              : "hover:bg-gray-50 dark:hover:bg-slate-700/50"
                          }`}
                        >
                          <Icon
                            name="TrendingUp"
                            className="h-5 w-5 flex-shrink-0 text-emerald-600"
                          />
                          <div>
                            <div
                              className={`text-sm font-semibold ${isActivePath("/dashboard/tools/tsp-modeler") ? "text-emerald-600" : "text-slate-900 group-hover:text-emerald-600 dark:text-white"}`}
                            >
                              TSP Calculator
                            </div>
                            <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                              Optimize your retirement
                            </div>
                          </div>
                        </Link>
                        <Link
                          href="/dashboard/tools/sdp-strategist"
                          className={`group flex items-center gap-3 rounded-lg px-3 py-3 transition-all ${
                            isActivePath("/dashboard/tools/sdp-strategist")
                              ? "bg-emerald-50 dark:bg-emerald-900/20"
                              : "hover:bg-gray-50 dark:hover:bg-slate-700/50"
                          }`}
                        >
                          <Icon
                            name="PiggyBank"
                            className="h-5 w-5 flex-shrink-0 text-emerald-600"
                          />
                          <div>
                            <div
                              className={`text-sm font-semibold ${isActivePath("/dashboard/tools/sdp-strategist") ? "text-emerald-600" : "text-slate-900 group-hover:text-emerald-600 dark:text-white"}`}
                            >
                              SDP Calculator
                            </div>
                            <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                              Deployment savings
                            </div>
                          </div>
                        </Link>
                        <Link
                          href="/dashboard/tools/house-hacking"
                          className={`group flex items-center gap-3 rounded-lg px-3 py-3 transition-all ${
                            isActivePath("/dashboard/tools/house-hacking")
                              ? "bg-emerald-50 dark:bg-emerald-900/20"
                              : "hover:bg-gray-50 dark:hover:bg-slate-700/50"
                          }`}
                        >
                          <Icon name="Home" className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                          <div>
                            <div
                              className={`text-sm font-semibold ${isActivePath("/dashboard/tools/house-hacking") ? "text-emerald-600" : "text-slate-900 group-hover:text-emerald-600 dark:text-white"}`}
                            >
                              House Hacking
                            </div>
                            <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                              Multi-unit investments
                            </div>
                          </div>
                        </Link>
                        <Link
                          href="/dashboard/tools/pcs-planner"
                          className={`group flex items-center gap-3 rounded-lg px-3 py-3 transition-all ${
                            isActivePath("/dashboard/tools/pcs-planner")
                              ? "bg-emerald-50 dark:bg-emerald-900/20"
                              : "hover:bg-gray-50 dark:hover:bg-slate-700/50"
                          }`}
                        >
                          <Icon name="Truck" className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                          <div>
                            <div
                              className={`text-sm font-semibold ${isActivePath("/dashboard/tools/pcs-planner") ? "text-emerald-600" : "text-slate-900 group-hover:text-emerald-600 dark:text-white"}`}
                            >
                              PCS Planner
                            </div>
                            <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                              Move planning & costs
                            </div>
                          </div>
                        </Link>
                        <Link
                          href="/dashboard/tools/on-base-savings"
                          className={`group flex items-center gap-3 rounded-lg px-3 py-3 transition-all ${
                            isActivePath("/dashboard/tools/on-base-savings")
                              ? "bg-emerald-50 dark:bg-emerald-900/20"
                              : "hover:bg-gray-50 dark:hover:bg-slate-700/50"
                          }`}
                        >
                          <Icon
                            name="ShoppingCart"
                            className="h-5 w-5 flex-shrink-0 text-emerald-600"
                          />
                          <div>
                            <div
                              className={`text-sm font-semibold ${isActivePath("/dashboard/tools/on-base-savings") ? "text-emerald-600" : "text-slate-900 group-hover:text-emerald-600 dark:text-white"}`}
                            >
                              On-Base Savings
                            </div>
                            <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                              Commissary & exchange
                            </div>
                          </div>
                        </Link>
                        <Link
                          href="/dashboard/tools/salary-calculator"
                          className={`group flex items-center gap-3 rounded-lg px-3 py-3 transition-all ${
                            isActivePath("/dashboard/tools/salary-calculator")
                              ? "bg-emerald-50 dark:bg-emerald-900/20"
                              : "hover:bg-gray-50 dark:hover:bg-slate-700/50"
                          }`}
                        >
                          <Icon
                            name="Calculator"
                            className="h-5 w-5 flex-shrink-0 text-emerald-600"
                          />
                          <div>
                            <div
                              className={`text-sm font-semibold ${isActivePath("/dashboard/tools/salary-calculator") ? "text-emerald-600" : "text-slate-900 group-hover:text-emerald-600 dark:text-white"}`}
                            >
                              Retirement Calculator
                            </div>
                            <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                              Career transition planning
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Resources Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => handleDropdownMouseEnter("resources", setIntelligenceOpen)}
                  onMouseLeave={() => handleDropdownMouseLeave("resources", setIntelligenceOpen)}
                >
                  <button
                    className={`group relative flex items-center rounded-lg px-4 py-2 font-semibold transition-all ${
                      isActivePath("/dashboard/listening-post") ||
                      isActivePath("/dashboard/directory") ||
                      isActivePath("/dashboard/refer-earn")
                        ? "text-slate-900 dark:text-white"
                        : "text-gray-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white"
                    }`}
                  >
                    Resources
                    <Icon
                      name="ChevronDown"
                      className={`ml-1 h-4 w-4 transition-transform ${intelligenceOpen ? "rotate-180" : ""}`}
                    />
                    {(isActivePath("/dashboard/listening-post") ||
                      isActivePath("/dashboard/directory") ||
                      isActivePath("/dashboard/refer-earn")) && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-slate-700 to-slate-900" />
                    )}
                  </button>
                  {intelligenceOpen && (
                    <div
                      className="animate-in fade-in slide-in-from-top-2 absolute left-0 top-full z-50 mt-1 w-72 overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-2xl duration-200 dark:border-slate-700 dark:bg-slate-800"
                      onMouseEnter={() =>
                        handleDropdownMouseEnter("resources", setIntelligenceOpen)
                      }
                      onMouseLeave={() =>
                        handleDropdownMouseLeave("resources", setIntelligenceOpen)
                      }
                    >
                      <div className="p-3">
                        <Link
                          href="/dashboard/listening-post"
                          className={`group flex items-start gap-3 rounded-lg px-3 py-3 transition-all ${
                            isActivePath("/dashboard/listening-post")
                              ? "bg-purple-50 dark:bg-purple-900/20"
                              : "hover:bg-gray-50 dark:hover:bg-slate-700/50"
                          }`}
                        >
                          <Icon
                            name="Radio"
                            className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600"
                          />
                          <div>
                            <div
                              className={`text-sm font-semibold ${isActivePath("/dashboard/listening-post") ? "text-purple-600" : "text-slate-900 group-hover:text-purple-600 dark:text-white"}`}
                            >
                              Listening Post
                            </div>
                            <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                              Real-time military news
                            </div>
                          </div>
                        </Link>
                        <Link
                          href="/dashboard/directory"
                          className={`group flex items-start gap-3 rounded-lg px-3 py-3 transition-all ${
                            isActivePath("/dashboard/directory")
                              ? "bg-purple-50 dark:bg-purple-900/20"
                              : "hover:bg-gray-50 dark:hover:bg-slate-700/50"
                          }`}
                        >
                          <Icon
                            name="Users"
                            className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600"
                          />
                          <div>
                            <div
                              className={`text-sm font-semibold ${isActivePath("/dashboard/directory") ? "text-purple-600" : "text-slate-900 group-hover:text-purple-600 dark:text-white"}`}
                            >
                              Directory
                            </div>
                            <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                              Military community
                            </div>
                          </div>
                        </Link>
                        <Link
                          href="/dashboard/referrals"
                          className={`group flex items-start gap-3 rounded-lg px-3 py-3 transition-all ${
                            isActivePath("/dashboard/referrals")
                              ? "bg-purple-50 dark:bg-purple-900/20"
                              : "hover:bg-gray-50 dark:hover:bg-slate-700/50"
                          }`}
                        >
                          <Icon
                            name="Gift"
                            className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600"
                          />
                          <div>
                            <div
                              className={`text-sm font-semibold ${isActivePath("/dashboard/referrals") ? "text-purple-600" : "text-slate-900 group-hover:text-purple-600 dark:text-white"}`}
                            >
                              Refer & Earn
                            </div>
                            <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                              Share with your unit
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </SignedIn>

              {/* Toolkits Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => handleDropdownMouseEnter("toolkits", setResourcesOpen)}
                onMouseLeave={() => handleDropdownMouseLeave("toolkits", setResourcesOpen)}
              >
                <button
                  className={`group relative flex items-center rounded-lg px-4 py-2 font-semibold transition-all ${
                    isActivePath("/pcs-hub") ||
                    isActivePath("/career-hub") ||
                    isActivePath("/deployment") ||
                    isActivePath("/on-base-shopping")
                      ? "text-slate-900 dark:text-white"
                      : "text-gray-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  Toolkits
                  <Icon
                    name="ChevronDown"
                    className={`ml-1 h-4 w-4 transition-transform ${resourcesOpen ? "rotate-180" : ""}`}
                  />
                  {(isActivePath("/pcs-hub") ||
                    isActivePath("/career-hub") ||
                    isActivePath("/deployment") ||
                    isActivePath("/on-base-shopping")) && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-slate-700 to-slate-900" />
                  )}
                </button>
                {resourcesOpen && (
                  <div
                    className="animate-in fade-in slide-in-from-top-2 absolute left-0 top-full z-50 mt-1 w-72 overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-2xl duration-200 dark:border-slate-700 dark:bg-slate-800"
                    onMouseEnter={() => handleDropdownMouseEnter("toolkits", setResourcesOpen)}
                    onMouseLeave={() => handleDropdownMouseLeave("toolkits", setResourcesOpen)}
                  >
                    <div className="p-3">
                      <Link
                        href="/pcs-hub"
                        className={`group flex items-start gap-3 rounded-lg px-3 py-3 transition-all ${
                          isActivePath("/pcs-hub")
                            ? "bg-blue-50 dark:bg-blue-900/20"
                            : "hover:bg-gray-50 dark:hover:bg-slate-700/50"
                        }`}
                      >
                        <Icon name="Truck" className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                        <div>
                          <div
                            className={`text-sm font-semibold ${isActivePath("/pcs-hub") ? "text-blue-600" : "text-slate-900 group-hover:text-blue-600 dark:text-white"}`}
                          >
                            PCS Hub
                          </div>
                          <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                            Permanent change of station
                          </div>
                        </div>
                      </Link>
                      <Link
                        href="/career-hub"
                        className={`group flex items-start gap-3 rounded-lg px-3 py-3 transition-all ${
                          isActivePath("/career-hub")
                            ? "bg-blue-50 dark:bg-blue-900/20"
                            : "hover:bg-gray-50 dark:hover:bg-slate-700/50"
                        }`}
                      >
                        <Icon
                          name="Briefcase"
                          className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
                        />
                        <div>
                          <div
                            className={`text-sm font-semibold ${isActivePath("/career-hub") ? "text-blue-600" : "text-slate-900 group-hover:text-blue-600 dark:text-white"}`}
                          >
                            Career Hub
                          </div>
                          <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                            Military career planning
                          </div>
                        </div>
                      </Link>
                      <Link
                        href="/deployment"
                        className={`group flex items-start gap-3 rounded-lg px-3 py-3 transition-all ${
                          isActivePath("/deployment")
                            ? "bg-blue-50 dark:bg-blue-900/20"
                            : "hover:bg-gray-50 dark:hover:bg-slate-700/50"
                        }`}
                      >
                        <Icon
                          name="Shield"
                          className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
                        />
                        <div>
                          <div
                            className={`text-sm font-semibold ${isActivePath("/deployment") ? "text-blue-600" : "text-slate-900 group-hover:text-blue-600 dark:text-white"}`}
                          >
                            Deployment
                          </div>
                          <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                            Deployment preparation
                          </div>
                        </div>
                      </Link>
                      <Link
                        href="/on-base-shopping"
                        className={`group flex items-start gap-3 rounded-lg px-3 py-3 transition-all ${
                          isActivePath("/on-base-shopping")
                            ? "bg-blue-50 dark:bg-blue-900/20"
                            : "hover:bg-gray-50 dark:hover:bg-slate-700/50"
                        }`}
                      >
                        <Icon
                          name="ShoppingCart"
                          className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
                        />
                        <div>
                          <div
                            className={`text-sm font-semibold ${isActivePath("/on-base-shopping") ? "text-blue-600" : "text-slate-900 group-hover:text-blue-600 dark:text-white"}`}
                          >
                            On-Base Shopping
                          </div>
                          <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                            Commissary & exchange
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Right Side - Enhanced */}
            <div className="flex items-center gap-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 font-semibold text-gray-600 transition-colors hover:text-slate-900">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:from-slate-700 hover:to-slate-800 hover:shadow-lg">
                    Start Free Account
                  </button>
                </SignUpButton>
              </SignedOut>

              <SignedIn>
                {/* Search Button - Simple Icon */}
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="hidden p-2 text-gray-600 transition-colors hover:text-blue-600 lg:flex"
                  title="Search (Press /)"
                >
                  <Icon name="Search" className="h-5 w-5" />
                </button>

                {/* Upgrade Button - Premium CTA */}
                <Link
                  href="/dashboard/upgrade"
                  className="hidden transform items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-2.5 font-bold text-white shadow-lg transition-all hover:scale-105 hover:from-emerald-700 hover:to-emerald-800 hover:shadow-xl lg:flex"
                >
                  <Icon name="Zap" className="h-4 w-4" />
                  <span>Upgrade</span>
                </Link>

                {/* User Menu */}
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox:
                        "w-9 h-9 ring-2 ring-slate-200 dark:ring-slate-700 hover:ring-blue-500 transition-all",
                    },
                  }}
                />
              </SignedIn>

              {/* Mobile Menu Button - Enhanced */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-lg p-2 text-gray-600 transition-all hover:bg-gray-100 hover:text-slate-900 dark:hover:bg-slate-800 lg:hidden"
              >
                <Icon name={mobileMenuOpen ? "X" : "Menu"} className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900 lg:hidden">
            <div className="space-y-4 px-4 py-6">
              <SignedIn>
                {/* Mobile Dashboard Section */}
                <div>
                  <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Dashboard
                  </div>
                  <div className="space-y-2">
                    <Link
                      href="/dashboard"
                      className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <Icon name="LayoutDashboard" className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link
                      href="/dashboard/binder"
                      className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <Icon name="FolderOpen" className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Binder</span>
                    </Link>
                    <Link
                      href="/dashboard/pcs-copilot"
                      className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <Icon name="Truck" className="h-5 w-5 text-orange-600" />
                      <span className="font-medium">PCS Copilot</span>
                    </Link>
                  </div>
                </div>

                {/* Mobile Premium Tools Section */}
                <div>
                  <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Premium Tools
                  </div>
                  <div className="space-y-2">
                    <Link
                      href="/dashboard/paycheck-audit"
                      className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <Icon name="DollarSign" className="h-5 w-5 text-green-600" />
                      <span className="font-medium">LES Auditor</span>
                      <span className="ml-auto rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                        New
                      </span>
                    </Link>
                    <Link
                      href="/dashboard/pcs-copilot"
                      className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <Icon name="Truck" className="h-5 w-5 text-orange-600" />
                      <span className="font-medium">PCS Copilot</span>
                    </Link>
                    <Link
                      href="/dashboard/navigator"
                      className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <Icon name="MapPin" className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Base Navigator</span>
                      <span className="ml-auto rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                        New
                      </span>
                    </Link>
                    <Link
                      href="/dashboard/tdy-voucher"
                      className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <Icon name="File" className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">TDY Copilot</span>
                      <span className="ml-auto rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                        New
                      </span>
                    </Link>
                    <Link
                      href="/dashboard/ask"
                      className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <Icon name="MessageCircle" className="h-5 w-5 text-indigo-600" />
                      <span className="font-medium">Ask Our Military Expert</span>
                      <span className="ml-auto rounded bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                        Expert Mode
                      </span>
                    </Link>
                  </div>
                </div>

                {/* Mobile Core Tools Section */}
                <div>
                  <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Calculators
                  </div>
                  <div className="space-y-2">
                    <Link
                      href="/dashboard/tools/tsp-modeler"
                      className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <Icon name="TrendingUp" className="h-5 w-5 text-emerald-600" />
                      <span className="font-medium">TSP Calculator</span>
                    </Link>
                    <Link
                      href="/dashboard/tools/sdp-strategist"
                      className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <Icon name="PiggyBank" className="h-5 w-5 text-emerald-600" />
                      <span className="font-medium">SDP Calculator</span>
                    </Link>
                    <Link
                      href="/dashboard/tools/house-hacking"
                      className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <Icon name="Home" className="h-5 w-5 text-emerald-600" />
                      <span className="font-medium">House Hacking</span>
                    </Link>
                    <Link
                      href="/dashboard/tools/pcs-planner"
                      className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <Icon name="Truck" className="h-5 w-5 text-emerald-600" />
                      <span className="font-medium">PCS Planner</span>
                    </Link>
                    <Link
                      href="/dashboard/tools/on-base-savings"
                      className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <Icon name="ShoppingCart" className="h-5 w-5 text-emerald-600" />
                      <span className="font-medium">On-Base Savings</span>
                    </Link>
                    <Link
                      href="/dashboard/tools/salary-calculator"
                      className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <Icon name="Calculator" className="h-5 w-5 text-emerald-600" />
                      <span className="font-medium">Retirement Calculator</span>
                    </Link>
                  </div>
                </div>

                {/* Mobile Intelligence Section */}
                <div>
                  <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Resources
                  </div>
                  <div className="space-y-2">
                    <Link
                      href="/dashboard/listening-post"
                      className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <Icon name="Radio" className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Listening Post</span>
                    </Link>
                    <Link
                      href="/dashboard/directory"
                      className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <Icon name="Users" className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Directory</span>
                    </Link>
                    <Link
                      href="/dashboard/referrals"
                      className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <Icon name="Gift" className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Refer & Earn</span>
                    </Link>
                  </div>
                </div>

                {/* Mobile Resources Section */}
                <div>
                  <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Toolkits
                  </div>
                  <div className="space-y-2">
                    <Link
                      href="/pcs-hub"
                      className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <Icon name="Truck" className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">PCS Hub</span>
                    </Link>
                    <Link
                      href="/career-hub"
                      className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <Icon name="Briefcase" className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Career Hub</span>
                    </Link>
                    <Link
                      href="/deployment"
                      className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <Icon name="Shield" className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Deployment</span>
                    </Link>
                    <Link
                      href="/base-guides"
                      className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <Icon name="MapPin" className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Base Guides</span>
                    </Link>
                    <Link
                      href="/on-base-shopping"
                      className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <Icon name="ShoppingCart" className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">On-Base Shopping</span>
                    </Link>
                  </div>
                </div>

                {/* Mobile Upgrade CTA */}
                <div className="border-t border-gray-200 pt-4 dark:border-slate-700">
                  <Link
                    href="/dashboard/upgrade"
                    className="block w-full rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2.5 text-center text-sm font-semibold text-white transition-all hover:from-emerald-700 hover:to-emerald-800"
                  >
                    Upgrade to Premium
                  </Link>
                </div>
              </SignedIn>
              <SignedOut>
                <div className="space-y-2.5">
                  <SignInButton mode="modal">
                    <button className="w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-600 transition-colors hover:text-slate-900">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800">
                      Start Free Account
                    </button>
                  </SignUpButton>
                </div>
              </SignedOut>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
