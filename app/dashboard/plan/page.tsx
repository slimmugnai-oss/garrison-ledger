'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import DownloadGuideButton from '@/app/components/DownloadGuideButton';
import TaskCard from '@/app/components/ui/TaskCard';
import { useUser } from '@clerk/nextjs';

type AssessmentAnswers = Record<string, unknown>;

type TaskItem = { slug: string; title: string; summary: string; fullContent: string; topics?: string[]; priority?: 'high'|'medium'|'low' };
type PlanRenderNode = {
  id: string;
  title: string;
  html: string;
  blockType: 'section'|'checklist'|'faq'|'table'|'tip';
  source: string;
  slug: string;
  callouts: {
    whyItMatters?: string[];
    doThisNow?: { id:string; text:string }[];
    estImpact?: { label:string; value:string }[];
  };
};

export default function PlanPage() {
  const { user } = useUser();
  const [answers, setAnswers] = useState<AssessmentAnswers | null>(null);
  const [loading, setLoading] = useState(true);
  const [taskStatuses, setTaskStatuses] = useState<Record<string,'incomplete'|'complete'>>({});
  const [taskData, setTaskData] = useState<{ pcs:TaskItem[]; career:TaskItem[]; finance:TaskItem[]; deployment:TaskItem[] }>({ pcs:[], career:[], finance:[], deployment:[] });
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [sections, setSections] = useState<Record<'pcs'|'career'|'finance'|'deployment', PlanRenderNode[]>>({ pcs: [], career: [], finance: [], deployment: [] });
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
        
        if (data.answers) {
          setAnswers(data.answers);
          
          // Tags/resources deprecated in V2.1 layout
        }
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
        if (!r.ok) {
          console.error('Plan API failed:', r.status, await r.text());
          return;
        }
        const j = await r.json();
        console.log('Plan API response:', j);
        if (j.sections) setSections(j.sections as Record<'pcs'|'career'|'finance'|'deployment', PlanRenderNode[]>);
        setTools(j.tools || null);
        setStageSummary(j.stageSummary || "");
        setTaskData({ pcs: j.pcs || [], career: j.career || [], finance: j.finance || [], deployment: j.deployment || [] });
        console.log('TaskData set:', { pcs: j.pcs?.length, career: j.career?.length, finance: j.finance?.length, deployment: j.deployment?.length });
      } catch (e) {
        console.error('Error loading plan:', e);
      }
    }
    loadPlanBlocks();
  }, []);

  useEffect(() => {
    async function loadStatuses() {
      try {
        const r = await fetch('/api/task-status', { cache: 'no-store' });
        if (!r.ok) {
          console.warn('Task status endpoint failed, continuing without saved statuses');
          return;
        }
        const j = await r.json();
        setTaskStatuses(j.statuses || {});
      } catch (err) {
        console.warn('Error loading task statuses:', err);
      }
    }
    loadStatuses();
  }, []);

  // Deep links to tools from facts
  const personal = (answers as { personal?: { age?: number } })?.personal;
  const timeline = (answers as { timeline?: { sdpAmount?: number } })?.timeline;
  const housing = (answers as { housing?: { bahAmount?: number; houseHackingInterest?: boolean } })?.housing;
  const financial = (answers as { financial?: { tspBalance?: number; tspContribution?: number } })?.financial;

  const age = personal?.age ?? 30;
  const tspBalance = financial?.tspBalance ?? 50000;
  const tspContribution = financial?.tspContribution ?? 500;
  const tspHref = tools?.tspHref || `/dashboard/tools/tsp-modeler?age=${age}&retire=50&bal=${tspBalance}&cont=${tspContribution}&mix=C:70,S:30`;

  const sdpAmount = timeline?.sdpAmount ?? 10000;
  const sdpHref = tools?.sdpHref || `/dashboard/tools/sdp-strategist?amount=${sdpAmount}`;

  const bahAmount = housing?.bahAmount ?? 2400;
  const houseHref = tools?.houseHref || `/dashboard/tools/house-hacking?price=400000&rate=6.5&tax=4800&ins=1600&bah=${bahAmount}&rent=2200`;

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen" style={{ backgroundColor: '#FDFDFB' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading your personalized plan...</p>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Command Center Header */}
          <div className="mb-10 rounded-2xl p-8 md:p-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="text-slate-300 text-sm mb-2">Automated Concierge</div>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  {(user?.firstName ? `${user.firstName}` : 'Your') + "'s"} Military Financial Roadmap
                </h2>
                {stageSummary && (
                  <p className="mt-3 text-slate-200/90 max-w-2xl">
                    {stageSummary}
                  </p>
                )}
              </div>
              <div>
                <DownloadGuideButton />
              </div>
            </div>
          </div>

          {!answers && (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
              <div className="text-4xl mb-4">📋</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Assessment Required</h2>
              <p className="text-gray-600 mb-6">
                Complete the Readiness Assessment to get your personalized plan.
              </p>
              <Link 
                href="/dashboard/assessment"
                className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Take Assessment
              </Link>
            </div>
          )}

          {answers && (
            <div className="space-y-8">
              {/* At-a-Glance Priorities */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Your Top Priorities</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InsightCard title="Next Move" value={resolvePcsStatus(answers)} icon="🧭" accent="emerald" />
                  <InsightCard title="Career Goal" value={resolveCareerGoal(answers)} icon="💼" accent="indigo" />
                  <InsightCard title="Financial Priority" value={resolveFinancialPriority(answers)} icon="💰" accent="amber" />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-white text-xl">⚡</span>
                  </div>

          {/* Topic Filters */}
          {allTopics.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Filter by Topic</h3>
                {selectedTopics.length > 0 && (
                  <button onClick={clearTopics} className="text-sm text-slate-600 hover:text-slate-800 underline">Clear filters</button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {allTopics.map(t => {
                  const active = selectedTopics.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() => toggleTopic(t)}
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm ${active ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-slate-50 text-slate-700'}`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
                  <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ActionLinkCard title="Open TSP Modeler" description="Optimize your retirement savings" href={tspHref} icon="📈" />
                  <ActionLinkCard title="Open SDP Strategist" description="Plan your deployment windfall" href={sdpHref} icon="💵" />
                  <ActionLinkCard title="Open House Calculator" description="Analyze a house-hack" href={houseHref} icon="🏡" />
                </div>
              </div>

              {/* Intelligent Sections */}
              {taskData.pcs.filter(topicMatches).length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-white text-xl">🧭</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Your PCS Action Plan 🗺️</h2>
                  </div>
                  <div className="space-y-4">
                    {taskData.pcs.filter(topicMatches).map((t) => (
                      <TaskCard key={t.slug} slug={t.slug} title={t.title} summary={t.summary} fullContent={t.fullContent} status={taskStatuses[t.slug] || 'incomplete'} topics={t.topics || []} priority={t.priority || 'low'} />
                    ))}
                  </div>
                </div>
              )}

              {taskData.career.filter(topicMatches).length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-white text-xl">💼</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Your Career Development Roadmap 💼</h2>
                  </div>
                  <div className="space-y-4">
                    {taskData.career.filter(topicMatches).map((t) => (
                      <TaskCard key={t.slug} slug={t.slug} title={t.title} summary={t.summary} fullContent={t.fullContent} status={taskStatuses[t.slug] || 'incomplete'} topics={t.topics || []} priority={t.priority || 'low'} />
                    ))}
                  </div>
                </div>
              )}

              {taskData.finance.filter(topicMatches).length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-white text-xl">💰</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Your Financial Wellness Checklist 💰</h2>
                  </div>
                  <div className="space-y-4">
                    {taskData.finance.filter(topicMatches).map((t) => (
                      <TaskCard key={t.slug} slug={t.slug} title={t.title} summary={t.summary} fullContent={t.fullContent} status={taskStatuses[t.slug] || 'incomplete'} topics={t.topics || []} priority={t.priority || 'low'} />
                    ))}
                  </div>
                </div>
              )}

              {taskData.deployment.filter(topicMatches).length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-rose-600 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-white text-xl">❤️</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Your Deployment Readiness Guide ❤️</h2>
                  </div>
                  <div className="space-y-4">
                    {taskData.deployment.filter(topicMatches).map((t) => (
                      <TaskCard key={t.slug} slug={t.slug} title={t.title} summary={t.summary} fullContent={t.fullContent} status={taskStatuses[t.slug] || 'incomplete'} topics={t.topics || []} priority={t.priority || 'low'} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function InsightCard({ title, value, icon, accent }: { title: string; value: string; icon: string; accent: 'emerald'|'indigo'|'amber' }) {
  const color = accent === 'emerald' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : accent === 'indigo' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' : 'bg-amber-50 text-amber-800 border-amber-200';
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xl">{icon}</span>
        <div className="text-sm font-semibold">{title}</div>
      </div>
      <div className="text-lg font-bold leading-tight">{value || '—'}</div>
    </div>
  );
}

type V21Answers = {
  v21?: {
    move?: { pcsSituation?: string };
    career?: { ambitions?: string[] };
    finance?: { priority?: string };
  };
};

function resolvePcsStatus(answers: AssessmentAnswers | null): string {
  const v21 = (answers as unknown as V21Answers)?.v21;
  const s = v21?.move?.pcsSituation;
  const map: Record<string,string> = { arrived: 'Just Arrived', dwell: 'Dwell Time', window: 'PCS Window', orders: 'Orders in Hand', none: 'Not Expecting' };
  return s ? (map[s] || String(s)) : '';
}

function resolveCareerGoal(answers: AssessmentAnswers | null): string {
  const v21 = (answers as unknown as V21Answers)?.v21;
  const ambitions: string[] = Array.isArray(v21?.career?.ambitions) ? v21.career!.ambitions! : [];
  const priorityOrder = ['business','job','portable','education','not_career'];
  const first = priorityOrder.find(k => ambitions.includes(k)) || ambitions[0];
  const map: Record<string,string> = {
    business: 'Grow Your Business',
    job: 'Find a New Job',
    portable: 'Make Career Portable',
    education: 'Education/Certification',
    not_career: 'Not Focused Now',
  };
  return first ? (map[first] || String(first)) : '';
}

function resolveFinancialPriority(answers: AssessmentAnswers | null): string {
  const v21 = (answers as unknown as V21Answers)?.v21;
  const p = v21?.finance?.priority;
  const map: Record<string,string> = {
    budget: 'Stabilize Budget',
    pay_debt: 'Pay Down Debt',
    emergency_savings: 'Build Emergency Fund',
    maximize_tsp: 'Invest for Retirement',
    use_va_loan: 'Use VA Loan Smartly',
  };
  return p ? (map[p] || String(p)) : '';
}


function ActionLinkCard({ title, description, href, icon }: { title: string; description: string; href: string; icon: string }) {
  return (
    <Link href={href} className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-2xl">{icon}</span>
        <h4 className="font-semibold text-slate-900">{title}</h4>
      </div>
      <p className="text-sm text-slate-600">{description}</p>
    </Link>
  );
}

