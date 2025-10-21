'use client';

import { useState, useEffect } from 'react';

interface RatingButtonProps {
  contentId: string;
  initialRating?: number;
  onRatingChange?: (rating: number) => void;
}

export default function RatingButton({ contentId, initialRating, onRatingChange }: RatingButtonProps) {
  const [userRating, setUserRating] = useState<number | null>(initialRating || null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserRating = async () => {
    try {
      const response = await fetch(`/api/ratings?contentId=${contentId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.rating) {
        setUserRating(data.rating.rating);
      }
    } catch (error) {
      // Failed to load existing rating - not critical, user can still rate
      if (process.env.NODE_ENV === 'development') {
        console.error('[RatingButton] Failed to fetch user rating:', error);
      }
    }
  };

  useEffect(() => {
    // Fetch user's existing rating
    fetchUserRating();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId]);

  const submitRating = async (rating: number) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId,
          rating,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to submit rating');
      }

      setUserRating(rating);
      onRatingChange?.(rating);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit rating';
      alert(message);
      
      if (process.env.NODE_ENV === 'development') {
        console.error('[RatingButton] Rating submission failed:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const displayRating = hoverRating || userRating || 0;

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => submitRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(null)}
            disabled={isLoading}
            className={`text-2xl transition-all ${
              star <= displayRating ? 'text-yellow-400' : 'text-gray-300'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'}`}
            title={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
      {userRating && (
        <span className="text-xs text-body font-medium">
          Your rating: {userRating}/5
        </span>
      )}
    </div>
  );
}

