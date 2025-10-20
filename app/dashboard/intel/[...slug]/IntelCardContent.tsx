/**
 * INTEL CARD CONTENT (Client Component)
 * 
 * Renders markdown content with proper styling
 */

'use client';

export default function IntelCardContent({ content }: { content: string }) {
  // Process markdown to HTML
  const processMarkdown = (md: string): string => {
    return md
      .replace(/---[\s\S]*?---\s*/, '') // Remove frontmatter
      // Headers
      .replace(/^# (.+)$/gm, '<h1 class="text-4xl font-bold text-gray-900 mb-6 font-lora">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4 font-lora">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold text-gray-900 mt-6 mb-3 font-lora">$1</h3>')
      // BLUF
      .replace(/\*\*BLUF:\*\*\s*(.+?)(?=\n|$)/g, '<div class="bg-blue-50 border-l-4 border-blue-600 p-4 my-6"><p class="text-sm font-semibold text-blue-900 mb-1">BOTTOM LINE UP FRONT:</p><p class="text-gray-800">$1</p></div>')
      // Bold and italic
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
      // Lists
      .replace(/^- (.+)$/gm, '<li class="ml-4 text-gray-700">$1</li>')
      .replace(/^✅ (.+)$/gm, '<li class="ml-4 text-gray-700">✅ $1</li>')
      .replace(/^❌ (.+)$/gm, '<li class="ml-4 text-gray-700">❌ $1</li>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
      // Components (enhanced rendering)
      .replace(/<Disclaimer\s+kind="([^"]+)"\s*\/?>/g, '<div class="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-5 my-6"><div class="flex items-start gap-3"><svg class="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg><div><p class="font-semibold text-yellow-900 mb-1">Disclaimer</p><p class="text-sm text-yellow-800">This is educational information only and should not be considered financial, legal, or tax advice. Consult appropriate professionals for your specific situation.</p></div></div></div>')
      .replace(/<DataRef[^>]*>/g, '<span class="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-900 rounded-lg font-semibold text-sm"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/></svg>Live Data</span>')
      .replace(/<RateBadge[^>]*>/g, '<div class="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-900 rounded-lg font-bold my-3"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/></svg>Official Rate</div>')
      .replace(/<AsOf\s+source="([^"]+)"\s*\/?>/g, '<div class="inline-flex items-center gap-1.5 text-sm text-gray-600 italic mt-2"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>Last verified: Latest data</div>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p class="text-gray-700 leading-relaxed mb-4">')
      // Wrap in paragraph
      .replace(/^(?!<)/gm, '<p class="text-gray-700 leading-relaxed mb-4">');
  };

  const htmlContent = processMarkdown(content);

  return (
    <article className="prose prose-lg max-w-none">
      <div
        className="mdx-content"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </article>
  );
}

