'use client';

import { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import { createClient } from '@supabase/supabase-js';

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
  const [promoting, setPromoting] = useState(false);

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
  }, [filterStatus]);

  // When item is selected, populate editor
  useEffect(() => {
    if (selectedItem) {
      setEditTitle(selectedItem.title);
      setEditSummary(selectedItem.summary || '');
      setEditHTML(selectedItem.raw_html || '');
      setEditTags(selectedItem.tags || []);
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
      
      // Insert into content_blocks
      const { error: insertError } = await supabase
        .from('content_blocks')
        .insert({
          slug,
          title: editTitle,
          summary: editSummary,
          html: editHTML,
          type: 'article', // Default type, admin can change later
          tags: editTags,
          topics: editTags.slice(0, 3), // Use first 3 tags as topics
          source_page: selectedItem.source_id,
          est_read_min: Math.ceil(editHTML.length / 1000), // Rough estimate
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
        console.error('Error updating feed_item:', updateError);
      }
      
      alert(`✅ Promoted to content_blocks as "${slug}"`);
      
      // Reload items and clear selection
      await loadItems();
      setSelectedItem(null);
      
    } catch (error) {
      console.error('Promotion error:', error);
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

  // Filtered items for display
  const filteredItems = items.filter(item =>
    searchTerm === '' ||
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.summary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Intelligence Briefing Pipeline</h1>
            <p className="text-gray-600">Curate RSS feed articles into atomic content blocks</p>
          </div>

          {/* Two-Panel Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT PANEL - Inbox */}
            <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Inbox</h2>
                
                {/* Search */}
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                
                {/* Filter by Status */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : filteredItems.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
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
                      <div className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
                        {item.title}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        {item.source_id} • {new Date(item.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
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
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              {!selectedItem ? (
                <div className="flex items-center justify-center h-96 text-gray-400">
                  ← Select an item from the inbox to review
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Header with Actions */}
                  <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">Review Article</h2>
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
                        onClick={() => updateStatus('approved')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => updateStatus('rejected')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>

                  {/* Editable Fields */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Summary</label>
                    <textarea
                      value={editSummary}
                      onChange={(e) => setEditSummary(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Content (HTML)</label>
                    <textarea
                      value={editHTML}
                      onChange={(e) => setEditHTML(e.target.value)}
                      rows={12}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={editTags.join(', ')}
                      onChange={(e) => setEditTags(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Preview */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Preview</label>
                    <div
                      className="prose prose-sm max-w-none p-4 border border-gray-200 rounded-lg bg-gray-50 max-h-64 overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: editHTML }}
                    />
                  </div>

                  {/* Promote Button */}
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={handlePromote}
                      disabled={promoting || !editTitle || !editHTML}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:cursor-not-allowed"
                    >
                      {promoting ? 'Promoting...' : '🚀 Promote to Content Block'}
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      This will create a new atomic content block and mark this item as promoted
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Source:</span>
                        <span className="ml-2 font-semibold text-gray-900">{selectedItem.source_id}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Published:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {selectedItem.published_at
                            ? new Date(selectedItem.published_at).toLocaleDateString()
                            : 'Unknown'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
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
                        <span className="text-gray-500">Ingested:</span>
                        <span className="ml-2 font-semibold text-gray-900">
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
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{items.filter(i => i.status === 'new').length}</div>
              <div className="text-sm text-gray-600">New</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{items.filter(i => i.status === 'approved').length}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{items.filter(i => i.status === 'promoted').length}</div>
              <div className="text-sm text-gray-600">Promoted</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{items.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

