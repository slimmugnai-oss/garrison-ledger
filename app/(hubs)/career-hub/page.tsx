'use client';

import { useEffect } from 'react';

export default function Page() {
  useEffect(() => {
    // Adjust iframe height to content
    const iframe = document.getElementById('hub-content');
    if (iframe) {
      iframe.onload = () => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            iframe.style.height = iframeDoc.documentElement.scrollHeight + 'px';
          }
        } catch (e) {
          // Cross-origin restriction, use default height
          iframe.style.height = '100vh';
        }
      };
    }
  }, []);

  return (
    <iframe 
      id="hub-content"
      src="/hubs/career-hub.html"
      className="w-full border-0"
      style={{ minHeight: '100vh' }}
      title="Career Hub"
    />
  );
}
