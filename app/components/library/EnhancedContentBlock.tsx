'use client';

import { useState } from 'react';
import Icon from '../ui/Icon';
import BookmarkButton from './BookmarkButton';
import ShareButton from './ShareButton';
import RatingButton from './RatingButton';

interface ContentBlock {
  id: string;
  title: string;
  summary: string | null;
  html: string;
  domain: string;
  difficulty_level: string;
  target_audience: string[];
  content_rating: number;
  content_freshness_score: number;
  est_read_min: number;
  tags: string[];
  seo_keywords: string[];
  relevance_score?: number;
  trend_score?: number;
  total_views?: number;
  type?: string;
}

interface EnhancedContentBlockProps {
  block: ContentBlock;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onActionClick?: (action: string, data?: any) => void;
}

export default function EnhancedContentBlock({ 
  block, 
  isExpanded, 
  onToggleExpand,
  onActionClick 
}: EnhancedContentBlockProps) {
  const [showActionItems, setShowActionItems] = useState(false);

  // Format content with enhanced styling
  const formatContent = (html: string) => {
    let formatted = html;

    // Fix broken markdown tables
    formatted = formatted.replace(
      /(\| [^|]+\| [^|]+\| [^|]+\|)\s*(\| :---- \| :---- \| :---- \|)\s*(\| [^|]+\| [^|]+\| [^|]+\|)/g,
      (match, header, separator, firstRow) => {
        return `${header}\n${separator}\n${firstRow}`;
      }
    );

    // Fix superscript references
    formatted = formatted.replace(
      /([.!?])(\d{1,2})(?![^<]*<\/sup>)(?=\s|$)/g,
      (match, punctuation, number) => {
        return `${punctuation}<sup class="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded">${number}</sup>`;
      }
    );

    // Convert markdown tables to proper HTML
    formatted = convertMarkdownTableToHTML(formatted);

    return formatted;
  };

  const convertMarkdownTableToHTML = (content: string) => {
    const tableRegex = /^\|(.+)\|$/gm;
    const lines = content.split('\n');
    let inTable = false;
    let tableRows: string[] = [];
    const result: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.match(/^\|.*\|$/)) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        tableRows.push(line);
      } else {
      if (inTable && tableRows.length > 0) {
        result.push(renderTable(tableRows));
        tableRows = [];
        inTable = false;
      }
        result.push(line);
      }
    }

    // Handle table at end of content
    if (inTable && tableRows.length > 0) {
      result.push(renderTable(tableRows));
    }

    return result.join('\n');
  };

  const renderTable = (rows: string[]) => {
    const headerRow = rows[0];
    const separatorRow = rows[1];
    const dataRows = rows.slice(2);

    const headers = headerRow.split('|').slice(1, -1).map(h => h.trim());
    const data = dataRows.map(row => 
      row.split('|').slice(1, -1).map(cell => cell.trim())
    );

    return `
      <div class="overflow-x-auto my-6">
        <table class="min-w-full border border-gray-200 rounded-lg">
          <thead class="bg-gray-50">
            <tr>
              ${headers.map(header => 
                `<th class="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">${header}</th>`
              ).join('')}
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            ${data.map(row => 
              `<tr class="hover:bg-gray-50">
                ${row.map(cell => 
                  `<td class="px-4 py-3 text-sm text-gray-700">${cell}</td>`
                ).join('')}
              </tr>`
            ).join('')}
          </tbody>
        </table>
      </div>
    `;
  };

  const getDomainColor = (domain: string) => {
    const colors = {
      finance: 'bg-blue-100 text-blue-700 border-blue-200',
      career: 'bg-green-100 text-green-700 border-green-200',
      pcs: 'bg-purple-100 text-purple-700 border-purple-200',
      deployment: 'bg-orange-100 text-orange-700 border-orange-200',
      retirement: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      benefits: 'bg-pink-100 text-pink-700 border-pink-200'
    };
    return colors[domain as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-700 border-green-200',
      intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      advanced: 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const renderContentRating = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'text-yellow-400' : 'text-gray-300'}>
          ⭐
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1">
        {stars}
        <span className="text-xs text-gray-600 ml-1">({rating}/5)</span>
      </span>
    );
  };

  const extractActionItems = (html: string) => {
    // Extract action items from content
    const actionKeywords = [
      'action item', 'next step', 'to do', 'checklist', 'apply now',
      'calculate', 'compare', 'review', 'update', 'contact', 'file',
      'submit', 'register', 'enroll', 'plan', 'budget'
    ];

    const sentences = html.split(/[.!?]+/);
    return sentences.filter(sentence => 
      actionKeywords.some(keyword => 
        sentence.toLowerCase().includes(keyword)
      )
    ).slice(0, 3); // Limit to 3 action items
  };

  const actionItems = extractActionItems(block.html);

  return (
    <div className="bg-surface border border-subtle rounded-lg hover:shadow-lg transition-all">
      {/* Header */}
      <button
        onClick={onToggleExpand}
        className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-lg"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h3 className="text-xl font-bold text-primary">{block.title}</h3>
              {block.est_read_min > 0 && (
                <span className="text-xs bg-surface-hover text-body px-2 py-1 rounded-full font-medium">
                  {block.est_read_min} min read
                </span>
              )}
              {block.relevance_score && (
                <span className="text-xs bg-info-subtle text-info px-2 py-1 rounded-full font-bold">
                  {(block.relevance_score * 10).toFixed(0)}% match
                </span>
              )}
              {block.trend_score && (
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-bold">
                  🔥 Trending
                </span>
              )}
              {block.type && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold">
                  {block.type}
                </span>
              )}
            </div>
            
            {block.summary && (
              <p className="text-body mb-3 line-clamp-2">{block.summary}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`px-2 py-1 rounded text-xs font-semibold capitalize border ${getDomainColor(block.domain)}`}>
                {block.domain}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-semibold capitalize border ${getDifficultyColor(block.difficulty_level)}`}>
                {block.difficulty_level}
              </span>
              {block.content_rating > 0 && renderContentRating(block.content_rating)}
              {block.content_freshness_score >= 90 && (
                <span className="text-xs bg-success-subtle text-success px-2 py-1 rounded-full font-medium">
                  ✨ Fresh
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <BookmarkButton contentId={block.id} />
              <ShareButton contentId={block.id} title={block.title} />
              <RatingButton contentId={block.id} initialRating={block.content_rating} />
              {actionItems.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActionItems(!showActionItems);
                  }}
                  className="px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 text-sm bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-100"
                >
                  <span>📋</span>
                  <span className="hidden sm:inline">Action Items</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <Icon 
              name={isExpanded ? "ChevronUp" : "ChevronDown"} 
              className="w-6 h-6 text-gray-400 transition-transform"
            />
          </div>
        </div>
      </button>

      {/* Action Items Preview */}
      {showActionItems && !isExpanded && actionItems.length > 0 && (
        <div className="px-6 pb-4 border-t border-subtle">
          <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
            <span>📋</span> Key Action Items
          </h4>
          <ul className="space-y-1">
            {actionItems.map((item, index) => (
              <li key={index} className="text-sm text-body flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>{item.trim()}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={onToggleExpand}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View full content →
          </button>
        </div>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-subtle">
          <div
            className="prose prose-sm max-w-none mt-6 text-body"
            dangerouslySetInnerHTML={{ __html: formatContent(block.html) }}
          />
          
          {/* Enhanced Action Items */}
          {actionItems.length > 0 && (
            <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
                <span>📋</span> Action Items
              </h4>
              <ul className="space-y-2">
                {actionItems.map((item, index) => (
                  <li key={index} className="text-sm text-body flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{item.trim()}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => onActionClick?.('calculate', { type: 'life-insurance' })}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Use Life Insurance Calculator
                </button>
                <button
                  onClick={() => onActionClick?.('compare', { type: 'insurance-options' })}
                  className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                >
                  Compare Options
                </button>
              </div>
            </div>
          )}

          {/* Related Tools */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
              <span>🔗</span> Related Tools
            </h4>
            <div className="flex flex-wrap gap-2">
              {block.domain === 'finance' && (
                <>
                  <button
                    onClick={() => onActionClick?.('navigate', { path: '/dashboard/tools/tsp-modeler' })}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    TSP Calculator
                  </button>
                  <button
                    onClick={() => onActionClick?.('navigate', { path: '/dashboard/tools/sdp-strategist' })}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    SDP Strategist
                  </button>
                </>
              )}
              {block.domain === 'pcs' && (
                <button
                  onClick={() => onActionClick?.('navigate', { path: '/dashboard/tools/pcs-planner' })}
                  className="px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors"
                >
                  PCS Planner
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
