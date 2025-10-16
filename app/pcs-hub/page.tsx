import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from 'next/link';
import AnimatedCard from '../components/ui/AnimatedCard';
import Icon from '../components/ui/Icon';
import { generatePageMeta } from "@/lib/seo-config";

export const metadata: Metadata = generatePageMeta({
  title: "PCS Hub - Complete Military Relocation & Moving Guide | Garrison Ledger",
  description: "Master your PCS move with our comprehensive guide. Timeline generator, budget calculator, DITY vs government move decision framework, and step-by-step checklists for military families.",
  path: "/pcs-hub",
  keywords: [
    "PCS checklist",
    "military relocation guide",
    "PCS planning",
    "military move",
    "PCS budget calculator",
    "DITY move",
    "PPM move profit",
    "military family relocation",
    "PCS preparation",
    "permanent change of station"
  ]
});

export default function PCSHub() {
  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
              <Icon name="Truck" className="h-4 w-4" />
              <span className="text-sm font-semibold">Complete PCS Resource Hub</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-serif font-black mb-6 leading-tight">
              The Ultimate PCS Checklist & Guide for Military Families
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Master your permanent change of station with our comprehensive timeline generator, budget calculator, and step-by-step moving guide. Save $1,200-$4,500 on your next PCS.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/dashboard/tools/pcs-planner"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <Icon name="Calculator" className="h-5 w-5" />
                Use PCS Financial Planner
              </Link>
              <Link
                href="/dashboard/assessment"
                className="inline-flex items-center justify-center gap-2 bg-blue-500/20 backdrop-blur border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-500/30 transition-all"
              >
                Get Personalized PCS Plan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-black text-blue-600 mb-1">90</div>
              <div className="text-sm text-gray-600">Days to Plan</div>
            </div>
            <div>
              <div className="text-3xl font-black text-green-600 mb-1">$1.2K-$4.5K</div>
              <div className="text-sm text-gray-600">Avg DITY Profit</div>
            </div>
            <div>
              <div className="text-3xl font-black text-purple-600 mb-1">$500-$2K</div>
              <div className="text-sm text-gray-600">Out-of-Pocket Cost</div>
            </div>
            <div>
              <div className="text-3xl font-black text-amber-600 mb-1">5K-18K</div>
              <div className="text-sm text-gray-600">Lbs Weight Allowance</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Quick Navigation */}
        <div className="mb-16 bg-blue-50 border-2 border-blue-200 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Icon name="MapPin" className="h-6 w-6 text-blue-600" />
            Jump to Section
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <a href="#phase1" className="flex items-center justify-between px-4 py-3 bg-white rounded-lg hover:shadow-md transition-all group">
              <span className="font-semibold text-gray-700">Phase 1: Pre-Orders</span>
              <Icon name="ChevronRight" className="h-5 w-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a href="#phase2" className="flex items-center justify-between px-4 py-3 bg-white rounded-lg hover:shadow-md transition-all group">
              <span className="font-semibold text-gray-700">Phase 2: Orders Received</span>
              <Icon name="ChevronRight" className="h-5 w-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a href="#phase3" className="flex items-center justify-between px-4 py-3 bg-white rounded-lg hover:shadow-md transition-all group">
              <span className="font-semibold text-gray-700">Phase 3: Moving</span>
              <Icon name="ChevronRight" className="h-5 w-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-all group" />
            </a>
            <a href="#phase4" className="flex items-center justify-between px-4 py-3 bg-white rounded-lg hover:shadow-md transition-all group">
              <span className="font-semibold text-gray-700">Phase 4: Arrival</span>
              <Icon name="ChevronRight" className="h-5 w-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a href="#financial" className="flex items-center justify-between px-4 py-3 bg-white rounded-lg hover:shadow-md transition-all group">
              <span className="font-semibold text-gray-700">Financial Planning</span>
              <Icon name="ChevronRight" className="h-5 w-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a href="#faq" className="flex items-center justify-between px-4 py-3 bg-white rounded-lg hover:shadow-md transition-all group">
              <span className="font-semibold text-gray-700">FAQs</span>
              <Icon name="ChevronRight" className="h-5 w-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>

        {/* Phase 1: Pre-Orders (60-90 Days Before) */}
        <section id="phase1" className="mb-20">
          <AnimatedCard delay={0}>
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white font-black text-xl">
                  1
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-serif font-black text-gray-900">
                    Phase 1: Pre-Orders Planning
                  </h2>
                  <p className="text-purple-700 font-semibold">60-90 Days Before Move Date</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="bg-white rounded-xl p-6 border border-purple-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Icon name="ClipboardList" className="h-5 w-5 text-purple-600" />
                    Start Preparing
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                        <Icon name="Check" className="h-4 w-4 text-purple-600" />
                      </span>
                      <span>Review current budget and update emergency fund (aim for 3-6 months expenses)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                        <Icon name="Check" className="h-4 w-4 text-purple-600" />
                      </span>
                      <span>Research cost of living at potential new duty stations</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                        <Icon name="Check" className="h-4 w-4 text-purple-600" />
                      </span>
                      <span>Start decluttering and organizing (reduces weight = saves money)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                        <Icon name="Check" className="h-4 w-4 text-purple-600" />
                      </span>
                      <span>Begin researching housing options at likely new locations</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Icon name="Lightbulb" className="h-5 w-5 text-amber-600" />
                    Pro Tips
                  </h3>
                  <ul className="space-y-3 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold mt-0.5">•</span>
                      <span><strong>Start early:</strong> Peak PCS season (May-August) books up fast</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold mt-0.5">•</span>
                      <span><strong>Join PCS groups:</strong> Facebook base-specific groups have insider tips</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold mt-0.5">•</span>
                      <span><strong>Consider DITY/PPM:</strong> You can make $1,200-$4,500 profit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold mt-0.5">•</span>
                      <span><strong>Track expenses:</strong> Keep all receipts for reimbursement</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </section>

        {/* Phase 2: Orders Received (30-60 Days Before) */}
        <section id="phase2" className="mb-20">
          <AnimatedCard delay={100}>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl">
                  2
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-serif font-black text-gray-900">
                    Phase 2: Orders Received
                  </h2>
                  <p className="text-blue-700 font-semibold">30-60 Days Before Report Date</p>
                </div>
              </div>
              
              <div className="space-y-6 mt-8">
                <div className="bg-white rounded-xl p-6 border border-blue-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Icon name="FileText" className="h-5 w-5 text-blue-600" />
                    Critical Actions
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Transportation (TMO/PPPO)</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600">▸</span>
                          <span>Contact TMO 30-45 days before desired move date (60-90 days in peak season)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600">▸</span>
                          <span>Decide: Government move (HHG) vs PPM/DITY (Personally Procured Move)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600">▸</span>
                          <span>Book pack and pickup dates early for best availability</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600">▸</span>
                          <span>Understand your weight allowance: E-1 (5,000 lbs) to O-6+ (18,000 lbs)</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Financial Prep</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600">▸</span>
                          <span><strong>DLA (Dislocation Allowance):</strong> One-time payment for household setup</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600">▸</span>
                          <span><strong>TLE (Temporary Lodging Expense):</strong> Up to 10 days lodging reimbursement</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600">▸</span>
                          <span><strong>Per Diem:</strong> Daily allowance for meals and incidentals during travel</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600">▸</span>
                          <span><strong>Advance Pay:</strong> Consider 1-month advance if needed (must be repaid)</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Icon name="Calculator" className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-bold text-green-900 mb-1">Use Our PCS Financial Planner</h4>
                        <p className="text-sm text-green-800 mb-3">
                          Calculate your exact entitlements (DLA, TLE, per diem), estimate moving costs, and determine if a PPM/DITY move is profitable for you.
                        </p>
                        <Link
                          href="/dashboard/tools/pcs-planner"
                          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                        >
                          <Icon name="Calculator" className="h-4 w-4" />
                          Calculate My PCS Budget
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-blue-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Icon name="Home" className="h-5 w-5 text-blue-600" />
                    Housing Search
                  </h3>
                  <div className="prose prose-blue max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      <strong>Contact your sponsor immediately</strong> for insider knowledge about the new base. They can provide real-world insights about housing, schools, traffic patterns, and local area that official resources don&apos;t cover.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-bold text-blue-900 mb-2">On-Base Housing</h4>
                        <ul className="space-y-1 text-sm text-gray-700">
                          <li>✓ Community, security, short commute</li>
                          <li>✓ Utilities included in BAH</li>
                          <li>✓ May have waitlist (contact housing office early)</li>
                          <li>✓ Base amenities nearby (commissary, gym, schools)</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-bold text-green-900 mb-2">Off-Base Housing</h4>
                        <ul className="space-y-1 text-sm text-gray-700">
                          <li>✓ More variety and space options</li>
                          <li>✓ Work-life separation from military community</li>
                          <li>✓ Require military clause in lease (SCRA protection)</li>
                          <li>✓ Factor utilities into budget (not covered by BAH)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </section>

        {/* Phase 3: Moving (0-30 Days) */}
        <section id="phase3" className="mb-20">
          <AnimatedCard delay={200}>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white font-black text-xl">
                  3
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-serif font-black text-gray-900">
                    Phase 3: Execute Your Move
                  </h2>
                  <p className="text-green-700 font-semibold">Move Week & Travel Days</p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 border border-green-200 mt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Government Move (HHG) Checklist</h3>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <input type="checkbox" className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500" />
                    <span className="text-gray-700">Be present during pack day - document condition of items and any pre-existing damage</span>
                  </label>
                  <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <input type="checkbox" className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500" />
                    <span className="text-gray-700">Keep essential documents, valuables, and irreplaceable items with you (not in HHG shipment)</span>
                  </label>
                  <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <input type="checkbox" className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500" />
                    <span className="text-gray-700">Complete high-value inventory for items over $100 (required for insurance claims)</span>
                  </label>
                  <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <input type="checkbox" className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500" />
                    <span className="text-gray-700">Take photos of electronics, furniture condition before packing</span>
                  </label>
                  <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <input type="checkbox" className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500" />
                    <span className="text-gray-700">Final walkthrough of residence - document condition for security deposit</span>
                  </label>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-green-200 mt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">PPM/DITY Move Checklist</h3>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <input type="checkbox" className="mt-1 h-5 w-5 text-green-600 rounded focus:ring-green-500" />
                    <span className="text-gray-700">Get empty weight ticket before loading (certified scale - CAT scale, truck stop)</span>
                  </label>
                  <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <input type="checkbox" className="mt-1 h-5 w-5 text-green-600 rounded focus:ring-green-500" />
                    <span className="text-gray-700">Load vehicle/truck and get full weight ticket (same scale if possible)</span>
                  </label>
                  <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <input type="checkbox" className="mt-1 h-5 w-5 text-green-600 rounded focus:ring-green-500" />
                    <span className="text-gray-700">Save ALL receipts (truck rental, gas, tolls, packing materials, storage)</span>
                  </label>
                  <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <input type="checkbox" className="mt-1 h-5 w-5 text-green-600 rounded focus:ring-green-500" />
                    <span className="text-gray-700">Document odometer readings (start and end) for mileage reimbursement</span>
                  </label>
                  <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <input type="checkbox" className="mt-1 h-5 w-5 text-green-600 rounded focus:ring-green-500" />
                    <span className="text-gray-700">Submit PPM claim within 45 days of arrival (don&apos;t wait!)</span>
                  </label>
                </div>
                
                <div className="mt-4 p-4 bg-green-600 text-white rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="DollarSign" className="h-5 w-5" />
                    <span className="font-bold">Average PPM/DITY Profit: $1,200-$4,500</span>
                  </div>
                  <p className="text-sm text-green-100">
                    The government reimburses 100% of what it would have cost them. If you can move for less, you keep the difference!
                  </p>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </section>

        {/* Phase 4: Arrival & Settlement */}
        <section id="phase4" className="mb-20">
          <AnimatedCard delay={300}>
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center text-white font-black text-xl">
                  4
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-serif font-black text-gray-900">
                    Phase 4: Arrival & In-Processing
                  </h2>
                  <p className="text-amber-700 font-semibold">First 30 Days at New Station</p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 border border-amber-200 mt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">First Week Checklist</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                    <Icon name="CheckCircle" className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-gray-900">Report to new command by RNLTD</span>
                      <p className="text-sm text-gray-600 mt-1">Late arrival can result in AWOL status - communicate if delayed</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                    <Icon name="CheckCircle" className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-gray-900">Complete in-processing checklist</span>
                      <p className="text-sm text-gray-600 mt-1">ID card, DEERS update, finance visit, housing briefing, base orientation</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                    <Icon name="CheckCircle" className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-gray-900">Schedule HHG delivery</span>
                      <p className="text-sm text-gray-600 mt-1">Typically arrives 7-21 days after pack date - TMO will coordinate</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                    <Icon name="CheckCircle" className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-gray-900">Enroll children in school/childcare</span>
                      <p className="text-sm text-gray-600 mt-1">Contact schools early - some have waitlists or registration deadlines</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                    <Icon name="CheckCircle" className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-gray-900">Establish utilities and services</span>
                      <p className="text-sm text-gray-600 mt-1">Electric, water, gas, internet, trash - may require deposits</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </section>

        {/* Financial Planning Deep Dive */}
        <section id="financial" className="mb-20">
          <AnimatedCard delay={400}>
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-8">
              PCS Financial Planning
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Government Move vs PPM */}
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Icon name="Truck" className="h-6 w-6 text-blue-600" />
                  Government Move (HHG)
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-green-900 mb-2">✅ Pros:</h4>
                    <ul className="space-y-1 text-sm text-gray-700 ml-4">
                      <li>• Military handles everything (packing, loading, transport, delivery)</li>
                      <li>• No upfront costs (government pays movers directly)</li>
                      <li>• Less physical work for you</li>
                      <li>• Full replacement value insurance included</li>
                      <li>• Best for large households, long distances, OCONUS moves</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-red-900 mb-2">❌ Cons:</h4>
                    <ul className="space-y-1 text-sm text-gray-700 ml-4">
                      <li>• No control over pack/delivery dates (within window)</li>
                      <li>• Items may arrive damaged (file claims within 75 days)</li>
                      <li>• No profit opportunity</li>
                      <li>• Peak season delays common (May-August)</li>
                    </ul>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>Best for:</strong> Families with large households (15,000+ lbs), international moves, or those who prefer convenience over profit.
                    </p>
                  </div>
                </div>
              </div>

              {/* PPM/DITY Move */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-2 border-green-400 rounded-2xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Icon name="DollarSign" className="h-6 w-6" />
                  PPM/DITY Move (Make Profit!)
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold mb-2">✅ Pros:</h4>
                    <ul className="space-y-1 text-sm text-green-50 ml-4">
                      <li>• Keep the difference: Government pays 100%, you do it cheaper</li>
                      <li>• Average profit: <strong className="text-yellow-300">$1,200-$4,500</strong></li>
                      <li>• Full control over dates, packing, handling</li>
                      <li>• Your items, your care (less damage)</li>
                      <li>• Advance payment available (95% upfront)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-bold mb-2">⚠️ Cons:</h4>
                    <ul className="space-y-1 text-sm text-green-50 ml-4">
                      <li>• You do all the work (packing, loading, driving, unloading)</li>
                      <li>• Upfront costs (truck rental, gas, lodging, packing supplies)</li>
                      <li>• Must get weight tickets (empty & full)</li>
                      <li>• Physical labor intensive</li>
                    </ul>
                  </div>
                  
                  <div className="mt-6 p-4 bg-white/10 backdrop-blur border border-white/20 rounded-lg">
                    <p className="text-sm">
                      <strong className="text-yellow-300">Calculator:</strong> Use our PCS Financial Planner to calculate exact profit potential based on your weight, distance, and rank.
                    </p>
                    <Link
                      href="/dashboard/tools/pcs-planner"
                      className="mt-3 inline-flex items-center gap-2 bg-white text-green-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-50 transition-colors"
                    >
                      <Icon name="Calculator" className="h-4 w-4" />
                      Calculate My PPM Profit
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </section>

        {/* PCS Entitlements Breakdown */}
        <section id="entitlements" className="mb-20">
          <AnimatedCard delay={500}>
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-8">
              PCS Entitlements & Money You&apos;re Owed
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* DLA */}
              <div className="bg-white border-2 border-blue-200 rounded-xl p-6">
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Icon name="DollarSign" className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">DLA (Dislocation Allowance)</h3>
                <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                  One-time payment to offset costs of setting up a new household (utility deposits, furniture, essentials).
                </p>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-xs text-gray-600 mb-1">Typical Range:</div>
                  <div className="text-2xl font-black text-blue-600">$800-$3,000</div>
                  <div className="text-xs text-gray-500 mt-1">Depends on rank and dependents</div>
                </div>
              </div>

              {/* TLE */}
              <div className="bg-white border-2 border-green-200 rounded-xl p-6">
                <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center mb-4">
                  <Icon name="Home" className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">TLE (Temporary Lodging Expense)</h3>
                <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                  Reimbursement for temporary lodging and meals while waiting for housing or HHG delivery.
                </p>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-xs text-gray-600 mb-1">Coverage:</div>
                  <div className="text-2xl font-black text-green-600">Up to 10 Days</div>
                  <div className="text-xs text-gray-500 mt-1">At old and/or new duty station</div>
                </div>
              </div>

              {/* Per Diem */}
              <div className="bg-white border-2 border-purple-200 rounded-xl p-6">
                <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <Icon name="Calendar" className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Per Diem</h3>
                <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                  Daily allowance for meals and incidental expenses during authorized travel days.
                </p>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-xs text-gray-600 mb-1">Typical Rate:</div>
                  <div className="text-2xl font-black text-purple-600">$151-$180/day</div>
                  <div className="text-xs text-gray-500 mt-1">Varies by location + dependents</div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="mb-20">
          <AnimatedCard delay={600}>
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-8">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              {/* FAQ 1 */}
              <details className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors group">
                <summary className="font-bold text-gray-900 cursor-pointer flex items-center justify-between">
                  <span>I just got my orders. What are the first three things I should do?</span>
                  <Icon name="ChevronDown" className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 text-gray-700 leading-relaxed pl-6 border-l-4 border-blue-500">
                  <p className="mb-3">
                    <strong>1) Create your timeline:</strong> Use your Report No Later Than Date (RNLTD) to work backward and create a customized checklist. Our PCS Financial Planner can help you build this timeline.
                  </p>
                  <p className="mb-3">
                    <strong>2) Start your PCS Binder:</strong> Make multiple copies of your orders (you&apos;ll need them for TMO, finance, housing, travel). Organize all important documents in one place.
                  </p>
                  <p>
                    <strong>3) Contact TMO immediately:</strong> Schedule your appointment 30-45 days before desired pack date (60-90 days if moving during peak season May-August).
                  </p>
                </div>
              </details>

              {/* FAQ 2 */}
              <details className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors group">
                <summary className="font-bold text-gray-900 cursor-pointer flex items-center justify-between">
                  <span>What&apos;s the difference between a government move and a PPM (DITY) move?</span>
                  <Icon name="ChevronDown" className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 text-gray-700 leading-relaxed pl-6 border-l-4 border-green-500">
                  <p className="mb-3">
                    <strong>Government Move (HHG):</strong> The military hires and manages a moving company. They pack, load, transport, and deliver your household goods. You don&apos;t pay anything upfront, but you also have less control over dates and handling.
                  </p>
                  <p className="mb-3">
                    <strong>PPM/DITY (Personally Procured Move):</strong> You move your own belongings and the government reimburses you 100% of what it would have cost them to hire movers. If you can execute the move for less than their estimate, you keep the difference as profit.
                  </p>
                  <p className="bg-green-50 border border-green-200 rounded-lg p-4 mt-3">
                    <strong className="text-green-900">Profit Potential:</strong> Most families make $1,200-$4,500 profit on a DITY move, depending on distance, weight, and how efficiently they execute. Use our PCS Financial Planner to calculate your specific scenario.
                  </p>
                </div>
              </details>

              {/* FAQ 3 */}
              <details className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors group">
                <summary className="font-bold text-gray-900 cursor-pointer flex items-center justify-between">
                  <span>What are DLA and TLE? How much will I get?</span>
                  <Icon name="ChevronDown" className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 text-gray-700 leading-relaxed pl-6 border-l-4 border-purple-500">
                  <div className="mb-4">
                    <strong className="text-purple-900">DLA (Dislocation Allowance):</strong> One-time payment to help offset costs of setting up a new household like utility deposits, renters insurance, and essentials.
                    <div className="bg-purple-50 rounded-lg p-3 mt-2">
                      <div className="text-sm">Typical amounts:</div>
                      <ul className="text-sm mt-1 space-y-1">
                        <li>• E-1 to E-4 without dependents: ~$800-1,200</li>
                        <li>• E-5 to E-7 with dependents: ~$1,800-2,400</li>
                        <li>• O-3 to O-5 with dependents: ~$2,400-3,000</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <strong className="text-purple-900">TLE (Temporary Lodging Expense):</strong> Reimburses lodging and meal expenses for up to 10 days while you&apos;re in temporary housing waiting for HHG delivery or permanent housing.
                    <div className="bg-purple-50 rounded-lg p-3 mt-2">
                      <div className="text-sm">Coverage: Lodging (actual cost) + meals (75% of per diem rate)</div>
                      <div className="text-sm mt-1">Max: 10 days at old station + 10 days at new station</div>
                    </div>
                  </div>
                </div>
              </details>

              {/* FAQ 4 */}
              <details className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors group">
                <summary className="font-bold text-gray-900 cursor-pointer flex items-center justify-between">
                  <span>How much does a PCS move cost out of pocket?</span>
                  <Icon name="ChevronDown" className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 text-gray-700 leading-relaxed pl-6 border-l-4 border-amber-500">
                  <p className="mb-4">
                    Most CONUS PCS moves cost <strong>$500-$2,000 out of pocket</strong> for military families, even with entitlements.
                  </p>
                  <div className="bg-amber-50 rounded-lg p-4 mb-4">
                    <div className="font-bold text-amber-900 mb-2">Common Out-of-Pocket Expenses:</div>
                    <ul className="space-y-1 text-sm">
                      <li>• Travel meals beyond per diem allowance</li>
                      <li>• Temporary lodging beyond 10 TLE days</li>
                      <li>• Utility deposits at new home ($200-500)</li>
                      <li>• Household items that didn&apos;t survive the move</li>
                      <li>• Pet transportation costs</li>
                      <li>• Car shipping (if not driving all vehicles)</li>
                    </ul>
                  </div>
                  <p className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-900">
                    <strong>OCONUS moves:</strong> Can cost $2,000-$5,000 out of pocket due to passport fees, pet relocation (quarantine, vaccines, flights), additional lodging, and vehicle shipping/storage.
                  </p>
                </div>
              </details>

              {/* FAQ 5 */}
              <details className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors group">
                <summary className="font-bold text-gray-900 cursor-pointer flex items-center justify-between">
                  <span>When should I contact TMO for my PCS move?</span>
                  <Icon name="ChevronDown" className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 text-gray-700 leading-relaxed pl-6 border-l-4 border-blue-500">
                  <p className="mb-4">
                    Contact your Transportation Office (TMO or PPPO) <strong>at least 30-45 days before your desired pack date</strong>.
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <Icon name="AlertTriangle" className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-red-900 mb-1">Peak PCS Season (May-August):</div>
                        <div className="text-sm text-red-800">
                          Contact TMO <strong>60-90 days in advance</strong> to secure your preferred dates. Moving companies book up fast, and you may have limited choice if you wait until the last minute.
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm">
                    <strong>What to bring to TMO:</strong> Copy of orders, weight estimate, desired pack/pickup dates, destination address (if known), and list of high-value items (>$100 each).
                  </p>
                </div>
              </details>

              {/* FAQ 6 */}
              <details className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors group">
                <summary className="font-bold text-gray-900 cursor-pointer flex items-center justify-between">
                  <span>What&apos;s the weight limit for my PCS move?</span>
                  <Icon name="ChevronDown" className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 text-gray-700 leading-relaxed pl-6 border-l-4 border-gray-500">
                  <p className="mb-4">
                    Weight allowances are determined by your <strong>rank and dependency status</strong>:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2">Rank</th>
                          <th className="text-right py-2">Without Deps</th>
                          <th className="text-right py-2">With Deps</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700">
                        <tr className="border-b border-gray-100">
                          <td className="py-2">E-1</td>
                          <td className="text-right">5,000 lbs</td>
                          <td className="text-right">8,000 lbs</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2">E-5</td>
                          <td className="text-right">7,000 lbs</td>
                          <td className="text-right">11,000 lbs</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2">E-7</td>
                          <td className="text-right">11,000 lbs</td>
                          <td className="text-right">13,000 lbs</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2">O-3</td>
                          <td className="text-right">12,000 lbs</td>
                          <td className="text-right">14,000 lbs</td>
                        </tr>
                        <tr>
                          <td className="py-2">O-6+</td>
                          <td className="text-right">18,000 lbs</td>
                          <td className="text-right">18,000 lbs</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <strong>Pro Gear:</strong> You get an additional 2,000 lbs allowance for uniforms and military equipment (separate from household goods weight).
                  </p>
                  <p className="text-sm bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                    <strong>Overage costs:</strong> Exceeding your weight limit costs approximately $0.50-$1.00 per pound. A 1,000 lb overage could cost you $500-$1,000!
                  </p>
                </div>
              </details>
            </div>
          </AnimatedCard>
        </section>

        {/* Related Tools */}
        <section className="mb-20">
          <AnimatedCard delay={700}>
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 text-white text-center">
              <h2 className="text-3xl md:text-4xl font-serif font-black mb-6">
                Ready to Plan Your PCS?
              </h2>
              <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
                Use our AI-powered tools to maximize your PCS profit and minimize stress.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <Link
                  href="/dashboard/tools/pcs-planner"
                  className="bg-white text-gray-900 rounded-xl p-6 hover:shadow-2xl transition-all hover:-translate-y-1 text-left group"
                >
                  <Icon name="Calculator" className="h-8 w-8 text-blue-600 mb-3" />
                  <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">PCS Financial Planner</h3>
                  <p className="text-sm text-gray-600">
                    Calculate entitlements, estimate costs, and determine PPM profit potential.
                  </p>
                </Link>
                
                <Link
                  href="/dashboard/assessment"
                  className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl p-6 hover:shadow-2xl transition-all hover:-translate-y-1 text-left group border-2 border-blue-400"
                >
                  <Icon name="Sparkles" className="h-8 w-8 mb-3" />
                  <h3 className="text-xl font-bold mb-2">Get AI-Curated PCS Plan</h3>
                  <p className="text-sm text-blue-100">
                    Take 5-minute assessment and get personalized PCS financial strategy.
                  </p>
                </Link>
              </div>
            </div>
          </AnimatedCard>
        </section>

      </div>

      <Footer />
      
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "The Ultimate PCS Checklist & Guide for Military Families",
            "description": "Complete guide to military PCS moves with timeline, budget calculator, and expert guidance",
            "author": {
              "@type": "Organization",
              "name": "Garrison Ledger"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Garrison Ledger",
              "url": "https://garrisonledger.com"
            },
            "datePublished": "2025-01-16",
            "dateModified": "2025-01-16",
            "mainEntityOfPage": "https://garrisonledger.com/pcs-hub",
            "articleSection": "Military Relocation",
            "wordCount": 2000,
            "inLanguage": "en-US"
          })
        }}
      />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "I just got my orders. What are the first three things I should do?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "1) Use the Timeline Generator with your Report No Later Than Date to create a customized checklist. 2) Start your PCS Binder with a copy of your orders. 3) Visit your Transportation Office (TMO) to schedule household goods shipment."
                }
              },
              {
                "@type": "Question",
                "name": "What's the difference between a government move and a PPM (DITY) move?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A government move is when the military hires and manages a moving company. A Personally Procured Move (PPM) is when you move your own belongings and the government pays you 100% of what it would have cost them. If you can do it for less, you can potentially make a profit."
                }
              },
              {
                "@type": "Question",
                "name": "What are DLA and TLE?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "DLA (Dislocation Allowance) is a one-time payment to help offset costs of setting up a new household. TLE (Temporary Lodging Expense) provides reimbursement for temporary lodging and meal expenses for up to 10 days at your old or new CONUS duty station."
                }
              },
              {
                "@type": "Question",
                "name": "How much does a PCS move cost out of pocket?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Most CONUS PCS moves cost $500-2,000 out of pocket for military families. This includes travel meals not covered by per diem, temporary lodging beyond TLE days, utility deposits, and household items. International PCS moves can cost $2,000-5,000."
                }
              },
              {
                "@type": "Question",
                "name": "When should I contact TMO for my PCS move?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Contact your Transportation Office (TMO) at least 30-45 days before your desired pack date. During peak PCS season (May-August), contact TMO 60-90 days in advance to secure your preferred dates."
                }
              },
              {
                "@type": "Question",
                "name": "What's the weight limit for my PCS move?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Weight allowances range from 5,000 lbs (E-1 without dependents) to 18,000 lbs (O-6+ with dependents). Your rank and dependency status determine your allowance. Pro gear gets separate 2,000 lb allowance. Exceeding weight limit costs $0.50-1.00 per pound."
                }
              }
            ]
          })
        }}
      />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to Plan a Military PCS Move: Complete Guide",
            "description": "Step-by-step guide to planning and executing a successful military PCS move",
            "totalTime": "P90D",
            "step": [
              {
                "@type": "HowToStep",
                "name": "Receive and Review Orders",
                "text": "Review your PCS orders immediately. Note your RNLTD, gaining unit, and location. Make copies for your PCS binder.",
                "position": 1
              },
              {
                "@type": "HowToStep",
                "name": "Contact Transportation Office (TMO)",
                "text": "Schedule appointment 30-45 days before desired move date. Choose government move or PPM. Book early during peak season.",
                "position": 2
              },
              {
                "@type": "HowToStep",
                "name": "Financial Planning",
                "text": "Calculate your DLA, TLE, and per diem entitlements. Estimate out-of-pocket costs.",
                "position": 3
              },
              {
                "@type": "HowToStep",
                "name": "Arrange Housing and Logistics",
                "text": "Contact sponsor at gaining unit. Research housing. Schedule house hunting trip if authorized.",
                "position": 4
              },
              {
                "@type": "HowToStep",
                "name": "Execute Move",
                "text": "Complete packing or oversee movers. Travel to new duty station with essential documents.",
                "position": 5
              },
              {
                "@type": "HowToStep",
                "name": "In-Process at New Duty Station",
                "text": "Report by RNLTD. Complete in-processing. Arrange HHG delivery. Update DEERS and ID.",
                "position": 6
              }
            ]
          })
        }}
      />
    </>
  );
}

