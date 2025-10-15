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

      // Track the share
      await fetch('/api/content/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId,
          interactionType: 'share',
        }),
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleShare();
      }}
      className="px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 text-sm bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300"
      title="Share this content"
    >
      <span>🔗</span>
      <span className="hidden sm:inline">Share</span>
    </button>
  );
}

