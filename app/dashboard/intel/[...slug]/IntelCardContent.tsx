/**
 * INTEL CARD CONTENT - FIXED VERSION
 * Properly renders markdown with all formatting
 */

'use client';

export default function IntelCardContent({ content }: { content: string }) {
  // SIMPLE markdown processing that actually works
  const processMarkdown = (md: string): string => {
    let html = md;
    
    // Remove frontmatter
    html = html.replace(/^---[\s\S]*?---\s*/m, '');
    
    // Line breaks to spaces within paragraphs
    html = html.replace(/([^\n])\n([^\n#*-])/g, '$1 $2');
    
    // Step 2: Process BLUF FIRST (before bold/italic processing)
    html = html.replace(/\*\*BLUF:\*\*\s*([^\n]+)/g, 
      '<div class="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-600 rounded-r-xl p-6 my-8 shadow-lg"><div class="flex items-start gap-3"><div class="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-xl">!</div><div><p class="text-xs font-bold text-blue-900 uppercase tracking-widest mb-2">BOTTOM LINE UP FRONT</p><p class="text-lg text-gray-800 font-medium leading-relaxed">$1</p></div></div></div>');
    
    // Step 3: Headers (BEFORE bold processing)
    html = html.replace(/^# (.+)$/gm, '<h1 class="text-5xl font-black text-gray-900 mb-8 font-lora border-b-4 border-blue-600 pb-4">$1</h1>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-3xl font-bold text-gray-900 mt-12 mb-6 font-lora">$1</h2>');
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-2xl font-semibold text-gray-900 mt-8 mb-4 font-lora">$1</h3>');
    html = html.replace(/^#### (.+)$/gm, '<h4 class="text-xl font-semibold text-gray-800 mt-6 mb-3">$1</h4>');
    
    // Step 4: Custom components
    html = html.replace(/<Disclaimer[^>]*\/>/g, 
      '<div class="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 my-8 shadow-md"><div class="flex items-start gap-3"><svg class="w-8 h-8 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg><div><p class="font-bold text-yellow-900 text-base mb-2">⚠️ Disclaimer</p><p class="text-sm text-yellow-800">Educational information only - not financial advice.</p></div></div></div>');
    
    html = html.replace(/<DataRef[^>]*>/g, '<span class="inline-block px-4 py-2 bg-blue-100 text-blue-900 rounded-lg font-bold text-sm border-2 border-blue-300">📊 Live Data</span>');
    html = html.replace(/<RateBadge[^>]*>/g, '<div class="inline-block px-6 py-3 bg-green-100 text-green-900 rounded-xl font-bold text-lg my-3 border-2 border-green-400">💰 Official Rate</div>');
    html = html.replace(/<AsOf[^>]*\/>/g, '<span class="text-sm text-gray-600 italic">(Latest data)</span>');
    
    // Step 5: Bold and italic (AFTER headers and components)
    html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
    html = html.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em class="italic text-gray-700">$1</em>');
    
    // Step 6: Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 font-semibold underline decoration-2" target="_blank" rel="noopener noreferrer">$1 →</a>');
    
    // Step 7: Lists
    html = html.replace(/^- (.+)$/gm, '<li class="ml-6 mb-3 text-gray-700 text-base">$1</li>');
    html = html.replace(/^✅ (.+)$/gm, '<li class="ml-6 mb-3 text-gray-700 text-base">✅ $1</li>');
    html = html.replace(/^❌ (.+)$/gm, '<li class="ml-6 mb-3 text-gray-700 text-base">❌ $1</li>');
    
    // Wrap lists
    html = html.replace(/(<li class="ml-6[^>]*>.*<\/li>\s*)+/g, '<ul class="space-y-2 my-6 pl-4">$&</ul>');
    
    // Step 8: Paragraphs
    html = html.split('\n\n').map(block => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<')) return trimmed; // Already HTML
      return `<p class="text-gray-700 text-base leading-relaxed mb-6">${trimmed}</p>`;
    }).join('\n');
    
    return html;
  };

  const processedHTML = processMarkdown(content);

  return (
    <article className="max-w-none">
      <div className="bg-white rounded-2xl p-10 shadow-xl border border-gray-200">
        <div
          className="intel-card-content"
          dangerouslySetInnerHTML={{ __html: processedHTML }}
        />
      </div>
    </article>
  );
}
