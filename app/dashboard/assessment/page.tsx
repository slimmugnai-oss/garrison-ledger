"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Header from "@/app/components/Header";

export default function ComprehensiveAssessment() {
  const r = useRouter();

  // Section 1: Your Foundation
  const [serviceYears, setServiceYears] = useState("0-4");
  const [familySnapshot, setFamilySnapshot] = useState("none");
  const [efmpEnrolled, setEfmpEnrolled] = useState(false);

  // Section 2: Your Next Move (PCS & Relocation)
  const [pcsSituation, setPcsSituation] = useState("dwell");
  const [oconusMove, setOconusMove] = useState<"yes"|"no"|"unsure">("no");

  // Section 3: The Homefront (Deployment)
  const [deploymentStatus, setDeploymentStatus] = useState("none");

  // Section 4: Your Career & Ambition (multi-select)
  const [careerAmbitions, setCareerAmbitions] = useState<string[]>([]);
  const toggleAmbition = (id: string) =>
    setCareerAmbitions((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  // Section 5: Your Financial Picture
  const [financialPriority, setFinancialPriority] = useState("budget");

  // Section 6: Personalization Preferences
  const [topicInterests, setTopicInterests] = useState<string[]>([]);
  const toggleTopicInterest = (id: string) =>
    setTopicInterests((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const [urgencyLevel, setUrgencyLevel] = useState("normal");
  const [knowledgeLevel, setKnowledgeLevel] = useState("intermediate");

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);

    const answers = {
      comprehensive: {
        foundation: { serviceYears, familySnapshot, efmpEnrolled },
        move: { pcsSituation, oconusMove },
        deployment: { status: deploymentStatus },
        career: { ambitions: careerAmbitions },
        finance: { priority: financialPriority },
        preferences: { topicInterests, urgencyLevel, knowledgeLevel },
      },
      // Also populate strategic for atomic rules compatibility
      strategic: {
        biggestFocus: determineBiggestFocus(),
        pcsTimeline: pcsSituation,
        efmpEnrolled,
        careerGoal: careerAmbitions[0] || '',
        financialWorry: financialPriority,
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
        alert(`Failed to save: ${j.error || res.status}`);
        setSubmitting(false);
        return;
      }
      r.push("/dashboard/plan");
    } catch {
      alert("Failed to save assessment. Please try again.");
      setSubmitting(false);
    }
  };

  // Infer biggest focus from detailed answers
  function determineBiggestFocus() {
    if (pcsSituation === 'orders' || pcsSituation === 'window') return 'pcs';
    if (deploymentStatus && deploymentStatus !== 'none') return 'deployment';
    if (careerAmbitions.length > 0) return 'career';
    return 'finances';
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-serif font-black text-text mb-4">
              Readiness Assessment
            </h1>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              Complete this comprehensive assessment to receive your personalized Military Financial Roadmap. Takes 5-7 minutes.
            </p>
          </div>

          <div className="space-y-8">
            {/* Section 1: Your Foundation */}
            <Section title="Your Foundation" number="1" icon="🏛️">
              <Field label="Which best describes you or your spouse's service?">
                <Select value={serviceYears} onChange={setServiceYears} options={[
                  { value: "0-4", label: "0-4 Years (Newer to military life)" },
                  { value: "5-10", label: "5-10 Years (Finding the rhythm)" },
                  { value: "11-15", label: "11-15 Years (Mid-career)" },
                  { value: "16+", label: "16+ Years (Approaching retirement/transition)" },
                ]} />
              </Field>
              <Field label="What does your family look like right now?">
                <Select value={familySnapshot} onChange={setFamilySnapshot} options={[
                  { value: "none", label: "No children" },
                  { value: "young_children", label: "Young children (0-5 years)" },
                  { value: "school_age", label: "School-age children (6-17 years)" },
                  { value: "mixed", label: "Mixed ages" },
                ]} />
              </Field>
              <Checkbox checked={efmpEnrolled} onChange={setEfmpEnrolled} label="Enrolled in Exceptional Family Member Program (EFMP)" />
            </Section>

            {/* Section 2: Your Next Move */}
            <Section title="Your Next Move (PCS & Relocation)" number="2" icon="🧭">
              <Field label="What is your current PCS situation?">
                <Select value={pcsSituation} onChange={setPcsSituation} options={[
                  { value: "arrived", label: "Just arrived at new duty station" },
                  { value: "dwell", label: "In the dwell time (settled for now)" },
                  { value: "window", label: "In the PCS window (orders expected soon)" },
                  { value: "orders", label: "Orders in hand (moving within 4 months)" },
                  { value: "none", label: "Not expecting to PCS again" },
                ]} />
              </Field>
              <Field label="Will this be an OCONUS (overseas) move?">
                <RadioGroup name="oconus" value={oconusMove} onChange={(v) => setOconusMove(v as "yes"|"no"|"unsure")} options={[
                  { value: "no", label: "No - staying CONUS" },
                  { value: "yes", label: "Yes - moving overseas" },
                  { value: "unsure", label: "Unsure" },
                ]} />
              </Field>
            </Section>

            {/* Section 3: The Homefront */}
            <Section title="The Homefront (Deployment)" number="3" icon="🎗️">
              <Field label="What's your current deployment reality?">
                <Select value={deploymentStatus} onChange={setDeploymentStatus} options={[
                  { value: "pre", label: "Pre-deployment (preparing for upcoming deployment)" },
                  { value: "current", label: "Currently deployed" },
                  { value: "reintegration", label: "Reintegration phase (recently returned)" },
                  { value: "none", label: "Not in a deployment cycle" },
                ]} />
              </Field>
            </Section>

            {/* Section 4: Career & Ambition */}
            <Section title="Your Career & Ambition" number="4" icon="💼">
              <Field label="What are your career goals? (Select all that apply)">
                <div className="space-y-3">
                  {[
                    { id: "find-job", label: "I'm looking to find a new job" },
                    { id: "portable-career", label: "I want to make my career more portable" },
                    { id: "business", label: "I'm trying to grow my own business" },
                    { id: "education", label: "I'm considering certification or education" },
                    { id: "federal", label: "I'm interested in federal employment" },
                    { id: "not_career", label: "I'm not focused on career at this time" },
                  ].map((opt) => (
                    <Checkbox
                      key={opt.id}
                      checked={careerAmbitions.includes(opt.id)}
                      onChange={() => toggleAmbition(opt.id)}
                      label={opt.label}
                    />
                  ))}
                </div>
              </Field>
            </Section>

            {/* Section 5: Financial Picture */}
            <Section title="Your Financial Picture" number="5" icon="💰">
              <Field label="What is your family's single biggest financial priority right now?">
                <Select value={financialPriority} onChange={setFinancialPriority} options={[
                  { value: "budget", label: "Get on a stable budget" },
                  { value: "debt", label: "Pay off debt" },
                  { value: "emergency", label: "Build emergency savings" },
                  { value: "tsp", label: "Maximize TSP/retirement" },
                  { value: "va", label: "Use the VA Loan effectively" },
                ]} />
              </Field>
            </Section>

            {/* Section 6: Personalization Preferences */}
            <Section title="Personalization Preferences (Optional)" number="6" icon="⚙️">
              <Field label="Which topics interest you most? (Select all that apply)">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { id: "pcs-prep", label: "PCS Planning & Checklists" },
                    { id: "housing", label: "Housing & BAH Strategies" },
                    { id: "va-loan", label: "VA Loan & Home Buying" },
                    { id: "remote-work", label: "Remote Work & Portable Careers" },
                    { id: "mycaa", label: "MyCAA & Education Funding" },
                    { id: "federal-employment", label: "Federal Employment" },
                    { id: "entrepreneurship", label: "Starting a Business" },
                    { id: "tsp", label: "TSP & Retirement" },
                    { id: "deployment", label: "Deployment & Reintegration" },
                  ].map((opt) => (
                    <Checkbox
                      key={opt.id}
                      checked={topicInterests.includes(opt.id)}
                      onChange={() => toggleTopicInterest(opt.id)}
                      label={opt.label}
                      small
                    />
                  ))}
                </div>
              </Field>
              <Field label="How urgent are your needs?">
                <Select value={urgencyLevel} onChange={setUrgencyLevel} options={[
                  { value: "low", label: "Low - Exploring and planning ahead" },
                  { value: "normal", label: "Normal - Need this in next few months" },
                  { value: "high", label: "High - Need actionable steps right now" },
                ]} />
              </Field>
              <Field label="How would you describe your knowledge of military benefits?">
                <Select value={knowledgeLevel} onChange={setKnowledgeLevel} options={[
                  { value: "beginner", label: "Beginner - New to military life" },
                  { value: "intermediate", label: "Intermediate - Know the basics" },
                  { value: "advanced", label: "Advanced - Know benefits well" },
                ]} />
              </Field>
            </Section>

            {/* Submit */}
            <div className="pt-8">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed"
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

function Section({ title, number, icon, children }: { title: string; number: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl p-8 border border-border shadow-card">
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border">
        <div className="flex-shrink-0 w-14 h-14 bg-primary rounded-xl flex items-center justify-center shadow-md">
          <span className="text-white text-2xl">{icon}</span>
        </div>
        <div>
          <div className="text-sm font-bold text-muted uppercase tracking-wider">Section {number}</div>
          <h2 className="text-2xl font-serif font-bold text-text">{title}</h2>
        </div>
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-base font-bold text-text mb-3">{label}</label>
      {children}
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: Array<{ value: string; label: string }> }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary text-text bg-card font-medium transition-all"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

function RadioGroup({ name, value, onChange, options }: { name: string; value: string; onChange: (v: string) => void; options: Array<{ value: string; label: string }> }) {
  return (
    <div className="space-y-3">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
            value === opt.value
              ? 'border-primary-accent bg-indigo-50'
              : 'border-border hover:bg-gray-50'
          }`}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={(e) => onChange(e.target.value)}
            className="w-5 h-5 text-primary-accent border-border focus:ring-primary-accent"
          />
          <span className="ml-3 text-text-body font-medium">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

function Checkbox({ checked, onChange, label, small = false }: { checked: boolean; onChange: (v: boolean) => void; label: string; small?: boolean }) {
  return (
    <label className={`flex items-center ${small ? 'p-2' : 'p-3'} cursor-pointer hover:bg-gray-50 rounded-lg transition-colors`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 text-primary-accent border-border rounded focus:ring-primary-accent"
      />
      <span className={`ml-3 text-text-body ${small ? 'text-sm' : 'font-medium'}`}>{label}</span>
    </label>
  );
}
