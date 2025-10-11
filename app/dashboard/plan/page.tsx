'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import DownloadGuideButton from '@/app/components/DownloadGuideButton';
import { useUser } from '@clerk/nextjs';

type AssessmentAnswers = Record<string, unknown>;
type TaskItem = { 
  slug: string; 
  title: string; 
  summary: string; 
  fullContent: string; 
  topics?: string[]; 
  priority?: 'high'|'medium'|'low';
  why?: string;
};

export default function ExecutiveBriefing() {
  const { user } = useUser();
  const [answers, setAnswers] = useState<AssessmentAnswers | null>(null);
  const [loading, setLoading] = useState(true);
  const [taskData, setTaskData] = useState<{ pcs:TaskItem[]; career:TaskItem[]; finance:TaskItem[]; deployment:TaskItem[] }>({ pcs:[], career:[], finance:[], deployment:[] });
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [stageSummary, setStageSummary] = useState<string>("");
  const [tools, setTools] = useState<{ tspHref: string; sdpHref: string; houseHref: string } | null>(null);

  const allTopics = useMemo(() => {
    const s = new Set<string>();
    for (const cat of ['pcs','career','finance','deployment'] as const) {
      for (const item of taskData[cat] || []) {
        for (const t of (item?.topics || []) as string[]) s.add(t);
      }
    }
    return Array.from(s).sort();
  }, [taskData]);

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]);
  };

  const clearTopics = () => setSelectedTopics([]);

  const topicMatches = (item: TaskItem) => selectedTopics.length === 0 || (item?.topics || []).some((t: string) => selectedTopics.includes(t));

  useEffect(() => {
    async function loadAssessment() {
      try {
        const res = await fetch('/api/assessment', { cache: 'no-store' });
        const data = await res.json();
        if (data.answers) setAnswers(data.answers);
      } catch (error) {
        console.error('Error loading assessment:', error);
      } finally {
        setLoading(false);
      }
    }
    loadAssessment();
  }, []);

  useEffect(() => {
    async function loadPlanBlocks() {
      try {
        const r = await fetch('/api/plan', { cache: 'no-store' });
        if (!r.ok) return;
        const j = await r.json();
        setTools(j.tools || null);
        setStageSummary(j.stageSummary || "");
        
        // Extract 'why' from sections and merge with taskData
        const withWhy = (cat: 'pcs'|'career'|'finance'|'deployment') => {
          const items = j[cat] || [];
          const sectionItems = (j.sections?.[cat] || []) as Array<{ slug: string; callouts?: { whyItMatters?: string[] } }>;
          return items.map((item: TaskItem) => {
            const sectionMatch = sectionItems.find((s) => s.slug === item.slug);
            return { ...item, why: sectionMatch?.callouts?.whyItMatters?.[0] || '' };
          });
        };
        
        setTaskData({ 
          pcs: withWhy('pcs'),
          career: withWhy('career'),
          finance: withWhy('finance'),
          deployment: withWhy('deployment'),
        });
      } catch (e) {
        console.error('Error loading plan:', e);
      }
    }
    loadPlanBlocks();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen" style={{ backgroundColor: '#FDFDFB' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading your Executive Briefing...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen" style={{ backgroundColor: '#FDFDFB' }}>
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="text-slate-300 text-sm mb-2 uppercase tracking-wider">Executive Briefing</div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
                  {(user?.firstName || 'Your')}&apos;s Military Financial Roadmap
                </h1>
                {stageSummary && <p className="text-xl text-slate-200">{stageSummary}</p>}
              </div>
              <div>
                <DownloadGuideButton />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {!answers && (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
              <div className="text-6xl mb-6">📋</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Assessment Required</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Complete the Readiness Assessment to generate your personalized Executive Briefing with curated content from our toolkit hubs.
              </p>
              <Link 
                href="/dashboard/assessment"
                className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-10 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
              >
                Take Assessment
              </Link>
            </div>
          )}

          {answers && (
            <>
              {/* Topic Filters */}
              {allTopics.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Filter by Topic</h3>
                    {selectedTopics.length > 0 && (
                      <button onClick={clearTopics} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Clear filters
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allTopics.map(t => {
                      const active = selectedTopics.includes(t);
                      return (
                        <button
                          key={t}
                          onClick={() => toggleTopic(t)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Content Sections - Magazine Style */}
              <div className="space-y-16">
                {taskData.pcs.filter(topicMatches).length > 0 && (
                  <ContentSection 
                    title="Your PCS Action Plan" 
                    icon="🧭" 
                    color="emerald"
                    items={taskData.pcs.filter(topicMatches)}
                    tools={tools}
                  />
                )}

                {taskData.career.filter(topicMatches).length > 0 && (
                  <ContentSection 
                    title="Your Career Development Roadmap" 
                    icon="💼" 
                    color="indigo"
                    items={taskData.career.filter(topicMatches)}
                    tools={tools}
                  />
                )}

                {taskData.finance.filter(topicMatches).length > 0 && (
                  <ContentSection 
                    title="Your Financial Wellness Checklist" 
                    icon="💰" 
                    color="amber"
                    items={taskData.finance.filter(topicMatches)}
                    tools={tools}
                  />
                )}

                {taskData.deployment.filter(topicMatches).length > 0 && (
                  <ContentSection 
                    title="Your Deployment Readiness Guide" 
                    icon="❤️" 
                    color="rose"
                    items={taskData.deployment.filter(topicMatches)}
                    tools={tools}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

type SectionProps = {
  title: string;
  icon: string;
  color: 'emerald'|'indigo'|'amber'|'rose';
  items: TaskItem[];
  tools: { tspHref: string; sdpHref: string; houseHref: string } | null;
};

function ContentSection({ title, icon, color, items }: SectionProps) {
  const colorClasses = {
    emerald: 'bg-emerald-600 border-emerald-200',
    indigo: 'bg-indigo-600 border-indigo-200',
    amber: 'bg-amber-600 border-amber-200',
    rose: 'bg-rose-600 border-rose-200',
  };

  return (
    <section className="scroll-mt-24">
      {/* Section Header */}
      <div className={`rounded-t-2xl border-t-8 ${colorClasses[color]} p-8 text-white shadow-lg`}>
        <div className="flex items-center gap-4">
          <div className="text-4xl">{icon}</div>
          <h2 className="text-3xl font-black">{title}</h2>
        </div>
      </div>

      {/* Content Cards */}
      <div className="bg-white rounded-b-2xl shadow-xl border-l border-r border-b border-gray-200 p-8 space-y-12">
        {items.map((item, idx) => (
          <ContentBlock key={item.slug} item={item} isLast={idx === items.length - 1} />
        ))}
      </div>
    </section>
  );
}

function ContentBlock({ item, isLast }: { item: TaskItem; isLast: boolean }) {
  const priorityBadge = item.priority === 'high' ? (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
      ⚡ Priority Action
    </span>
  ) : null;

  return (
    <article className={`${!isLast ? 'pb-12 border-b border-gray-200' : ''}`}>
      {/* Two-Column Layout */}
      <div className="grid lg:grid-cols-[1fr,320px] gap-8">
        {/* Main Content Column */}
        <div>
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="text-2xl font-bold text-gray-900 leading-tight">{item.title}</h3>
              {priorityBadge}
            </div>
            
            {item.topics && item.topics.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {item.topics.slice(0, 6).map((t) => (
                  <span key={t} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Rich HTML Content */}
          <div 
            className="prose prose-slate max-w-none prose-headings:font-bold prose-h3:text-xl prose-h3:text-gray-900 prose-h4:text-lg prose-h4:text-gray-800 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:my-2 prose-strong:text-gray-900 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:italic prose-blockquote:text-gray-700"
            dangerouslySetInnerHTML={{ __html: item.fullContent }}
          />
        </div>

        {/* Sidebar - Why It Matters */}
        <aside className="lg:sticky lg:top-24 self-start">
          {item.why && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 mb-6">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">?</span>
                </div>
                <h4 className="font-bold text-blue-900 text-lg">Why This Matters</h4>
              </div>
              <p className="text-blue-800 leading-relaxed">{item.why}</p>
            </div>
          )}

          {item.priority === 'high' && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-300 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <h4 className="font-bold text-amber-900 mb-2">Do This First</h4>
                  <p className="text-amber-800 text-sm leading-relaxed">
                    This is a high-priority action based on your current situation. Tackle this before moving to other items.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Contextual Tool CTA */}
          {tools && item.topics?.includes('tsp') && (
            <Link 
              href={tools.tspHref}
              className="block bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📈</span>
                <h5 className="font-bold text-gray-900 group-hover:text-blue-600">Related Tool</h5>
              </div>
              <p className="text-sm text-gray-600 mb-3">Model your TSP growth with our interactive calculator</p>
              <div className="text-blue-600 font-semibold text-sm">Open TSP Modeler →</div>
            </Link>
          )}
          
          {tools && item.topics?.includes('sdp') && (
            <Link 
              href={tools.sdpHref}
              className="block bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-green-500 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">💵</span>
                <h5 className="font-bold text-gray-900 group-hover:text-green-600">Related Tool</h5>
              </div>
              <p className="text-sm text-gray-600 mb-3">Plan your deployment savings strategy</p>
              <div className="text-green-600 font-semibold text-sm">Open SDP Strategist →</div>
            </Link>
          )}
          
          {tools && (item.topics?.includes('housing') || item.topics?.includes('va-loan')) && (
            <Link 
              href={tools.houseHref}
              className="block bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-amber-500 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🏡</span>
                <h5 className="font-bold text-gray-900 group-hover:text-amber-600">Related Tool</h5>
              </div>
              <p className="text-sm text-gray-600 mb-3">Analyze house-hacking opportunities</p>
              <div className="text-amber-600 font-semibold text-sm">Open House Calculator →</div>
            </Link>
          )}
        </aside>
      </div>
    </article>
  );
}
