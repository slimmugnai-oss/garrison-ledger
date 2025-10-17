'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from './Icon';

interface Shortcut {
  keys: string[];
  description: string;
  action: () => void;
}

export default function KeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false);
  const router = useRouter();

  const shortcuts: Shortcut[] = [
    {
      keys: ['?'],
      description: 'Show keyboard shortcuts',
      action: () => setShowHelp(!showHelp)
    },
    {
      keys: ['g', 'd'],
      description: 'Go to Dashboard',
      action: () => router.push('/dashboard')
    },
    {
      keys: ['g', 't'],
      description: 'Go to Tools',
      action: () => router.push('/dashboard/tools/tsp-modeler')
    },
    {
      keys: ['g', 'p'],
      description: 'Go to Profile',
      action: () => router.push('/dashboard/profile')
    },
    {
      keys: ['g', 'c'],
      description: 'Go to Collaborate',
      action: () => router.push('/dashboard/collaborate')
    },
    {
      keys: ['Escape'],
      description: 'Close modals/help',
      action: () => setShowHelp(false)
    }
  ];

  useEffect(() => {
    let sequence: string[] = [];
    let timeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Handle single-key shortcuts
      if (e.key === '?') {
        e.preventDefault();
        setShowHelp(prev => !prev);
        return;
      }

      if (e.key === 'Escape') {
        setShowHelp(false);
        return;
      }

      // Handle multi-key shortcuts (e.g., 'g d')
      sequence.push(e.key.toLowerCase());
      
      // Clear sequence after 1 second
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        sequence = [];
      }, 1000);

      // Check for matching shortcuts
      shortcuts.forEach(shortcut => {
        if (shortcut.keys.length === sequence.length) {
          const matches = shortcut.keys.every((key, i) => key === sequence[i]);
          if (matches) {
            e.preventDefault();
            shortcut.action();
            sequence = [];
          }
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [router]);

  if (!showHelp) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={() => setShowHelp(false)}
    >
      <div 
        className="bg-surface rounded-xl border-2 border-default p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Icon name="Command" className="h-6 w-6 text-info" />
            <h2 className="text-2xl font-bold text-primary">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={() => setShowHelp(false)}
            className="text-muted hover:text-primary"
          >
            <Icon name="X" className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 px-4 bg-surface-hover rounded-lg"
            >
              <span className="text-body">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, i) => (
                  <span key={i}>
                    <kbd className="px-3 py-1 bg-gray-700 text-white text-sm font-mono rounded border border-gray-600">
                      {key === ' ' ? 'Space' : key.toUpperCase()}
                    </kbd>
                    {i < shortcut.keys.length - 1 && (
                      <span className="mx-1 text-muted">then</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-info-subtle rounded-lg border border-info">
          <p className="text-sm text-info">
            <Icon name="Info" className="h-4 w-4 inline mr-1" />
            Press <kbd className="px-2 py-1 bg-gray-700 text-white text-xs font-mono rounded">?</kbd> anytime to toggle this help panel
          </p>
        </div>
      </div>
    </div>
  );
}

