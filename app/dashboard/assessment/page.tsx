'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Header from '@/app/components/Header';

export default function DetailedAssessment() {
  const r = useRouter();
  
  // Personal & Service
  const [age, setAge] = useState(30);
  const [yearsOfService, setYearsOfService] = useState(5);
  const [rankCategory, setRankCategory] = useState('enlisted_junior'); // enlisted_junior, enlisted_senior, officer, warrant
  const [dependents, setDependents] = useState(0);
  const [kidsAges, setKidsAges] = useState(''); // comma-separated
  
  // Career & Employment
  const [spouseEmployed, setSpouseEmployed] = useState(false);
  const [careerField, setCareerField] = useState('');
  const [portableCareerInterest, setPortableCareerInterest] = useState('high'); // high, medium, low
  const [educationGoals, setEducationGoals] = useState(false);
  const [mycaaEligible, setMycaaEligible] = useState(false);
  
  // Financial Situation
  const [tspBalance, setTspBalance] = useState(50000);
  const [tspContribution, setTspContribution] = useState(500);
  const [emergencyFund, setEmergencyFund] = useState('3-6'); // 0, 1-2, 3-6, 6+
  const [monthlyBudgetStress, setMonthlyBudgetStress] = useState('manageable'); // comfortable, manageable, tight, struggling
  const [debtLevel, setDebtLevel] = useState('low'); // none, low, medium, high
  
  // Housing
  const [currentBase, setCurrentBase] = useState('');
  const [housingStatus, setHousingStatus] = useState('on_base'); // on_base, off_base, unsure
  const [bahAmount, setBahAmount] = useState(0);
  const [buyInterest, setBuyInterest] = useState('interested'); // not_interested, researching, ready, already_own
  const [houseHackingInterest, setHouseHackingInterest] = useState(false);
  
  // Goals & Timeline
  const [pcsDate, setPcsDate] = useState('within_6_months'); // within_3, within_6, 6-12, 12+, unknown
  const [deploymentStatus, setDeploymentStatus] = useState('none'); // none, upcoming, currently, returned
  const [sdpAvailable, setSdpAvailable] = useState(false);
  const [sdpAmount, setSdpAmount] = useState(0);
  const [separationTimeline, setSeparationTimeline] = useState('10+'); // 0-2, 2-5, 5-10, 10+, career
  
  // Investment & Risk
  const [investmentComfort, setInvestmentComfort] = useState('moderate'); // conservative, moderate, aggressive
  const [financialGoals, setFinancialGoals] = useState<string[]>([]); // emergency_fund, house_down, retirement, college, debt_free
  
  const toggleGoal = (goal: string) => {
    setFinancialGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    
    const answers = {
      personal: { age, yearsOfService, rankCategory, dependents, kidsAges },
      career: { spouseEmployed, careerField, portableCareerInterest, educationGoals, mycaaEligible },
      financial: { tspBalance, tspContribution, emergencyFund, monthlyBudgetStress, debtLevel },
      housing: { currentBase, housingStatus, bahAmount, buyInterest, houseHackingInterest },
      timeline: { pcsDate, deploymentStatus, sdpAvailable, sdpAmount, separationTimeline },
      goals: { investmentComfort, financialGoals }
    };

    try {
      console.log('Saving assessment:', answers);
      const res = await fetch('/api/save-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      
      console.log('Assessment response:', res.status, res.statusText);
      const data = await res.json();
      console.log('Assessment data:', data);
      
      if (!res.ok) {
        alert(`Failed to save assessment: ${data.error || 'Unknown error'}`);
        setSubmitting(false);
        return;
      }
      
      console.log('Assessment saved successfully, navigating to plan...');
      r.push('/dashboard/plan');
    } catch (error) {
      console.error('Error saving assessment:', error);
      alert('Failed to save assessment. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen" style={{ backgroundColor: '#FDFDFB' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">📋 Financial Readiness Assessment</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Answer these questions to receive your personalized Military Financial Roadmap. Takes about 5-7 minutes.
            </p>
          </div>
          
          <div className="space-y-6">
            {/* Section 1: Personal & Service */}
            <Section title="Personal & Service Information" icon="👤">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Your Age">
                  <input
                    type="number"
                    value={age}
                    onChange={e => setAge(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  />
                </Field>
                <Field label="Years of Service">
                  <input
                    type="number"
                    value={yearsOfService}
                    onChange={e => setYearsOfService(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  />
                </Field>
                <Field label="Rank Category">
                  <select
                    value={rankCategory}
                    onChange={e => setRankCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="enlisted_junior">Enlisted (E1-E6)</option>
                    <option value="enlisted_senior">Enlisted (E7-E9)</option>
                    <option value="warrant">Warrant Officer</option>
                    <option value="officer">Commissioned Officer</option>
                  </select>
                </Field>
                <Field label="Number of Dependents">
                  <input
                    type="number"
                    value={dependents}
                    onChange={e => setDependents(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  />
                </Field>
              </div>
              {dependents > 0 && (
                <Field label="Children's Ages (comma-separated, e.g., 3, 7, 12)">
                  <input
                    type="text"
                    value={kidsAges}
                    onChange={e => setKidsAges(e.target.value)}
                    placeholder="3, 7, 12"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  />
                </Field>
              )}
            </Section>

            {/* Section 2: Career & Employment */}
            <Section title="Career & Employment" icon="💼">
              <div className="space-y-6">
                <Field label="Is your spouse currently employed?">
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={spouseEmployed}
                        onChange={() => setSpouseEmployed(true)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-900">Yes</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={!spouseEmployed}
                        onChange={() => setSpouseEmployed(false)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-900">No</span>
                    </label>
                  </div>
                </Field>
                
                <Field label="Career field or desired field">
                  <input
                    type="text"
                    value={careerField}
                    onChange={e => setCareerField(e.target.value)}
                    placeholder="e.g., Healthcare, IT, Education, Business..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  />
                </Field>
                
                <Field label="Interest in portable/remote career">
                  <select
                    value={portableCareerInterest}
                    onChange={e => setPortableCareerInterest(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="high">High - actively seeking</option>
                    <option value="medium">Medium - exploring options</option>
                    <option value="low">Low - not a priority</option>
                  </select>
                </Field>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={educationGoals}
                    onChange={e => setEducationGoals(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-900 font-medium">Interested in education/certification programs</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={mycaaEligible}
                    onChange={e => setMycaaEligible(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-900 font-medium">MyCAA eligible (E1-E6, W1-W2, O1-O3)</span>
                </div>
              </div>
            </Section>

            {/* Section 3: Financial Situation */}
            <Section title="Financial Situation" icon="💰">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Current TSP Balance">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={tspBalance}
                      onChange={e => setTspBalance(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                </Field>
                <Field label="Monthly TSP Contribution">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={tspContribution}
                      onChange={e => setTspContribution(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                </Field>
                <Field label="Emergency Fund (months of expenses)">
                  <select
                    value={emergencyFund}
                    onChange={e => setEmergencyFund(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="0">None or less than 1 month</option>
                    <option value="1-2">1-2 months</option>
                    <option value="3-6">3-6 months</option>
                    <option value="6+">6+ months</option>
                  </select>
                </Field>
                <Field label="Monthly Budget Status">
                  <select
                    value={monthlyBudgetStress}
                    onChange={e => setMonthlyBudgetStress(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="comfortable">Comfortable - savings left over</option>
                    <option value="manageable">Manageable - breaking even</option>
                    <option value="tight">Tight - living paycheck to paycheck</option>
                    <option value="struggling">Struggling - behind on bills</option>
                  </select>
                </Field>
                <Field label="Debt Level (excluding mortgage)">
                  <select
                    value={debtLevel}
                    onChange={e => setDebtLevel(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="none">No debt</option>
                    <option value="low">Low (&lt;$5k)</option>
                    <option value="medium">Medium ($5k-$20k)</option>
                    <option value="high">High (&gt;$20k)</option>
                  </select>
                </Field>
              </div>
            </Section>

            {/* Section 4: Housing */}
            <Section title="Housing & Location" icon="🏡">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Current/Next Duty Station">
                  <input
                    type="text"
                    value={currentBase}
                    onChange={e => setCurrentBase(e.target.value)}
                    placeholder="e.g., Fort Bragg, Camp Pendleton..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  />
                </Field>
                <Field label="Housing Status">
                  <select
                    value={housingStatus}
                    onChange={e => setHousingStatus(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="on_base">Living on base</option>
                    <option value="off_base">Living off base</option>
                    <option value="unsure">Undecided/PCSing soon</option>
                  </select>
                </Field>
                <Field label="Monthly BAH Amount">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={bahAmount}
                      onChange={e => setBahAmount(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                </Field>
                <Field label="Home Buying Interest">
                  <select
                    value={buyInterest}
                    onChange={e => setBuyInterest(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="not_interested">Not interested</option>
                    <option value="researching">Researching options</option>
                    <option value="ready">Ready to buy soon</option>
                    <option value="already_own">Already own property</option>
                  </select>
                </Field>
              </div>
              <div className="mt-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={houseHackingInterest}
                    onChange={e => setHouseHackingInterest(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-900 font-medium">Interested in house hacking (multi-unit investment)</span>
                </div>
              </div>
            </Section>

            {/* Section 5: Timeline & Deployment */}
            <Section title="Timeline & Deployment" icon="📅">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Next PCS Timeline">
                  <select
                    value={pcsDate}
                    onChange={e => setPcsDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="within_3">Within 3 months</option>
                    <option value="within_6">3-6 months</option>
                    <option value="6-12">6-12 months</option>
                    <option value="12+">12+ months</option>
                    <option value="unknown">Unknown/No PCS planned</option>
                  </select>
                </Field>
                <Field label="Deployment Status">
                  <select
                    value={deploymentStatus}
                    onChange={e => setDeploymentStatus(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="none">No deployment</option>
                    <option value="upcoming">Upcoming deployment</option>
                    <option value="currently">Currently deployed</option>
                    <option value="returned">Recently returned</option>
                  </select>
                </Field>
                <Field label="Years Until Separation/Retirement">
                  <select
                    value={separationTimeline}
                    onChange={e => setSeparationTimeline(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="0-2">0-2 years</option>
                    <option value="2-5">2-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">10+ years</option>
                    <option value="career">Career (20+ years)</option>
                  </select>
                </Field>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={sdpAvailable}
                    onChange={e => setSdpAvailable(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-900 font-medium">I have SDP funds (Savings Deposit Program)</span>
                </div>
                {sdpAvailable && (
                  <Field label="Expected SDP Payout Amount">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={sdpAmount}
                        onChange={e => setSdpAmount(Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      />
                    </div>
                  </Field>
                )}
              </div>
            </Section>

            {/* Section 6: Investment Goals & Risk */}
            <Section title="Investment Goals & Risk Tolerance" icon="📊">
              <div className="space-y-6">
                <Field label="Investment Comfort Level">
                  <select
                    value={investmentComfort}
                    onChange={e => setInvestmentComfort(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="conservative">Conservative - prioritize safety</option>
                    <option value="moderate">Moderate - balanced approach</option>
                    <option value="aggressive">Aggressive - maximize growth</option>
                  </select>
                </Field>
                
                <Field label="Financial Goals (select all that apply)">
                  <div className="space-y-3">
                    {[
                      { id: 'emergency_fund', label: 'Build emergency fund' },
                      { id: 'house_down', label: 'Save for house down payment' },
                      { id: 'retirement', label: 'Optimize retirement savings' },
                      { id: 'college', label: 'Save for kids college' },
                      { id: 'debt_free', label: 'Become debt-free' },
                      { id: 'passive_income', label: 'Generate passive income' }
                    ].map(goal => (
                      <div key={goal.id} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={financialGoals.includes(goal.id)}
                          onChange={() => toggleGoal(goal.id)}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-900 font-medium">{goal.label}</span>
                      </div>
                    ))}
                  </div>
                </Field>
              </div>
            </Section>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? '💾 Saving assessment...' : 'Generate My Personalized Financial Roadmap 🚀'}
              </button>
              <p className="text-center text-sm text-gray-500 mt-4">
                Premium members will receive a downloadable PDF guide
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl p-8 border border-gray-200" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
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

