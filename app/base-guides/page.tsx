import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from 'next/link';
import AnimatedCard from '../components/ui/AnimatedCard';
import Icon from '../components/ui/Icon';
import { generatePageMeta } from "@/lib/seo-config";

export const metadata: Metadata = generatePageMeta({
  title: "Military Base Guides - Housing, Schools & BAH Rates | Garrison Ledger",
  description: "Complete military base guides for major installations. Housing options, school ratings, BAH rates, neighborhoods, and PCS preparation. Research your next duty station.",
  path: "/base-guides",
  keywords: [
    "military base guide",
    "military housing",
    "BAH rates",
    "military schools",
    "base neighborhoods",
    "military installations",
    "PCS preparation",
    "on-base housing",
    "off-base housing",
    "military base directory"
  ]
});

export default function BaseGuidesHub() {
  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-600 via-green-700 to-teal-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
              <Icon name="MapPin" className="h-4 w-4" />
              <span className="text-sm font-semibold">Base Research Hub</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-serif font-black mb-6 leading-tight">
              Military Base Guides: Housing, Schools & PCS Prep
            </h1>
            
            <p className="text-xl md:text-2xl text-emerald-100 mb-8 leading-relaxed">
              Research your next duty station with confidence. Housing options, school ratings, BAH rates, and neighborhood guides for major U.S. installations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/dashboard/assessment"
                className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <Icon name="Sparkles" className="h-5 w-5" />
                Get Personalized Base Guidance
              </Link>
              <a
                href="https://www.defensetravel.dod.mil/site/bahCalc.cfm"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-emerald-500/20 backdrop-blur border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-500/30 transition-all"
              >
                Check BAH Rates
                <Icon name="ExternalLink" className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* On-Base vs Off-Base Decision */}
        <section className="mb-20">
          <AnimatedCard delay={0}>
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-8">
              On-Base vs Off-Base Housing: Making the Decision
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* On-Base */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
                  <Icon name="Shield" className="h-6 w-6" />
                  On-Base Housing
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-green-900 mb-2">✅ Pros:</h4>
                    <ul className="space-y-2 text-sm text-gray-700 ml-4">
                      <li>• Close-knit military community and built-in support network</li>
                      <li>• Security (gated access, military police)</li>
                      <li>• Short commute to work (5-10 minutes walking/biking)</li>
                      <li>• Utilities included in BAH (water, electric, gas, trash)</li>
                      <li>• Maintenance handled by housing office</li>
                      <li>• Base amenities nearby (commissary, gym, pool, playgrounds)</li>
                      <li>• No deposits or upfront costs</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-red-900 mb-2">❌ Cons:</h4>
                    <ul className="space-y-2 text-sm text-gray-700 ml-4">
                      <li>• Limited space/floor plan options</li>
                      <li>• Possible waitlist (3-12 months at some bases)</li>
                      <li>• Less privacy (neighbors are coworkers)</li>
                      <li>• Strict rules (HOA-style regulations)</li>
                      <li>• May not maximize BAH (lose unused portion)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Off-Base */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-green-900 mb-6 flex items-center gap-2">
                  <Icon name="Home" className="h-6 w-6" />
                  Off-Base Housing
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-green-900 mb-2">✅ Pros:</h4>
                    <ul className="space-y-2 text-sm text-gray-700 ml-4">
                      <li>• More variety (houses, apartments, townhomes, neighborhoods)</li>
                      <li>• Larger spaces possible within same BAH</li>
                      <li>• Work-life separation (home isn&apos;t on base)</li>
                      <li>• Local community experience (civilian friends, schools)</li>
                      <li>• May maximize BAH (keep difference if rent is less)</li>
                      <li>• Pet-friendly options more available</li>
                      <li>• Investment opportunity (house hacking, VA loan)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-red-900 mb-2">❌ Cons:</h4>
                    <ul className="space-y-2 text-sm text-gray-700 ml-4">
                      <li>• Longer commute (gate traffic, 20-45 minutes)</li>
                      <li>• Utilities NOT included (factor into budget)</li>
                      <li>• Deposits required (security, utilities, pets = $1,000-2,500)</li>
                      <li>• Must include military clause in lease (SCRA protection)</li>
                      <li>• Responsibility for maintenance and repairs</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </section>

        {/* Housing Search Strategy */}
        <section className="mb-20">
          <AnimatedCard delay={100}>
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-8">
              How to Find Housing Before PCSing
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white border-2 border-blue-200 rounded-xl p-6 hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Icon name="Users" className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Contact Your Sponsor</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Your assigned sponsor has insider knowledge about housing market, neighborhoods, traffic, and local area that official resources don&apos;t provide. Contact them immediately upon receiving orders.
                </p>
              </div>

              <div className="bg-white border-2 border-green-200 rounded-xl p-6 hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4">
                  <Icon name="Search" className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Research Online</h3>
                <p className="text-gray-700 text-sm leading-relaxed mb-3">
                  Use MilitaryByOwner, AHRN.com, and base-specific Facebook PCS groups for rental listings and insider advice from current residents.
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Check school ratings (GreatSchools.org)</li>
                  <li>• Review crime statistics</li>
                  <li>• Calculate commute times</li>
                </ul>
              </div>

              <div className="bg-white border-2 border-purple-200 rounded-xl p-6 hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <Icon name="MapPin" className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">House Hunting Trip</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  If authorized in orders, schedule 7-10 day house hunting trip. Visit multiple neighborhoods, meet landlords, verify military clause acceptance. Secure housing 30-60 days before report date when possible.
                </p>
              </div>
            </div>
          </AnimatedCard>
        </section>

        {/* BAH & Budget Planning */}
        <section className="mb-20">
          <AnimatedCard delay={200}>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-8 md:p-12">
              <h2 className="text-3xl font-serif font-black text-gray-900 mb-6">
                BAH Rates & Housing Budget
              </h2>
              
              <div className="bg-white rounded-xl p-6 border border-purple-200 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Understanding BAH (Basic Allowance for Housing)</h3>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  BAH is determined by three factors: <strong>rank, dependency status, and zip code</strong>. Rates are updated annually and vary significantly by location.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-bold text-blue-900 mb-3">With Dependents (Higher Rate)</h4>
                    <table className="w-full text-sm">
                      <tbody className="text-gray-700">
                        <tr className="border-b border-blue-200">
                          <td className="py-2">E-5 (Fort Liberty, NC)</td>
                          <td className="text-right font-bold">~$1,800/mo</td>
                        </tr>
                        <tr className="border-b border-blue-200">
                          <td className="py-2">O-3 (San Diego, CA)</td>
                          <td className="text-right font-bold">~$3,500/mo</td>
                        </tr>
                        <tr>
                          <td className="py-2">E-7 (Norfolk, VA)</td>
                          <td className="text-right font-bold">~$2,100/mo</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-3">Without Dependents (Lower Rate)</h4>
                    <table className="w-full text-sm">
                      <tbody className="text-gray-700">
                        <tr className="border-b border-gray-200">
                          <td className="py-2">E-5 (Fort Liberty, NC)</td>
                          <td className="text-right font-bold">~$1,350/mo</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="py-2">O-3 (San Diego, CA)</td>
                          <td className="text-right font-bold">~$2,700/mo</td>
                        </tr>
                        <tr>
                          <td className="py-2">E-7 (Norfolk, VA)</td>
                          <td className="text-right font-bold">~$1,600/mo</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-900">
                    <strong>Important:</strong> If you rent off-base for less than your BAH, you keep the difference. If your rent is higher, you pay out of pocket. Utilities are NOT included in BAH for off-base housing.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-purple-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Housing Budget Checklist</h3>
                <div className="space-y-2">
                  <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <input type="checkbox" className="mt-1 h-5 w-5 text-purple-600 rounded focus:ring-purple-500" />
                    <span className="text-gray-700 text-sm">Look up BAH rate using DoD calculator (rank + dependency + installation zip)</span>
                  </label>
                  <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <input type="checkbox" className="mt-1 h-5 w-5 text-purple-600 rounded focus:ring-purple-500" />
                    <span className="text-gray-700 text-sm">Factor utilities if off-base (~$150-300/month for electric, water, gas)</span>
                  </label>
                  <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <input type="checkbox" className="mt-1 h-5 w-5 text-purple-600 rounded focus:ring-purple-500" />
                    <span className="text-gray-700 text-sm">Calculate deposits needed (security deposit + utility deposits = $1,000-2,500)</span>
                  </label>
                  <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <input type="checkbox" className="mt-1 h-5 w-5 text-purple-600 rounded focus:ring-purple-500" />
                    <span className="text-gray-700 text-sm">Research internet/cable costs (~$60-120/month)</span>
                  </label>
                  <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <input type="checkbox" className="mt-1 h-5 w-5 text-purple-600 rounded focus:ring-purple-500" />
                    <span className="text-gray-700 text-sm">Consider commute costs (gas, tolls, vehicle wear if off-base)</span>
                  </label>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </section>

        {/* School Research */}
        <section className="mb-20">
          <AnimatedCard delay={300}>
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-8">
              Researching Schools for Military Kids
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white border-2 border-blue-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">DoDEA Schools (On-Base)</h3>
                <ul className="space-y-3 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">✓</span>
                    <span>Free tuition (funded by Department of Defense)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">✓</span>
                    <span>Understand military lifestyle (deployments, PCS)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">✓</span>
                    <span>Standardized curriculum across locations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">✓</span>
                    <span>Generally good academic performance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">✓</span>
                    <span>Transfer records easily within DoDEA system</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white border-2 border-green-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Local Public Schools (Off-Base)</h3>
                <ul className="space-y-3 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <span>Wide variety of quality (research GreatSchools.org ratings)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <span>May offer more programs (magnet, STEM, arts, IB)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <span>Civilian peers (different perspective)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <span>Interstate Compact ensures smooth records transfer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <span>May require proof of residence for enrollment</span>
                  </li>
                </ul>
              </div>
            </div>
          </AnimatedCard>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="mb-20">
          <AnimatedCard delay={400}>
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-8">
              Base Housing FAQs
            </h2>
            
            <div className="space-y-4">
              <details className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-emerald-300 transition-colors group">
                <summary className="font-bold text-gray-900 cursor-pointer flex items-center justify-between">
                  <span>How do I decide between living on-base versus off-base?</span>
                  <Icon name="ChevronDown" className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 text-gray-700 leading-relaxed pl-6 border-l-4 border-blue-500">
                  <p className="mb-3">
                    Consider your priorities: <strong>Community vs Privacy</strong>, <strong>Convenience vs Space</strong>, <strong>Budget vs Flexibility</strong>.
                  </p>
                  <div className="space-y-3">
                    <div className="bg-blue-50 rounded-lg p-3 text-sm">
                      <strong className="text-blue-900">Choose On-Base if:</strong> You want military community, short commute matters, you have young kids (playgrounds/schools nearby), or you don&apos;t want to deal with landlords/maintenance.
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-sm">
                      <strong className="text-green-900">Choose Off-Base if:</strong> You want more space/variety, prefer work-life separation, want to maximize BAH, or are considering house hacking/investment.
                    </div>
                  </div>
                </div>
              </details>

              <details className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-emerald-300 transition-colors group">
                <summary className="font-bold text-gray-900 cursor-pointer flex items-center justify-between">
                  <span>What is a military clause in a lease and why do I need it?</span>
                  <Icon name="ChevronDown" className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 text-gray-700 leading-relaxed pl-6 border-l-4 border-purple-500">
                  <p className="mb-3">
                    A military clause allows you to <strong>break your lease early without penalty</strong> if you receive PCS orders, deployment orders, or separate from service.
                  </p>
                  <div className="bg-purple-50 rounded-lg p-4 mb-3">
                    <strong className="text-purple-900">SCRA Protection:</strong> Under the Servicemembers Civil Relief Act, active duty members can terminate housing leases with 30 days written notice when receiving qualifying orders. This is a federal right, but having it explicitly in your lease makes enforcement easier.
                  </div>
                  <p className="text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                    <strong>Always include this protection</strong> in off-base rental agreements. Most military-friendly landlords near bases include it by default, but verify before signing.
                  </p>
                </div>
              </details>

              <details className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-emerald-300 transition-colors group">
                <summary className="font-bold text-gray-900 cursor-pointer flex items-center justify-between">
                  <span>What should I look for when choosing a neighborhood near a military base?</span>
                  <Icon name="ChevronDown" className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 text-gray-700 leading-relaxed pl-6 border-l-4 border-green-500">
                  <p className="mb-4"><strong>Key Factors to Research:</strong></p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">▸</span>
                        <span><strong>School quality:</strong> GreatSchools.org ratings, test scores</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">▸</span>
                        <span><strong>Commute time:</strong> Account for gate traffic (peak hours can add 20-30 min)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">▸</span>
                        <span><strong>Commissary distance:</strong> Weekly grocery shopping access</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">▸</span>
                        <span><strong>Medical facilities:</strong> Proximity to base clinic/hospital</span>
                      </li>
                    </ul>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">▸</span>
                        <span><strong>Safety:</strong> Crime statistics, neighborhood watch</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">▸</span>
                        <span><strong>Amenities:</strong> Grocery stores, parks, restaurants</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">▸</span>
                        <span><strong>Military-friendly:</strong> Landlords who accept military clauses</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">▸</span>
                        <span><strong>Community:</strong> Other military families nearby</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </details>
            </div>
          </AnimatedCard>
        </section>

        {/* Related Tools */}
        <section className="mb-20">
          <AnimatedCard delay={500}>
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 text-white text-center">
              <h2 className="text-3xl md:text-4xl font-serif font-black mb-6">
                Plan Your Next Duty Station
              </h2>
              <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
                Use our tools to make informed housing and financial decisions for your PCS.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <Link
                  href="/dashboard/tools/pcs-planner"
                  className="bg-white text-gray-900 rounded-xl p-6 hover:shadow-2xl transition-all hover:-translate-y-1 text-left group"
                >
                  <Icon name="Calculator" className="h-8 w-8 text-emerald-600 mb-3" />
                  <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-600 transition-colors">PCS Financial Planner</h3>
                  <p className="text-sm text-gray-600">
                    Calculate moving costs, entitlements, and PPM profit potential.
                  </p>
                </Link>
                
                <Link
                  href="/dashboard/tools/house-hacking"
                  className="bg-white text-gray-900 rounded-xl p-6 hover:shadow-2xl transition-all hover:-translate-y-1 text-left group"
                >
                  <Icon name="Home" className="h-8 w-8 text-green-600 mb-3" />
                  <h3 className="text-xl font-bold mb-2 group-hover:text-green-600 transition-colors">House Hacking Calculator</h3>
                  <p className="text-sm text-gray-600">
                    Analyze multi-unit property investments using your BAH.
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
            "headline": "Military Base Guides: Housing, Schools & BAH Rates",
            "description": "Complete military base guides for housing decisions, school research, and PCS preparation",
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
                "name": "How do I decide between living on-base versus off-base?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "On-base housing offers community, security, short commute, and utilities included in BAH. Off-base provides variety, work-life separation, and local community experience. Consider your priorities: community vs privacy, convenience vs space, budget vs flexibility."
                }
              },
              {
                "@type": "Question",
                "name": "What is a military clause in a lease and why do I need it?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A military clause allows you to break your lease early without penalty if you receive PCS orders, deployment orders, or separation. Under SCRA, active duty members can terminate housing leases with 30 days written notice when receiving qualifying orders."
                }
              },
              {
                "@type": "Question",
                "name": "What should I look for when choosing a neighborhood near a military base?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Consider school quality and ratings, commute time to base (including gate traffic), proximity to commissary and exchange, local amenities (grocery, medical, parks), neighborhood safety ratings, and military-friendly community culture. Check if landlords accept military clauses in leases."
                }
              }
            ]
          })
        }}
      />
    </>
  );
}

