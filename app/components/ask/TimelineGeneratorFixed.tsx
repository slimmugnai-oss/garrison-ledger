"use client";

/**
 * WORKING TIMELINE GENERATOR FOR ASK MILITARY EXPERT
 * 
 * Uses the Ask AI to generate timelines instead of separate endpoint
 */

import { useState } from "react";
import { Calendar, Loader2, ChevronRight } from "lucide-react";

type TimelineType = "pcs" | "deployment" | "transition" | "career";

export default function TimelineGeneratorFixed() {
  const [timelineType, setTimelineType] = useState<TimelineType>("pcs");
  const [eventDate, setEventDate] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [timeline, setTimeline] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!eventDate) return;

    setGenerating(true);
    setTimeline(null);

    try {
      const questions = {
        pcs: `I'm PCSing on ${eventDate}. Create a detailed 180-day timeline with all tasks I need to complete, organized by date. Include: orders processing, housing search, school enrollment, finance appointments, moving company booking, final out-processing, and everything else.`,
        deployment: `I'm deploying on ${eventDate}. Create a pre-deployment timeline with all preparation tasks: financial prep, legal documents, family care plan, deployment briefings, gear issue, medical checkups, and everything else I need to do before wheels up.`,
        transition: `I'm separating/retiring on ${eventDate}. Create a transition timeline with: TAP class, resume writing, job search, VA benefits filing, final medical, out-processing, and all civilian transition tasks.`,
        career: `Create a career progression timeline for reaching my next rank/milestone by ${eventDate}. Include: PME completion, awards needed, time-in-grade requirements, evaluation timelines, and promotion board prep.`,
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
      {/* Header */}
      <div className="flex items-center">
        <Calendar className="h-6 w-6 text-blue-600 mr-3" />
        <div>
          <h3 className="text-xl font-bold text-slate-800">Timeline Generator</h3>
          <p className="text-sm text-slate-600">
            Create a personalized timeline for your PCS, deployment, or transition
          </p>
        </div>
      </div>

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

