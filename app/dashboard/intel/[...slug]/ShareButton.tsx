'use client';

export default function ShareButton({ title }: { title: string }) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title,
        text: `Check out this Intel Card: ${title}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <button
      onClick={handleShare}
      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm"
    >
      Share
    </button>
  );
}
