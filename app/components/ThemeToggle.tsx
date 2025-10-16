'use client';

import { useState, useEffect } from 'react';
import Icon from './ui/Icon';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true);
    
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    setIsDark(initialDark);
    
    // Apply theme to html element
    if (initialDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    
    // Update DOM
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
        <div className="w-5 h-5 bg-gray-300 dark:bg-slate-600 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors flex items-center justify-center group"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Icon name="Sun" className="h-5 w-5 text-amber-500 group-hover:text-amber-400 transition-colors" />
      ) : (
        <Icon name="Moon" className="h-5 w-5 text-slate-600 group-hover:text-slate-700 transition-colors" />
      )}
    </button>
  );
}

