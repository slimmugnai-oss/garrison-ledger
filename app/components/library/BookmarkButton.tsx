'use client';

import { useState, useEffect } from 'react';

interface BookmarkButtonProps {
  contentId: string;
  onBookmarkChange?: (isBookmarked: boolean) => void;
}

export default function BookmarkButton({ contentId, onBookmarkChange }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if already bookmarked
    checkBookmarkStatus();
  }, [contentId]);

  const checkBookmarkStatus = async () => {
    try {
      const response = await fetch('/api/bookmarks');
      if (response.ok) {
        const data = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isCurrentlyBookmarked = data.bookmarks?.some((b: any) => b.content_id === contentId);
        setIsBookmarked(isCurrentlyBookmarked || false);
      }
    } catch {
      setIsBookmarked(false);
    }
  };

  const toggleBookmark = async () => {
    setIsLoading(true);

    try {
      if (isBookmarked) {
        // Remove bookmark
        const response = await fetch(`/api/bookmarks?contentId=${contentId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setIsBookmarked(false);
          onBookmarkChange?.(false);
        }
      } else {
        // Add bookmark
        const response = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ contentId }),
        });

        if (response.ok) {
          setIsBookmarked(true);
          onBookmarkChange?.(true);
        }
      }
    } catch {
      alert('Failed to update bookmark');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleBookmark();
      }}
      disabled={isLoading}
      className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 text-sm ${
        isBookmarked
          ? 'bg-blue-100 text-blue-700 border-2 border-blue-300 hover:bg-blue-200'
          : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isBookmarked ? 'Remove bookmark' : 'Bookmark this content'}
    >
      <span>{isBookmarked ? '🔖' : '📌'}</span>
      <span className="hidden sm:inline">{isBookmarked ? 'Saved' : 'Save'}</span>
    </button>
  );
}

