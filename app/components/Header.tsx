'use client';

import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Icon from './ui/Icon';

export default function Header() {
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [coreToolsOpen, setCoreToolsOpen] = useState(false);
  const [intelligenceOpen, setIntelligenceOpen] = useState(false);
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
      } else if (e.key === 'Escape') {
        setShowSearch(false);
        setDashboardOpen(false);
        setCoreToolsOpen(false);
        setIntelligenceOpen(false);
        setResourcesOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSearch]);

  const isActivePath = (path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* Premium Search Modal - Enhanced */}
      {showSearch && (
        <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-slate-900/40 to-black/60 backdrop-blur-md z-50 flex items-start justify-center pt-24 px-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
            {/* Search Header */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-slate-700 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Icon name="Search" className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <input
                  id="nav-search"
                  type="text"
                  placeholder="Search calculators, intel, resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-lg font-semibold placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none text-slate-900 dark:text-white"
                  autoFocus
                />
                <button
                  onClick={() => setShowSearch(false)}
                  className="p-2 hover:bg-white/50 dark:hover:bg-slate-600/50 rounded-lg transition-colors"
                >
                  <Icon name="X" className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Search Shortcuts */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quick Access:</span>
                <Link 
                  href="/dashboard/intel-library" 
                  onClick={() => setShowSearch(false)}
                  className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-semibold hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                >
                  Intel Library
                </Link>
                <Link 
                  href="/dashboard/tools/tsp-calculator" 
                  onClick={() => setShowSearch(false)}
                  className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                >
                  TSP Calculator
                </Link>
                <Link 
                  href="/dashboard/pcs-copilot" 
                  onClick={() => setShowSearch(false)}
                  className="px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-lg text-xs font-semibold hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                >
                  PCS Copilot
                </Link>
                <Link 
                  href="/base-guides" 
                  onClick={() => setShowSearch(false)}
                  className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  Base Guides
                </Link>
              </div>
            </div>

            {/* Search Footer */}
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <kbd className="px-2 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded text-xs font-mono">↵</kbd>
                  <span>to select</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-2 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded text-xs font-mono">ESC</kbd>
                  <span>to close</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Icon name="Sparkles" className="w-3 h-3" />
                <span>Powered by AI</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header - Premium Design */}
      <header className="sticky top-0 z-40 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl border-b-2 border-slate-200/50 dark:border-slate-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Premium Brand */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                  <Icon name="Shield" className="w-6 h-6 text-white drop-shadow-md" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur-md opacity-0 group-hover:opacity-30 transition-all duration-300" />
              </div>
              <div className="hidden sm:block">
                <div className="font-bold text-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">
                  Garrison Ledger
                </div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 -mt-1 tracking-wide">
                  Military Financial Intelligence
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                href="/"
                className={`px-4 py-2 rounded-lg transition-all flex items-center font-semibold relative group ${
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
                {/* Dashboard Dropdown */}
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
                    Dashboard
                    <Icon name="ChevronDown" className={`w-4 h-4 ml-1 transition-transform ${dashboardOpen ? 'rotate-180' : ''}`} />
                    {isActivePath('/dashboard') && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-700 to-slate-900 rounded-full" />
                    )}
                  </button>
                  {dashboardOpen && (
                    <div 
                      className="absolute top-full left-0 mt-3 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                      onMouseEnter={() => { if (closeTimeout) clearTimeout(closeTimeout); setDashboardOpen(true); }}
                      onMouseLeave={() => { const t = setTimeout(() => setDashboardOpen(false), 150); setCloseTimeout(t); }}
                    >
                      <div className="p-3">
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
                        <Link href="/dashboard/pcs-copilot" className={`group flex items-start gap-3 px-3 py-3 rounded-lg transition-all ${
                          isActivePath('/dashboard/pcs-copilot') ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                        }`}>
                          <Icon name="Truck" className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className={`font-semibold text-sm ${isActivePath('/dashboard/pcs-copilot') ? 'text-blue-600' : 'text-slate-900 dark:text-white group-hover:text-orange-600'}`}>
                              PCS Copilot
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                              AI reimbursement assistant
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Core Tools Dropdown */}
                <div 
                  className="relative"
                  onMouseEnter={() => { if (closeTimeout) clearTimeout(closeTimeout); setCoreToolsOpen(true); }}
                  onMouseLeave={() => { const t = setTimeout(() => setCoreToolsOpen(false), 150); setCloseTimeout(t); }}
                >
                  <button className={`px-4 py-2 rounded-lg transition-all flex items-center font-semibold relative group ${
                    isActivePath('/dashboard/tools') 
                      ? 'text-slate-900 dark:text-white' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                  }`}>
                    Core Tools
                    <Icon name="ChevronDown" className={`w-4 h-4 ml-1 transition-transform ${coreToolsOpen ? 'rotate-180' : ''}`} />
                    {isActivePath('/dashboard/tools') && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-700 to-slate-900 rounded-full" />
                    )}
                  </button>
                  {coreToolsOpen && (
                    <div 
                      className="absolute top-full left-0 mt-3 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                      onMouseEnter={() => { if (closeTimeout) clearTimeout(closeTimeout); setCoreToolsOpen(true); }}
                      onMouseLeave={() => { const t = setTimeout(() => setCoreToolsOpen(false), 150); setCloseTimeout(t); }}
                    >
                      <div className="p-3">
                        <Link href="/dashboard/tools/tsp-calculator" className={`group flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                          isActivePath('/dashboard/tools/tsp-calculator') ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                        }`}>
                          <Icon name="TrendingUp" className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          <div>
                            <div className={`font-semibold text-sm ${isActivePath('/dashboard/tools/tsp-calculator') ? 'text-emerald-600' : 'text-slate-900 dark:text-white group-hover:text-emerald-600'}`}>
                              TSP Calculator
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                              Optimize your retirement
                            </div>
                          </div>
                        </Link>
                        <Link href="/dashboard/tools/sdp-calculator" className={`group flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                          isActivePath('/dashboard/tools/sdp-calculator') ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                        }`}>
                          <Icon name="PiggyBank" className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          <div>
                            <div className={`font-semibold text-sm ${isActivePath('/dashboard/tools/sdp-calculator') ? 'text-emerald-600' : 'text-slate-900 dark:text-white group-hover:text-emerald-600'}`}>
                              SDP Calculator
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                              Deployment savings
                            </div>
                          </div>
                        </Link>
                        <Link href="/dashboard/tools/house-hacking" className={`group flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                          isActivePath('/dashboard/tools/house-hacking') ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                        }`}>
                          <Icon name="Home" className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          <div>
                            <div className={`font-semibold text-sm ${isActivePath('/dashboard/tools/house-hacking') ? 'text-emerald-600' : 'text-slate-900 dark:text-white group-hover:text-emerald-600'}`}>
                              House Hacking
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                              Multi-unit investments
                            </div>
                          </div>
                        </Link>
                        <Link href="/dashboard/tools/pcs-planner" className={`group flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                          isActivePath('/dashboard/tools/pcs-planner') ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                        }`}>
                          <Icon name="Truck" className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          <div>
                            <div className={`font-semibold text-sm ${isActivePath('/dashboard/tools/pcs-planner') ? 'text-emerald-600' : 'text-slate-900 dark:text-white group-hover:text-emerald-600'}`}>
                              PCS Planner
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                              Move planning & costs
                            </div>
                          </div>
                        </Link>
                        <Link href="/dashboard/tools/on-base-savings" className={`group flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                          isActivePath('/dashboard/tools/on-base-savings') ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                        }`}>
                          <Icon name="ShoppingCart" className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          <div>
                            <div className={`font-semibold text-sm ${isActivePath('/dashboard/tools/on-base-savings') ? 'text-emerald-600' : 'text-slate-900 dark:text-white group-hover:text-emerald-600'}`}>
                              On-Base Savings
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                              Commissary & exchange
                            </div>
                          </div>
                        </Link>
                        <Link href="/dashboard/tools/retirement-calculator" className={`group flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                          isActivePath('/dashboard/tools/retirement-calculator') ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                        }`}>
                          <Icon name="Calculator" className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          <div>
                            <div className={`font-semibold text-sm ${isActivePath('/dashboard/tools/retirement-calculator') ? 'text-emerald-600' : 'text-slate-900 dark:text-white group-hover:text-emerald-600'}`}>
                              Retirement Calculator
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                              Military retirement planning
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Intelligence Dropdown */}
                <div 
                  className="relative"
                  onMouseEnter={() => { if (closeTimeout) clearTimeout(closeTimeout); setIntelligenceOpen(true); }}
                  onMouseLeave={() => { const t = setTimeout(() => setIntelligenceOpen(false), 150); setCloseTimeout(t); }}
                >
                  <button className={`px-4 py-2 rounded-lg transition-all flex items-center font-semibold relative group ${
                    isActivePath('/dashboard/intel-library') || isActivePath('/dashboard/listening-post') || isActivePath('/dashboard/directory') || isActivePath('/dashboard/refer-earn')
                      ? 'text-slate-900 dark:text-white' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                  }`}>
                    Intelligence
                    <Icon name="ChevronDown" className={`w-4 h-4 ml-1 transition-transform ${intelligenceOpen ? 'rotate-180' : ''}`} />
                    {(isActivePath('/dashboard/intel-library') || isActivePath('/dashboard/listening-post') || isActivePath('/dashboard/directory') || isActivePath('/dashboard/refer-earn')) && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-700 to-slate-900 rounded-full" />
                    )}
                  </button>
                  {intelligenceOpen && (
                    <div 
                      className="absolute top-full left-0 mt-3 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                      onMouseEnter={() => { if (closeTimeout) clearTimeout(closeTimeout); setIntelligenceOpen(true); }}
                      onMouseLeave={() => { const t = setTimeout(() => setIntelligenceOpen(false), 150); setCloseTimeout(t); }}
                    >
                      <div className="p-3">
                        <Link href="/dashboard/intel-library" className={`group flex items-start gap-3 px-3 py-3 rounded-lg transition-all ${
                          isActivePath('/dashboard/intel-library') ? 'bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                        }`}>
                          <Icon name="BookOpen" className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className={`font-semibold text-sm ${isActivePath('/dashboard/intel-library') ? 'text-purple-600' : 'text-slate-900 dark:text-white group-hover:text-purple-600'}`}>
                              Intel Library
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                              410+ expert articles
                            </div>
                          </div>
                        </Link>
                        <Link href="/dashboard/listening-post" className={`group flex items-start gap-3 px-3 py-3 rounded-lg transition-all ${
                          isActivePath('/dashboard/listening-post') ? 'bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                        }`}>
                          <Icon name="Radio" className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className={`font-semibold text-sm ${isActivePath('/dashboard/listening-post') ? 'text-purple-600' : 'text-slate-900 dark:text-white group-hover:text-purple-600'}`}>
                              Listening Post
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                              Real-time military news
                            </div>
                          </div>
                        </Link>
                        <Link href="/dashboard/directory" className={`group flex items-start gap-3 px-3 py-3 rounded-lg transition-all ${
                          isActivePath('/dashboard/directory') ? 'bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                        }`}>
                          <Icon name="Users" className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className={`font-semibold text-sm ${isActivePath('/dashboard/directory') ? 'text-purple-600' : 'text-slate-900 dark:text-white group-hover:text-purple-600'}`}>
                              Directory
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                              Military community
                            </div>
                          </div>
                        </Link>
                        <Link href="/dashboard/refer-earn" className={`group flex items-start gap-3 px-3 py-3 rounded-lg transition-all ${
                          isActivePath('/dashboard/refer-earn') ? 'bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                        }`}>
                          <Icon name="Gift" className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className={`font-semibold text-sm ${isActivePath('/dashboard/refer-earn') ? 'text-purple-600' : 'text-slate-900 dark:text-white group-hover:text-purple-600'}`}>
                              Refer & Earn
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                              Share with your unit
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </SignedIn>

              {/* Resources Dropdown */}
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
                  {(isActivePath('/pcs-hub') || isActivePath('/career-hub') || isActivePath('/deployment') || isActivePath('/on-base-shopping') || isActivePath('/base-guides')) && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-700 to-slate-900 rounded-full" />
                  )}
                </button>
                {resourcesOpen && (
                  <div 
                    className="absolute top-full left-0 mt-3 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                    onMouseEnter={() => { if (closeTimeout) clearTimeout(closeTimeout); setResourcesOpen(true); }}
                    onMouseLeave={() => { const t = setTimeout(() => setResourcesOpen(false), 150); setCloseTimeout(t); }}
                  >
                    <div className="p-3">
                      <Link href="/pcs-hub" className={`group flex items-start gap-3 px-3 py-3 rounded-lg transition-all ${
                        isActivePath('/pcs-hub') ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                      }`}>
                        <Icon name="Truck" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className={`font-semibold text-sm ${isActivePath('/pcs-hub') ? 'text-blue-600' : 'text-slate-900 dark:text-white group-hover:text-blue-600'}`}>
                            PCS Hub
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            Permanent change of station
                          </div>
                        </div>
                      </Link>
                      <Link href="/career-hub" className={`group flex items-start gap-3 px-3 py-3 rounded-lg transition-all ${
                        isActivePath('/career-hub') ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                      }`}>
                        <Icon name="Briefcase" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className={`font-semibold text-sm ${isActivePath('/career-hub') ? 'text-blue-600' : 'text-slate-900 dark:text-white group-hover:text-blue-600'}`}>
                            Career Hub
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            Military career planning
                          </div>
                        </div>
                      </Link>
                      <Link href="/deployment" className={`group flex items-start gap-3 px-3 py-3 rounded-lg transition-all ${
                        isActivePath('/deployment') ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                      }`}>
                        <Icon name="Shield" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className={`font-semibold text-sm ${isActivePath('/deployment') ? 'text-blue-600' : 'text-slate-900 dark:text-white group-hover:text-blue-600'}`}>
                            Deployment
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            Deployment preparation
                          </div>
                        </div>
                      </Link>
                      <Link href="/base-guides" className={`group flex items-start gap-3 px-3 py-3 rounded-lg transition-all ${
                        isActivePath('/base-guides') ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                      }`}>
                        <Icon name="MapPin" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className={`font-semibold text-sm ${isActivePath('/base-guides') ? 'text-blue-600' : 'text-slate-900 dark:text-white group-hover:text-blue-600'}`}>
                            Base Guides
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            Military installation guides
                          </div>
                        </div>
                      </Link>
                      <Link href="/on-base-shopping" className={`group flex items-start gap-3 px-3 py-3 rounded-lg transition-all ${
                        isActivePath('/on-base-shopping') ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                      }`}>
                        <Icon name="ShoppingCart" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className={`font-semibold text-sm ${isActivePath('/on-base-shopping') ? 'text-blue-600' : 'text-slate-900 dark:text-white group-hover:text-blue-600'}`}>
                            On-Base Shopping
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
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
                  <button className="px-4 py-2 text-gray-600 hover:text-slate-900 font-semibold transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-6 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl font-bold hover:from-slate-700 hover:to-slate-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                    Get Started Free
                  </button>
                </SignUpButton>
              </SignedOut>

              <SignedIn>
                {/* Premium Search Button - Enhanced */}
                <button 
                  onClick={() => setShowSearch(!showSearch)}
                  className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all group"
                  title="Search Library (Press /)"
                >
                  <Icon name="Search" className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Search</span>
                  <kbd className="hidden xl:inline-flex px-2 py-0.5 text-xs font-mono bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded">
                    /
                  </kbd>
                </button>

                {/* Upgrade Button - Premium CTA */}
                <Link
                  href="/dashboard/upgrade"
                  className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-bold hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Icon name="Zap" className="w-4 h-4" />
                  <span>Upgrade</span>
                </Link>

                {/* User Menu */}
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9 ring-2 ring-slate-200 dark:ring-slate-700 hover:ring-blue-500 transition-all"
                    }
                  }}
                />
              </SignedIn>

              {/* Mobile Menu Button - Enhanced */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl text-gray-600 hover:text-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
              >
                <Icon name={mobileMenuOpen ? "X" : "Menu"} className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="px-4 py-6 space-y-4">
              <SignedIn>
                {/* Mobile Dashboard Section */}
                <div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Dashboard
                  </div>
                  <div className="space-y-2">
                    <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <Icon name="LayoutDashboard" className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link href="/dashboard/plan" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <Icon name="Sparkles" className="w-5 h-5 text-indigo-600" />
                      <span className="font-medium">AI Plan</span>
                    </Link>
                    <Link href="/dashboard/assessment" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <Icon name="ClipboardCheck" className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Assessment</span>
                    </Link>
                    <Link href="/dashboard/binder" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <Icon name="FolderOpen" className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Binder</span>
                    </Link>
                    <Link href="/dashboard/pcs-copilot" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <Icon name="Truck" className="w-5 h-5 text-orange-600" />
                      <span className="font-medium">PCS Copilot</span>
                    </Link>
                  </div>
                </div>

                {/* Mobile Core Tools Section */}
                <div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Core Tools
                  </div>
                  <div className="space-y-2">
                    <Link href="/dashboard/tools/tsp-calculator" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <Icon name="TrendingUp" className="w-5 h-5 text-emerald-600" />
                      <span className="font-medium">TSP Calculator</span>
                    </Link>
                    <Link href="/dashboard/tools/sdp-calculator" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <Icon name="PiggyBank" className="w-5 h-5 text-emerald-600" />
                      <span className="font-medium">SDP Calculator</span>
                    </Link>
                    <Link href="/dashboard/tools/house-hacking" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <Icon name="Home" className="w-5 h-5 text-emerald-600" />
                      <span className="font-medium">House Hacking</span>
                    </Link>
                    <Link href="/dashboard/tools/pcs-planner" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <Icon name="Truck" className="w-5 h-5 text-emerald-600" />
                      <span className="font-medium">PCS Planner</span>
                    </Link>
                    <Link href="/dashboard/tools/on-base-savings" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <Icon name="ShoppingCart" className="w-5 h-5 text-emerald-600" />
                      <span className="font-medium">On-Base Savings</span>
                    </Link>
                    <Link href="/dashboard/tools/retirement-calculator" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <Icon name="Calculator" className="w-5 h-5 text-emerald-600" />
                      <span className="font-medium">Retirement Calculator</span>
                    </Link>
                  </div>
                </div>

                {/* Mobile Intelligence Section */}
                <div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Intelligence
                  </div>
                  <div className="space-y-2">
                    <Link href="/dashboard/intel-library" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <Icon name="BookOpen" className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Intel Library</span>
                    </Link>
                    <Link href="/dashboard/listening-post" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <Icon name="Radio" className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Listening Post</span>
                    </Link>
                    <Link href="/dashboard/directory" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <Icon name="Users" className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Directory</span>
                    </Link>
                    <Link href="/dashboard/refer-earn" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <Icon name="Gift" className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Refer & Earn</span>
                    </Link>
                  </div>
                </div>

                {/* Mobile Resources Section */}
                <div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Resources
                  </div>
                  <div className="space-y-2">
                    <Link href="/pcs-hub" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <Icon name="Truck" className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">PCS Hub</span>
                    </Link>
                    <Link href="/career-hub" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <Icon name="Briefcase" className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Career Hub</span>
                    </Link>
                    <Link href="/deployment" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <Icon name="Shield" className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Deployment</span>
                    </Link>
                    <Link href="/base-guides" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <Icon name="MapPin" className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Base Guides</span>
                    </Link>
                    <Link href="/on-base-shopping" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <Icon name="ShoppingCart" className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">On-Base Shopping</span>
                    </Link>
                  </div>
                </div>

                {/* Mobile Upgrade CTA */}
                <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                  <Link href="/dashboard/upgrade" className="block w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-center py-3 px-4 rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all">
                    Upgrade to Premium
                  </Link>
                </div>
              </SignedIn>
              <SignedOut>
                <div className="space-y-3">
                  <SignInButton mode="modal">
                    <button className="w-full px-4 py-3 text-gray-600 hover:text-slate-900 font-semibold transition-colors text-left">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="w-full px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors">
                      Get Started
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