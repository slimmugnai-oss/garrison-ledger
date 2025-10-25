import type { Metadata } from "next";
import Link from 'next/link';

import { generatePageMeta } from "@/lib/seo-config";

import Footer from "../components/Footer";
import Header from "../components/Header";
import AnimatedCard from '../components/ui/AnimatedCard';
import Badge from '../components/ui/Badge';
import Icon from '../components/ui/Icon';


export const metadata: Metadata = generatePageMeta({
  title: "Military Career Hub - Portable Careers & Remote Jobs for Military Spouses | Garrison Ledger",
  description: "Complete career guide for military spouses and transitioning service members. Find portable careers, remote jobs, MyCAA funding, resume tips, and federal employment opportunities.",
  path: "/career-hub",
  keywords: [
    "portable careers military spouses",
    "military spouse jobs",
    "remote work military spouses",
    "military spouse employment",
    "MyCAA funding",
    "military transition careers",
    "federal jobs military spouse",
    "military spouse resume",
    "portable career guide"
  ]
});

export default function CareerHub() {
  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
              <Icon name="Briefcase" className="h-4 w-4" />
              <span className="text-sm font-semibold">Career Development Hub</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-serif font-black mb-6 leading-tight">
              Portable Careers for Military Spouses & Service Members
            </h1>
            
            <p className="text-xl md:text-2xl text-pink-100 mb-8 leading-relaxed">
              Build a career that survives PCS moves. Find remote work, unlock MyCAA funding ($4,000), and transition with confidence. <strong className="text-white">21% unemployment rate ends here.</strong>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/dashboard/tools/salary-calculator"
                className="inline-flex items-center justify-center gap-2 bg-surface text-purple-700 px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <Icon name="Calculator" className="h-5 w-5" />
                Career Opportunity Analyzer
              </Link>
              <Link
                href="/dashboard/intel"
                className="inline-flex items-center justify-center gap-2 bg-purple-500/20 backdrop-blur border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-purple-500/30 transition-all"
              >
                Get Personalized Career Plan
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
              <div className="text-3xl font-black text-purple-600 mb-1">21-24%</div>
              <div className="text-sm text-body">Spouse Unemployment</div>
            </div>
            <div>
              <div className="text-3xl font-black text-success mb-1">$4,000</div>
              <div className="text-sm text-body">MyCAA Funding</div>
            </div>
            <div>
              <div className="text-3xl font-black text-info mb-1">$35K-$120K</div>
              <div className="text-sm text-body">Remote Career Range</div>
            </div>
            <div>
              <div className="text-3xl font-black text-amber-600 mb-1">500+</div>
              <div className="text-sm text-body">MSEP Employers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Quick Navigation */}
        <div className="mb-16 bg-purple-50 border-2 border-purple-200 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-3">
            <Icon name="MapPin" className="h-6 w-6 text-purple-600" />
            Jump to Section
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <a href="#portable" className="flex items-center justify-between px-4 py-3 bg-surface rounded-lg hover:shadow-md transition-all group">
              <span className="font-semibold text-body">Portable Careers</span>
              <Icon name="ChevronRight" className="h-5 w-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a href="#mycaa" className="flex items-center justify-between px-4 py-3 bg-surface rounded-lg hover:shadow-md transition-all group">
              <span className="font-semibold text-body">MyCAA Funding</span>
              <Icon name="ChevronRight" className="h-5 w-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a href="#remote" className="flex items-center justify-between px-4 py-3 bg-surface rounded-lg hover:shadow-md transition-all group">
              <span className="font-semibold text-body">Remote Jobs</span>
              <Icon name="ChevronRight" className="h-5 w-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a href="#resume" className="flex items-center justify-between px-4 py-3 bg-surface rounded-lg hover:shadow-md transition-all group">
              <span className="font-semibold text-body">Resume Guide</span>
              <Icon name="ChevronRight" className="h-5 w-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a href="#transition" className="flex items-center justify-between px-4 py-3 bg-surface rounded-lg hover:shadow-md transition-all group">
              <span className="font-semibold text-body">Military Transition</span>
              <Icon name="ChevronRight" className="h-5 w-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a href="#faq" className="flex items-center justify-between px-4 py-3 bg-surface rounded-lg hover:shadow-md transition-all group">
              <span className="font-semibold text-body">FAQs</span>
              <Icon name="ChevronRight" className="h-5 w-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>

        {/* Military Spouse Reality */}
        <section className="mb-16">
          <AnimatedCard delay={0}>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-2xl p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-serif font-black text-primary mb-6">
                The Military Spouse Career Reality
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-rose-900 mb-4">The Challenge</h3>
                  <div className="space-y-3 text-body">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-rose-600 font-bold text-sm">!</span>
                      </span>
                      <span><strong>21-24% unemployment rate</strong> (vs 3-4% national average)</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-rose-600 font-bold text-sm">!</span>
                      </span>
                      <span><strong>PCS every 2-3 years</strong> disrupts career progression</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-rose-600 font-bold text-sm">!</span>
                      </span>
                      <span><strong>State license transfers</strong> cost time and money</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-rose-600 font-bold text-sm">!</span>
                      </span>
                      <span><strong>Employment gaps</strong> damage resume credibility</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-rose-600 font-bold text-sm">!</span>
                      </span>
                      <span><strong>Deployment solo parenting</strong> limits work hours/flexibility</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-success mb-4">The Solution: Portable Careers</h3>
                  <div className="space-y-3 text-body">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-success-subtle rounded-full flex items-center justify-center mt-0.5">
                        <Icon name="Check" className="h-4 w-4 text-success" />
                      </span>
                      <span><strong>Remote work</strong> survives every PCS move</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-success-subtle rounded-full flex items-center justify-center mt-0.5">
                        <Icon name="Check" className="h-4 w-4 text-success" />
                      </span>
                      <span><strong>National certifications</strong> transfer across state lines</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-success-subtle rounded-full flex items-center justify-center mt-0.5">
                        <Icon name="Check" className="h-4 w-4 text-success" />
                      </span>
                      <span><strong>Freelance/consulting</strong> provides location flexibility</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-success-subtle rounded-full flex items-center justify-center mt-0.5">
                        <Icon name="Check" className="h-4 w-4 text-success" />
                      </span>
                      <span><strong>Federal employment</strong> preference programs help spouses</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-success-subtle rounded-full flex items-center justify-center mt-0.5">
                        <Icon name="Check" className="h-4 w-4 text-success" />
                      </span>
                      <span><strong>MyCAA provides $4,000</strong> for training/certifications</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </section>

        {/* Top Portable Careers */}
        <section id="portable" className="mb-20">
          <AnimatedCard delay={100}>
            <h2 className="text-4xl font-serif font-black text-primary mb-8">
              Top Portable Careers for Military Spouses (2025)
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Software Developer */}
              <div className="bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-xl p-6 hover:shadow-2xl transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <Icon name="Monitor" className="h-8 w-8" />
                  <Badge variant="success">High Demand</Badge>
                </div>
                <h3 className="text-2xl font-bold mb-2">Software Developer</h3>
                <div className="text-3xl font-black text-white/90 mb-4">$85K-$120K</div>
                <ul className="space-y-2 text-sm text-white/95">
                  <li>✓ 100% remote work standard</li>
                  <li>✓ High salary, strong benefits</li>
                  <li>✓ Bootcamps covered by MyCAA</li>
                  <li>✓ Freelance opportunities abundant</li>
                </ul>
              </div>

              {/* Registered Nurse */}
              <div className="bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-xl p-6 hover:shadow-2xl transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <Icon name="Heart" className="h-8 w-8" />
                  <Badge variant="success">Always Hiring</Badge>
                </div>
                <h3 className="text-2xl font-bold mb-2">Registered Nurse (RN)</h3>
                <div className="text-3xl font-black text-teal-100 mb-4">$70K-$95K</div>
                <ul className="space-y-2 text-sm text-teal-50">
                  <li>✓ Needed at every base (MTF jobs)</li>
                  <li>✓ Compact licensure (multi-state)</li>
                  <li>✓ Travel nursing option ($2K+/week)</li>
                  <li>✓ High job security</li>
                </ul>
              </div>

              {/* Accountant/Bookkeeper */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-6 hover:shadow-2xl transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <Icon name="Calculator" className="h-8 w-8" />
                  <Badge variant="primary">Remote Friendly</Badge>
                </div>
                <h3 className="text-2xl font-bold mb-2">Accountant/Bookkeeper</h3>
                <div className="text-3xl font-black text-white/90 mb-4">$45K-$75K</div>
                <ul className="space-y-2 text-sm text-green-50">
                  <li>✓ Fully remote capable</li>
                  <li>✓ QuickBooks certification via MyCAA</li>
                  <li>✓ Freelance client flexibility</li>
                  <li>✓ Tax season surge income</li>
                </ul>
              </div>

              {/* Virtual Assistant */}
              <div className="bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-xl p-6 hover:shadow-2xl transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <Icon name="Users" className="h-8 w-8" />
                  <Badge variant="warning">Low Barrier</Badge>
                </div>
                <h3 className="text-2xl font-bold mb-2">Virtual Assistant</h3>
                <div className="text-3xl font-black text-purple-100 mb-4">$35K-$55K</div>
                <ul className="space-y-2 text-sm text-purple-50">
                  <li>✓ Start quickly (minimal training)</li>
                  <li>✓ 100% remote</li>
                  <li>✓ Flexible hours (deployment-friendly)</li>
                  <li>✓ Grow to agency model</li>
                </ul>
              </div>

              {/* Marketing Specialist */}
              <div className="bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-xl p-6 hover:shadow-2xl transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <Icon name="TrendingUp" className="h-8 w-8" />
                  <Badge variant="primary">Growing Field</Badge>
                </div>
                <h3 className="text-2xl font-bold mb-2">Marketing Specialist</h3>
                <div className="text-3xl font-black text-orange-100 mb-4">$50K-$80K</div>
                <ul className="space-y-2 text-sm text-orange-50">
                  <li>✓ Remote work standard</li>
                  <li>✓ Digital marketing certifications</li>
                  <li>✓ Freelance + full-time options</li>
                  <li>✓ Social media skills transferable</li>
                </ul>
              </div>

              {/* Teacher/Tutor */}
              <div className="bg-gradient-to-br from-amber-500 to-yellow-600 text-white rounded-xl p-6 hover:shadow-2xl transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <Icon name="BookOpen" className="h-8 w-8" />
                  <Badge variant="success">Stable Demand</Badge>
                </div>
                <h3 className="text-2xl font-bold mb-2">Teacher/Online Tutor</h3>
                <div className="text-3xl font-black text-amber-100 mb-4">$40K-$65K</div>
                <ul className="space-y-2 text-sm text-amber-50">
                  <li>✓ DoDEA schools at every base</li>
                  <li>✓ Online tutoring (VIPKid, Outschool)</li>
                  <li>✓ Teaching licenses (check reciprocity)</li>
                  <li>✓ Summer break for PCS flexibility</li>
                </ul>
              </div>
            </div>
          </AnimatedCard>
        </section>

        {/* MyCAA Funding */}
        <section id="mycaa" className="mb-20">
          <AnimatedCard delay={200}>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-success rounded-2xl p-8 md:p-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-success rounded-xl flex items-center justify-center">
                  <Icon name="DollarSign" className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-serif font-black text-primary">
                    MyCAA: $4,000 Free Career Training
                  </h2>
                  <p className="text-success font-semibold">Military Spouse Career Advancement Accounts</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div className="bg-surface rounded-xl p-6 border border-success">
                  <h3 className="text-xl font-bold text-primary mb-4">Who&apos;s Eligible?</h3>
                  <div className="space-y-3 text-body">
                    <div className="flex items-start gap-2">
                      <span className="text-success">▸</span>
                      <span>Spouses of active-duty members in <strong>pay grades E-1 to E-6, W-1 to W-2, O-1 to O-3</strong></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-success">▸</span>
                      <span>Service member on <strong>Title 10 orders</strong> (includes activated Guard/Reserve)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-success">▸</span>
                      <span>Must be pursuing <strong>portable career field</strong> (approved list)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-success">▸</span>
                      <span>Degree, license, or certification program</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">What&apos;s Covered?</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-4xl font-black text-white/90 mb-2">$4,000</div>
                      <div className="text-sm text-white/90">Maximum funding per spouse (lifetime)</div>
                    </div>
                    <div className="space-y-2 text-sm text-green-50">
                      <div className="flex items-start gap-2">
                        <span>✓</span>
                        <span>Tuition, fees, books</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span>✓</span>
                        <span>Licenses and certifications</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span>✓</span>
                        <span>Associate degrees (up to 2 years)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span>✓</span>
                        <span>Online and in-person programs</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <a
                        href="https://myseco.militaryonesource.mil/portal/mycaa"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-surface text-success px-4 py-2 rounded-lg font-bold text-sm hover:bg-success-subtle transition-colors"
                      >
                        Apply for MyCAA
                        <Icon name="ExternalLink" className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="mb-20">
          <AnimatedCard delay={300}>
            <h2 className="text-4xl font-serif font-black text-primary mb-8">
              Career FAQs for Military Spouses
            </h2>
            
            <div className="space-y-4">
              <details className="bg-surface border-2 border-subtle rounded-xl p-6 hover:border-purple-300 transition-colors group">
                <summary className="font-bold text-primary cursor-pointer flex items-center justify-between">
                  <span>How much does MyCAA provide?</span>
                  <Icon name="ChevronDown" className="h-5 w-5 text-muted group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 text-body leading-relaxed pl-6 border-l-4 border-success">
                  <p>
                    MyCAA provides up to <strong>$4,000 for eligible spouses</strong> to pursue licenses, certifications, or associate degrees in portable career fields. This is a lifetime benefit that can cover tuition, fees, books, and exam costs.
                  </p>
                </div>
              </details>

              <details className="bg-surface border-2 border-subtle rounded-xl p-6 hover:border-purple-300 transition-colors group">
                <summary className="font-bold text-primary cursor-pointer flex items-center justify-between">
                  <span>Who is eligible for MyCAA?</span>
                  <Icon name="ChevronDown" className="h-5 w-5 text-muted group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 text-body leading-relaxed pl-6 border-l-4 border-info">
                  <p>
                    Spouses of active-duty members in pay grades <strong>E-1 to E-6, W-1 to W-2, and O-1 to O-3</strong> (including activated Guard/Reserve in the same grades) while the service member is on Title 10 orders. Not available for spouses of retired, separated, or non-activated Guard/Reserve members.
                  </p>
                </div>
              </details>

              <details className="bg-surface border-2 border-subtle rounded-xl p-6 hover:border-purple-300 transition-colors group">
                <summary className="font-bold text-primary cursor-pointer flex items-center justify-between">
                  <span>What are the best remote jobs for military spouses in 2025?</span>
                  <Icon name="ChevronDown" className="h-5 w-5 text-muted group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 text-body leading-relaxed pl-6 border-l-4 border-purple-500">
                  <p className="mb-3">Top portable careers with full remote work and transferable skills:</p>
                  <ul className="space-y-2 bg-purple-50 rounded-lg p-4">
                    <li><strong>Software Developer:</strong> $85K-$120K (bootcamp-friendly, MyCAA eligible)</li>
                    <li><strong>Virtual Assistant:</strong> $35K-$55K (quick start, flexible hours)</li>
                    <li><strong>Registered Nurse:</strong> $70K-$95K (needed everywhere, Compact license)</li>
                    <li><strong>Accountant/Bookkeeper:</strong> $45K-$75K (remote work, tax season surge)</li>
                    <li><strong>Marketing Specialist:</strong> $50K-$80K (digital skills, freelance friendly)</li>
                    <li><strong>Teacher/Tutor:</strong> $40K-$65K (DoDEA schools, online tutoring)</li>
                    <li><strong>Graphic Designer:</strong> $45K-$70K (freelance, portfolio-based)</li>
                    <li><strong>Customer Service:</strong> $30K-$50K (fully remote, many companies hiring)</li>
                  </ul>
                </div>
              </details>

              <details className="bg-surface border-2 border-subtle rounded-xl p-6 hover:border-purple-300 transition-colors group">
                <summary className="font-bold text-primary cursor-pointer flex items-center justify-between">
                  <span>How do I maintain a career through multiple PCS moves?</span>
                  <Icon name="ChevronDown" className="h-5 w-5 text-muted group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 text-body leading-relaxed pl-6 border-l-4 border-amber-500">
                  <p className="mb-4"><strong>5-Step Strategy for PCS-Proof Careers:</strong></p>
                  <ol className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center text-amber-900 font-bold text-sm">1</span>
                      <div>
                        <strong>Focus on remote-first careers</strong> - Choose fields where remote work is standard, not an exception
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center text-amber-900 font-bold text-sm">2</span>
                      <div>
                        <strong>Get national certifications</strong> - Avoid state-specific licenses that require transfer fees/exams every PCS
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center text-amber-900 font-bold text-sm">3</span>
                      <div>
                        <strong>Build freelance skills</strong> - Develop consulting/freelance capability for location flexibility
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center text-amber-900 font-bold text-sm">4</span>
                      <div>
                        <strong>Leverage federal employment</strong> - Use military spouse preference programs (PPP, MSEP)
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center text-amber-900 font-bold text-sm">5</span>
                      <div>
                        <strong>Network within military community</strong> - Military spouse employment groups share opportunities
                      </div>
                    </li>
                  </ol>
                </div>
              </details>
            </div>
          </AnimatedCard>
        </section>

        {/* Related Tools */}
        <section className="mb-20">
          <AnimatedCard delay={400}>
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 text-white text-center">
              <h2 className="text-3xl md:text-4xl font-serif font-black mb-6">
                Plan Your Career Transition
              </h2>
              <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
                Use our tools to compare opportunities and build your portable career strategy.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <Link
                  href="/dashboard/tools/salary-calculator"
                  className="bg-surface text-primary rounded-xl p-6 hover:shadow-2xl transition-all hover:-translate-y-1 text-left group"
                >
                  <Icon name="Calculator" className="h-8 w-8 text-purple-600 mb-3" />
                  <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors">Career Opportunity Analyzer</h3>
                  <p className="text-sm text-body">
                    Compare total compensation packages and cost of living for career opportunities.
                  </p>
                </Link>
                
                <Link
                  href="/dashboard/intel"
                  className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-6 hover:shadow-2xl transition-all hover:-translate-y-1 text-left group border-2 border-slate-700"
                >
                  <Icon name="Sparkles" className="h-8 w-8 mb-3" />
                  <h3 className="text-xl font-bold mb-2">Get Personalized Career Plan</h3>
                  <p className="text-sm text-white/90">
                    AI-curated guidance for your unique military career situation.
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
            "headline": "Portable Careers for Military Spouses: Complete Guide",
            "description": "Comprehensive guide to remote work, portable careers, and employment resources for military spouses",
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
                "name": "How much does MyCAA provide?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "MyCAA provides up to $4,000 for eligible spouses to pursue licenses, certifications, or associate degrees in portable career fields."
                }
              },
              {
                "@type": "Question",
                "name": "Who is eligible for MyCAA?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Spouses of active-duty members in pay grades E-1 to E-6, W-1 to W-2, and O-1 to O-3 (including activated Guard/Reserve) while the service member is on Title 10 orders."
                }
              },
              {
                "@type": "Question",
                "name": "What are the best remote jobs for military spouses in 2025?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Top portable careers include Software Developer ($85K-$120K), Virtual Assistant ($35K-$55K), Registered Nurse ($70K-$95K), Accountant ($45K-$75K), Marketing Specialist ($50K-$80K), and Teacher/Tutor ($40K-$65K). All offer remote work and transferable skills."
                }
              }
            ]
          })
        }}
      />
    </>
  );
}

