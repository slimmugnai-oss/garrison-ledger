"use client";

import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import Icon from "./ui/Icon";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex flex-shrink-0 items-center">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold text-primary transition-colors hover:text-blue-700"
            >
              <Icon name="BarChart" className="h-6 w-6" />
              <span className="hidden sm:inline">Garrison Ledger</span>
              <span className="sm:hidden">GL</span>
            </Link>
          </div>

          {/* Main Navigation - Desktop */}
          <nav className="hidden items-center gap-1 lg:flex">
            <SignedIn>
              {/* Dashboard Link */}
              <Link
                href="/dashboard"
                className={`rounded-lg px-4 py-2 font-medium transition-all ${
                  isActivePath("/dashboard") &&
                  !isActivePath("/dashboard/tools") &&
                  !isActivePath("/dashboard/library") &&
                  !isActivePath("/dashboard/listening-post")
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Dashboard
              </Link>

              {/* Tools Mega Menu */}
              <div className="group relative">
                <button
                  className={`flex items-center gap-1 rounded-lg px-4 py-2 font-medium transition-all ${
                    isActivePath("/dashboard/tools")
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Calculators
                  <Icon name="ChevronDown" className="h-4 w-4" />
                </button>

                {/* Dropdown */}
                <div className="invisible absolute left-0 top-full mt-1 w-80 rounded-lg border border-gray-200 bg-white py-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
                  <div className="grid grid-cols-2 gap-1 p-2">
                    <Link
                      href="/dashboard/tools/tsp-modeler"
                      className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-gray-50"
                    >
                      <Icon name="BarChart" className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">TSP Modeler</div>
                        <div className="text-xs text-gray-500">Optimize returns</div>
                      </div>
                    </Link>
                    <Link
                      href="/dashboard/tools/sdp-strategist"
                      className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-gray-50"
                    >
                      <Icon name="PiggyBank" className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">SDP Strategist</div>
                        <div className="text-xs text-gray-500">10% guaranteed</div>
                      </div>
                    </Link>
                    <Link
                      href="/dashboard/tools/pcs-planner"
                      className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-gray-50"
                    >
                      <Icon name="Truck" className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">PCS Planner</div>
                        <div className="text-xs text-gray-500">Move budget</div>
                      </div>
                    </Link>
                    <Link
                      href="/dashboard/tools/house-hacking"
                      className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-gray-50"
                    >
                      <Icon name="Home" className="h-5 w-5 text-indigo-600" />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">House Hacking</div>
                        <div className="text-xs text-gray-500">Build wealth</div>
                      </div>
                    </Link>
                    <Link
                      href="/dashboard/tools/on-base-savings"
                      className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-gray-50"
                    >
                      <Icon name="ShoppingCart" className="h-5 w-5 text-orange-600" />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Base Savings</div>
                        <div className="text-xs text-gray-500">Save $1000s</div>
                      </div>
                    </Link>
                    <Link
                      href="/dashboard/tools/salary-calculator"
                      className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-gray-50"
                    >
                      <Icon name="Briefcase" className="h-5 w-5 text-emerald-600" />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Career Analyzer</div>
                        <div className="text-xs text-gray-500">Compare offers</div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Intel Library */}
              <Link
                href="/dashboard/library"
                className={`rounded-lg px-4 py-2 font-medium transition-all ${
                  isActivePath("/dashboard/library")
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Intel Library
              </Link>

              {/* Resources Mega Menu */}
              <div className="group relative">
                <button
                  className={`flex items-center gap-1 rounded-lg px-4 py-2 font-medium transition-all ${
                    isActivePath("/pcs-hub") ||
                    isActivePath("/career-hub") ||
                    isActivePath("/deployment") ||
                    isActivePath("/base-guides")
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Resources
                  <Icon name="ChevronDown" className="h-4 w-4" />
                </button>

                {/* Dropdown */}
                <div className="invisible absolute left-0 top-full mt-1 w-72 rounded-lg border border-gray-200 bg-white py-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
                  <div className="space-y-1 p-2">
                    <a
                      href="/pcs-hub"
                      className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-gray-50"
                    >
                      <Icon name="Truck" className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">PCS Hub</div>
                        <div className="text-xs text-gray-500">Moving & relocation</div>
                      </div>
                    </a>
                    <a
                      href="/career-hub"
                      className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-gray-50"
                    >
                      <Icon name="Briefcase" className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Career Hub</div>
                        <div className="text-xs text-gray-500">Advancement & transition</div>
                      </div>
                    </a>
                    <a
                      href="/deployment"
                      className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-gray-50"
                    >
                      <Icon name="Shield" className="h-5 w-5 text-red-600" />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Deployment Guide</div>
                        <div className="text-xs text-gray-500">Pre & post prep</div>
                      </div>
                    </a>
                    <a
                      href="/base-guides"
                      className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-gray-50"
                    >
                      <Icon name="MapPin" className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Base Guides</div>
                        <div className="text-xs text-gray-500">Installation info</div>
                      </div>
                    </a>
                    <a
                      href="/dashboard/listening-post"
                      className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-gray-50"
                    >
                      <Icon name="Radio" className="h-5 w-5 text-indigo-600" />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Listening Post</div>
                        <div className="text-xs text-gray-500">Latest news</div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </SignedIn>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <SignedIn>
              {/* Search Button - Now on the right */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="hidden items-center gap-2 rounded-lg px-3 py-1.5 text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900 lg:flex"
                title="Search Library (Press /)"
              >
                <Icon name="Search" className="h-4 w-4" />
                <span className="text-sm font-medium">Search</span>
                <kbd className="hidden rounded border border-gray-300 bg-gray-100 px-2 py-0.5 text-xs xl:inline-block">
                  /
                </kbd>
              </button>

              {/* Upgrade CTA */}
              <Link
                href="/dashboard/upgrade"
                className="hidden items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 font-semibold text-white transition-all hover:scale-105 hover:shadow-lg lg:flex"
              >
                <Icon name="Star" className="h-4 w-4" />
                Upgrade
              </Link>

              {/* User Menu */}
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 ring-2 ring-blue-100",
                  },
                }}
              />
            </SignedIn>

            <SignedOut>
              <div className="hidden items-center gap-3 lg:flex">
                <SignInButton mode="modal">
                  <button className="font-medium text-gray-700 transition-colors hover:text-gray-900">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700">
                    Get Started
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-gray-900 lg:hidden"
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
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-200 bg-white pb-4 lg:hidden">
            {/* Mobile Search */}
            <div className="border-b border-gray-100 px-4 py-3">
              <form
                onSubmit={handleSearch}
                className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2"
              >
                <Icon name="Search" className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Intel Library..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-none bg-transparent text-base placeholder-gray-400 outline-none"
                />
              </form>
            </div>

            <nav className="space-y-1 px-4 py-3">
              <SignedIn>
                {/* Dashboard */}
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-colors ${
                    pathname === "/dashboard"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon name="LayoutDashboard" className="h-5 w-5" />
                  Dashboard
                </Link>

                {/* Calculators */}
                <div className="pt-2">
                  <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Calculators
                  </div>
                  <Link
                    href="/dashboard/tools/tsp-modeler"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 transition-colors hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon name="BarChart" className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">TSP Modeler</span>
                  </Link>
                  <Link
                    href="/dashboard/tools/sdp-strategist"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 transition-colors hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon name="PiggyBank" className="h-5 w-5 text-green-600" />
                    <span className="font-medium">SDP Strategist</span>
                  </Link>
                  <Link
                    href="/dashboard/tools/pcs-planner"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 transition-colors hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon name="Truck" className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">PCS Planner</span>
                  </Link>
                  <Link
                    href="/dashboard/tools/house-hacking"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 transition-colors hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon name="Home" className="h-5 w-5 text-indigo-600" />
                    <span className="font-medium">House Hacking</span>
                  </Link>
                </div>

                {/* Content */}
                <div className="pt-2">
                  <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Content
                  </div>
                  <Link
                    href="/dashboard/library"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-colors ${
                      isActivePath("/dashboard/library")
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon name="BookOpen" className="h-5 w-5" />
                    Intel Library
                  </Link>
                  <Link
                    href="/dashboard/listening-post"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-colors ${
                      isActivePath("/dashboard/listening-post")
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon name="Radio" className="h-5 w-5" />
                    Listening Post
                  </Link>
                </div>

                {/* Resources */}
                <div className="pt-2">
                  <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Resources
                  </div>
                  <a
                    href="/pcs-hub"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 transition-colors hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon name="Truck" className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">PCS Hub</span>
                  </a>
                  <a
                    href="/deployment"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 transition-colors hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon name="Shield" className="h-5 w-5 text-red-600" />
                    <span className="font-medium">Deployment Guide</span>
                  </a>
                  <a
                    href="/base-guides"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 transition-colors hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon name="MapPin" className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">Base Guides</span>
                  </a>
                </div>

                {/* Upgrade CTA */}
                <div className="pt-4">
                  <Link
                    href="/dashboard/upgrade"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-semibold text-white transition-all hover:shadow-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon name="Star" className="h-5 w-5" />
                    Upgrade to Premium
                  </Link>
                </div>
              </SignedIn>

              <SignedOut>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon name="Home" className="h-5 w-5" />
                    Home
                  </Link>
                  <div className="my-2 border-t border-gray-100" />
                  <SignInButton mode="modal">
                    <button className="w-full rounded-lg border border-gray-200 py-2.5 text-center font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700">
                      Get Started Free
                    </button>
                  </SignUpButton>
                </div>
              </SignedOut>
            </nav>
          </div>
        )}
      </div>

      {/* Search Modal Overlay */}
      {showSearch && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 pt-20"
          onClick={() => setShowSearch(false)}
        >
          <div
            className="mx-4 w-full max-w-2xl rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearch} className="p-6">
              <div className="mb-4 flex items-center gap-4">
                <Icon name="Search" className="h-6 w-6 text-gray-400" />
                <input
                  id="nav-search"
                  type="text"
                  placeholder="Search 410+ expert content blocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-none bg-transparent text-lg placeholder-gray-400 outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowSearch(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <Icon name="X" className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div>
                  Press{" "}
                  <kbd className="rounded border border-gray-300 bg-gray-100 px-2 py-1 font-mono text-xs">
                    Enter
                  </kbd>{" "}
                  to search
                </div>
                <div>
                  <kbd className="rounded border border-gray-300 bg-gray-100 px-2 py-1 font-mono text-xs">
                    Esc
                  </kbd>{" "}
                  to close
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
