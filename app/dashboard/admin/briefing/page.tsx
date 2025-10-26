'use client';

import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

import Header from '@/app/components/Header';

type FeedItem = {
  id: string;
  source_id: string;
  url: string;
  title: string;
  summary: string | null;
  raw_html: string | null;
  tags: string[];
  published_at: string | null;
  status: string;
  created_at: string;
  notes: string | null;
};

export default function BriefingAdminPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('new');
  
  // Editor state
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editHTML, setEditHTML] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editDomain, setEditDomain] = useState<string>('finance');
  const [editDifficulty, setEditDifficulty] = useState<string>('intermediate');
  const [editSEOKeywords, setEditSEOKeywords] = useState<string[]>([]);
  const [promoting, setPromoting] = useState(false);
  const [curating, setCurating] = useState(false);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Load feed items
  const loadItems = async () => {
    setLoading(true);
    let query = supabase
      .from('feed_items')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus);
    }
    
    const { data } = await query;
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  // When item is selected, populate editor
  useEffect(() => {
    if (selectedItem) {
      setEditTitle(selectedItem.title);
      setEditSummary(selectedItem.summary || '');
      setEditHTML(selectedItem.raw_html || '');
      setEditTags(selectedItem.tags || []);
      // Reset AI-suggested fields
      setEditDomain('finance');
      setEditDifficulty('intermediate');
      setEditSEOKeywords([]);
    }
  }, [selectedItem]);

  // Promote to content_block
  const handlePromote = async () => {
    if (!selectedItem) return;
    
    setPromoting(true);
    
    try {
      // Generate slug from title
      const slug = editTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      // Extract text content from HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = editHTML;
      const textContent = tempDiv.textContent || tempDiv.innerText || '';
      const wordCount = textContent.split(/\s+/).length;
      
      // Use AI-provided domain or auto-detect from tags
      let domain = editDomain; // Use AI suggestion if available
      if (domain === 'finance') { // If still default, try auto-detect
        const tagString = editTags.join(' ').toLowerCase();
        if (tagString.includes('pcs') || tagString.includes('relocation')) domain = 'pcs';
        else if (tagString.includes('career') || tagString.includes('employment')) domain = 'career';
        else if (tagString.includes('deployment') || tagString.includes('combat')) domain = 'deployment';
        else if (tagString.includes('lifestyle') || tagString.includes('family')) domain = 'lifestyle';
      }
      
      // Use AI-provided difficulty or auto-detect
      let difficulty = editDifficulty; // Use AI suggestion if available
      if (difficulty === 'intermediate') { // If still default, try auto-detect
        difficulty = wordCount < 200 ? 'beginner' : wordCount > 400 ? 'advanced' : 'intermediate';
      }
      
      // Auto-detect audience (AI doesn't provide this yet)
      const tagString = editTags.join(' ').toLowerCase();
      const audience = ['military-member', 'military-spouse']; // Default to both
      if (tagString.includes('officer')) audience.push('officer');
      if (tagString.includes('spouse')) audience.push('military-spouse');
      if (tagString.includes('family') || tagString.includes('children')) audience.push('family');
      
      // Use AI-provided SEO keywords or generate from tags
      const seoKeywords = editSEOKeywords.length > 0 ? editSEOKeywords : editTags.slice(0, 5);
      
      // Insert into content_blocks with enhanced metadata
      const { error: insertError } = await supabase
        .from('content_blocks')
        .insert({
          slug,
          title: editTitle,
          summary: editSummary,
          html: editHTML,
          text_content: textContent,
          block_type: 'guide', // Default type
          tags: editTags,
          topics: editTags.slice(0, 3), // Use first 3 tags as topics
          source_page: selectedItem.source_id,
          est_read_min: Math.max(1, Math.ceil(wordCount / 200)), // 200 words per minute
          domain,
          difficulty_level: difficulty,
          target_audience: audience,
          seo_keywords: seoKeywords,
          content_rating: 3.0, // Default rating, can be adjusted later
          content_freshness_score: 100, // New content gets max freshness
          content_version: 1,
          last_reviewed_at: new Date().toISOString(),
          next_review_due: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
        });
      
      if (insertError) {
        alert(`Error promoting: ${insertError.message}`);
        setPromoting(false);
        return;
      }
      
      // Update feed_item status
      const { error: updateError } = await supabase
        .from('feed_items')
        .update({ status: 'promoted', promoted_slug: slug })
        .eq('id', selectedItem.id);
      
      if (updateError) {
      }
      
      alert(`✅ Promoted to content_blocks as "${slug}"`);
      
      // Reload items and clear selection
      await loadItems();
      setSelectedItem(null);
      
    } catch {
      alert('Error during promotion');
    }
    
    setPromoting(false);
  };

  // Update status (approve/reject)
  const updateStatus = async (status: 'approved' | 'rejected') => {
    if (!selectedItem) return;
    
    const { error } = await supabase
      .from('feed_items')
      .update({ status })
      .eq('id', selectedItem.id);
    
    if (!error) {
      await loadItems();
      setSelectedItem(null);
    }
  };

  // Auto-curate with Gemini AI
  const handleAutoCurate = async () => {
    if (!selectedItem) return;
    
    setCurating(true);
    
    try {
      const response = await fetch('/api/curate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedItem.title,
          summary: selectedItem.summary || '',
          source_url: selectedItem.url
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        alert(`AI curation failed: ${data.error || 'Unknown error'}`);
        setCurating(false);
        return;
      }
      
      // Populate editor with AI-curated content and metadata
      setEditHTML(data.html);
      setEditSummary(data.summary);
      setEditTags(data.tags);
      setEditDomain(data.domain || 'finance');
      setEditDifficulty(data.difficulty || 'intermediate');
      setEditSEOKeywords(data.seoKeywords || data.tags?.slice(0, 5) || []);
      
      alert('✨ Content curated by AI with smart metadata! Review and edit before promoting.');
      
    } catch {
      alert('Failed to curate content');
    }
    
    setCurating(false);
  };

  // Filtered items for display
  const filteredItems = items.filter(item =>
    searchTerm === '' ||
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.summary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-surface-hover">
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Intelligence Briefing Pipeline</h1>
            <p className="text-body">Curate RSS feed articles into atomic content blocks</p>
          </div>

          {/* Two-Panel Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT PANEL - Inbox */}
            <div className="lg:col-span-1 bg-surface rounded-xl border border-subtle shadow-sm">
              <div className="p-4 border-b border-subtle">
                <h2 className="text-lg font-bold text-primary mb-4">Inbox</h2>
                
                {/* Search */}
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-default rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                
                {/* Filter by Status */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-default rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="new">New ({items.filter(i => i.status === 'new').length})</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="promoted">Promoted</option>
                  <option value="all">All</option>
                </select>
              </div>
              
              {/* Item List */}
              <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
                {loading ? (
                  <div className="p-8 text-center text-muted">Loading...</div>
                ) : filteredItems.length === 0 ? (
                  <div className="p-8 text-center text-muted">
                    {searchTerm ? 'No matching items' : 'No items found'}
                  </div>
                ) : (
                  filteredItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        selectedItem?.id === item.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''
                      }`}
                    >
                      <div className="font-semibold text-sm text-primary line-clamp-2 mb-1">
                        {item.title}
                      </div>
                      <div className="text-xs text-muted mb-2">
                        {item.source_id} • {new Date(item.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs bg-surface-hover text-body px-2 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* RIGHT PANEL - Editor */}
            <div className="lg:col-span-2 bg-surface rounded-xl border border-subtle shadow-sm p-6">
              {!selectedItem ? (
                <div className="flex items-center justify-center h-96 text-muted">
                  ← Select an item from the inbox to review
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Header with Actions */}
                  <div className="flex items-start justify-between pb-4 border-b border-subtle">
                    <div>
                      <h2 className="text-2xl font-bold text-primary mb-1">Review Article</h2>
                      <a
                        href={selectedItem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:text-indigo-800 underline"
                      >
                        View original →
                      </a>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAutoCurate}
                        disabled={curating}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {curating ? '✨ Curating...' : '✨ Auto-Curate with Gemini'}
                      </button>
                      <button
                        onClick={() => updateStatus('approved')}
                        className="px-4 py-2 bg-success text-white rounded-lg text-sm font-semibold hover:bg-success transition-colors"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => updateStatus('rejected')}
                        className="px-4 py-2 bg-danger text-white rounded-lg text-sm font-semibold hover:bg-danger transition-colors"
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>

                  {/* Editable Fields */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-semibold text-body mb-2">Title</label>
                <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-body mb-2">Summary</label>
                    <textarea
                      value={editSummary}
                      onChange={(e) => setEditSummary(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-body mb-2">Content (HTML)</label>
                    <textarea
                      value={editHTML}
                      onChange={(e) => setEditHTML(e.target.value)}
                      rows={12}
                      className="w-full px-4 py-3 border border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="tags_commaseparated" className="block text-sm font-semibold text-body mb-2">Tags (comma-separated)</label>
                <input
                      type="text"
                      value={editTags.join(', ')}
                      onChange={(e) => setEditTags(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                      className="w-full px-4 py-3 border border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Metadata Controls */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-body mb-2">Domain</label>
                      <select
                        value={editDomain}
                        onChange={(e) => setEditDomain(e.target.value)}
                        className="w-full px-4 py-3 border border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="finance">Finance</option>
                        <option value="pcs">PCS</option>
                        <option value="career">Career</option>
                        <option value="deployment">Deployment</option>
                        <option value="lifestyle">Lifestyle</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-body mb-2">Difficulty</label>
                      <select
                        value={editDifficulty}
                        onChange={(e) => setEditDifficulty(e.target.value)}
                        className="w-full px-4 py-3 border border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="seo_keywords_commaseparated" className="block text-sm font-semibold text-body mb-2">SEO Keywords (comma-separated)</label>
                <input
                      type="text"
                      value={editSEOKeywords.join(', ')}
                      onChange={(e) => setEditSEOKeywords(e.target.value.split(',').map(k => k.trim()).filter(Boolean))}
                      placeholder="Auto-populated by AI or uses tags"
                      className="w-full px-4 py-3 border border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-muted mt-1">
                      ✨ Auto-populated when you use AI curation
                    </p>
                  </div>

                  {/* Preview */}
                  <div>
                    <label className="block text-sm font-semibold text-body mb-2">Preview</label>
                    <div
                      className="prose prose-sm max-w-none p-4 border border-subtle rounded-lg bg-surface-hover max-h-64 overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: editHTML }}
                    />
                  </div>

                  {/* Promote Button */}
                  <div className="pt-4 border-t border-subtle">
                    <button
                      onClick={handlePromote}
                      disabled={promoting || !editTitle || !editHTML}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:cursor-not-allowed"
                    >
                      {promoting ? 'Promoting...' : '🚀 Promote to Content Block'}
                    </button>
                    <p className="text-xs text-muted text-center mt-2">
                      This will create a new atomic content block and mark this item as promoted
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="pt-4 border-t border-subtle">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted">Source:</span>
                        <span className="ml-2 font-semibold text-primary">{selectedItem.source_id}</span>
                      </div>
                      <div>
                        <span className="text-muted">Published:</span>
                        <span className="ml-2 font-semibold text-primary">
                          {selectedItem.published_at
                            ? new Date(selectedItem.published_at).toLocaleDateString()
                            : 'Unknown'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted">Status:</span>
                        <span className={`ml-2 font-semibold ${
                          selectedItem.status === 'new' ? 'text-blue-600' :
                          selectedItem.status === 'approved' ? 'text-green-600' :
                          selectedItem.status === 'promoted' ? 'text-purple-600' :
                          'text-red-600'
                        }`}>
                          {selectedItem.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted">Ingested:</span>
                        <span className="ml-2 font-semibold text-primary">
                          {new Date(selectedItem.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-8 grid grid-cols-4 gap-4">
            <div className="bg-surface rounded-lg border border-subtle p-4 text-center">
              <div className="text-2xl font-bold text-info">{items.filter(i => i.status === 'new').length}</div>
              <div className="text-sm text-body">New</div>
            </div>
            <div className="bg-surface rounded-lg border border-subtle p-4 text-center">
              <div className="text-2xl font-bold text-success">{items.filter(i => i.status === 'approved').length}</div>
              <div className="text-sm text-body">Approved</div>
            </div>
            <div className="bg-surface rounded-lg border border-subtle p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{items.filter(i => i.status === 'promoted').length}</div>
              <div className="text-sm text-body">Promoted</div>
            </div>
            <div className="bg-surface rounded-lg border border-subtle p-4 text-center">
              <div className="text-2xl font-bold text-body">{items.length}</div>
              <div className="text-sm text-body">Total</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

