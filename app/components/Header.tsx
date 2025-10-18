'use client';

import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Icon from './ui/Icon';

export default function Header() {
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const pathname = usePathname();

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !showSearch) {
        e.preventDefault();
        setShowSearch(true);
        const searchInput = document.getElementById('nav-search');
        if (searchInput) searchInput.focus();
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSearch]);

  const isActivePath = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/dashboard/library?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };
  
  return (
    <header className="sticky top-0 z-50 bg-surface dark:bg-slate-900 shadow-sm border-b border-subtle dark:border-slate-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary dark:text-white hover:text-info dark:hover:text-info transition-colors flex items-center">
              <Icon name="BarChart" className="h-5 w-5 mr-2" /> 
              <span className="hidden sm:inline">Garrison Ledger</span>
              <span className="sm:hidden">GL</span>
            </Link>
          </div>

          {/* Navigation - Desktop - Enhanced with active states */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link 
              href="/" 
              className={`transition-colors font-medium relative ${
                isActivePath('/') 
                  ? 'text-blue-600 dark:text-blue-400 font-semibold' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Home
              {isActivePath('/') && <div className="absolute -bottom-6 left-0 right-0 h-0.5 bg-info dark:bg-info rounded-full" />}
            </Link>
            <SignedIn>
              {/* Command Center Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => { if (closeTimeout) clearTimeout(closeTimeout); setDashboardOpen(true); }}
                onMouseLeave={() => { const t = setTimeout(() => setDashboardOpen(false), 200); setCloseTimeout(t); }}
              >
                <button className={`transition-colors flex items-center font-medium relative ${
                  isActivePath('/dashboard') 
                    ? 'text-blue-600 dark:text-blue-400 font-semibold' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}>
                  Command Center
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {isActivePath('/dashboard') && <div className="absolute -bottom-6 left-0 right-0 h-0.5 bg-info dark:bg-info rounded-full" />}
                </button>
                {dashboardOpen && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-64 bg-surface rounded-xl shadow-xl border border-subtle py-3 z-50"
                    onMouseEnter={() => { if (closeTimeout) clearTimeout(closeTimeout); setDashboardOpen(true); }}
                    onMouseLeave={() => { const t = setTimeout(() => setDashboardOpen(false), 200); setCloseTimeout(t); }}
                  >
                    <div className="px-4 py-2 text-xs font-semibold text-muted uppercase tracking-wider flex items-center">
                      <Icon name="LayoutDashboard" className="w-3 h-3 mr-1" />
                      Your Command Center
                    </div>
                    <Link href="/dashboard" className={`flex items-center px-4 py-2.5 transition-colors font-medium ${
                      pathname === '/dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}>
                      <Icon name="LayoutDashboard" className="w-4 h-4 mr-3 text-info" />
                      Dashboard Overview
                    </Link>
                    <Link href="/dashboard/plan" className={`flex items-center px-4 py-2.5 transition-colors font-medium ${
                      isActivePath('/dashboard/plan') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}>
                      <Icon name="Sparkles" className="w-4 h-4 mr-3 text-indigo-500" />
                      Your AI Plan
                    </Link>
                    <Link href="/dashboard/assessment" className={`flex items-center px-4 py-2.5 transition-colors font-medium ${
                      isActivePath('/dashboard/assessment') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}>
                      <Icon name="ClipboardCheck" className="w-4 h-4 mr-3 text-green-500" />
                      Military Assessment
                    </Link>
                    <Link href="/dashboard/binder" className={`flex items-center px-4 py-2.5 transition-colors font-medium ${
                      isActivePath('/dashboard/binder') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}>
                      <Icon name="FolderOpen" className="w-4 h-4 mr-3 text-purple-500" />
                      My Binder
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Search Button */}
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className="text-body hover:text-primary transition-colors p-2 rounded-lg hover:bg-surface-hover"
                title="Search (Press /)"
              >
                <Icon name="Search" className="w-5 h-5" />
              </button>

              {/* Tools Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => { if (closeTimeout) clearTimeout(closeTimeout); setToolsOpen(true); }}
                onMouseLeave={() => { const t = setTimeout(() => setToolsOpen(false), 200); setCloseTimeout(t); }}
              >
                <button className={`transition-colors flex items-center font-medium relative ${
                  isActivePath('/dashboard/tools') 
                    ? 'text-blue-600 dark:text-blue-400 font-semibold' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}>
                  Tools
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {isActivePath('/dashboard/tools') && <div className="absolute -bottom-6 left-0 right-0 h-0.5 bg-info rounded-full" />}
                </button>
                {toolsOpen && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-72 bg-surface rounded-xl shadow-xl border border-subtle py-3 z-50"
                    onMouseEnter={() => { if (closeTimeout) clearTimeout(closeTimeout); setToolsOpen(true); }}
                    onMouseLeave={() => { const t = setTimeout(() => setToolsOpen(false), 200); setCloseTimeout(t); }}
                  >
                    <div className="px-4 py-2 text-xs font-semibold text-muted uppercase tracking-wider flex items-center">
                      <Icon name="TrendingUp" className="w-3 h-3 mr-1" />
                      Financial Tools
                    </div>
                    <Link href="/dashboard/tools/tsp-modeler" className="flex items-center px-4 py-2.5 text-body hover:bg-surface-hover transition-colors font-medium">
                      <Icon name="BarChart" className="w-4 h-4 mr-3 text-info" />
                      TSP Modeler
                    </Link>
                    <Link href="/dashboard/tools/sdp-strategist" className="flex items-center px-4 py-2.5 text-body hover:bg-surface-hover transition-colors font-medium">
                      <Icon name="PiggyBank" className="w-4 h-4 mr-3 text-green-500" />
                      SDP Strategist
                    </Link>
                    <Link href="/dashboard/tools/house-hacking" className="flex items-center px-4 py-2.5 text-body hover:bg-surface-hover transition-colors font-medium">
                      <Icon name="Home" className="w-4 h-4 mr-3 text-purple-500" />
                      House Hacking
                    </Link>
                    <div className="border-t border-subtle my-2"></div>
                    <div className="px-4 py-2 text-xs font-semibold text-muted uppercase tracking-wider flex items-center">
                      <Icon name="MapPin" className="w-3 h-3 mr-1" />
                      Planning Tools
                    </div>
                    <Link href="/dashboard/tools/pcs-planner" className="flex items-center px-4 py-2.5 text-body hover:bg-surface-hover transition-colors font-medium">
                      <Icon name="Truck" className="w-4 h-4 mr-3 text-indigo-500" />
                      PCS Financial Planner
                    </Link>
                    <Link href="/dashboard/tools/on-base-savings" className="flex items-center px-4 py-2.5 text-body hover:bg-surface-hover transition-colors font-medium">
                      <Icon name="ShoppingCart" className="w-4 h-4 mr-3 text-orange-500" />
                      Annual Savings Center
                    </Link>
                    <Link href="/dashboard/tools/salary-calculator" className="flex items-center px-4 py-2.5 text-body hover:bg-surface-hover transition-colors font-medium">
                      <Icon name="Briefcase" className="w-4 h-4 mr-3 text-emerald-500" />
                      Career Opportunity Analyzer
                    </Link>
                  </div>
                )}
              </div>

              {/* Resources Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => { if (closeTimeout) clearTimeout(closeTimeout); setResourcesOpen(true); }}
                onMouseLeave={() => { const t = setTimeout(() => setResourcesOpen(false), 200); setCloseTimeout(t); }}
              >
                <button className={`transition-colors flex items-center font-medium relative ${
                  isActivePath('/pcs-hub') || isActivePath('/career-hub') || isActivePath('/deployment') || isActivePath('/on-base-shopping') || isActivePath('/base-guides')
                    ? 'text-blue-600 font-semibold' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}>
                  Resources
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {(isActivePath('/pcs-hub') || isActivePath('/career-hub') || isActivePath('/deployment') || isActivePath('/on-base-shopping') || isActivePath('/base-guides')) && 
                    <div className="absolute -bottom-6 left-0 right-0 h-0.5 bg-info rounded-full" />}
                </button>
                {resourcesOpen && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-64 bg-surface rounded-xl shadow-xl border border-subtle py-3 z-50"
                    onMouseEnter={() => { if (closeTimeout) clearTimeout(closeTimeout); setResourcesOpen(true); }}
                    onMouseLeave={() => { const t = setTimeout(() => setResourcesOpen(false), 200); setCloseTimeout(t); }}
                  >
                    <div className="px-4 py-2 text-xs font-semibold text-muted uppercase tracking-wider flex items-center">
                      <Icon name="BookOpen" className="w-3 h-3 mr-1" />
                      Resource Hubs
                    </div>
                    <a href="/pcs-hub" className="flex items-center px-4 py-2.5 text-body hover:bg-surface-hover transition-colors font-medium">
                      <Icon name="Truck" className="w-4 h-4 mr-3 text-info" />
                      PCS Hub
                    </a>
                    <a href="/career-hub" className="flex items-center px-4 py-2.5 text-body hover:bg-surface-hover transition-colors font-medium">
                      <Icon name="Briefcase" className="w-4 h-4 mr-3 text-green-500" />
                      Career Hub
                    </a>
                    <a href="/deployment" className="flex items-center px-4 py-2.5 text-body hover:bg-surface-hover transition-colors font-medium">
                      <Icon name="Shield" className="w-4 h-4 mr-3 text-red-500" />
                      Deployment Guide
                    </a>
                    <a href="/on-base-shopping" className="flex items-center px-4 py-2.5 text-body hover:bg-surface-hover transition-colors font-medium">
                      <Icon name="ShoppingCart" className="w-4 h-4 mr-3 text-orange-500" />
                      On-Base Shopping
                    </a>
                    <a href="/base-guides" className="flex items-center px-4 py-2.5 text-body hover:bg-surface-hover transition-colors font-medium">
                      <Icon name="MapPin" className="w-4 h-4 mr-3 text-purple-500" />
                      Base Guides
                    </a>
                  </div>
                )}
              </div>

              <Link 
                href="/dashboard/library" 
                className={`transition-colors font-medium relative ${
                  isActivePath('/dashboard/library') 
                    ? 'text-blue-600 dark:text-blue-400 font-semibold' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Intel Library
                {isActivePath('/dashboard/library') && <div className="absolute -bottom-6 left-0 right-0 h-0.5 bg-info dark:bg-info rounded-full" />}
              </Link>
              <Link 
                href="/dashboard/listening-post" 
                className={`transition-colors font-medium relative ${
                  isActivePath('/dashboard/listening-post') 
                    ? 'text-blue-600 dark:text-blue-400 font-semibold' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Listening Post
                {isActivePath('/dashboard/listening-post') && <div className="absolute -bottom-6 left-0 right-0 h-0.5 bg-info dark:bg-info rounded-full" />}
              </Link>
              <Link 
                href="/dashboard/referrals" 
                className={`transition-colors font-medium relative ${
                  isActivePath('/dashboard/referrals') 
                    ? 'text-blue-600 dark:text-blue-400 font-semibold' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Referrals
                {isActivePath('/dashboard/referrals') && <div className="absolute -bottom-6 left-0 right-0 h-0.5 bg-info dark:bg-info rounded-full" />}
              </Link>
              <Link 
                href="/dashboard/directory" 
                className={`transition-colors font-medium relative ${
                  isActivePath('/dashboard/directory') 
                    ? 'text-blue-600 dark:text-blue-400 font-semibold' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Directory
                {isActivePath('/dashboard/directory') && <div className="absolute -bottom-6 left-0 right-0 h-0.5 bg-info dark:bg-info rounded-full" />}
              </Link>
              <Link 
                href="/dashboard/referrals" 
                className={`transition-colors font-medium relative ${
                  isActivePath('/dashboard/referrals') 
                    ? 'text-blue-600 font-semibold' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Refer & Earn
                {isActivePath('/dashboard/referrals') && <div className="absolute -bottom-6 left-0 right-0 h-0.5 bg-info rounded-full" />}
              </Link>
              <Link 
                href="/dashboard/upgrade" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold transition-all hover:shadow-lg hover:scale-105"
              >
                Upgrade
              </Link>
            </SignedIn>
          </nav>

          {/* Search Overlay */}
          {showSearch && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
              <div className="bg-surface rounded-xl shadow-2xl w-full max-w-2xl mx-4">
                <form onSubmit={handleSearch} className="p-6">
                  <div className="flex items-center gap-4">
                    <Icon name="Search" className="w-6 h-6 text-muted" />
                    <input
                      id="nav-search"
                      type="text"
                      placeholder="Search Intel Library... (Press / to focus)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 text-lg border-none outline-none bg-transparent"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowSearch(false)}
                      className="text-muted hover:text-body p-2"
                    >
                      <Icon name="X" className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mt-4 text-sm text-muted">
                    Press <kbd className="px-2 py-1 bg-surface-hover rounded text-xs">Enter</kbd> to search or <kbd className="px-2 py-1 bg-surface-hover rounded text-xs">Esc</kbd> to close
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Mobile menu button - Improved touch target */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-body hover:text-primary p-3 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Authentication Buttons - Desktop Only */}
          <div className="hidden lg:flex items-center space-x-4">
            <SignedOut>
              <div className="flex items-center space-x-2">
                <SignInButton mode="modal">
                  <button className="text-body hover:text-primary transition-colors font-medium">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-info hover:bg-info text-white px-4 py-2 rounded-md font-medium transition-colors">
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
                      avatarBox: "w-8 h-8"
                    }
                  }}
                />
              </div>
            </SignedIn>
          </div>
        </div>

        {/* Enhanced Mobile Menu - Improved mobile UX */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-subtle dark:border-slate-700 bg-surface dark:bg-slate-900 max-h-[80vh] overflow-y-auto">
            <nav className="flex flex-col">
              {/* Search in Mobile - Improved touch target */}
              <div className="px-4 py-4 border-b border-subtle">
                <form onSubmit={handleSearch} className="flex items-center gap-3">
                  <Icon name="Search" className="w-5 h-5 text-muted flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search Intel Library..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 text-base border-none outline-none bg-transparent min-h-[44px]"
                  />
                </form>
              </div>

              {/* Main Navigation - Improved touch targets */}
              <div className="px-4 py-3 space-y-2">
                <Link 
                  href="/" 
                  className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors min-h-[44px] ${
                    isActivePath('/') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon name="Home" className="w-5 h-5 mr-3 flex-shrink-0" />
                  Home
                </Link>
                <SignedIn>
                  {/* Command Center Section */}
                  <div className="px-3 py-2">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 flex items-center">
                      <Icon name="LayoutDashboard" className="w-3 h-3 mr-1" />
                      Command Center
                    </p>
                    <div className="space-y-1">
                      <Link 
                        href="/dashboard" 
                        className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors min-h-[44px] ${
                          pathname === '/dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon name="LayoutDashboard" className="w-4 h-4 mr-3 text-info flex-shrink-0" />
                        Dashboard Overview
                      </Link>
                      <Link 
                        href="/dashboard/plan" 
                        className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors min-h-[44px] ${
                          isActivePath('/dashboard/plan') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon name="Sparkles" className="w-4 h-4 mr-3 text-indigo-500 flex-shrink-0" />
                        Your AI Plan
                      </Link>
                      <Link 
                        href="/dashboard/assessment" 
                        className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors min-h-[44px] ${
                          isActivePath('/dashboard/assessment') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon name="ClipboardCheck" className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" />
                        Military Assessment
                      </Link>
                      <Link 
                        href="/dashboard/binder" 
                        className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors min-h-[44px] ${
                          isActivePath('/dashboard/binder') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon name="FolderOpen" className="w-4 h-4 mr-3 text-purple-500 flex-shrink-0" />
                        My Binder
                      </Link>
                    </div>
                  </div>
                  {/* Tools Section */}
                  <div className="px-3 py-2">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 flex items-center">
                      <Icon name="TrendingUp" className="w-3 h-3 mr-1" />
                      Financial Tools
                    </p>
                    <div className="space-y-1">
                      <Link href="/dashboard/tools/tsp-modeler" className="flex items-center px-3 py-2 rounded-lg text-body hover:bg-surface-hover transition-colors" onClick={() => setMobileMenuOpen(false)}>
                        <Icon name="BarChart" className="w-4 h-4 mr-3 text-info" />
                        TSP Modeler
                      </Link>
                      <Link href="/dashboard/tools/sdp-strategist" className="flex items-center px-3 py-2 rounded-lg text-body hover:bg-surface-hover transition-colors" onClick={() => setMobileMenuOpen(false)}>
                        <Icon name="PiggyBank" className="w-4 h-4 mr-3 text-green-500" />
                        SDP Strategist
                      </Link>
                      <Link href="/dashboard/tools/house-hacking" className="flex items-center px-3 py-2 rounded-lg text-body hover:bg-surface-hover transition-colors" onClick={() => setMobileMenuOpen(false)}>
                        <Icon name="Home" className="w-4 h-4 mr-3 text-purple-500" />
                        House Hacking
                      </Link>
                    </div>
                  </div>

                  <div className="px-3 py-2">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 flex items-center">
                      <Icon name="MapPin" className="w-3 h-3 mr-1" />
                      Planning Tools
                    </p>
                    <div className="space-y-1">
                      <Link href="/dashboard/tools/pcs-planner" className="flex items-center px-3 py-2 rounded-lg text-body hover:bg-surface-hover transition-colors" onClick={() => setMobileMenuOpen(false)}>
                        <Icon name="Truck" className="w-4 h-4 mr-3 text-indigo-500" />
                        PCS Financial Planner
                      </Link>
                      <Link href="/dashboard/tools/on-base-savings" className="flex items-center px-3 py-2 rounded-lg text-body hover:bg-surface-hover transition-colors" onClick={() => setMobileMenuOpen(false)}>
                        <Icon name="ShoppingCart" className="w-4 h-4 mr-3 text-orange-500" />
                        Annual Savings Center
                      </Link>
                      <Link href="/dashboard/tools/salary-calculator" className="flex items-center px-3 py-2 rounded-lg text-body hover:bg-surface-hover transition-colors" onClick={() => setMobileMenuOpen(false)}>
                        <Icon name="Briefcase" className="w-4 h-4 mr-3 text-emerald-500" />
                        Career Opportunity Analyzer
                      </Link>
                    </div>
                  </div>

                  {/* Resources Section */}
                  <div className="px-3 py-2">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 flex items-center">
                      <Icon name="BookOpen" className="w-3 h-3 mr-1" />
                      Resource Hubs
                    </p>
                    <div className="space-y-1">
                      <a href="/pcs-hub" className="flex items-center px-3 py-2 rounded-lg text-body hover:bg-surface-hover transition-colors">
                        <Icon name="Truck" className="w-4 h-4 mr-3 text-info" />
                        PCS Hub
                      </a>
                      <a href="/career-hub" className="flex items-center px-3 py-2 rounded-lg text-body hover:bg-surface-hover transition-colors">
                        <Icon name="Briefcase" className="w-4 h-4 mr-3 text-green-500" />
                        Career Hub
                      </a>
                      <a href="/deployment" className="flex items-center px-3 py-2 rounded-lg text-body hover:bg-surface-hover transition-colors">
                        <Icon name="Shield" className="w-4 h-4 mr-3 text-red-500" />
                        Deployment Guide
                      </a>
                      <a href="/on-base-shopping" className="flex items-center px-3 py-2 rounded-lg text-body hover:bg-surface-hover transition-colors">
                        <Icon name="ShoppingCart" className="w-4 h-4 mr-3 text-orange-500" />
                        On-Base Shopping
                      </a>
                      <a href="/base-guides" className="flex items-center px-3 py-2 rounded-lg text-body hover:bg-surface-hover transition-colors">
                        <Icon name="MapPin" className="w-4 h-4 mr-3 text-purple-500" />
                        Base Guides
                      </a>
                    </div>
                  </div>

                  {/* Additional Links */}
                  <Link 
                    href="/dashboard/library" 
                    className={`flex items-center px-3 py-2 rounded-lg font-medium transition-colors ${
                      isActivePath('/dashboard/library') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon name="Library" className="w-5 h-5 mr-3" />
                    Intel Library
                  </Link>
                  <Link 
                    href="/dashboard/listening-post" 
                    className={`flex items-center px-3 py-2 rounded-lg font-medium transition-colors ${
                      isActivePath('/dashboard/listening-post') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon name="Radio" className="w-5 h-5 mr-3" />
                    Listening Post
                  </Link>
                  <Link 
                    href="/dashboard/directory" 
                    className={`flex items-center px-3 py-2 rounded-lg font-medium transition-colors ${
                      isActivePath('/dashboard/directory') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon name="Users" className="w-5 h-5 mr-3" />
                    Directory
                  </Link>
                  <Link 
                    href="/dashboard/referrals" 
                    className={`flex items-center px-3 py-2 rounded-lg font-medium transition-colors ${
                      isActivePath('/dashboard/referrals') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon name="Gift" className="w-5 h-5 mr-3" />
                    Refer & Earn
                  </Link>
                  
                  {/* Upgrade Button */}
                  <div className="px-3 py-2">
                    <Link 
                      href="/dashboard/upgrade" 
                      className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg font-semibold transition-all hover:shadow-lg text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Upgrade to Premium
                    </Link>
                  </div>
                </SignedIn>
              </div>
              
              {/* Mobile Auth Buttons */}
              <div className="px-2 py-2 border-t border-subtle mt-2 pt-4">
                <SignedOut>
                  <div className="flex flex-col space-y-2">
                    <SignInButton mode="modal">
                      <button className="w-full text-center text-body hover:text-primary transition-colors font-medium py-2 border border-default rounded-lg">
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="w-full bg-info hover:bg-info text-white py-2 rounded-lg font-medium transition-colors">
                        Sign Up
                      </button>
                    </SignUpButton>
                  </div>
                </SignedOut>
                
                <SignedIn>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-body">Your Account</span>
                    <UserButton 
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "w-8 h-8"
                        }
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
