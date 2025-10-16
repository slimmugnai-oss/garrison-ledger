import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from 'next/link';
import AnimatedCard from '../components/ui/AnimatedCard';
import Icon from '../components/ui/Icon';
import { generatePageMeta } from "@/lib/seo-config";

export const metadata: Metadata = generatePageMeta({
  title: "Military Shopping Guide - Commissary & Exchange Savings | Garrison Ledger",
  description: "Save 25%+ shopping on base. Complete guide to commissary savings, exchange tax-free benefits, MILITARY STAR card perks, and MWR funding. Calculate your annual savings.",
  path: "/on-base-shopping",
  keywords: [
    "commissary savings",
    "military exchange",
    "MILITARY STAR card",
    "on-base shopping",
    "tax-free shopping military",
    "commissary vs civilian",
    "AAFES benefits",
    "NEX shopping",
    "MCX savings",
    "military shopping benefits"
  ]
});

export default function ShoppingHub() {
  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
              <Icon name="ShoppingCart" className="h-4 w-4" />
              <span className="text-sm font-semibold">Military Shopping Benefits Hub</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-serif font-black mb-6 leading-tight">
              Save 25%+ Shopping On Base
            </h1>
            
            <p className="text-xl md:text-2xl text-orange-100 mb-8 leading-relaxed">
              Master commissary and exchange benefits to save <strong className="text-white">thousands per year</strong> on groceries, gas, and tax-free shopping. Your earned benefit - maximize it.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/dashboard/tools/on-base-savings"
                className="inline-flex items-center justify-center gap-2 bg-white text-orange-700 px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <Icon name="Calculator" className="h-5 w-5" />
                Calculate Annual Savings
              </Link>
              <Link
                href="/dashboard/assessment"
                className="inline-flex items-center justify-center gap-2 bg-orange-500/20 backdrop-blur border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-500/30 transition-all"
              >
                Get Shopping Strategy
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
              <div className="text-3xl font-black text-green-600 mb-1">25%</div>
              <div className="text-sm text-gray-600">Avg Commissary Savings</div>
            </div>
            <div>
              <div className="text-3xl font-black text-blue-600 mb-1">6-10%</div>
              <div className="text-sm text-gray-600">Tax-Free Exchange</div>
            </div>
            <div>
              <div className="text-3xl font-black text-purple-600 mb-1">5¢/gal</div>
              <div className="text-sm text-gray-600">Gas Discount (STAR)</div>
            </div>
            <div>
              <div className="text-3xl font-black text-amber-600 mb-1">$2,400+</div>
              <div className="text-sm text-gray-600">Annual Savings Potential</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Commissary Deep Dive */}
        <section id="commissary" className="mb-20">
          <AnimatedCard delay={0}>
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-8">
              Commissary: Your 25% Savings Superpower
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center">
                    <Icon name="DollarSign" className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <div className="text-4xl font-black text-green-600">25%</div>
                    <div className="text-sm text-gray-700">Average Savings vs Civilian Stores</div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The Defense Commissary Agency (DeCA) sells groceries <strong>at cost</strong> - no markup. You only pay a 5% surcharge which funds facility construction and modernization.
                </p>
                <div className="bg-white rounded-lg p-4 border border-green-300">
                  <div className="text-sm text-gray-700">
                    <strong className="text-green-900">Example:</strong> A family spending $600/month at civilian grocery stores would spend ~$450 at commissary.
                  </div>
                  <div className="text-2xl font-black text-green-600 mt-2">$1,800/year saved</div>
                </div>
              </div>

              <div className="bg-white border-2 border-blue-200 rounded-xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Maximize Commissary Savings</h3>
                <ul className="space-y-3 text-gray-700 text-sm">
                  <li className="flex items-start gap-3">
                    <Icon name="Check" className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Stack coupons:</strong> Manufacturer coupons + Commissary app + Family Magazine coupons</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="Check" className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Buy store brands:</strong> Additional 10-15% savings over name brands</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="Check" className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Case Lot sales:</strong> Buy in bulk during special events (save 20-40%)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="Check" className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Shop Tuesday-Thursday:</strong> Best selection, shortest lines</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="Check" className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Get Commissary Rewards Card:</strong> Earn points on purchases</span>
                  </li>
                </ul>
                
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-900">
                    <strong>5% Surcharge:</strong> This is NOT a tax or profit - it funds commissary facility improvements. Already included in the 25% average savings calculation.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </section>

        {/* Exchange Benefits */}
        <section id="exchange" className="mb-20">
          <AnimatedCard delay={100}>
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-8">
              Exchange: Tax-Free Shopping & MILITARY STAR Perks
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-6">Tax-Free Savings</h3>
                <p className="text-blue-50 mb-6 leading-relaxed">
                  Every purchase at the Exchange (AAFES, NEX, MCX) is <strong>tax-free</strong>. This saves you 6-10% depending on your state&apos;s sales tax rate.
                </p>
                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
                  <div className="text-sm text-blue-100 mb-2">Example: Big-Ticket Purchase</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-100">Laptop at Best Buy:</span>
                      <span className="font-bold">$1,000 + $80 tax</span>
                    </div>
                    <div className="flex justify-between border-t border-white/20 pt-2">
                      <span className="text-white font-bold">Same laptop at Exchange:</span>
                      <span className="font-black text-green-300">$1,000 (no tax!)</span>
                    </div>
                    <div className="text-right text-green-300 font-bold">Save: $80</div>
                  </div>
                </div>
                <p className="mt-4 text-xs text-blue-100">
                  Electronics, appliances, furniture, clothing, toys - all tax-free. Annual savings on big purchases can easily exceed $500-1,000 per year.
                </p>
              </div>

              <div className="bg-white border-2 border-purple-200 rounded-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">MILITARY STAR Card Benefits</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-purple-900 mb-2">Card Perks:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <Icon name="Check" className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span><strong>No annual fee</strong> - Free to apply and maintain</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon name="Check" className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span><strong>5¢ off per gallon</strong> at Exchange gas stations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon name="Check" className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span><strong>10% off food court</strong> purchases</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon name="Check" className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Free shipping</strong> on online orders at ShopMyExchange.com</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon name="Check" className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Special financing</strong> offers (0% APR promotions)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon name="Check" className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Competitive APR</strong> and rewards program</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-900">
                      <strong>Gas Savings Example:</strong> Fill up twice per week (30 gallons) = $0.05 × 30 × 52 weeks = <strong>$78/year savings</strong> just on gas!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </section>

        {/* Branch-Specific Exchanges */}
        <section className="mb-20">
          <AnimatedCard delay={200}>
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-8">
              Exchange by Branch (All Offer Same Benefits)
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white border-2 border-blue-200 rounded-xl p-6 text-center hover:shadow-xl transition-all">
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon name="Shield" className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">AAFES</h3>
                <p className="text-sm text-gray-600 mb-3">Army & Air Force Exchange Service</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Serves: Army, Air Force, Space Force</div>
                  <div>Locations: Worldwide</div>
                </div>
              </div>

              <div className="bg-white border-2 border-indigo-200 rounded-xl p-6 text-center hover:shadow-xl transition-all">
                <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon name="Anchor" className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">NEX</h3>
                <p className="text-sm text-gray-600 mb-3">Navy Exchange</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Serves: Navy</div>
                  <div>Locations: Naval stations worldwide</div>
                </div>
              </div>

              <div className="bg-white border-2 border-red-200 rounded-xl p-6 text-center hover:shadow-xl transition-all">
                <div className="w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon name="Star" className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">MCX</h3>
                <p className="text-sm text-gray-600 mb-3">Marine Corps Exchange</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Serves: Marine Corps</div>
                  <div>Locations: Marine bases worldwide</div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
              <p className="text-center text-gray-700">
                <Icon name="Info" className="h-5 w-5 text-blue-600 inline mr-2" />
                <strong>100% of Exchange profits</strong> fund Morale, Welfare & Recreation (MWR) programs: youth programs, fitness centers, pools, sports equipment, and recreation facilities. Your shopping supports your community!
              </p>
            </div>
          </AnimatedCard>
        </section>

        {/* Shopping Strategy */}
        <section className="mb-20">
          <AnimatedCard delay={300}>
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-8">
              Strategic Shopping: When to Buy Where
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-green-900 mb-4">
                  <Icon name="CheckCircle" className="h-6 w-6 text-green-600 inline mr-2" />
                  Buy at Commissary
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">▸</span>
                    <span><strong>Groceries:</strong> Meat, produce, dairy, pantry staples</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">▸</span>
                    <span><strong>Baby products:</strong> Diapers, formula, baby food</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">▸</span>
                    <span><strong>Household goods:</strong> Cleaning supplies, paper products</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">▸</span>
                    <span><strong>Specialty items:</strong> Organic, gluten-free usually cheaper</span>
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg text-xs text-green-900">
                  Typical family of 4 saves <strong>$150-250/month</strong> vs civilian grocery stores
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-4">
                  <Icon name="ShoppingCart" className="h-6 w-6 text-blue-600 inline mr-2" />
                  Buy at Exchange
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">▸</span>
                    <span><strong>Electronics:</strong> Laptops, phones, TVs (save 6-10% tax)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">▸</span>
                    <span><strong>Appliances:</strong> Fridges, washers, dryers (big tax savings)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">▸</span>
                    <span><strong>Furniture:</strong> Couches, beds, dining sets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">▸</span>
                    <span><strong>Clothing:</strong> Uniforms, athletic wear, kids clothes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">▸</span>
                    <span><strong>Gas:</strong> Use STAR card for 5¢/gal discount</span>
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg text-xs text-blue-900">
                  Price match guarantee ensures you get best deal (local + online competitors)
                </div>
              </div>
            </div>
          </AnimatedCard>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="mb-20">
          <AnimatedCard delay={400}>
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-8">
              Shopping Benefits FAQs
            </h2>
            
            <div className="space-y-4">
              <details className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-colors group">
                <summary className="font-bold text-gray-900 cursor-pointer flex items-center justify-between">
                  <span>Who is eligible to shop on base?</span>
                  <Icon name="ChevronDown" className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 text-gray-700 leading-relaxed pl-6 border-l-4 border-blue-500">
                  <p className="mb-3"><strong>Eligible to Shop Commissary & Exchange:</strong></p>
                  <ul className="space-y-2 bg-blue-50 rounded-lg p-4 text-sm">
                    <li>✓ Active duty service members (all branches)</li>
                    <li>✓ Guard and Reserve members</li>
                    <li>✓ Retirees and their dependents</li>
                    <li>✓ 100% disabled veterans</li>
                    <li>✓ Medal of Honor recipients</li>
                    <li>✓ Eligible dependents with valid ID</li>
                    <li>✓ Some disabled veterans with VHIC (Veterans Health ID Card)</li>
                  </ul>
                  <p className="mt-3 text-sm">
                    You must show valid military ID at base gate and checkout. Dependents need current dependent ID card.
                  </p>
                </div>
              </details>

              <details className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-colors group">
                <summary className="font-bold text-gray-900 cursor-pointer flex items-center justify-between">
                  <span>How much can I save shopping at the commissary vs civilian stores?</span>
                  <Icon name="ChevronDown" className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 text-gray-700 leading-relaxed pl-6 border-l-4 border-green-500">
                  <p className="mb-4">
                    The Defense Commissary Agency (DeCA) targets approximately <strong>25% average savings</strong> compared to civilian grocery stores. The 5% surcharge is already included in this calculation.
                  </p>
                  <div className="bg-green-50 rounded-lg p-4 mb-4">
                    <strong className="text-green-900">Real Example:</strong>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Monthly grocery budget (civilian):</span>
                        <span className="font-bold">$800</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Same groceries at commissary:</span>
                        <span className="font-bold text-green-600">~$600</span>
                      </div>
                      <div className="flex justify-between border-t border-green-200 mt-2 pt-2">
                        <span className="font-bold">Monthly Savings:</span>
                        <span className="font-black text-green-600">$200</span>
                      </div>
                      <div className="flex justify-between text-lg">
                        <span className="font-bold">Annual Savings:</span>
                        <span className="font-black text-green-600">$2,400</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm">
                    Actual savings vary by location, product selection, and shopping habits. Some items save 40-50%, others save 10-15%.
                  </p>
                </div>
              </details>

              <details className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-colors group">
                <summary className="font-bold text-gray-900 cursor-pointer flex items-center justify-between">
                  <span>Can I use coupons at the commissary?</span>
                  <Icon name="ChevronDown" className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 text-gray-700 leading-relaxed pl-6 border-l-4 border-purple-500">
                  <p className="mb-4">
                    <strong>Yes!</strong> Commissaries accept manufacturer coupons and you can stack them for maximum savings.
                  </p>
                  <div className="space-y-3">
                    <div className="bg-purple-50 rounded-lg p-4">
                      <strong className="text-purple-900">Coupon Sources:</strong>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>• Manufacturer coupons (newspaper, product websites)</li>
                        <li>• Digital coupons through Commissary app</li>
                        <li>• Family Magazine coupons (found at store entrances)</li>
                        <li>• Commissary Rewards Card exclusive offers</li>
                      </ul>
                    </div>
                    <p className="text-sm">
                      <strong>Pro Tip:</strong> Stack manufacturer coupons with commissary sale items for 30-50% off. Case Lot sales + coupons = massive savings on pantry staples.
                    </p>
                  </div>
                </div>
              </details>

              <details className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-colors group">
                <summary className="font-bold text-gray-900 cursor-pointer flex items-center justify-between">
                  <span>Does the Exchange price match online stores?</span>
                  <Icon name="ChevronDown" className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 text-gray-700 leading-relaxed pl-6 border-l-4 border-blue-500">
                  <p className="mb-3">
                    <strong>Yes.</strong> The Exchange matches identical items from local competitors and select online retailers under its price match policy.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4 mb-3">
                    <strong className="text-blue-900">How to Price Match:</strong>
                    <ol className="mt-2 space-y-1 text-sm list-decimal ml-4">
                      <li>Find lower price at competitor (Best Buy, Walmart, Amazon, etc.)</li>
                      <li>Bring proof (ad, screenshot, link) to Exchange</li>
                      <li>Item must be identical (model number, condition, color)</li>
                      <li>Present at checkout for price adjustment</li>
                    </ol>
                  </div>
                  <p className="text-sm bg-green-50 border border-green-200 rounded-lg p-3">
                    <strong>Stack savings:</strong> Price match + tax-free = potentially 6-15% cheaper than civilian stores for big-ticket items!
                  </p>
                </div>
              </details>
            </div>
          </AnimatedCard>
        </section>

        {/* Calculate Your Savings */}
        <section className="mb-20">
          <AnimatedCard delay={500}>
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 text-white text-center">
              <h2 className="text-3xl md:text-4xl font-serif font-black mb-6">
                How Much Can You Save?
              </h2>
              <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
                Use our calculator to estimate your annual savings from commissary and exchange shopping.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <Link
                  href="/dashboard/tools/on-base-savings"
                  className="bg-white text-gray-900 rounded-xl p-6 hover:shadow-2xl transition-all hover:-translate-y-1 text-left group"
                >
                  <Icon name="Calculator" className="h-8 w-8 text-amber-600 mb-3" />
                  <h3 className="text-xl font-bold mb-2 group-hover:text-amber-600 transition-colors">On-Base Savings Calculator</h3>
                  <p className="text-sm text-gray-600">
                    Calculate your annual savings from commissary, exchange, and STAR card benefits.
                  </p>
                </Link>
                
                <Link
                  href="/dashboard/assessment"
                  className="bg-gradient-to-br from-amber-600 to-orange-700 text-white rounded-xl p-6 hover:shadow-2xl transition-all hover:-translate-y-1 text-left group border-2 border-amber-400"
                >
                  <Icon name="Sparkles" className="h-8 w-8 mb-3" />
                  <h3 className="text-xl font-bold mb-2">Get Personalized Savings Plan</h3>
                  <p className="text-sm text-amber-100">
                    AI-curated strategy to maximize your military shopping benefits.
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
            "headline": "Military Shopping Guide: Commissary & Exchange Savings",
            "description": "Complete guide to military shopping benefits including commissary savings, exchange tax-free benefits, and MILITARY STAR card perks",
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
                "name": "Who is eligible to shop on base?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Active duty, Guard/Reserve, retirees, Medal of Honor recipients, and eligible dependents. Some disabled veterans and caregivers also qualify with a VHIC (Veterans Health ID Card)."
                }
              },
              {
                "@type": "Question",
                "name": "How much can I save shopping at the commissary vs civilian stores?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The Defense Commissary Agency targets approximately 25% average savings compared to civilian grocery stores. A family spending $800/month at civilian stores would spend ~$600 at commissary, saving $2,400/year."
                }
              },
              {
                "@type": "Question",
                "name": "Can I use coupons at the commissary?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. Commissaries accept manufacturer coupons, digital coupons through the Commissary app, and exclusive savings through the Family Magazine. You can stack manufacturer coupons with commissary sales for maximum savings."
                }
              },
              {
                "@type": "Question",
                "name": "Does the Exchange price match online stores?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. The Exchange matches identical items from local competitors and select online retailers under its price match policy. Stack price match with tax-free shopping for 6-15% additional savings on big-ticket items."
                }
              }
            ]
          })
        }}
      />
    </>
  );
}

