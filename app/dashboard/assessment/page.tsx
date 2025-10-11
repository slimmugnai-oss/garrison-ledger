"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Header from "@/app/components/Header";

export default function StrategicAssessment() {
  const r = useRouter();

  // Section 1: The Big Picture
  const [biggestFocus, setBiggestFocus] = useState<string>("");

  // Section 2: Your Next Move
  const [pcsTimeline, setPcsTimeline] = useState<string>("");
  const [efmpEnrolled, setEfmpEnrolled] = useState<boolean>(false);

  // Section 3: Your Career
  const [careerGoal, setCareerGoal] = useState<string>("");

  // Section 4: Your Finances
  const [financialWorry, setFinancialWorry] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!biggestFocus) {
      alert("Please select your biggest focus to continue.");
      return;
    }

    setSubmitting(true);

    const answers = {
      strategic: {
        biggestFocus,
        pcsTimeline,
        efmpEnrolled,
        careerGoal,
        financialWorry,
      },
      // Legacy compatibility
      v21: {
        foundation: { efmp: efmpEnrolled },
        move: { pcsSituation: pcsTimeline },
        career: { ambitions: careerGoal ? [careerGoal] : [] },
        finance: { priority: financialWorry },
      },
    };

    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(`Failed to save assessment: ${j.error || res.status}`);
        setSubmitting(false);
        return;
      }
      r.push("/dashboard/plan");
    } catch {
      alert("Failed to save assessment. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen" style={{ backgroundColor: "#FDFDFB" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Strategic Assessment
            </h1>
            <p className="text-xl text-gray-600">
              Answer 4 questions to receive your personalized action plan. Takes 2 minutes.
            </p>
          </div>

          <div className="space-y-8">
            {/* Section 1: The Big Picture */}
            <Section title="The Big Picture" number="1">
              <Question text="What is your family's single biggest focus or challenge right now?">
                <RadioGroup
                  name="biggestFocus"
                  value={biggestFocus}
                  onChange={setBiggestFocus}
                  options={[
                    { value: "pcs", label: "Preparing for an upcoming PCS move." },
                    { value: "deployment", label: "Navigating a current or upcoming deployment." },
                    { value: "career", label: "My (or my spouse's) career development." },
                    { value: "finances", label: "Getting our household finances in order." },
                  ]}
                />
              </Question>
            </Section>

            {/* Section 2: Your Next Move */}
            <Section title="Your Next Move" number="2">
              <Question text="How close is your next PCS?">
                <RadioGroup
                  name="pcsTimeline"
                  value={pcsTimeline}
                  onChange={setPcsTimeline}
                  options={[
                    { value: "orders", label: "We have orders in hand (less than 4 months)." },
                    { value: "window", label: "We're in the \"PCS window\" (4-12 months)." },
                    { value: "settled", label: "We're comfortably settled (1+ year away)." },
                  ]}
                />
              </Question>
              <Question text="Is your family enrolled in EFMP?" className="mt-6">
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="efmp"
                      checked={efmpEnrolled === true}
                      onChange={() => setEfmpEnrolled(true)}
                      className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-900 font-medium">Yes</span>
                  </label>
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="efmp"
                      checked={efmpEnrolled === false}
                      onChange={() => setEfmpEnrolled(false)}
                      className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-900 font-medium">No</span>
                  </label>
                </div>
              </Question>
            </Section>

            {/* Section 3: Your Career */}
            <Section title="Your Career" number="3">
              <Question text="What's your primary career goal today?">
                <RadioGroup
                  name="careerGoal"
                  value={careerGoal}
                  onChange={setCareerGoal}
                  options={[
                    { value: "find-job", label: "Find a job, now." },
                    { value: "portable-career", label: "Explore portable career options for the future." },
                    { value: "business", label: "Start or grow my own business." },
                    { value: "education", label: "Get a new certification or degree." },
                  ]}
                />
              </Question>
            </Section>

            {/* Section 4: Your Finances */}
            <Section title="Your Finances" number="4">
              <Question text="From a financial standpoint, what's keeping you up at night?">
                <RadioGroup
                  name="financialWorry"
                  value={financialWorry}
                  onChange={setFinancialWorry}
                  options={[
                    { value: "budget-debt", label: "The stress of monthly budgeting and debt." },
                    { value: "emergency-savings", label: "The fear of not having enough emergency savings." },
                    { value: "retirement-tsp", label: "The uncertainty of not saving enough for retirement (TSP)." },
                  ]}
                />
              </Question>
            </Section>

            {/* Submit Button */}
            <div className="pt-8">
              <button
                onClick={handleSubmit}
                disabled={submitting || !biggestFocus}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-5 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Generating Your Plan..." : "Generate My Personalized Plan →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Section({ title, number, children }: { title: string; number: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-sm">
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
        <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xl font-bold">{number}</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Question({ text, children, className = "" }: { text: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-lg font-semibold text-gray-900 mb-4">{text}</label>
      {children}
    </div>
  );
}

function RadioGroup({ 
  name, 
  value, 
  onChange, 
  options 
}: { 
  name: string; 
  value: string; 
  onChange: (val: string) => void; 
  options: Array<{ value: string; label: string }> 
}) {
  return (
    <div className="space-y-3">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
            value === opt.value
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-200 hover:bg-gray-50'
          }`}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={(e) => onChange(e.target.value)}
            className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <span className="ml-3 text-gray-900 font-medium">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}
