'use client';

import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

import Icon from './ui/Icon';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      setShowSearch(false);
      setSearchQuery('');
    }
  };
  
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo/Brand */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-primary hover:text-blue-700 transition-colors flex items-center gap-2">
              <Icon name="BarChart" className="h-6 w-6" /> 
              <span className="hidden sm:inline">Garrison Ledger</span>
              <span className="sm:hidden">GL</span>
            </Link>
          </div>

          {/* Main Navigation - Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            <SignedIn>
              {/* Dashboard Link */}
              <Link 
                href="/dashboard" 
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isActivePath('/dashboard') && !isActivePath('/dashboard/tools') && !isActivePath('/dashboard/library') && !isActivePath('/dashboard/listening-post')
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Dashboard
              </Link>

              {/* Tools Mega Menu */}
              <div className="relative group">
                <button className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  isActivePath('/dashboard/tools')
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}>
                  Calculators
                  <Icon name="ChevronDown" className="h-4 w-4" />
                </button>
                
                {/* Dropdown */}
                <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="grid grid-cols-2 gap-1 p-2">
                    <Link href="/dashboard/tools/tsp-modeler" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-50 transition-colors">
                      <Icon name="BarChart" className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-semibold text-sm text-gray-900">TSP Modeler</div>
                        <div className="text-xs text-gray-500">Optimize returns</div>
                      </div>
                    </Link>
                    <Link href="/dashboard/tools/sdp-strategist" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-50 transition-colors">
                      <Icon name="PiggyBank" className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-semibold text-sm text-gray-900">SDP Strategist</div>
                        <div className="text-xs text-gray-500">10% guaranteed</div>
                      </div>
                    </Link>
                    <Link href="/dashboard/tools/pcs-planner" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-50 transition-colors">
                      <Icon name="Truck" className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-semibold text-sm text-gray-900">PCS Planner</div>
                        <div className="text-xs text-gray-500">Move budget</div>
                      </div>
                    </Link>
                    <Link href="/dashboard/tools/house-hacking" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-50 transition-colors">
                      <Icon name="Home" className="h-5 w-5 text-indigo-600" />
                      <div>
                        <div className="font-semibold text-sm text-gray-900">House Hacking</div>
                        <div className="text-xs text-gray-500">Build wealth</div>
                      </div>
                    </Link>
                    <Link href="/dashboard/tools/on-base-savings" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-50 transition-colors">
                      <Icon name="ShoppingCart" className="h-5 w-5 text-orange-600" />
                      <div>
                        <div className="font-semibold text-sm text-gray-900">Base Savings</div>
                        <div className="text-xs text-gray-500">Save $1000s</div>
                      </div>
                    </Link>
                    <Link href="/dashboard/tools/salary-calculator" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-50 transition-colors">
                      <Icon name="Briefcase" className="h-5 w-5 text-emerald-600" />
                      <div>
                        <div className="font-semibold text-sm text-gray-900">Career Analyzer</div>
                        <div className="text-xs text-gray-500">Compare offers</div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Intel Library */}
              <Link 
                href="/dashboard/library" 
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isActivePath('/dashboard/library')
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Intel Library
              </Link>

              {/* Resources Mega Menu */}
              <div className="relative group">
                <button className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  isActivePath('/pcs-hub') || isActivePath('/career-hub') || isActivePath('/deployment') || isActivePath('/base-guides')
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}>
                  Resources
                  <Icon name="ChevronDown" className="h-4 w-4" />
                </button>
                
                {/* Dropdown */}
                <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="p-2 space-y-1">
                    <a href="/pcs-hub" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-50 transition-colors">
                      <Icon name="Truck" className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-semibold text-sm text-gray-900">PCS Hub</div>
                        <div className="text-xs text-gray-500">Moving & relocation</div>
                      </div>
                    </a>
                    <a href="/career-hub" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-50 transition-colors">
                      <Icon name="Briefcase" className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-semibold text-sm text-gray-900">Career Hub</div>
                        <div className="text-xs text-gray-500">Advancement & transition</div>
                      </div>
                    </a>
                    <a href="/deployment" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-50 transition-colors">
                      <Icon name="Shield" className="h-5 w-5 text-red-600" />
                      <div>
                        <div className="font-semibold text-sm text-gray-900">Deployment Guide</div>
                        <div className="text-xs text-gray-500">Pre & post prep</div>
                      </div>
                    </a>
                    <a href="/base-guides" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-50 transition-colors">
                      <Icon name="MapPin" className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-semibold text-sm text-gray-900">Base Guides</div>
                        <div className="text-xs text-gray-500">Installation info</div>
                      </div>
                    </a>
                    <a href="/dashboard/listening-post" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-50 transition-colors">
                      <Icon name="Radio" className="h-5 w-5 text-indigo-600" />
                      <div>
                        <div className="font-semibold text-sm text-gray-900">Listening Post</div>
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
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
                title="Search Library (Press /)"
              >
                <Icon name="Search" className="w-4 h-4" />
                <span className="text-sm font-medium">Search</span>
                <kbd className="hidden xl:inline-block px-2 py-0.5 text-xs bg-gray-100 border border-gray-300 rounded">/</kbd>
              </button>

              {/* Upgrade CTA */}
              <Link 
                href="/dashboard/upgrade" 
                className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
              >
                <Icon name="Star" className="w-4 h-4" />
                Upgrade
              </Link>

              {/* User Menu */}
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 ring-2 ring-blue-100"
                  }
                }}
              />
            </SignedIn>

            <SignedOut>
              <div className="hidden lg:flex items-center gap-3">
                <SignInButton mode="modal">
                  <button className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                    Get Started
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>

            {/* Mobile menu button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-gray-700 hover:text-gray-900 p-2"
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
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white pb-4">
            {/* Mobile Search */}
            <div className="px-4 py-3 border-b border-gray-100">
              <form onSubmit={handleSearch} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <Icon name="Search" className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Intel Library..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-base border-none outline-none bg-transparent placeholder-gray-400"
                />
              </form>
            </div>

            <nav className="px-4 py-3 space-y-1">
              <SignedIn>
                {/* Dashboard */}
                <Link 
                  href="/dashboard" 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                    pathname === '/dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon name="LayoutDashboard" className="w-5 h-5" />
                  Dashboard
                </Link>

                {/* Calculators */}
                <div className="pt-2">
                  <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Calculators
                  </div>
                  <Link href="/dashboard/tools/tsp-modeler" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <Icon name="BarChart" className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">TSP Modeler</span>
                  </Link>
                  <Link href="/dashboard/tools/sdp-strategist" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <Icon name="PiggyBank" className="w-5 h-5 text-green-600" />
                    <span className="font-medium">SDP Strategist</span>
                  </Link>
                  <Link href="/dashboard/tools/pcs-planner" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <Icon name="Truck" className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">PCS Planner</span>
                  </Link>
                  <Link href="/dashboard/tools/house-hacking" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <Icon name="Home" className="w-5 h-5 text-indigo-600" />
                    <span className="font-medium">House Hacking</span>
                  </Link>
                </div>

                {/* Content */}
                <div className="pt-2">
                  <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Content
                  </div>
                  <Link 
                    href="/dashboard/library" 
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                      isActivePath('/dashboard/library') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon name="BookOpen" className="w-5 h-5" />
                    Intel Library
                  </Link>
                  <Link 
                    href="/dashboard/listening-post" 
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                      isActivePath('/dashboard/listening-post') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon name="Radio" className="w-5 h-5" />
                    Listening Post
                  </Link>
                </div>

                {/* Resources */}
                <div className="pt-2">
                  <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Resources
                  </div>
                  <a href="/pcs-hub" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <Icon name="Truck" className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">PCS Hub</span>
                  </a>
                  <a href="/deployment" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <Icon name="Shield" className="w-5 h-5 text-red-600" />
                    <span className="font-medium">Deployment Guide</span>
                  </a>
                  <a href="/base-guides" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <Icon name="MapPin" className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">Base Guides</span>
                  </a>
                </div>

                {/* Upgrade CTA */}
                <div className="pt-4">
                  <Link 
                    href="/dashboard/upgrade" 
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon name="Star" className="w-5 h-5" />
                    Upgrade to Premium
                  </Link>
                </div>
              </SignedIn>

              <SignedOut>
                <div className="flex flex-col gap-2">
                  <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <Icon name="Home" className="w-5 h-5" />
                    Home
                  </Link>
                  <div className="border-t border-gray-100 my-2" />
                  <SignInButton mode="modal">
                    <button className="w-full text-center text-gray-700 hover:text-gray-900 font-medium py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold transition-colors">
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
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20"
          onClick={() => setShowSearch(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearch} className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Icon name="Search" className="w-6 h-6 text-gray-400" />
                <input
                  id="nav-search"
                  type="text"
                  placeholder="Search 410+ expert content blocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-lg border-none outline-none bg-transparent placeholder-gray-400"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowSearch(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <Icon name="X" className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div>
                  Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Enter</kbd> to search
                </div>
                <div>
                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Esc</kbd> to close
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}

