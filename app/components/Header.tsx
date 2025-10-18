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
        setDashboardOpen(false);
        setResourcesOpen(false);
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
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand - Enhanced */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center gap-3 transition-all">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-700 to-slate-900 rounded-lg blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-slate-700 to-slate-900 p-2 rounded-lg">
                  <Icon name="Shield" className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <div className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  <span className="hidden sm:inline">Garrison Ledger</span>
                  <span className="sm:hidden">GL</span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium hidden md:block">
                  Military Financial Intelligence
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center space-x-2">
            <Link 
              href="/" 
              className={`px-4 py-2 rounded-lg transition-all font-semibold relative group ${
                pathname === '/' 
                  ? 'text-slate-900 dark:text-white' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Home
              {pathname === '/' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-700 to-slate-900 rounded-full" />
              )}
            </Link>

            <SignedIn>
              {/* Dashboard Mega Dropdown - WORLD CLASS */}
              <div 
                className="relative"
                onMouseEnter={() => { if (closeTimeout) clearTimeout(closeTimeout); setDashboardOpen(true); }}
                onMouseLeave={() => { const t = setTimeout(() => setDashboardOpen(false), 150); setCloseTimeout(t); }}
              >
                <button className={`px-4 py-2 rounded-lg transition-all flex items-center font-semibold relative group ${
                  isActivePath('/dashboard') 
                    ? 'text-slate-900 dark:text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                }`}>
                  Command Center
                  <Icon name="ChevronDown" className={`w-4 h-4 ml-1 transition-transform ${dashboardOpen ? 'rotate-180' : ''}`} />
                  {isActivePath('/dashboard') && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-700 to-slate-900 rounded-full" />
                  )}
                </button>
                {dashboardOpen && (
                  <div 
                    className="absolute top-full left-0 mt-3 w-[800px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                    onMouseEnter={() => { if (closeTimeout) clearTimeout(closeTimeout); setDashboardOpen(true); }}
                    onMouseLeave={() => { const t = setTimeout(() => setDashboardOpen(false), 150); setCloseTimeout(t); }}
                  >
                    {/* Dropdown Header */}
                    <div className="bg-gradient-to-r from-slate-700 to-slate-900 px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Icon name="LayoutDashboard" className="w-5 h-5 text-white" />
                        <div>
                          <h3 className="text-white font-bold text-lg">Your Command Center</h3>
                          <p className="text-slate-300 text-xs">AI-powered financial intelligence platform</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-0 p-6">
                      {/* Column 1: Core Features */}
                      <div className="pr-6 border-r border-gray-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-1.5 bg-blue-50 rounded-lg">
                            <Icon name="Monitor" className="w-4 h-4 text-blue-600" />
                          </div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">Core</h4>
                        </div>
                        <div className="space-y-1">
                          <Link href="/dashboard" className={`group flex items-start gap-3 px-3 py-3 rounded-lg transition-all ${
                            pathname === '/dashboard' ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                          }`}>
                            <Icon name="LayoutDashboard" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className={`font-semibold text-sm ${pathname === '/dashboard' ? 'text-blue-600' : 'text-slate-900 dark:text-white group-hover:text-blue-600'}`}>
                                Dashboard
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                Your mission overview
                              </div>
                            </div>
                          </Link>
                          <Link href="/dashboard/plan" className={`group flex items-start gap-3 px-3 py-3 rounded-lg transition-all ${
                            isActivePath('/dashboard/plan') ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                          }`}>
                            <Icon name="Sparkles" className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className={`font-semibold text-sm ${isActivePath('/dashboard/plan') ? 'text-blue-600' : 'text-slate-900 dark:text-white group-hover:text-indigo-600'}`}>
                                AI Plan
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                Personalized strategy
                              </div>
                            </div>
                          </Link>
                          <Link href="/dashboard/assessment" className={`group flex items-start gap-3 px-3 py-3 rounded-lg transition-all ${
                            isActivePath('/dashboard/assessment') ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                          }`}>
                            <Icon name="ClipboardCheck" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className={`font-semibold text-sm ${isActivePath('/dashboard/assessment') ? 'text-blue-600' : 'text-slate-900 dark:text-white group-hover:text-green-600'}`}>
                                Assessment
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                Financial intelligence
                              </div>
                            </div>
                          </Link>
                          <Link href="/dashboard/binder" className={`group flex items-start gap-3 px-3 py-3 rounded-lg transition-all ${
                            isActivePath('/dashboard/binder') ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                          }`}>
                            <Icon name="FolderOpen" className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className={`font-semibold text-sm ${isActivePath('/dashboard/binder') ? 'text-blue-600' : 'text-slate-900 dark:text-white group-hover:text-purple-600'}`}>
                                Binder
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                Secure documents
                              </div>
                            </div>
                          </Link>
                        </div>
                      </div>

                      {/* Column 2: Tools */}
                      <div className="px-6 border-r border-gray-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-1.5 bg-green-50 rounded-lg">
                            <Icon name="Calculator" className="w-4 h-4 text-green-600" />
                          </div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">Financial Tools</h4>
                        </div>
                        <div className="space-y-1">
                          <Link href="/dashboard/tools/tsp-modeler" className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all">
                            <Icon name="TrendingUp" className="w-4 h-4 text-blue-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">TSP Modeler</span>
                          </Link>
                          <Link href="/dashboard/tools/sdp-strategist" className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all">
                            <Icon name="PiggyBank" className="w-4 h-4 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-green-600 transition-colors">SDP Strategist</span>
                          </Link>
                          <Link href="/dashboard/tools/house-hacking" className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all">
                            <Icon name="Home" className="w-4 h-4 text-purple-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">House Hacking</span>
                          </Link>
                          <Link href="/dashboard/tools/pcs-planner" className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all">
                            <Icon name="Truck" className="w-4 h-4 text-indigo-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">PCS Planner</span>
                          </Link>
                          <Link href="/dashboard/tools/on-base-savings" className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all">
                            <Icon name="ShoppingCart" className="w-4 h-4 text-orange-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">Savings Center</span>
                          </Link>
                          <Link href="/dashboard/tools/salary-calculator" className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all">
                            <Icon name="Briefcase" className="w-4 h-4 text-emerald-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">Career Analyzer</span>
                          </Link>
                        </div>
                      </div>

                      {/* Column 3: Content & Community */}
                      <div className="pl-6">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-1.5 bg-purple-50 rounded-lg">
                            <Icon name="BookOpen" className="w-4 h-4 text-purple-600" />
                          </div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">Intelligence</h4>
                        </div>
                        <div className="space-y-1">
                          <Link href="/dashboard/library" className={`group flex items-start gap-3 px-3 py-3 rounded-lg transition-all ${
                            isActivePath('/dashboard/library') ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                          }`}>
                            <Icon name="Library" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className={`font-semibold text-sm ${isActivePath('/dashboard/library') ? 'text-blue-600' : 'text-slate-900 dark:text-white group-hover:text-blue-600'}`}>
                                Intel Library
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                410+ expert articles
                              </div>
                            </div>
                          </Link>
                          <Link href="/dashboard/listening-post" className={`group flex items-start gap-3 px-3 py-3 rounded-lg transition-all ${
                            isActivePath('/dashboard/listening-post') ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                          }`}>
                            <Icon name="Radio" className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className={`font-semibold text-sm ${isActivePath('/dashboard/listening-post') ? 'text-blue-600' : 'text-slate-900 dark:text-white group-hover:text-purple-600'}`}>
                                Listening Post
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                Real-time military news
                              </div>
                            </div>
                          </Link>
                          <Link href="/dashboard/directory" className={`group flex items-start gap-3 px-3 py-3 rounded-lg transition-all ${
                            isActivePath('/dashboard/directory') ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                          }`}>
                            <Icon name="Users" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className={`font-semibold text-sm ${isActivePath('/dashboard/directory') ? 'text-blue-600' : 'text-slate-900 dark:text-white group-hover:text-green-600'}`}>
                                Directory
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                Military community
                              </div>
                            </div>
                          </Link>
                          <Link href="/dashboard/referrals" className={`group flex items-start gap-3 px-3 py-3 rounded-lg transition-all ${
                            isActivePath('/dashboard/referrals') ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                          }`}>
                            <Icon name="Gift" className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className={`font-semibold text-sm ${isActivePath('/dashboard/referrals') ? 'text-blue-600' : 'text-slate-900 dark:text-white group-hover:text-orange-600'}`}>
                                Refer & Earn
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                Share with your unit
                              </div>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Dropdown Footer - Quick Actions */}
                    <div className="bg-gray-50 dark:bg-slate-900 px-6 py-4 border-t border-gray-100 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          <kbd className="px-2 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded text-xs font-mono">ESC</kbd> to close
                        </div>
                        <Link href="/dashboard" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                          View All
                          <Icon name="ChevronRight" className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Search Button */}
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className="px-4 py-2 rounded-lg text-gray-600 hover:text-slate-900 hover:bg-gray-50 transition-all flex items-center gap-2 font-semibold"
                title="Search Library (Press /)"
              >
                <Icon name="Search" className="w-4 h-4" />
                <span className="text-sm hidden xl:inline">Search</span>
              </button>
            </SignedIn>

            {/* Resources Dropdown - ELEVATED */}
            <div 
              className="relative"
              onMouseEnter={() => { if (closeTimeout) clearTimeout(closeTimeout); setResourcesOpen(true); }}
              onMouseLeave={() => { const t = setTimeout(() => setResourcesOpen(false), 150); setCloseTimeout(t); }}
            >
              <button className={`px-4 py-2 rounded-lg transition-all flex items-center font-semibold relative group ${
                isActivePath('/pcs-hub') || isActivePath('/career-hub') || isActivePath('/deployment') || isActivePath('/on-base-shopping') || isActivePath('/base-guides')
                  ? 'text-slate-900 dark:text-white' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}>
                Resources
                <Icon name="ChevronDown" className={`w-4 h-4 ml-1 transition-transform ${resourcesOpen ? 'rotate-180' : ''}`} />
                {(isActivePath('/pcs-hub') || isActivePath('/career-hub') || isActivePath('/deployment') || isActivePath('/on-base-shopping') || isActivePath('/base-guides')) && 
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-700 to-slate-900 rounded-full" />}
              </button>
              {resourcesOpen && (
                <div 
                  className="absolute top-full right-0 mt-3 w-[380px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                  onMouseEnter={() => { if (closeTimeout) clearTimeout(closeTimeout); setResourcesOpen(true); }}
                  onMouseLeave={() => { const t = setTimeout(() => setResourcesOpen(false), 150); setCloseTimeout(t); }}
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-slate-700 to-slate-900 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Icon name="BookOpen" className="w-5 h-5 text-white" />
                      <div>
                        <h3 className="text-white font-bold text-lg">Military Life Guides</h3>
                        <p className="text-slate-300 text-xs">Expert knowledge for every situation</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="space-y-2">
                      <a href="/pcs-hub" className="group flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all">
                        <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                          <Icon name="Truck" className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">PCS Hub</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Complete moving & relocation guide</div>
                        </div>
                      </a>

                      <a href="/career-hub" className="group flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all">
                        <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                          <Icon name="Briefcase" className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900 dark:text-white group-hover:text-green-600 transition-colors">Career Hub</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Transition planning & job search</div>
                        </div>
                      </a>

                      <a href="/deployment" className="group flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all">
                        <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                          <Icon name="Shield" className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900 dark:text-white group-hover:text-red-600 transition-colors">Deployment Guide</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Pre & post-deployment prep</div>
                        </div>
                      </a>

                      <a href="/on-base-shopping" className="group flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all">
                        <div className="p-2 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                          <Icon name="ShoppingCart" className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">Shopping Guide</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Commissary & Exchange savings</div>
                        </div>
                      </a>

                      <a href="/base-guides" className="group flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all">
                        <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                          <Icon name="MapPin" className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">Base Guides</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Installation info & tips</div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <SignedIn>
              {/* Upgrade CTA - PROMINENT */}
              <Link 
                href="/dashboard/upgrade" 
                className="ml-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold transition-all hover:shadow-lg hover:shadow-blue-500/50 hover:-translate-y-0.5 relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative">Upgrade</span>
              </Link>
            </SignedIn>
          </nav>

          {/* Search Overlay - ENHANCED */}
          {showSearch && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-32 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 border border-gray-200 dark:border-slate-700 overflow-hidden">
                <form onSubmit={handleSearch}>
                  <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100 dark:border-slate-700">
                    <Icon name="Search" className="w-6 h-6 text-gray-400 flex-shrink-0" />
                    <input
                      id="nav-search"
                      type="text"
                      placeholder="Search 410+ military financial articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 text-lg border-none outline-none bg-transparent text-slate-900 dark:text-white placeholder:text-gray-400"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowSearch(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                    >
                      <Icon name="X" className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900">
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded font-mono">Enter</kbd>
                        <span>to search</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded font-mono">ESC</kbd>
                        <span>to close</span>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-gray-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
            aria-label="Toggle menu"
          >
            <Icon name={mobileMenuOpen ? "X" : "Menu"} className="w-6 h-6" />
          </button>

          {/* Authentication Buttons - Desktop */}
          <div className="hidden lg:flex items-center space-x-3">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-gray-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors font-semibold px-4 py-2">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg font-bold transition-all hover:shadow-lg hover:shadow-slate-500/50">
                  Sign Up Free
                </button>
              </SignUpButton>
            </SignedOut>
            
            <SignedIn>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 ring-2 ring-offset-2 ring-blue-600"
                  }
                }}
              />
            </SignedIn>
          </div>
        </div>

        {/* Mobile Menu - ENHANCED */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="py-4">
              {/* Search in Mobile */}
              <div className="px-4 pb-4 border-b border-gray-100 dark:border-slate-800">
                <form onSubmit={handleSearch} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                  <Icon name="Search" className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search Library..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 text-base border-none outline-none bg-transparent min-h-[44px] text-slate-900 dark:text-white placeholder:text-gray-400"
                  />
                </form>
              </div>

              {/* Home */}
              <div className="px-4 py-2">
                <Link 
                  href="/" 
                  className={`flex items-center px-4 py-3 rounded-xl font-semibold transition-all min-h-[44px] ${
                    pathname === '/' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon name="Home" className="w-5 h-5 mr-3 flex-shrink-0" />
                  Home
                </Link>
              </div>

              <SignedIn>
                {/* Command Center */}
                <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-3 px-2">
                    <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Icon name="LayoutDashboard" className="w-4 h-4 text-blue-600" />
                    </div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Command Center</h4>
                  </div>
                  <div className="space-y-1">
                    <Link href="/dashboard" className={`flex items-center px-4 py-3 rounded-xl transition-all min-h-[44px] ${
                      pathname === '/dashboard' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`} onClick={() => setMobileMenuOpen(false)}>
                      <Icon name="Monitor" className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" />
                      Dashboard
                    </Link>
                    <Link href="/dashboard/plan" className={`flex items-center px-4 py-3 rounded-xl transition-all min-h-[44px] ${
                      isActivePath('/dashboard/plan') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`} onClick={() => setMobileMenuOpen(false)}>
                      <Icon name="Sparkles" className="w-5 h-5 mr-3 text-indigo-500 flex-shrink-0" />
                      AI Plan
                    </Link>
                    <Link href="/dashboard/assessment" className={`flex items-center px-4 py-3 rounded-xl transition-all min-h-[44px] ${
                      isActivePath('/dashboard/assessment') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`} onClick={() => setMobileMenuOpen(false)}>
                      <Icon name="ClipboardCheck" className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                      Assessment
                    </Link>
                    <Link href="/dashboard/binder" className={`flex items-center px-4 py-3 rounded-xl transition-all min-h-[44px] ${
                      isActivePath('/dashboard/binder') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`} onClick={() => setMobileMenuOpen(false)}>
                      <Icon name="FolderOpen" className="w-5 h-5 mr-3 text-purple-500 flex-shrink-0" />
                      Binder
                    </Link>
                  </div>
                </div>

                {/* Tools */}
                <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-3 px-2">
                    <div className="p-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Icon name="Calculator" className="w-4 h-4 text-green-600" />
                    </div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Financial Tools</h4>
                  </div>
                  <div className="space-y-1">
                    <Link href="/dashboard/tools/tsp-modeler" className="flex items-center px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all min-h-[44px]" onClick={() => setMobileMenuOpen(false)}>
                      <Icon name="TrendingUp" className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" />
                      TSP Modeler
                    </Link>
                    <Link href="/dashboard/tools/sdp-strategist" className="flex items-center px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all min-h-[44px]" onClick={() => setMobileMenuOpen(false)}>
                      <Icon name="PiggyBank" className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                      SDP Strategist
                    </Link>
                    <Link href="/dashboard/tools/house-hacking" className="flex items-center px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all min-h-[44px]" onClick={() => setMobileMenuOpen(false)}>
                      <Icon name="Home" className="w-5 h-5 mr-3 text-purple-500 flex-shrink-0" />
                      House Hacking
                    </Link>
                    <Link href="/dashboard/tools/pcs-planner" className="flex items-center px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all min-h-[44px]" onClick={() => setMobileMenuOpen(false)}>
                      <Icon name="Truck" className="w-5 h-5 mr-3 text-indigo-500 flex-shrink-0" />
                      PCS Planner
                    </Link>
                    <Link href="/dashboard/tools/on-base-savings" className="flex items-center px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all min-h-[44px]" onClick={() => setMobileMenuOpen(false)}>
                      <Icon name="ShoppingCart" className="w-5 h-5 mr-3 text-orange-500 flex-shrink-0" />
                      Savings Center
                    </Link>
                    <Link href="/dashboard/tools/salary-calculator" className="flex items-center px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all min-h-[44px]" onClick={() => setMobileMenuOpen(false)}>
                      <Icon name="Briefcase" className="w-5 h-5 mr-3 text-emerald-500 flex-shrink-0" />
                      Career Analyzer
                    </Link>
                  </div>
                </div>

                {/* Content & Community */}
                <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-3 px-2">
                    <div className="p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Icon name="BookOpen" className="w-4 h-4 text-purple-600" />
                    </div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Intelligence</h4>
                  </div>
                  <div className="space-y-1">
                    <Link href="/dashboard/library" className={`flex items-center px-4 py-3 rounded-xl transition-all min-h-[44px] ${
                      isActivePath('/dashboard/library') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`} onClick={() => setMobileMenuOpen(false)}>
                      <Icon name="Library" className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" />
                      Intel Library
                    </Link>
                    <Link href="/dashboard/listening-post" className={`flex items-center px-4 py-3 rounded-xl transition-all min-h-[44px] ${
                      isActivePath('/dashboard/listening-post') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`} onClick={() => setMobileMenuOpen(false)}>
                      <Icon name="Radio" className="w-5 h-5 mr-3 text-purple-500 flex-shrink-0" />
                      Listening Post
                    </Link>
                    <Link href="/dashboard/directory" className={`flex items-center px-4 py-3 rounded-xl transition-all min-h-[44px] ${
                      isActivePath('/dashboard/directory') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`} onClick={() => setMobileMenuOpen(false)}>
                      <Icon name="Users" className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                      Directory
                    </Link>
                    <Link href="/dashboard/referrals" className={`flex items-center px-4 py-3 rounded-xl transition-all min-h-[44px] ${
                      isActivePath('/dashboard/referrals') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`} onClick={() => setMobileMenuOpen(false)}>
                      <Icon name="Gift" className="w-5 h-5 mr-3 text-orange-500 flex-shrink-0" />
                      Refer & Earn
                    </Link>
                  </div>
                </div>
              </SignedIn>

              {/* Resources - Public */}
              <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-3 px-2">
                  <div className="p-1.5 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <Icon name="BookOpen" className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Military Guides</h4>
                </div>
                <div className="space-y-1">
                  <a href="/pcs-hub" className="flex items-center px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all min-h-[44px]">
                    <Icon name="Truck" className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" />
                    PCS Hub
                  </a>
                  <a href="/career-hub" className="flex items-center px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all min-h-[44px]">
                    <Icon name="Briefcase" className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                    Career Hub
                  </a>
                  <a href="/deployment" className="flex items-center px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all min-h-[44px]">
                    <Icon name="Shield" className="w-5 h-5 mr-3 text-red-500 flex-shrink-0" />
                    Deployment
                  </a>
                  <a href="/on-base-shopping" className="flex items-center px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all min-h-[44px]">
                    <Icon name="ShoppingCart" className="w-5 h-5 mr-3 text-orange-500 flex-shrink-0" />
                    Shopping
                  </a>
                  <a href="/base-guides" className="flex items-center px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all min-h-[44px]">
                    <Icon name="MapPin" className="w-5 h-5 mr-3 text-purple-500 flex-shrink-0" />
                    Base Guides
                  </a>
                </div>
              </div>

              <SignedIn>
                {/* Upgrade Button */}
                <div className="px-4 py-4 border-t border-gray-100 dark:border-slate-800">
                  <Link 
                    href="/dashboard/upgrade" 
                    className="flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-4 rounded-xl font-bold text-center transition-all hover:shadow-lg hover:shadow-blue-500/50 min-h-[44px]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon name="Star" className="w-5 h-5 mr-2" />
                    Upgrade to Premium
                  </Link>
                </div>
              </SignedIn>
              
              {/* Mobile Auth */}
              <div className="px-4 py-4 border-t border-gray-100 dark:border-slate-800">
                <SignedOut>
                  <div className="space-y-2">
                    <SignInButton mode="modal">
                      <button className="w-full text-center text-gray-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors font-semibold py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl min-h-[44px] hover:bg-gray-50 dark:hover:bg-slate-800">
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all min-h-[44px] hover:shadow-lg">
                        Sign Up Free
                      </button>
                    </SignUpButton>
                  </div>
                </SignedOut>
                
                <SignedIn>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Your Account</span>
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
