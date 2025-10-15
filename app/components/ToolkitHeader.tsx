'use client';

import { useState } from 'react';
import Link from 'next/link';
import Icon from './ui/Icon';

interface ToolkitHeaderProps {
  title: string;
  description: string;
  currentPage?: string;
}

export default function ToolkitHeader({ title, description, currentPage }: ToolkitHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);

  const isActivePage = (page: string) => currentPage === page;

  return (
    <>
      {/* Modern Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors flex items-center">
                <Icon name="BarChart" className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Garrison Ledger</span>
                <span className="sm:hidden">GL</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              <Link href="/" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">
                Home
              </Link>
              
              {/* Tools Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => { if (closeTimeout) clearTimeout(closeTimeout); }}
                onMouseLeave={() => { const t = setTimeout(() => setMobileMenuOpen(false), 200); setCloseTimeout(t); }}
              >
                <button className="text-gray-700 hover:text-gray-900 transition-colors flex items-center font-medium">
                  Tools
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Resource Hubs */}
              <div className="relative">
                <button className={`transition-colors flex items-center font-medium ${
                  currentPage ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-gray-900'
                }`}>
                  Resource Hubs
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-3 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">
                    <Icon name="BookOpen" className="w-3 h-3 mr-1" />
                    Resource Hubs
                  </div>
                  <a href="/pcs-hub" className={`flex items-center px-4 py-2.5 transition-colors font-medium ${
                    isActivePage('pcs-hub') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}>
                    <Icon name="Truck" className="w-4 h-4 mr-3 text-blue-500" />
                    PCS Hub
                  </a>
                  <a href="/career-hub" className={`flex items-center px-4 py-2.5 transition-colors font-medium ${
                    isActivePage('career-hub') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}>
                    <Icon name="Briefcase" className="w-4 h-4 mr-3 text-green-500" />
                    Career Hub
                  </a>
                  <a href="/deployment" className={`flex items-center px-4 py-2.5 transition-colors font-medium ${
                    isActivePage('deployment') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}>
                    <Icon name="Shield" className="w-4 h-4 mr-3 text-red-500" />
                    Deployment Guide
                  </a>
                  <a href="/on-base-shopping" className={`flex items-center px-4 py-2.5 transition-colors font-medium ${
                    isActivePage('on-base-shopping') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}>
                    <Icon name="ShoppingCart" className="w-4 h-4 mr-3 text-orange-500" />
                    On-Base Shopping
                  </a>
                  <a href="/base-guides" className={`flex items-center px-4 py-2.5 transition-colors font-medium ${
                    isActivePage('base-guides') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}>
                    <Icon name="MapPin" className="w-4 h-4 mr-3 text-purple-500" />
                    Base Guides
                  </a>
                </div>
              </div>

              <a 
                href="https://app.familymedia.com/dashboard" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold transition-all hover:shadow-lg hover:scale-105"
              >
                Try Premium
              </a>
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
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 bg-white">
              <nav className="flex flex-col px-4 py-3 space-y-1">
                <Link href="/" className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  <Icon name="Home" className="w-5 h-5 mr-3" />
                  Home
                </Link>
                
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                    <Icon name="BookOpen" className="w-3 h-3 mr-1" />
                    Resource Hubs
                  </p>
                  <div className="space-y-1">
                    <a href="/pcs-hub" className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                      isActivePage('pcs-hub') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}>
                      <Icon name="Truck" className="w-4 h-4 mr-3 text-blue-500" />
                      PCS Hub
                    </a>
                    <a href="/career-hub" className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                      isActivePage('career-hub') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}>
                      <Icon name="Briefcase" className="w-4 h-4 mr-3 text-green-500" />
                      Career Hub
                    </a>
                    <a href="/deployment" className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                      isActivePage('deployment') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}>
                      <Icon name="Shield" className="w-4 h-4 mr-3 text-red-500" />
                      Deployment Guide
                    </a>
                    <a href="/on-base-shopping" className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                      isActivePage('on-base-shopping') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}>
                      <Icon name="ShoppingCart" className="w-4 h-4 mr-3 text-orange-500" />
                      On-Base Shopping
                    </a>
                    <a href="/base-guides" className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                      isActivePage('base-guides') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}>
                      <Icon name="MapPin" className="w-4 h-4 mr-3 text-purple-500" />
                      Base Guides
                    </a>
                  </div>
                </div>

                <a 
                  href="https://app.familymedia.com/dashboard" 
                  className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg font-semibold transition-all hover:shadow-lg text-center mt-2"
                >
                  Try Premium
                </a>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">{title}</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">{description}</p>
          </div>
        </div>
      </div>
    </>
  );
}
