'use client';

import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
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
    <header className="sticky top-0 z-50 bg-surface border-b border-default shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo/Brand */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-primary hover:text-navy-professional transition-colors flex items-center gap-2">
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
                    ? 'bg-navy-professional/10 text-navy-professional' 
                    : 'text-body hover:bg-surface-hover'
                }`}
              >
                Dashboard
              </Link>

              {/* Tools Mega Menu */}
              <div className="relative group">
                <button className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  isActivePath('/dashboard/tools')
                    ? 'bg-navy-professional/10 text-navy-professional' 
                    : 'text-body hover:bg-surface-hover'
                }`}>
                  Calculators
                  <Icon name="ChevronDown" className="h-4 w-4" />
                </button>
                
                {/* Dropdown */}
                <div className="absolute top-full left-0 mt-1 w-80 bg-surface rounded-lg shadow-xl border border-default py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="grid grid-cols-2 gap-1 p-2">
                    <Link href="/dashboard/tools/tsp-modeler" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-surface-hover transition-colors">
                      <Icon name="BarChart" className="h-5 w-5 text-navy-professional" />
                      <div>
                        <div className="font-semibold text-sm text-primary">TSP Modeler</div>
                        <div className="text-xs text-muted">Optimize returns</div>
                      </div>
                    </Link>
                    <Link href="/dashboard/tools/sdp-strategist" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-surface-hover transition-colors">
                      <Icon name="PiggyBank" className="h-5 w-5 text-success" />
                      <div>
                        <div className="font-semibold text-sm text-primary">SDP Strategist</div>
                        <div className="text-xs text-muted">10% guaranteed</div>
                      </div>
                    </Link>
                    <Link href="/dashboard/tools/pcs-planner" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-surface-hover transition-colors">
                      <Icon name="Truck" className="h-5 w-5 text-navy-professional" />
                      <div>
                        <div className="font-semibold text-sm text-primary">PCS Planner</div>
                        <div className="text-xs text-muted">Move budget</div>
                      </div>
                    </Link>
                    <Link href="/dashboard/tools/house-hacking" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-surface-hover transition-colors">
                      <Icon name="Home" className="h-5 w-5 text-navy-light" />
                      <div>
                        <div className="font-semibold text-sm text-primary">House Hacking</div>
                        <div className="text-xs text-muted">Build wealth</div>
                      </div>
                    </Link>
                    <Link href="/dashboard/tools/on-base-savings" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-surface-hover transition-colors">
                      <Icon name="ShoppingCart" className="h-5 w-5 text-warning" />
                      <div>
                        <div className="font-semibold text-sm text-primary">Base Savings</div>
                        <div className="text-xs text-muted">Save $1000s</div>
                      </div>
                    </Link>
                    <Link href="/dashboard/tools/salary-calculator" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-surface-hover transition-colors">
                      <Icon name="Briefcase" className="h-5 w-5 text-success" />
                      <div>
                        <div className="font-semibold text-sm text-primary">Career Analyzer</div>
                        <div className="text-xs text-muted">Compare offers</div>
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
                    ? 'bg-navy-professional/10 text-navy-professional' 
                    : 'text-body hover:bg-surface-hover'
                }`}
              >
                Intel Library
              </Link>

              {/* Resources Mega Menu */}
              <div className="relative group">
                <button className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  isActivePath('/pcs-hub') || isActivePath('/career-hub') || isActivePath('/deployment') || isActivePath('/base-guides')
                    ? 'bg-navy-professional/10 text-navy-professional' 
                    : 'text-body hover:bg-surface-hover'
                }`}>
                  Resources
                  <Icon name="ChevronDown" className="h-4 w-4" />
                </button>
                
                {/* Dropdown */}
                <div className="absolute top-full left-0 mt-1 w-72 bg-surface rounded-lg shadow-xl border border-default py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="p-2 space-y-1">
                    <a href="/pcs-hub" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-surface-hover transition-colors">
                      <Icon name="Truck" className="h-5 w-5 text-navy-professional" />
                      <div>
                        <div className="font-semibold text-sm text-primary">PCS Hub</div>
                        <div className="text-xs text-muted">Moving & relocation</div>
                      </div>
                    </a>
                    <a href="/career-hub" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-surface-hover transition-colors">
                      <Icon name="Briefcase" className="h-5 w-5 text-success" />
                      <div>
                        <div className="font-semibold text-sm text-primary">Career Hub</div>
                        <div className="text-xs text-muted">Advancement & transition</div>
                      </div>
                    </a>
                    <a href="/deployment" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-surface-hover transition-colors">
                      <Icon name="Shield" className="h-5 w-5 text-danger" />
                      <div>
                        <div className="font-semibold text-sm text-primary">Deployment Guide</div>
                        <div className="text-xs text-muted">Pre & post prep</div>
                      </div>
                    </a>
                    <a href="/base-guides" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-surface-hover transition-colors">
                      <Icon name="MapPin" className="h-5 w-5 text-navy-light" />
                      <div>
                        <div className="font-semibold text-sm text-primary">Base Guides</div>
                        <div className="text-xs text-muted">Installation info</div>
                      </div>
                    </a>
                    <a href="/dashboard/listening-post" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-surface-hover transition-colors">
                      <Icon name="Radio" className="h-5 w-5 text-info" />
                      <div>
                        <div className="font-semibold text-sm text-primary">Listening Post</div>
                        <div className="text-xs text-muted">Latest news</div>
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
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-muted hover:text-primary hover:bg-surface-hover rounded-lg transition-all"
                title="Search Library (Press /)"
              >
                <Icon name="Search" className="w-4 h-4" />
                <span className="text-sm font-medium">Search</span>
                <kbd className="hidden xl:inline-block px-2 py-0.5 text-xs bg-surface border border-default rounded">/</kbd>
              </button>

              {/* Upgrade CTA */}
              <Link 
                href="/dashboard/upgrade" 
                className="hidden lg:flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
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
                  <button className="text-body hover:text-primary font-medium transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="btn-primary">
                    Get Started
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>

            {/* Mobile menu button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-body hover:text-primary p-2"
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
          <div className="lg:hidden border-t border-default bg-surface pb-4">
            {/* Mobile Search */}
            <div className="px-4 py-3 border-b border-subtle">
              <form onSubmit={handleSearch} className="flex items-center gap-2 px-3 py-2 bg-surface-hover rounded-lg">
                <Icon name="Search" className="w-5 h-5 text-muted" />
                <input
                  type="text"
                  placeholder="Search Intel Library..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-base border-none outline-none bg-transparent placeholder-muted"
                />
              </form>
            </div>

            <nav className="px-4 py-3 space-y-1">
              <SignedIn>
                {/* Dashboard */}
                <Link 
                  href="/dashboard" 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                    pathname === '/dashboard' ? 'bg-navy-professional/10 text-navy-professional' : 'text-body hover:bg-surface-hover'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon name="LayoutDashboard" className="w-5 h-5" />
                  Dashboard
                </Link>

                {/* Calculators */}
                <div className="pt-2">
                  <div className="px-3 py-1 text-xs font-semibold text-muted uppercase tracking-wider">
                    Calculators
                  </div>
                  <Link href="/dashboard/tools/tsp-modeler" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-body hover:bg-surface-hover transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <Icon name="BarChart" className="w-5 h-5 text-navy-professional" />
                    <span className="font-medium">TSP Modeler</span>
                  </Link>
                  <Link href="/dashboard/tools/sdp-strategist" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-body hover:bg-surface-hover transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <Icon name="PiggyBank" className="w-5 h-5 text-success" />
                    <span className="font-medium">SDP Strategist</span>
                  </Link>
                  <Link href="/dashboard/tools/pcs-planner" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-body hover:bg-surface-hover transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <Icon name="Truck" className="w-5 h-5 text-navy-professional" />
                    <span className="font-medium">PCS Planner</span>
                  </Link>
                  <Link href="/dashboard/tools/house-hacking" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-body hover:bg-surface-hover transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <Icon name="Home" className="w-5 h-5 text-navy-light" />
                    <span className="font-medium">House Hacking</span>
                  </Link>
                </div>

                {/* Content */}
                <div className="pt-2">
                  <div className="px-3 py-1 text-xs font-semibold text-muted uppercase tracking-wider">
                    Content
                  </div>
                  <Link 
                    href="/dashboard/library" 
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                      isActivePath('/dashboard/library') ? 'bg-navy-professional/10 text-navy-professional' : 'text-body hover:bg-surface-hover'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon name="BookOpen" className="w-5 h-5" />
                    Intel Library
                  </Link>
                  <Link 
                    href="/dashboard/listening-post" 
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                      isActivePath('/dashboard/listening-post') ? 'bg-navy-professional/10 text-navy-professional' : 'text-body hover:bg-surface-hover'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon name="Radio" className="w-5 h-5" />
                    Listening Post
                  </Link>
                </div>

                {/* Resources */}
                <div className="pt-2">
                  <div className="px-3 py-1 text-xs font-semibold text-muted uppercase tracking-wider">
                    Resources
                  </div>
                  <a href="/pcs-hub" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-body hover:bg-surface-hover transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <Icon name="Truck" className="w-5 h-5 text-navy-professional" />
                    <span className="font-medium">PCS Hub</span>
                  </a>
                  <a href="/deployment" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-body hover:bg-surface-hover transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <Icon name="Shield" className="w-5 h-5 text-danger" />
                    <span className="font-medium">Deployment Guide</span>
                  </a>
                  <a href="/base-guides" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-body hover:bg-surface-hover transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <Icon name="MapPin" className="w-5 h-5 text-navy-light" />
                    <span className="font-medium">Base Guides</span>
                  </a>
                </div>

                {/* Upgrade CTA */}
                <div className="pt-4">
                  <Link 
                    href="/dashboard/upgrade" 
                    className="flex items-center justify-center gap-2 w-full gradient-primary text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon name="Star" className="w-5 h-5" />
                    Upgrade to Premium
                  </Link>
                </div>
              </SignedIn>

              <SignedOut>
                <div className="flex flex-col gap-2">
                  <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-body hover:bg-surface-hover transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <Icon name="Home" className="w-5 h-5" />
                    Home
                  </Link>
                  <div className="border-t border-subtle my-2" />
                  <SignInButton mode="modal">
                    <button className="w-full text-center text-body hover:text-primary font-medium py-2.5 border border-default rounded-lg hover:bg-surface-hover transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="w-full btn-primary py-2.5">
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

