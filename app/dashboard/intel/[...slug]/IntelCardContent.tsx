/**
 * INTEL CARD CONTENT (Client Component)
 * 
 * Renders MDX content with proper styling and custom components
 */

'use client';

import { useMDXComponents } from '@/lib/content/mdx-components';
import { useEffect, useState } from 'react';

export default function IntelCardContent({ content }: { content: string }) {
  const [processedContent, setProcessedContent] = useState<string>('');

  useEffect(() => {
    // Enhanced markdown processing with better formatting
    const processMarkdown = (md: string): string => {
      return md
        .replace(/---[\s\S]*?---\s*/, '') // Remove frontmatter
        
        // BLUF (special formatting)
        .replace(/\*\*BLUF:\*\*\s*(.+?)(?=\n\n|$)/gs, 
          '<div class="bg-blue-50 border-l-4 border-blue-600 rounded-r-lg p-6 my-8 shadow-sm"><div class="flex items-start gap-3"><svg class="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg><div><p class="text-xs font-bold text-blue-900 uppercase tracking-wide mb-2">BOTTOM LINE UP FRONT</p><p class="text-base text-gray-800 leading-relaxed">$1</p></div></div></div>')
        
        // Headers with better styling
        .replace(/^# (.+)$/gm, '<h1 class="text-4xl font-bold text-gray-900 mb-6 font-lora border-b-2 border-gray-200 pb-3">$1</h1>')
        .replace(/^## (.+)$/gm, '<h2 class="text-3xl font-semibold text-gray-900 mt-10 mb-5 font-lora">$1</h2>')
        .replace(/^### (.+)$/gm, '<h3 class="text-2xl font-semibold text-gray-900 mt-8 mb-4 font-lora">$1</h3>')
        .replace(/^#### (.+)$/gm, '<h4 class="text-xl font-semibold text-gray-900 mt-6 mb-3">$1</h4>')
        
        // Custom components with beautiful designs
        .replace(/<Disclaimer\s+kind="([^"]+)"(?:\s+compact)?\s*\/?>/g, 
          '<div class="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-6 my-8 shadow-md"><div class="flex items-start gap-4"><svg class="w-8 h-8 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg><div><p class="font-bold text-yellow-900 text-lg mb-2">⚠️ Important Disclaimer</p><p class="text-sm text-yellow-800 leading-relaxed">This is educational information only and should not be considered financial, legal, or tax advice. Consult appropriate professionals for your specific situation.</p></div></div></div>')
        
        .replace(/<DataRef[^>]*>/g, 
          '<span class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-900 rounded-full font-bold text-sm shadow-sm border border-blue-200"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/></svg>📊 Live Data</span>')
        
        .replace(/<RateBadge[^>]*>/g, 
          '<div class="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-100 text-green-900 rounded-xl font-bold text-base my-4 shadow-md border-2 border-green-300"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/></svg>💰 Official Rate</div>')
        
        .replace(/<AsOf\s+source="([^"]+)"\s*\/?>/g, 
          '<div class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium mt-3 border border-gray-300"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>🕒 Last verified: Latest data</div>')
        
        // Bold and italic
        .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em class="italic text-gray-700">$1</em>')
        
        // Links with better styling
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, 
          '<a href="$2" class="text-blue-600 hover:text-blue-700 font-semibold underline decoration-2 underline-offset-2 hover:decoration-blue-700 transition-colors" target="_blank" rel="noopener noreferrer">$1 →</a>')
        
        // Lists with better spacing
        .replace(/^- (.+)$/gm, '<li class="ml-6 mb-2 text-gray-700 leading-relaxed">• $1</li>')
        .replace(/^\d+\. (.+)$/gm, '<li class="ml-6 mb-2 text-gray-700 leading-relaxed">$1</li>')
        
        // Horizontal rules
        .replace(/^---$/gm, '<hr class="border-gray-300 my-8" />')
        
        // Paragraphs with better spacing
        .replace(/\n\n/g, '</p><p class="text-gray-700 leading-relaxed mb-6 text-base">')
        .replace(/^(?!<)/gm, '<p class="text-gray-700 leading-relaxed mb-6 text-base">');
    };

    setProcessedContent(processMarkdown(content));
  }, [content]);

  return (
    <article className="prose prose-lg max-w-none bg-white rounded-xl p-8 shadow-sm border border-gray-200">
      <div
        className="mdx-content"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    </article>
  );
}

