'use client';

import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useState } from 'react';
import Icon from './ui/Icon';

export default function Header() {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              <Icon name="BarChart3" className="h-5 w-5 inline mr-1" /> Garrison Ledger
            </Link>
          </div>

          {/* Navigation - Desktop - Clean organization */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-gray-900 transition-colors font-medium"
            >
              Home
            </Link>
            <SignedIn>
              <Link 
                href="/dashboard" 
                className="text-gray-700 hover:text-gray-900 transition-colors font-medium"
              >
                Dashboard
              </Link>
              <Link 
                href="/dashboard/assessment" 
                className="text-gray-700 hover:text-gray-900 transition-colors font-medium"
              >
                Assessment
              </Link>
              
              {/* Tools Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => { if (closeTimeout) clearTimeout(closeTimeout); setToolsOpen(true); }}
                onMouseLeave={() => { const t = setTimeout(() => setToolsOpen(false), 200); setCloseTimeout(t); }}
              >
                <button className="text-gray-700 hover:text-gray-900 transition-colors flex items-center font-medium">
                  Tools
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {toolsOpen && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50"
                    onMouseEnter={() => { if (closeTimeout) clearTimeout(closeTimeout); setToolsOpen(true); }}
                    onMouseLeave={() => { const t = setTimeout(() => setToolsOpen(false), 200); setCloseTimeout(t); }}
                  >
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Financial Tools</div>
                    <Link href="/dashboard/tools/tsp-modeler" className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                      TSP Modeler
                    </Link>
                    <Link href="/dashboard/tools/sdp-strategist" className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                      SDP Strategist
                    </Link>
                    <Link href="/dashboard/tools/house-hacking" className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                      House Hacking
                    </Link>
                    <div className="border-t border-gray-200 my-2"></div>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Planning Tools</div>
                    <Link href="/dashboard/tools/pcs-planner" className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                      PCS Financial Planner
                    </Link>
                    <Link href="/dashboard/tools/on-base-savings" className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                      Annual Savings Center
                    </Link>
                    <Link href="/dashboard/tools/salary-calculator" className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors font-medium">
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
                <button className="text-gray-700 hover:text-gray-900 transition-colors flex items-center font-medium">
                  Resources
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {resourcesOpen && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50"
                    onMouseEnter={() => { if (closeTimeout) clearTimeout(closeTimeout); setResourcesOpen(true); }}
                    onMouseLeave={() => { const t = setTimeout(() => setResourcesOpen(false), 200); setCloseTimeout(t); }}
                  >
                    <a href="/pcs-hub" className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                      PCS Hub
                    </a>
                    <a href="/career-hub" className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                      Career Hub
                    </a>
                    <a href="/deployment" className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                      Deployment Guide
                    </a>
                    <a href="/on-base-shopping" className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                      On-Base Shopping
                    </a>
                    <a href="/base-guides" className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                      Base Guides
                    </a>
                  </div>
                )}
              </div>

              <Link 
                href="/dashboard/library" 
                className="text-gray-700 hover:text-gray-900 transition-colors font-medium"
              >
                Intel Library
              </Link>
              <Link 
                href="/dashboard/directory" 
                className="text-gray-700 hover:text-gray-900 transition-colors font-medium"
              >
                Directory
              </Link>
              <Link 
                href="/dashboard/referrals" 
                className="text-gray-700 hover:text-gray-900 transition-colors font-medium"
              >
                Refer & Earn
              </Link>
              <Link 
                href="/dashboard/upgrade" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold transition-all hover:shadow-lg"
              >
                Upgrade
              </Link>
            </SignedIn>
          </nav>

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

          {/* Authentication Buttons - Desktop Only */}
          <div className="hidden lg:flex items-center space-x-4">
            <SignedOut>
              <div className="flex items-center space-x-2">
                <SignInButton mode="modal">
                  <button className="text-gray-700 hover:text-gray-900 transition-colors font-medium">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>
            
            <SignedIn>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
            </SignedIn>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-gray-900 transition-colors font-medium px-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <SignedIn>
                <Link 
                  href="/dashboard" 
                  className="text-gray-700 hover:text-gray-900 transition-colors font-medium px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/dashboard/assessment" 
                  className="text-gray-700 hover:text-gray-900 transition-colors font-medium px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Assessment
                </Link>
                <div className="px-2 py-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tools</p>
                  <div className="pl-3 space-y-2">
                    <Link href="/dashboard/tools/tsp-modeler" className="block text-gray-700 hover:text-gray-900 py-1" onClick={() => setMobileMenuOpen(false)}>
                      TSP Modeler
                    </Link>
                    <Link href="/dashboard/tools/sdp-strategist" className="block text-gray-700 hover:text-gray-900 py-1" onClick={() => setMobileMenuOpen(false)}>
                      SDP Strategist
                    </Link>
                    <Link href="/dashboard/tools/house-hacking" className="block text-gray-700 hover:text-gray-900 py-1" onClick={() => setMobileMenuOpen(false)}>
                      House Hacking
                    </Link>
                    <Link href="/dashboard/tools/pcs-planner" className="block text-gray-700 hover:text-gray-900 py-1" onClick={() => setMobileMenuOpen(false)}>
                      PCS Financial Planner
                    </Link>
                    <Link href="/dashboard/tools/on-base-savings" className="block text-gray-700 hover:text-gray-900 py-1" onClick={() => setMobileMenuOpen(false)}>
                      Annual Savings Center
                    </Link>
                    <Link href="/dashboard/tools/salary-calculator" className="block text-gray-700 hover:text-gray-900 py-1" onClick={() => setMobileMenuOpen(false)}>
                      Career Opportunity Analyzer
                    </Link>
                  </div>
                </div>
                <div className="px-2 py-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Resources</p>
                  <div className="pl-3 space-y-2">
                    <a href="/pcs-hub" className="block text-gray-700 hover:text-gray-900 py-1">
                      PCS Hub
                    </a>
                    <a href="/career-hub" className="block text-gray-700 hover:text-gray-900 py-1">
                      Career Hub
                    </a>
                    <a href="/deployment" className="block text-gray-700 hover:text-gray-900 py-1">
                      Deployment Guide
                    </a>
                    <a href="/on-base-shopping" className="block text-gray-700 hover:text-gray-900 py-1">
                      On-Base Shopping
                    </a>
                    <a href="/base-guides" className="block text-gray-700 hover:text-gray-900 py-1">
                      Base Guides
                    </a>
                  </div>
                </div>
                <Link 
                  href="/dashboard/library" 
                  className="text-gray-700 hover:text-gray-900 transition-colors font-medium px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Intel Library
                </Link>
                <Link 
                  href="/dashboard/directory" 
                  className="text-gray-700 hover:text-gray-900 transition-colors font-medium px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Directory
                </Link>
                <Link 
                  href="/dashboard/referrals" 
                  className="text-gray-700 hover:text-gray-900 transition-colors font-medium px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Refer & Earn
                </Link>
                <Link 
                  href="/dashboard/upgrade" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold transition-all hover:shadow-lg mx-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Upgrade
                </Link>
              </SignedIn>
              
              {/* Mobile Auth Buttons */}
              <div className="px-2 py-2 border-t border-gray-200 mt-2 pt-4">
                <SignedOut>
                  <div className="flex flex-col space-y-2">
                    <SignInButton mode="modal">
                      <button className="w-full text-center text-gray-700 hover:text-gray-900 transition-colors font-medium py-2 border border-gray-300 rounded-lg">
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors">
                        Sign Up
                      </button>
                    </SignUpButton>
                  </div>
                </SignedOut>
                
                <SignedIn>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Your Account</span>
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
