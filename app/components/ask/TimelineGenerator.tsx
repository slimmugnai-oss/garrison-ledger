"use client";

/**
 * TIMELINE GENERATOR UI FOR ASK MILITARY EXPERT
 *
 * Generates visual timelines for:
 * - PCS (moving checklist by date)
 * - Deployment (pre-deployment, during, post-deployment phases)
 * - Transition (separation/retirement planning)
 * - Career milestones (promotion timeline, training pipeline)
 */

import { Calendar, Download, ChevronRight } from "lucide-react";
import { useState } from "react";

type TimelineType = "pcs" | "deployment" | "transition" | "career";

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  category: string;
  completed?: boolean;
}

interface TimelineGeneratorProps {
  onGenerate?: (type: TimelineType, eventDate: Date, details: Record<string, unknown>) => Promise<TimelineEvent[]>;
}

export default function TimelineGenerator({ onGenerate }: TimelineGeneratorProps) {
  const [timelineType, setTimelineType] = useState<TimelineType>("pcs");
  const [eventDate, setEventDate] = useState<string>("");
  const [generatedTimeline, setGeneratedTimeline] = useState<TimelineEvent[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!eventDate || !onGenerate) return;

    setLoading(true);
    try {
      const timeline = await onGenerate(timelineType, new Date(eventDate), {});
      setGeneratedTimeline(timeline);
    } catch (error) {
      console.error("Timeline generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedTimeline) return;

    const content = generatedTimeline
      .map((event) => `${event.date} - ${event.title}\n${event.description}\n\n`)
      .join("");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${timelineType}-timeline.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
          className="w-full sm:w-auto px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!eventDate || loading}
        className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? "Generating..." : "Generate Timeline"}
        {!loading && <ChevronRight className="h-5 w-5 ml-2" />}
      </button>

      {/* Generated Timeline */}
      {generatedTimeline && generatedTimeline.length > 0 && (
        <div className="space-y-4">
          {/* Timeline Header with Download */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <h4 className="font-bold text-slate-800">
                Your {timelineType.toUpperCase()} Timeline
              </h4>
              <p className="text-sm text-slate-600">{generatedTimeline.length} milestones</p>
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>

          {/* Timeline Events */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />

            <div className="space-y-6">
              {generatedTimeline.map((event, index) => (
                <div key={index} className="relative pl-12">
                  {/* Timeline dot */}
                  <div className="absolute left-0 flex items-center justify-center">
                    <div className={`h-8 w-8 rounded-full border-4 border-white ${
                      event.completed ? "bg-green-500" : "bg-blue-500"
                    }`} />
                  </div>

                  {/* Event card */}
                  <div className="p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-xs font-semibold text-blue-600 uppercase">
                          {event.category}
                        </span>
                        <h5 className="font-bold text-slate-800 mt-1">{event.title}</h5>
                      </div>
                      <span className="text-sm font-semibold text-slate-500">{event.date}</span>
                    </div>
                    <p className="text-sm text-slate-600">{event.description}</p>
                    {event.completed && (
                      <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                        ✓ Completed
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

