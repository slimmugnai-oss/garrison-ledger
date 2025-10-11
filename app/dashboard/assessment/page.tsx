"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Header from "@/app/components/Header";

export default function DetailedAssessment() {
  const r = useRouter();

  // V2.1 — Revised Readiness Assessment
  // Section 1: Your Foundation
  const [serviceYears, setServiceYears] = useState("0-4");
  const [familySnapshot, setFamilySnapshot] = useState("none");
  const [efmp, setEfmp] = useState(false);

  // Section 2: Your Next Move (PCS & Relocation)
  const [pcsSituation, setPcsSituation] = useState("dwell");
  const [oconus, setOconus] = useState<"yes" | "no" | "unsure">("no");

  // Section 3: Homefront (Deployment)
  const [deployReality, setDeployReality] = useState("none");

  // Section 4: Career & Ambition (multi-select)
  const [ambitions, setAmbitions] = useState<string[]>([]);
  const toggleAmbition = (id: string) =>
    setAmbitions((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  // Section 5: Financial Picture
  const [finPriority, setFinPriority] = useState("budget");

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);

    const answers = {
      v21: {
        foundation: { serviceYears, familySnapshot, efmp },
        move: { pcsSituation, oconus },
        deployment: { status: deployReality },
        career: { ambitions },
        finance: { priority: finPriority },
      },
      // Legacy keys still referenced downstream (light touch)
      timeline: { pcsDate: pcsSituation, deploymentStatus: deployReality },
    } as const;

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
    } catch (e) {
      alert("Failed to save assessment. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen" style={{ backgroundColor: "#FDFDFB" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">📋 Readiness Assessment</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Answer these questions to receive your personalized plan. Takes about 3-5 minutes.
            </p>
          </div>

          <div className="space-y-6">
            {/* Section 1: Your Foundation */}
            <Section title="Your Foundation" icon="🏛️">
              <div className="space-y-6">
                <Field label="Which best describes you or your spouse's service?">
                  <select
                    value={serviceYears}
                    onChange={(e) => setServiceYears(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="0-4">0-4 Years (Newer to military life)</option>
                    <option value="5-10">5-10 Years (Finding the rhythm)</option>
                    <option value="11-15">11-15 Years (Mid-career)</option>
                    <option value="16+">16+ Years (Approaching retirement/transition)</option>
                  </select>
                </Field>
                <Field label="What does your family look like right now?">
                  <select
                    value={familySnapshot}
                    onChange={(e) => setFamilySnapshot(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="none">No children</option>
                    <option value="young_children">Young children</option>
                    <option value="school_age">School-age children</option>
                    <option value="mixed">Mixed ages</option>
                  </select>
                </Field>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={efmp}
                    onChange={(e) => setEfmp(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-900 font-medium">Enrolled in Exceptional Family Member Program (EFMP)</span>
                </div>
              </div>
            </Section>

            {/* Section 2: Your Next Move (PCS & Relocation) */}
            <Section title="Your Next Move (PCS & Relocation)" icon="🧭">
              <div className="space-y-6">
                <Field label="What is your current PCS situation?">
                  <select
                    value={pcsSituation}
                    onChange={(e) => setPcsSituation(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="arrived">Just arrived</option>
                    <option value="dwell">In the dwell time</option>
                    <option value="window">In the PCS window</option>
                    <option value="orders">Orders in hand</option>
                    <option value="none">Not expecting to PCS again</option>
                  </select>
                </Field>
                <Field label="Will this be an OCONUS (overseas) move?">
                  <select
                    value={oconus}
                    onChange={(e) => setOconus(e.target.value as 'yes'|'no'|'unsure')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                    <option value="unsure">Unsure</option>
                  </select>
                </Field>
              </div>
            </Section>

            {/* Section 3: The Homefront (Deployment) */}
            <Section title="The Homefront (Deployment)" icon="🎗️">
              <Field label="What's your current deployment reality?">
                <select
                  value={deployReality}
                  onChange={(e) => setDeployReality(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="pre">Pre-deployment</option>
                  <option value="current">Currently deployed</option>
                  <option value="reintegration">Reintegration phase</option>
                  <option value="none">Not in a deployment cycle</option>
                </select>
              </Field>
            </Section>

            {/* Section 4: Your Career & Ambition */}
            <Section title="Your Career & Ambition" icon="💼">
              <div className="space-y-3">
                {[
                  { id: "job", label: "I'm looking to find a new job." },
                  { id: "portable", label: "I want to make my current career more 'portable.'" },
                  { id: "business", label: "I'm trying to grow my own business." },
                  { id: "education", label: "I'm considering going back to school or certification." },
                  { id: "not_career", label: "I'm not focused on my career at this time." },
                ].map((opt) => (
                  <label key={opt.id} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={ambitions.includes(opt.id)}
                      onChange={() => toggleAmbition(opt.id)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-900">{opt.label}</span>
                  </label>
                ))}
              </div>
            </Section>

            {/* Section 5: Your Financial Picture */}
            <Section title="Your Financial Picture" icon="💰">
              <Field label="What is your family's single biggest financial priority right now?">
                <select
                  value={finPriority}
                  onChange={(e) => setFinPriority(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="budget">Get on a budget</option>
                  <option value="debt">Pay off debt</option>
                  <option value="emergency">Build emergency savings</option>
                  <option value="tsp">Maximize TSP</option>
                  <option value="va">Use the VA Loan</option>
                </select>
              </Field>
            </Section>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "💾 Saving assessment..." : "Generate My Personalized Plan 🚀"}
              </button>
              <p className="text-center text-sm text-gray-500 mt-4">Premium members will receive a downloadable PDF guide</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div
      className="bg-white rounded-xl p-8 border border-gray-200"
      style={{ boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}
    >
      <div className="flex items-center mb-6">
        <span className="text-3xl mr-3">{icon}</span>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      {children}
    </div>
  );
}

