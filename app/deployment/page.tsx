import type { Metadata } from "next";
import Link from 'next/link';

import { generatePageMeta } from "@/lib/seo-config";

import Footer from "../components/Footer";
import Header from "../components/Header";
import AnimatedCard from '../components/ui/AnimatedCard';
import Icon from '../components/ui/Icon';


export const metadata: Metadata = generatePageMeta({
  title: "Deployment Guide - Complete Preparation, Financial Planning & Reintegration | Garrison Ledger",
  description: "Master deployment preparation with our comprehensive guide. SDP calculator, financial checklists, communication planning, and reintegration strategies for military families.",
  path: "/deployment",
  keywords: [
    "deployment guide",
    "military deployment preparation",
    "SDP calculator",
    "deployment financial planning",
    "military family support",
    "deployment checklist",
    "reintegration guide",
    "deployment communication",
    "POA deployment",
    "OPSEC guidelines"
  ]
});

export default function DeploymentHub() {
  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
              <Icon name="Globe" className="h-4 w-4" />
              <span className="text-sm font-semibold">Complete Deployment Resource Hub</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-serif font-black mb-6 leading-tight">
              The Complete Deployment & Reintegration Guide
            </h1>
            
            <p className="text-xl md:text-2xl text-cyan-100 mb-8 leading-relaxed">
              Navigate deployment with confidence. Financial planning (earn 10% with SDP), legal preparation, communication strategies, and successful homecoming. <strong className="text-white">You&apos;ve got this.</strong>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/dashboard/tools/sdp-strategist"
                className="inline-flex items-center justify-center gap-2 bg-surface text-teal-700 px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <Icon name="DollarSign" className="h-5 w-5" />
                Use SDP Calculator (10% Return)
              </Link>
              <Link
                href="/dashboard/intel"
                className="inline-flex items-center justify-center gap-2 bg-teal-500/20 backdrop-blur border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-teal-500/30 transition-all"
              >
                Get Deployment Financial Plan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="bg-surface border-b border-subtle py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-black text-teal-600 mb-1">6-12</div>
              <div className="text-sm text-body">Months (Typical)</div>
            </div>
            <div>
              <div className="text-3xl font-black text-success mb-1">10%</div>
              <div className="text-sm text-body">SDP Return Rate</div>
            </div>
            <div>
              <div className="text-3xl font-black text-info mb-1">$10K</div>
              <div className="text-sm text-body">Max SDP Deposit</div>
            </div>
            <div>
              <div className="text-3xl font-black text-purple-600 mb-1">90</div>
              <div className="text-sm text-body">Days to Submit SDP</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Quick Navigation */}
        <div className="mb-16 bg-teal-50 border-2 border-teal-200 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-3">
            <Icon name="MapPin" className="h-6 w-6 text-teal-600" />
            Deployment Cycle Phases
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <a href="#before" className="flex items-center justify-between px-4 py-3 bg-surface rounded-lg hover:shadow-md transition-all group">
              <span className="font-semibold text-body">Before Deployment</span>
              <Icon name="ChevronRight" className="h-5 w-5 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a href="#during" className="flex items-center justify-between px-4 py-3 bg-surface rounded-lg hover:shadow-md transition-all group">
              <span className="font-semibold text-body">During Deployment</span>
              <Icon name="ChevronRight" className="h-5 w-5 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a href="#after" className="flex items-center justify-between px-4 py-3 bg-surface rounded-lg hover:shadow-md transition-all group">
              <span className="font-semibold text-body">Reintegration</span>
              <Icon name="ChevronRight" className="h-5 w-5 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a href="#financial" className="flex items-center justify-between px-4 py-3 bg-surface rounded-lg hover:shadow-md transition-all group">
              <span className="font-semibold text-body">Financial Planning</span>
              <Icon name="ChevronRight" className="h-5 w-5 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a href="#legal" className="flex items-center justify-between px-4 py-3 bg-surface rounded-lg hover:shadow-md transition-all group">
              <span className="font-semibold text-body">Legal Prep (POA)</span>
              <Icon name="ChevronRight" className="h-5 w-5 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a href="#faq" className="flex items-center justify-between px-4 py-3 bg-surface rounded-lg hover:shadow-md transition-all group">
              <span className="font-semibold text-body">FAQs</span>
              <Icon name="ChevronRight" className="h-5 w-5 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>

        {/* Before Deployment */}
        <section id="before" className="mb-20">
          <AnimatedCard delay={0}>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-2xl p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-info rounded-xl flex items-center justify-center text-white font-black text-xl">
                  1
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-black text-primary">
                  Before Deployment: Preparation Phase
                </h2>
              </div>
              
              <div id="legal" className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="bg-surface rounded-xl p-6 border border-info">
                  <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    <Icon name="File" className="h-5 w-5 text-info" />
                    Legal Preparations
                  </h3>
                  <ul className="space-y-3 text-body">
                    <li className="flex items-start gap-3">
                      <Icon name="Check" className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span><strong>Power of Attorney (POA):</strong> Visit base legal to prepare Special or General POA (free for active duty)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Icon name="Check" className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span><strong>Update will:</strong> Review beneficiaries and estate planning</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Icon name="Check" className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span><strong>SGLI review:</strong> Confirm $500K life insurance and beneficiaries current</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Icon name="Check" className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span><strong>Document copies:</strong> Birth certificates, passports, marriage certificate, medical records</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-surface rounded-xl p-6 border border-success">
                  <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    <Icon name="DollarSign" className="h-5 w-5 text-success" />
                    Financial Setup
                  </h3>
                  <ul className="space-y-3 text-body">
                    <li className="flex items-start gap-3">
                      <Icon name="Check" className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span><strong>Set up allotments:</strong> Automate bill payments (rent, car, insurance)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Icon name="Check" className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span><strong>Emergency fund:</strong> Build 3-6 months expenses before deploying</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Icon name="Check" className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span><strong>Joint accounts:</strong> Ensure spouse has access to all financial accounts</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Icon name="Check" className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span><strong>SCRA benefits:</strong> Contact creditors to reduce interest to 6% max on pre-service debts</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </section>

        {/* SDP - Savings Deposit Program */}
        <section id="financial" className="mb-20">
          <AnimatedCard delay={100}>
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-8 md:p-12 shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center border-2 border-white/30">
                  <Icon name="PiggyBank" className="h-10 w-10" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-serif font-black">
                    SDP: The 10% Guaranteed Return
                  </h2>
                  <p className="text-white/90 font-semibold">Savings Deposit Program - Military&apos;s Best-Kept Secret</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">What is SDP?</h3>
                  <p className="text-green-50 mb-4 leading-relaxed">
                    The Savings Deposit Program (SDP) allows service members deployed to designated combat zones to deposit up to <strong className="text-white">$10,000</strong> and earn a <strong className="text-yellow-300">guaranteed 10% annual return</strong>.
                  </p>
                  <p className="text-sm text-white/90">
                    This is <strong>risk-free, tax-free money</strong> - one of the best financial benefits available to deployed service members.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">Eligibility & Rules</h3>
                  <ul className="space-y-2 text-sm text-green-50">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-300">▸</span>
                      <span>Must be deployed to <strong>designated combat zone</strong> for 30+ consecutive days</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-300">▸</span>
                      <span>Maximum deposit: <strong>$10,000</strong> (undeployed pay only)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-300">▸</span>
                      <span>Interest accrues up to <strong>90 days after redeployment</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-300">▸</span>
                      <span>Start SDP within <strong>90 days of arrival</strong> in combat zone</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-300">▸</span>
                      <span>Funds returned within <strong>120 days after deployment ends</strong></span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 bg-gradient-to-r from-yellow-400 to-amber-500 text-primary rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <Icon name="Calculator" className="h-8 w-8 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Calculate Your SDP Potential</h3>
                    <p className="text-sm text-primary mb-4">
                      A 12-month deployment with maximum $10,000 contribution earns you <strong>$1,000+ guaranteed</strong>. Our SDP Strategist helps you optimize your contribution strategy.
                    </p>
                    <Link
                      href="/dashboard/tools/sdp-strategist"
                      className="inline-flex items-center gap-2 bg-surface text-amber-700 px-6 py-3 rounded-lg font-bold hover:bg-surface-hover transition-colors shadow-lg"
                    >
                      <Icon name="Calculator" className="h-5 w-5" />
                      Calculate My SDP Growth
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </section>

        {/* During Deployment */}
        <section id="during" className="mb-20">
          <AnimatedCard delay={200}>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-2xl p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white font-black text-xl">
                  2
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-black text-primary">
                  During Deployment: Staying Connected
                </h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="bg-surface rounded-xl p-6 border border-purple-200">
                  <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    <Icon name="MessageSquare" className="h-5 w-5 text-purple-600" />
                    Communication Options
                  </h3>
                  <div className="space-y-3 text-body text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <div>
                        <strong>Email:</strong> Most reliable method (check DSN email regularly)
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <div>
                        <strong>Video calls:</strong> Available when bandwidth allows (Skype, FaceTime, WhatsApp)
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <div>
                        <strong>Phone calls:</strong> AT&T Direct, DSN, morale calls (limited availability)
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <div>
                        <strong>Letters/packages:</strong> APO/FPO addresses (tangible connection, morale boost)
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-danger-subtle border-2 border-danger rounded-lg">
                    <div className="flex items-start gap-2">
                      <Icon name="AlertTriangle" className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-danger">
                        <strong>OPSEC Warning:</strong> Never post specific dates, locations, troop movements, or mission details online. When in doubt, don&apos;t post it.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-surface rounded-xl p-6 border border-purple-200">
                  <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    <Icon name="Heart" className="h-5 w-5 text-purple-600" />
                    For Families at Home
                  </h3>
                  <div className="space-y-3 text-body text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-success font-bold">✓</span>
                      <div>
                        <strong>Maintain routines:</strong> Keep normal schedules for children (school, activities, bedtime)
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-success font-bold">✓</span>
                      <div>
                        <strong>Join FRG:</strong> Family Readiness Group provides support, updates, community
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-success font-bold">✓</span>
                      <div>
                        <strong>Self-care:</strong> Exercise, hobbies, friendships - don&apos;t neglect your own needs
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-success font-bold">✓</span>
                      <div>
                        <strong>Seek support:</strong> Military OneSource counseling (free, confidential, 24/7)
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-success font-bold">✓</span>
                      <div>
                        <strong>Financial management:</strong> Review budget monthly, track expenses, adjust as needed
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </section>

        {/* Deployment Special Pays */}
        <section className="mb-20">
          <AnimatedCard delay={300}>
            <h2 className="text-4xl font-serif font-black text-primary mb-8">
              Deployment Financial Benefits
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* IDP */}
              <div className="bg-surface border-2 border-info rounded-xl p-6">
                <div className="w-14 h-14 bg-info rounded-xl flex items-center justify-center mb-4">
                  <Icon name="Shield" className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">IDP</h3>
                <p className="text-xs text-body mb-3">Imminent Danger Pay</p>
                <div className="text-2xl font-black text-info">$225/mo</div>
                <p className="text-xs text-muted mt-2">Designated hostile fire zones</p>
              </div>

              {/* HDP */}
              <div className="bg-surface border-2 border-purple-200 rounded-xl p-6">
                <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <Icon name="AlertTriangle" className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">HDP</h3>
                <p className="text-xs text-body mb-3">Hardship Duty Pay</p>
                <div className="text-2xl font-black text-purple-600">$50-$150/mo</div>
                <p className="text-xs text-muted mt-2">Difficult living conditions</p>
              </div>

              {/* FSA */}
              <div className="bg-surface border-2 border-success rounded-xl p-6">
                <div className="w-14 h-14 bg-success rounded-xl flex items-center justify-center mb-4">
                  <Icon name="Home" className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">FSA</h3>
                <p className="text-xs text-body mb-3">Family Separation Allowance</p>
                <div className="text-2xl font-black text-success">$250/mo</div>
                <p className="text-xs text-muted mt-2">30+ days away from dependents</p>
              </div>

              {/* CZTE */}
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-2 border-amber-400 rounded-xl p-6">
                <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center mb-4 border border-white/30">
                  <Icon name="Star" className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold mb-2">CZTE</h3>
                <p className="text-xs text-amber-100 mb-3">Combat Zone Tax Exclusion</p>
                <div className="text-2xl font-black text-yellow-200">TAX FREE</div>
                <p className="text-xs text-amber-100 mt-2">All pay earned in combat zone</p>
              </div>
            </div>

            <div className="mt-8 bg-surface rounded-xl p-6 border-2 border-subtle">
              <div className="flex items-start gap-4">
                <Icon name="Calculator" className="h-8 w-8 text-success flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-primary mb-2">Example: 12-Month Deployment</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-body">
                    <div>
                      <div className="font-semibold mb-2">Monthly Pays:</div>
                      <ul className="space-y-1">
                        <li>Base Pay (E-5): $3,200</li>
                        <li>BAH (with deps): $1,800</li>
                        <li>BAS: $460</li>
                        <li>IDP: $225</li>
                        <li>FSA: $250</li>
                        <li className="pt-2 border-t border-subtle font-bold">Total: $5,935/mo</li>
                      </ul>
                    </div>
                    <div>
                      <div className="font-semibold mb-2">12-Month Benefits:</div>
                      <ul className="space-y-1">
                        <li>Regular Pay: $71,220</li>
                        <li>Tax Savings (CZTE): ~$8,500</li>
                        <li>SDP Growth ($10K @ 10%): $1,000</li>
                        <li className="pt-2 border-t border-subtle font-bold text-success">Extra Income: ~$9,500</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </section>

        {/* Reintegration */}
        <section id="after" className="mb-20">
          <AnimatedCard delay={400}>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-2xl p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-rose-600 rounded-xl flex items-center justify-center text-white font-black text-xl">
                  3
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-black text-primary">
                  Reintegration: Coming Home
                </h2>
              </div>
              
              <div className="bg-surface rounded-xl p-6 border border-rose-200">
                <h3 className="text-xl font-bold text-primary mb-4">Homecoming is a Process, Not an Event</h3>
                <p className="text-body mb-6 leading-relaxed">
                  It&apos;s normal to feel awkward or experience tension when the service member returns. The deployed member has been in a highly structured environment with specific mission focus, while the at-home spouse has been managing everything solo and establishing new routines. <strong>Give it time and communicate openly.</strong>
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-rose-900 mb-3">For the Service Member:</h4>
                    <ul className="space-y-2 text-sm text-body">
                      <li className="flex items-start gap-2">
                        <span className="text-rose-600">•</span>
                        <span>Ease back into family roles gradually</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-rose-600">•</span>
                        <span>Respect routines spouse established</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-rose-600">•</span>
                        <span>Be patient with children re-bonding</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-rose-600">•</span>
                        <span>Seek counseling if experiencing PTSD symptoms</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-rose-900 mb-3">For the At-Home Spouse:</h4>
                    <ul className="space-y-2 text-sm text-body">
                      <li className="flex items-start gap-2">
                        <span className="text-rose-600">•</span>
                        <span>Allow time for readjustment (3-6 months normal)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-rose-600">•</span>
                        <span>Share responsibilities slowly, not all at once</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-rose-600">•</span>
                        <span>Communicate expectations openly</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-rose-600">•</span>
                        <span>Attend reintegration briefings together</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-info-subtle border border-info rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Resources:</strong> Military OneSource (24/7 counseling), Chaplain services, TRICARE behavioral health, Fleet & Family Support Center.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="mb-20">
          <AnimatedCard delay={500}>
            <h2 className="text-4xl font-serif font-black text-primary mb-8">
              Deployment FAQs
            </h2>
            
            <div className="space-y-4">
              <details className="bg-surface border-2 border-subtle rounded-xl p-6 hover:border-teal-300 transition-colors group">
                <summary className="font-bold text-primary cursor-pointer flex items-center justify-between">
                  <span>What is a Power of Attorney (POA) and which type do I need?</span>
                  <Icon name="ChevronDown" className="h-5 w-5 text-muted group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 text-body leading-relaxed pl-6 border-l-4 border-info">
                  <p className="mb-3">
                    A POA is a legal document giving someone (usually your spouse) authority to make financial or legal decisions on your behalf while you&apos;re deployed.
                  </p>
                  <div className="bg-info-subtle rounded-lg p-4 mb-3">
                    <div className="font-bold text-blue-900 mb-2">Two Types:</div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>General POA:</strong> Grants broad powers (manage finances, sell property, make legal decisions). Use for longer deployments or if spouse needs full authority.
                      </div>
                      <div>
                        <strong>Special POA:</strong> Limited to specific actions (manage specific account, register car, handle one transaction). Use when you want to limit scope.
                      </div>
                    </div>
                  </div>
                  <p className="text-sm bg-success-subtle border border-success rounded-lg p-3">
                    <strong>Free Service:</strong> Your base legal office can prepare POA documents for free. Schedule appointment 30+ days before deployment if possible.
                  </p>
                </div>
              </details>

              <details className="bg-surface border-2 border-subtle rounded-xl p-6 hover:border-teal-300 transition-colors group">
                <summary className="font-bold text-primary cursor-pointer flex items-center justify-between">
                  <span>How long does a typical military deployment last?</span>
                  <Icon name="ChevronDown" className="h-5 w-5 text-muted group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 text-body leading-relaxed pl-6 border-l-4 border-purple-500">
                  <p className="mb-3">
                    Standard deployments typically last <strong>6-12 months</strong>, though length varies by branch, mission type, and unit rotation schedule.
                  </p>
                  <ul className="space-y-2 text-sm bg-surface-hover rounded-lg p-4">
                    <li><strong>Army:</strong> 9-12 months typical</li>
                    <li><strong>Navy:</strong> 6-9 months (carrier deployments)</li>
                    <li><strong>Air Force:</strong> 4-6 months (rotating squadrons)</li>
                    <li><strong>Marines:</strong> 6-7 months (MEU rotations)</li>
                    <li><strong>Special Operations:</strong> Variable (3-12+ months)</li>
                  </ul>
                  <p className="mt-3 text-sm">
                    Your unit will provide specific timeline during pre-deployment briefings. Extensions (&ldquo;stop-loss&rdquo;) can occur but are now rare.
                  </p>
                </div>
              </details>

              <details className="bg-surface border-2 border-subtle rounded-xl p-6 hover:border-teal-300 transition-colors group">
                <summary className="font-bold text-primary cursor-pointer flex items-center justify-between">
                  <span>What financial support is available during deployment?</span>
                  <Icon name="ChevronDown" className="h-5 w-5 text-muted group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 text-body leading-relaxed pl-6 border-l-4 border-success">
                  <div className="space-y-3">
                    <div className="bg-success-subtle rounded-lg p-4">
                      <strong className="text-success">Special Pays:</strong>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>• <strong>IDP:</strong> $225/month (imminent danger zones)</li>
                        <li>• <strong>HDP:</strong> $50-$150/month (hardship duty)</li>
                        <li>• <strong>FSA:</strong> $250/month (30+ days family separation)</li>
                      </ul>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4">
                      <strong className="text-amber-900">Tax Benefits:</strong>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>• <strong>CZTE:</strong> All pay earned in combat zone is tax-free</li>
                        <li>• <strong>TSP contributions:</strong> Can contribute tax-free combat pay to Roth TSP</li>
                      </ul>
                    </div>
                    <div className="bg-info-subtle rounded-lg p-4">
                      <strong className="text-blue-900">Savings Opportunities:</strong>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>• <strong>SDP:</strong> 10% guaranteed return on up to $10,000</li>
                        <li>• <strong>Reduced expenses:</strong> No rent (if living on base), free meals</li>
                        <li>• <strong>SCRA benefits:</strong> 6% interest rate cap on pre-service debts</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </AnimatedCard>
        </section>

        {/* Related Tools */}
        <section className="mb-20">
          <AnimatedCard delay={600}>
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 text-white text-center">
              <h2 className="text-3xl md:text-4xl font-serif font-black mb-6">
                Maximize Your Deployment Savings
              </h2>
              <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
                Use our SDP calculator to see exactly how much you can earn with the 10% guaranteed return.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <Link
                  href="/dashboard/tools/sdp-strategist"
                  className="bg-surface text-primary rounded-xl p-6 hover:shadow-2xl transition-all hover:-translate-y-1 text-left group"
                >
                  <Icon name="PiggyBank" className="h-8 w-8 text-success mb-3" />
                  <h3 className="text-xl font-bold mb-2 group-hover:text-success transition-colors">SDP Strategist</h3>
                  <p className="text-sm text-body">
                    Calculate your 10% deployment savings growth and contribution strategy.
                  </p>
                </Link>
                
                <Link
                  href="/dashboard/intel"
                  className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-6 hover:shadow-2xl transition-all hover:-translate-y-1 text-left group border-2 border-slate-700"
                >
                  <Icon name="Sparkles" className="h-8 w-8 mb-3" />
                  <h3 className="text-xl font-bold mb-2">Get Deployment Financial Plan</h3>
                  <p className="text-sm text-white/90">
                    AI-curated guidance for your deployment financial strategy.
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
            "headline": "Complete Deployment & Reintegration Guide for Military Families",
            "description": "Comprehensive deployment guide covering preparation, financial planning, communication, and reintegration",
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
            "dateModified": "2025-01-16"
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
                "name": "What is a Power of Attorney (POA) and which type do I need?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A POA is a legal document giving someone authority to make financial or legal decisions. A General POA grants broad powers, while a Special POA is limited to specific actions. Most military families need a Special POA for deployment."
                }
              },
              {
                "@type": "Question",
                "name": "How long does a typical military deployment last?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Standard deployments typically last 6-12 months, though length varies by branch, mission, and unit. Army: 9-12 months, Navy: 6-9 months, Air Force: 4-6 months, Marines: 6-7 months."
                }
              },
              {
                "@type": "Question",
                "name": "What financial support is available during deployment?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Service members receive special pays including Imminent Danger Pay ($225/mo), Hardship Duty Pay ($50-150/mo), Family Separation Allowance ($250/mo), and Combat Zone Tax Exclusion (CZTE) making deployed pay tax-free. SDP offers 10% guaranteed return on up to $10,000."
                }
              }
            ]
          })
        }}
      />
    </>
  );
}

