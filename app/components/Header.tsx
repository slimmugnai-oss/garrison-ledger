'use client';

import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Icon from './ui/Icon';

export default function Header() {
  const [dashboardOpen, setDashboardOpen] = useState(false);
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
              <Icon name="Shield" className="h-6 w-6 mr-2" /> 
              <span className="hidden sm:inline">Garrison Ledger</span>
              <span className="sm:hidden">GL</span>
            </Link>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-lg transition-colors font-medium ${
                pathname === '/' 
                  ? 'bg-blue-50 text-blue-600 font-semibold' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              Home
            </Link>

            <SignedIn>
              {/* Dashboard Mega Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => { if (closeTimeout) clearTimeout(closeTimeout); setDashboardOpen(true); }}
                onMouseLeave={() => { const t = setTimeout(() => setDashboardOpen(false), 200); setCloseTimeout(t); }}
              >
                <button className={`px-3 py-2 rounded-lg transition-colors flex items-center font-medium ${
                  isActivePath('/dashboard') 
                    ? 'bg-blue-50 text-blue-600 font-semibold' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}>
                  Dashboard
                  <Icon name="ChevronDown" className="w-4 h-4 ml-1" />
                </button>
                {dashboardOpen && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-[720px] bg-surface rounded-xl shadow-2xl border border-subtle py-4 z-50"
                    onMouseEnter={() => { if (closeTimeout) clearTimeout(closeTimeout); setDashboardOpen(true); }}
                    onMouseLeave={() => { const t = setTimeout(() => setDashboardOpen(false), 200); setCloseTimeout(t); }}
                  >
                    <div className="grid grid-cols-3 gap-6 px-6">
                      {/* Command Center Column */}
                      <div>
                        <div className="px-2 py-2 text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center mb-3">
                          <Icon name="LayoutDashboard" className="w-3.5 h-3.5 mr-1.5" />
                          Command Center
                        </div>
                        <div className="space-y-1">
                          <Link href="/dashboard" className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                            pathname === '/dashboard' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                          }`}>
                            <Icon name="Monitor" className="w-4 h-4 mr-3 text-blue-500 flex-shrink-0" />
                            <span className="text-sm">Overview</span>
                          </Link>
                          <Link href="/dashboard/plan" className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                            isActivePath('/dashboard/plan') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                          }`}>
                            <Icon name="Sparkles" className="w-4 h-4 mr-3 text-indigo-500 flex-shrink-0" />
                            <span className="text-sm">AI Plan</span>
                          </Link>
                          <Link href="/dashboard/assessment" className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                            isActivePath('/dashboard/assessment') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                          }`}>
                            <Icon name="ClipboardCheck" className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" />
                            <span className="text-sm">Assessment</span>
                          </Link>
                          <Link href="/dashboard/binder" className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                            isActivePath('/dashboard/binder') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                          }`}>
                            <Icon name="FolderOpen" className="w-4 h-4 mr-3 text-purple-500 flex-shrink-0" />
                            <span className="text-sm">Binder</span>
                          </Link>
                        </div>
                      </div>

                      {/* Tools Column */}
                      <div>
                        <div className="px-2 py-2 text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center mb-3">
                          <Icon name="Calculator" className="w-3.5 h-3.5 mr-1.5" />
                          Financial Tools
                        </div>
                        <div className="space-y-1">
                          <Link href="/dashboard/tools/tsp-modeler" className="flex items-center px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                            <Icon name="TrendingUp" className="w-4 h-4 mr-3 text-blue-500 flex-shrink-0" />
                            <span className="text-sm">TSP Modeler</span>
                          </Link>
                          <Link href="/dashboard/tools/sdp-strategist" className="flex items-center px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                            <Icon name="PiggyBank" className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" />
                            <span className="text-sm">SDP Strategist</span>
                          </Link>
                          <Link href="/dashboard/tools/house-hacking" className="flex items-center px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                            <Icon name="Home" className="w-4 h-4 mr-3 text-purple-500 flex-shrink-0" />
                            <span className="text-sm">House Hacking</span>
                          </Link>
                          <Link href="/dashboard/tools/pcs-planner" className="flex items-center px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                            <Icon name="Truck" className="w-4 h-4 mr-3 text-indigo-500 flex-shrink-0" />
                            <span className="text-sm">PCS Planner</span>
                          </Link>
                          <Link href="/dashboard/tools/on-base-savings" className="flex items-center px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                            <Icon name="ShoppingCart" className="w-4 h-4 mr-3 text-orange-500 flex-shrink-0" />
                            <span className="text-sm">Savings Center</span>
                          </Link>
                          <Link href="/dashboard/tools/salary-calculator" className="flex items-center px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                            <Icon name="Briefcase" className="w-4 h-4 mr-3 text-emerald-500 flex-shrink-0" />
                            <span className="text-sm">Career Analyzer</span>
                          </Link>
                        </div>
                      </div>

                      {/* Content & Community Column */}
                      <div>
                        <div className="px-2 py-2 text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center mb-3">
                          <Icon name="BookOpen" className="w-3.5 h-3.5 mr-1.5" />
                          Content & Community
                        </div>
                        <div className="space-y-1">
                          <Link href="/dashboard/library" className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                            isActivePath('/dashboard/library') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                          }`}>
                            <Icon name="Library" className="w-4 h-4 mr-3 text-blue-500 flex-shrink-0" />
                            <span className="text-sm">Intel Library</span>
                          </Link>
                          <Link href="/dashboard/listening-post" className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                            isActivePath('/dashboard/listening-post') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                          }`}>
                            <Icon name="Radio" className="w-4 h-4 mr-3 text-purple-500 flex-shrink-0" />
                            <span className="text-sm">Listening Post</span>
                          </Link>
                          <Link href="/dashboard/directory" className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                            isActivePath('/dashboard/directory') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                          }`}>
                            <Icon name="Users" className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" />
                            <span className="text-sm">Directory</span>
                          </Link>
                          <Link href="/dashboard/referrals" className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                            isActivePath('/dashboard/referrals') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                          }`}>
                            <Icon name="Gift" className="w-4 h-4 mr-3 text-orange-500 flex-shrink-0" />
                            <span className="text-sm">Refer & Earn</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Search Button */}
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                title="Search Library (Press /)"
              >
                <Icon name="Search" className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium hidden xl:inline">Search</span>
              </button>
            </SignedIn>

            {/* Resources Dropdown - Public */}
            <div 
              className="relative"
              onMouseEnter={() => { if (closeTimeout) clearTimeout(closeTimeout); setResourcesOpen(true); }}
              onMouseLeave={() => { const t = setTimeout(() => setResourcesOpen(false), 200); setCloseTimeout(t); }}
            >
              <button className={`px-3 py-2 rounded-lg transition-colors flex items-center font-medium ${
                isActivePath('/pcs-hub') || isActivePath('/career-hub') || isActivePath('/deployment') || isActivePath('/on-base-shopping') || isActivePath('/base-guides')
                  ? 'bg-blue-50 text-blue-600 font-semibold' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}>
                Resources
                <Icon name="ChevronDown" className="w-4 h-4 ml-1" />
              </button>
              {resourcesOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 w-64 bg-surface rounded-xl shadow-xl border border-subtle py-3 z-50"
                  onMouseEnter={() => { if (closeTimeout) clearTimeout(closeTimeout); setResourcesOpen(true); }}
                  onMouseLeave={() => { const t = setTimeout(() => setResourcesOpen(false), 200); setCloseTimeout(t); }}
                >
                  <div className="px-4 py-2 text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                    <Icon name="BookOpen" className="w-3 h-3 mr-1.5" />
                    Military Life Guides
                  </div>
                  <a href="/pcs-hub" className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors">
                    <Icon name="Truck" className="w-4 h-4 mr-3 text-blue-500 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium">PCS Hub</div>
                      <div className="text-xs text-gray-500">Moving & relocation</div>
                    </div>
                  </a>
                  <a href="/career-hub" className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors">
                    <Icon name="Briefcase" className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium">Career Hub</div>
                      <div className="text-xs text-gray-500">Transition planning</div>
                    </div>
                  </a>
                  <a href="/deployment" className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors">
                    <Icon name="Shield" className="w-4 h-4 mr-3 text-red-500 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium">Deployment</div>
                      <div className="text-xs text-gray-500">Pre/post deployment</div>
                    </div>
                  </a>
                  <a href="/on-base-shopping" className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors">
                    <Icon name="ShoppingCart" className="w-4 h-4 mr-3 text-orange-500 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium">Shopping</div>
                      <div className="text-xs text-gray-500">Commissary & BX</div>
                    </div>
                  </a>
                  <a href="/base-guides" className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors">
                    <Icon name="MapPin" className="w-4 h-4 mr-3 text-purple-500 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium">Base Guides</div>
                      <div className="text-xs text-gray-500">Installation info</div>
                    </div>
                  </a>
                </div>
              )}
            </div>

            <SignedIn>
              {/* Upgrade CTA */}
              <Link 
                href="/dashboard/upgrade" 
                className="ml-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold transition-all hover:shadow-lg hover:scale-105"
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
                    <Icon name="Search" className="w-6 h-6 text-muted flex-shrink-0" />
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

          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-body hover:text-primary p-3 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Toggle menu"
          >
            <Icon name={mobileMenuOpen ? "X" : "Menu"} className="w-6 h-6" />
          </button>

          {/* Authentication Buttons - Desktop */}
          <div className="hidden lg:flex items-center space-x-3">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-gray-700 hover:text-gray-900 transition-colors font-medium px-3 py-2">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Sign Up Free
                </button>
              </SignUpButton>
            </SignedOut>
            
            <SignedIn>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9"
                  }
                }}
              />
            </SignedIn>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-subtle bg-surface max-h-[80vh] overflow-y-auto">
            <nav className="py-4">
              {/* Search in Mobile */}
              <div className="px-4 pb-4 border-b border-subtle">
                <form onSubmit={handleSearch} className="flex items-center gap-3">
                  <Icon name="Search" className="w-5 h-5 text-muted flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search Library..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 text-base border-none outline-none bg-transparent min-h-[44px]"
                  />
                </form>
              </div>

              {/* Home */}
              <div className="px-4 py-2">
                <Link 
                  href="/" 
                  className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors min-h-[44px] ${
                    pathname === '/' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon name="Home" className="w-5 h-5 mr-3 flex-shrink-0" />
                  Home
                </Link>
              </div>

              <SignedIn>
                {/* Command Center */}
                <div className="px-4 py-3 border-t border-subtle">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 px-2 flex items-center">
                    <Icon name="LayoutDashboard" className="w-3.5 h-3.5 mr-1.5" />
                    Command Center
                  </div>
                  <div className="space-y-1">
                    <Link href="/dashboard" className={`flex items-center px-4 py-3 rounded-lg transition-colors min-h-[44px] ${
                      pathname === '/dashboard' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                    }`} onClick={() => setMobileMenuOpen(false)}>
                      <Icon name="Monitor" className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" />
                      Dashboard
                    </Link>
                    <Link href="/dashboard/plan" className={`flex items-center px-4 py-3 rounded-lg transition-colors min-h-[44px] ${
                      isActivePath('/dashboard/plan') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                    }`} onClick={() => setMobileMenuOpen(false)}>
                      <Icon name="Sparkles" className="w-5 h-5 mr-3 text-indigo-500 flex-shrink-0" />
                      AI Plan
                    </Link>
                    <Link href="/dashboard/assessment" className={`flex items-center px-4 py-3 rounded-lg transition-colors min-h-[44px] ${
                      isActivePath('/dashboard/assessment') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                    }`} onClick={() => setMobileMenuOpen(false)}>
                      <Icon name="ClipboardCheck" className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                      Assessment
                    </Link>
                    <Link href="/dashboard/binder" className={`flex items-center px-4 py-3 rounded-lg transition-colors min-h-[44px] ${
                      isActivePath('/dashboard/binder') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                    }`} onClick={() => setMobileMenuOpen(false)}>
                      <Icon name="FolderOpen" className="w-5 h-5 mr-3 text-purple-500 flex-shrink-0" />
                      Binder
                    </Link>
                  </div>
                </div>

                {/* Tools */}
                <div className="px-4 py-3 border-t border-subtle">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 px-2 flex items-center">
                    <Icon name="Calculator" className="w-3.5 h-3.5 mr-1.5" />
                    Financial Tools
                  </div>
                  <div className="space-y-1">
                    <Link href="/dashboard/tools/tsp-modeler" className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]" onClick={() => setMobileMenuOpen(false)}>
                      <Icon name="TrendingUp" className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" />
                      TSP Modeler
                    </Link>
                    <Link href="/dashboard/tools/sdp-strategist" className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]" onClick={() => setMobileMenuOpen(false)}>
                      <Icon name="PiggyBank" className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                      SDP Strategist
                    </Link>
                    <Link href="/dashboard/tools/house-hacking" className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]" onClick={() => setMobileMenuOpen(false)}>
                      <Icon name="Home" className="w-5 h-5 mr-3 text-purple-500 flex-shrink-0" />
                      House Hacking
                    </Link>
                    <Link href="/dashboard/tools/pcs-planner" className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]" onClick={() => setMobileMenuOpen(false)}>
                      <Icon name="Truck" className="w-5 h-5 mr-3 text-indigo-500 flex-shrink-0" />
                      PCS Planner
                    </Link>
                    <Link href="/dashboard/tools/on-base-savings" className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]" onClick={() => setMobileMenuOpen(false)}>
                      <Icon name="ShoppingCart" className="w-5 h-5 mr-3 text-orange-500 flex-shrink-0" />
                      Savings Center
                    </Link>
                    <Link href="/dashboard/tools/salary-calculator" className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]" onClick={() => setMobileMenuOpen(false)}>
                      <Icon name="Briefcase" className="w-5 h-5 mr-3 text-emerald-500 flex-shrink-0" />
                      Career Analyzer
                    </Link>
                  </div>
                </div>

                {/* Content & Community */}
                <div className="px-4 py-3 border-t border-subtle">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 px-2 flex items-center">
                    <Icon name="BookOpen" className="w-3.5 h-3.5 mr-1.5" />
                    Content & Community
                  </div>
                  <div className="space-y-1">
                    <Link href="/dashboard/library" className={`flex items-center px-4 py-3 rounded-lg transition-colors min-h-[44px] ${
                      isActivePath('/dashboard/library') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                    }`} onClick={() => setMobileMenuOpen(false)}>
                      <Icon name="Library" className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" />
                      Intel Library
                    </Link>
                    <Link href="/dashboard/listening-post" className={`flex items-center px-4 py-3 rounded-lg transition-colors min-h-[44px] ${
                      isActivePath('/dashboard/listening-post') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                    }`} onClick={() => setMobileMenuOpen(false)}>
                      <Icon name="Radio" className="w-5 h-5 mr-3 text-purple-500 flex-shrink-0" />
                      Listening Post
                    </Link>
                    <Link href="/dashboard/directory" className={`flex items-center px-4 py-3 rounded-lg transition-colors min-h-[44px] ${
                      isActivePath('/dashboard/directory') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                    }`} onClick={() => setMobileMenuOpen(false)}>
                      <Icon name="Users" className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                      Directory
                    </Link>
                    <Link href="/dashboard/referrals" className={`flex items-center px-4 py-3 rounded-lg transition-colors min-h-[44px] ${
                      isActivePath('/dashboard/referrals') ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                    }`} onClick={() => setMobileMenuOpen(false)}>
                      <Icon name="Gift" className="w-5 h-5 mr-3 text-orange-500 flex-shrink-0" />
                      Refer & Earn
                    </Link>
                  </div>
                </div>
              </SignedIn>

              {/* Resources - Public */}
              <div className="px-4 py-3 border-t border-subtle">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 px-2 flex items-center">
                  <Icon name="BookOpen" className="w-3.5 h-3.5 mr-1.5" />
                  Military Life Guides
                </div>
                <div className="space-y-1">
                  <a href="/pcs-hub" className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]">
                    <Icon name="Truck" className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" />
                    PCS Hub
                  </a>
                  <a href="/career-hub" className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]">
                    <Icon name="Briefcase" className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                    Career Hub
                  </a>
                  <a href="/deployment" className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]">
                    <Icon name="Shield" className="w-5 h-5 mr-3 text-red-500 flex-shrink-0" />
                    Deployment
                  </a>
                  <a href="/on-base-shopping" className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]">
                    <Icon name="ShoppingCart" className="w-5 h-5 mr-3 text-orange-500 flex-shrink-0" />
                    Shopping
                  </a>
                  <a href="/base-guides" className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]">
                    <Icon name="MapPin" className="w-5 h-5 mr-3 text-purple-500 flex-shrink-0" />
                    Base Guides
                  </a>
                </div>
              </div>

              <SignedIn>
                {/* Upgrade Button */}
                <div className="px-4 py-3 border-t border-subtle">
                  <Link 
                    href="/dashboard/upgrade" 
                    className="flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg font-semibold text-center transition-all hover:shadow-lg min-h-[44px]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Upgrade to Premium
                  </Link>
                </div>
              </SignedIn>
              
              {/* Mobile Auth */}
              <div className="px-4 py-3 border-t border-subtle">
                <SignedOut>
                  <div className="space-y-2">
                    <SignInButton mode="modal">
                      <button className="w-full text-center text-gray-700 hover:text-gray-900 transition-colors font-medium py-3 border border-gray-300 rounded-lg min-h-[44px]">
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors min-h-[44px]">
                        Sign Up Free
                      </button>
                    </SignUpButton>
                  </div>
                </SignedOut>
                
                <SignedIn>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Your Account</span>
                    <UserButton 
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "w-9 h-9"
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
