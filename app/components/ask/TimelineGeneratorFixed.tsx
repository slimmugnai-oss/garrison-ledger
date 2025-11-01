"use client";

/**
 * WORKING TIMELINE GENERATOR FOR ASK MILITARY EXPERT
 * 
 * Uses the Ask AI to generate timelines instead of separate endpoint
 */

import { useState, useEffect } from "react";
import { Calendar, Loader2, ChevronRight, AlertCircle } from "lucide-react";

type TimelineType = "pcs" | "deployment" | "transition" | "career";

export default function TimelineGeneratorFixed() {
  const [timelineType, setTimelineType] = useState<TimelineType>("pcs");
  const [eventDate, setEventDate] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [timeline, setTimeline] = useState<string | null>(null);
  const [quota, setQuota] = useState<{ used: number; limit: number } | null>(null);
  const [quotaError, setQuotaError] = useState<string | null>(null);

  // Fetch quota on mount
  useEffect(() => {
    async function fetchQuota() {
      try {
        const res = await fetch("/api/ask/quota?feature=timeline");
        const data = await res.json();
        if (data.success) {
          setQuota({ used: data.used, limit: data.limit });
        }
      } catch (error) {
        console.error("Failed to fetch quota:", error);
      }
    }
    fetchQuota();
  }, []);

  const handleGenerate = async () => {
    if (!eventDate) return;

    // Check quota before generating
    if (quota && quota.used >= quota.limit) {
      setQuotaError(`You've used all ${quota.limit} free timelines this month. Upgrade to Premium for unlimited timelines.`);
      return;
    }

    setGenerating(true);
    setTimeline(null);
    setQuotaError(null);

    try {
      // Track timeline usage first
      await fetch("/api/ask/track-usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feature: "timeline", metadata: { type: timelineType, eventDate } }),
      });
      const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      
      const questions = {
        pcs: `TODAY IS ${today}. My PCS report date is ${new Date(eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.

Create a COMPREHENSIVE 180-day PCS countdown timeline with SPECIFIC tasks, exact dates, and official resources.

REQUIREMENTS:
- Work backward from my report date to create a chronological task list
- Include EXACT dates for each milestone (e.g., "By January 15, 2026: ...")
- Add official links/resources (DFAS.mil, Move.mil, DPS, finance office contacts)
- Categorize tasks: Orders | Finance | Housing | Household Goods | Schools | Travel | Final Out
- Be thorough - minimum 15-20 major milestones with subtasks

CRITICAL TASKS TO INCLUDE:
- Review PCS orders (180 days out) - link to MyPCS app
- Finance in-processing appointment (150 days) - what to bring
- House hunting trip authorization (120 days) - eligibility, process
- HHG weight estimate + booking deadline (90 days) - link to Move.mil
- School enrollment windows (60 days) - state-specific requirements
- Advance DLA/TLE requests (45 days) - how to file
- Final out-processing checklist (30 days) - base-specific
- Travel voucher prep (day of arrival) - what receipts to keep

Include links to official resources like DFAS, Move.mil, MilitaryOneSource, and base-specific pages.`,

        deployment: `TODAY IS ${today}. My deployment date is ${new Date(eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.

Create a DETAILED pre-deployment preparation timeline with specific tasks, dates, and resources.

REQUIREMENTS:
- Chronological task list from today until deployment
- Exact dates for each task
- Official links (TRICARE, finance, legal, medical)
- Minimum 12-15 major tasks with subtasks

CRITICAL TASKS:
- Unit pre-deployment briefing schedule
- SGLI beneficiary review (link to VA.gov)
- Power of Attorney (General + Special) - link to legal office
- TRICARE enrollment verification
- Financial preparation (SDP setup, allotments, SCRA protections)
- Family Care Plan (if dependents)
- Medical/dental checkups + deployment health assessments
- Wills + estate documents update
- Deployment gear issue schedule
- Training pipeline + certification deadlines
- Vehicle storage/shipping arrangements
- Final family prep (communication plan, emergency contacts)

Link to official resources: MilitaryOneSource, TRICARE, VA.gov, installation legal office.`,

        transition: `TODAY IS ${today}. My separation/retirement date is ${new Date(eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.

Create a COMPREHENSIVE transition timeline from military to civilian life with specific tasks, dates, and resources.

REQUIREMENTS:
- Chronological from today to separation + 90 days after
- Exact deadlines for each step
- Official links (VA.gov, eBenefits, TAP, DOL)
- Minimum 20 major milestones

CRITICAL TASKS:
- TAP class registration + attendance (mandatory 365 days out)
- VA benefits pre-filing (BDD program 180-90 days out)
- Resume writing + LinkedIn optimization (150 days)
- Job search strategy + networking (120 days)
- Federal job application (USAJOBS.gov) timeline (90 days)
- Terminal leave calculation + submission (60 days)
- Final medical exams + disability claims (60 days)
- TRICARE to civilian insurance transition
- TSP rollover decisions (link to TSP.gov)
- GI Bill transfer/certification
- Final out-processing checklist by installation
- DD-214 verification + copies
- 90-day post-separation checklist (unemployment, healthcare, benefits verification)

Link to: VA.gov, eBenefits.va.gov, USAJOBS.gov, TAP resources, DOL Veterans Employment.`,

        career: `TODAY IS ${today}. My target milestone date is ${new Date(eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.

Create a SPECIFIC career progression timeline for achieving my next rank/goal with exact requirements, dates, and resources.

REQUIREMENTS:
- Reverse-engineer from goal date to today
- Include TIG/TIS requirements
- PME completion deadlines
- Evaluation cycle milestones
- Award/decoration requirements

CRITICAL MILESTONES:
- Time-in-grade requirement verification
- PME enrollment + completion deadlines (link to service-specific PME sites)
- Evaluation cycle dates (when to prep PRF/EPR/FITREP)
- Awards package submission windows
- Board appearance dates + prep timeline
- Physical fitness test schedule
- Required certifications/schools
- Mentorship/networking checkpoints
- Promotion packet assembly deadline

Be service-specific and link to official career progression guides for Army/Navy/Air Force/Marines.`,
      };

      const response = await fetch("/api/ask/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questions[timelineType],
        }),
      });

      const data = await response.json();

      if (data.success && data.answer) {
        setTimeline(data.answer.bottomLine.join("\n\n"));
        // Update quota count
        if (quota) {
          setQuota({ ...quota, used: quota.used + 1 });
        }
      } else {
        setTimeline("Timeline generation failed. Please try again.");
      }
    } catch (error) {
      console.error("Timeline error:", error);
      setTimeline("Error generating timeline. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-6">
      {/* Header with Quota */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Calendar className="h-6 w-6 text-blue-600 mr-3" />
          <div>
            <h3 className="text-xl font-bold text-slate-800">Timeline Generator</h3>
            <p className="text-sm text-slate-600">
              Create a personalized timeline for your PCS, deployment, or transition
            </p>
          </div>
        </div>
        {quota && (
          <div className="text-sm">
            <span className={`font-semibold ${quota.used >= quota.limit ? "text-red-600" : "text-slate-700"}`}>
              {quota.limit - quota.used} of {quota.limit} free
            </span>
            <span className="text-slate-500 ml-1">this month</span>
          </div>
        )}
      </div>

      {/* Quota Error / Upgrade Prompt */}
      {quotaError && (
        <div className="border border-amber-300 rounded-lg p-4 bg-amber-50">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-amber-900 mb-2">Limit Reached</p>
              <p className="text-sm text-amber-800 mb-3">{quotaError}</p>
              <a
                href="/dashboard/upgrade"
                className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Upgrade to Premium
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Type Selection */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          What do you need a timeline for?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { value: "pcs", label: "PCS Move", icon: "🏠" },
            { value: "deployment", label: "Deployment", icon: "🌍" },
            { value: "transition", label: "Separation", icon: "🎓" },
            { value: "career", label: "Career Path", icon: "📈" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setTimelineType(option.value as TimelineType)}
              className={`p-4 rounded-lg border-2 transition-all ${
                timelineType === option.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 hover:border-blue-300 bg-white"
              }`}
            >
              <div className="text-3xl mb-2">{option.icon}</div>
              <div className="text-sm font-semibold text-slate-800">{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Event Date Input */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {timelineType === "pcs"
            ? "When is your report date?"
            : timelineType === "deployment"
            ? "When do you deploy?"
            : timelineType === "transition"
            ? "When do you separate/retire?"
            : "Target achievement date?"}
        </label>
        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-full sm:w-auto px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!eventDate || generating}
        className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {generating ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Generating Timeline...
          </>
        ) : (
          <>
            Generate Timeline
            <ChevronRight className="h-5 w-5 ml-2" />
          </>
        )}
      </button>

      {/* Generated Timeline */}
      {timeline && (
        <div className="border border-slate-200 rounded-lg p-6 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800">
              Your {timelineType.toUpperCase()} Timeline
            </h4>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 transition-colors"
            >
              Print Timeline
            </button>
          </div>

          <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
            {timeline}
          </div>
        </div>
      )}
    </div>
  );
}

