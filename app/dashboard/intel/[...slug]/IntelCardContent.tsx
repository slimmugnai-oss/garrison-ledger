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
      // Components (placeholders)
      .replace(/<Disclaimer[^>]*\/>/g, '<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4"><p class="text-sm text-blue-800"><strong>Disclaimer:</strong> Educational information only - not financial advice.</p></div>')
      .replace(/<DataRef[^>]*>/g, '<span class="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">[Live Data]</span>')
      .replace(/<RateBadge[^>]*>/g, '<div class="inline-block bg-blue-100 text-blue-900 px-4 py-2 rounded font-semibold my-2">[Rate Badge]</div>')
      .replace(/<AsOf[^>]*\/>/g, '<span class="text-sm text-gray-600 italic">(As of latest data)</span>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p class="text-gray-700 leading-relaxed mb-4">')
      // Wrap in paragraph
      .replace(/^(?!<)/gm, '<p class="text-gray-700 leading-relaxed mb-4">');
  };

  const htmlContent = processMarkdown(content);

  return (
    <article className="prose prose-lg max-w-none bg-white rounded-lg p-8">
      <div
        className="mdx-content"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
      
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Simplified markdown view. Full MDX with live data components coming in v1.1.
        </p>
      </div>
    </article>
  );
}

