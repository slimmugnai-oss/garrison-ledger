'use client';

import { useState, useEffect } from 'react';

import Icon from '../ui/Icon';

export default function SavingsCounter() {
  const [totalSavings, setTotalSavings] = useState(0);
  const targetSavings = 1247892; // Estimated collective savings

  useEffect(() => {
    // Animate counter on mount
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = targetSavings / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetSavings) {
        setTotalSavings(targetSavings);
        clearInterval(timer);
      } else {
        setTotalSavings(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-12 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
          <Icon name="TrendingUp" className="h-6 w-6 sm:h-8 sm:w-8 text-white/80" />
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Collective Military Family Savings</h3>
        </div>
        
        <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-2">
          ${totalSavings.toLocaleString()}
        </div>
        
        <p className="text-white/90 text-sm sm:text-base md:text-lg px-4">
          Total saved by 500+ military families using Garrison Ledger
        </p>
        
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-3 sm:p-4">
            <div className="text-lg sm:text-xl md:text-2xl font-black text-white">$1.2K-$4.5K</div>
            <div className="text-xs text-white/90 mt-1">Avg PPM/DITY Profit</div>
          </div>
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-3 sm:p-4">
            <div className="text-lg sm:text-xl md:text-2xl font-black text-white">$2,400/yr</div>
            <div className="text-xs text-white/90 mt-1">Commissary Savings</div>
          </div>
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-3 sm:p-4">
            <div className="text-lg sm:text-xl md:text-2xl font-black text-white">$1,000+</div>
            <div className="text-xs text-white/90 mt-1">SDP Deployment</div>
          </div>
        </div>
      </div>
    </div>
  );
}

