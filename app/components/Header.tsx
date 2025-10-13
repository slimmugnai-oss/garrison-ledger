'use client';

import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const handleMouseEnter = () => {
    if (closeTimeout) clearTimeout(closeTimeout);
    setResourcesOpen(true);
  };
  
  const handleMouseLeave = () => {
    const timeout = setTimeout(() => setResourcesOpen(false), 200);
    setCloseTimeout(timeout);
  };
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              📊 Garrison Ledger
            </Link>
          </div>

          {/* Navigation - Desktop - Updated with all tools */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              Home
            </Link>
            <SignedIn>
              <Link 
                href="/dashboard" 
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                href="/dashboard/upgrade" 
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Upgrade
              </Link>
              <Link 
                href="/dashboard/assessment" 
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Assessment
              </Link>
              <Link 
                href="/dashboard/tools/tsp-modeler" 
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                TSP Tool
              </Link>
              <Link 
                href="/dashboard/tools/house-hacking" 
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                House Tool
              </Link>
              <Link 
                href="/dashboard/tools/sdp-strategist" 
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                SDP Tool
              </Link>
              <Link 
                href="/dashboard/directory" 
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Directory
              </Link>
              {/* Resources Dropdown */}
              <div 
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button className="text-gray-700 hover:text-gray-900 transition-colors flex items-center">
                  Resources
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {resourcesOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <a href="https://familymedia.com/career-hub" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors" target="_blank" rel="noopener noreferrer">
                      Career Hub
                    </a>
                    <a href="https://familymedia.com/pcs-hub" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors" target="_blank" rel="noopener noreferrer">
                      PCS Hub
                    </a>
                    <a href="https://familymedia.com/base-guides" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors" target="_blank" rel="noopener noreferrer">
                      Base Guides
                    </a>
                    <a href="https://familymedia.com/on-base-shopping" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors" target="_blank" rel="noopener noreferrer">
                      On-Base Shopping
                    </a>
                    <a href="https://familymedia.com/deployment" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors" target="_blank" rel="noopener noreferrer">
                      Deployment Guide
                    </a>
                  </div>
                )}
              </div>
            </SignedIn>
          </nav>

          {/* Authentication Buttons */}
          <div className="flex items-center space-x-4">
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

          {/* Mobile menu button */}
          <div className="md:hidden">
            <SignedOut>
              <div className="flex items-center space-x-2">
                <SignInButton mode="modal">
                  <button className="text-gray-700 hover:text-gray-900 transition-colors text-sm">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm transition-colors">
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
                    avatarBox: "w-7 h-7"
                  }
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
}
