'use client';

interface ShareButtonProps {
  contentId: string;
  title: string;
}

export default function ShareButton({ contentId, title }: ShareButtonProps) {
  const shareUrl = `${window.location.origin}/content/${contentId}`;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        // Use native share if available (mobile)
        await navigator.share({
          title: title,
          text: `Check out this content from Garrison Ledger: ${title}`,
          url: shareUrl,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }

      // Track the share (non-blocking)
      fetch('/api/content/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId,
          interactionType: 'share',
        }),
      }).catch(() => {
        // Analytics tracking failure - don't show to user
        if (process.env.NODE_ENV === 'development') {
          // Tracking failure - non-critical
        }
      });
    } catch (error) {
      // Share/copy failed - show user-friendly message
      const errorMessage = error instanceof Error ? error.message : 'Failed to share';
      alert(`Unable to share: ${errorMessage}. Please copy the URL manually.`);
      
      if (process.env.NODE_ENV === 'development') {
        // Share failed - non-critical
      }
    }
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleShare();
      }}
      className="px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 text-sm bg-surface-hover text-body border-2 border-subtle hover:border-default"
      title="Share this content"
    >
      <span>🔗</span>
      <span className="hidden sm:inline">Share</span>
    </button>
  );
}

