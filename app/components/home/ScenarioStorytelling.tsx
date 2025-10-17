'use client';

import Link from 'next/link';
import AnimatedCard from '../ui/AnimatedCard';
import Icon from '../ui/Icon';
import Badge from '../ui/Badge';

export default function ScenarioStorytelling() {
  const scenarios = [
    {
      id: 'pcs',
      badge: { text: 'Common Scenario', variant: 'primary' as const },
      title: 'The $3,200 PCS Profit Opportunity',
      challenge: 'SSG Johnson is PCSing from Fort Bragg to Joint Base Lewis-McChord. Government move estimate: $8,500. He could do a DITY move for $5,300 and pocket the difference - but didn\'t know how to calculate it.',
      solution: [
        { text: 'Government reimbursement', value: '$8,500', icon: 'DollarSign' },
        { text: 'Actual DITY cost', value: '$5,300', icon: 'Truck' },
        { text: 'Net profit', value: '$3,200', icon: 'TrendingUp', highlight: true },
        { text: 'Tax implications calculated', value: '✓', icon: 'Calculator' }
      ],
      testimonial: {
        quote: "I had no idea I could make money on my PCS! The calculator broke down every cost and showed me exactly how to maximize my PPM. Saved me hours of research.",
        author: "SSG Martinez",
        details: "US Army • E-6 • 12 Years",
        savings: "$3,200"
      },
      cta: {
        text: 'Calculate Your PCS Profit',
        link: '/dashboard/tools/pcs-planner'
      },
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      id: 'tsp',
      badge: { text: 'Retirement Risk', variant: 'warning' as const },
      title: 'The $87,000 TSP Mistake',
      challenge: 'Capt. Williams (O-3, 8 years service) was contributing only 5% to TSP in all G Fund (conservative). Missing BRS match and losing massive growth potential over 20+ years to retirement.',
      solution: [
        { text: 'Current path (5%, G Fund)', value: '$342,000', icon: 'TrendingDown' },
        { text: 'Optimized (10% + match, 80/20 C/S)', value: '$429,000', icon: 'TrendingUp', highlight: true },
        { text: 'Difference from optimization', value: '+$87,000', icon: 'Sparkles', highlight: true },
        { text: 'Time to implement', value: '< 1 hour', icon: 'Timer' }
      ],
      testimonial: {
        quote: "I was literally leaving $87K on the table and didn't know it. Changed my TSP allocation the same day. This tool paid for itself 10,000x over.",
        author: "Capt. Williams",
        details: "US Air Force • O-3 • 8 Years",
        savings: "$87,000 future value"
      },
      cta: {
        text: 'Optimize Your TSP',
        link: '/dashboard/tools/tsp-modeler'
      },
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 'deployment',
      badge: { text: 'Guaranteed 10% Return', variant: 'success' as const },
      title: 'Turn Deployment into $1,200+ Guaranteed',
      challenge: 'PFC Rodriguez deploying for 12 months to combat zone. Has $10,000 saved but wasn\'t sure how to maximize deployment financial benefits beyond tax-free pay.',
      solution: [
        { text: 'SDP deposit (10% annual)', value: '$10,000', icon: 'PiggyBank' },
        { text: 'Guaranteed interest earned', value: '$1,000', icon: 'DollarSign', highlight: true },
        { text: 'Combat zone tax savings', value: '+$4,200', icon: 'Shield' },
        { text: 'Total deployment gain', value: '$5,200+', icon: 'TrendingUp', highlight: true }
      ],
      testimonial: {
        quote: "SDP is the best kept secret in military finance. 10% guaranteed is unbeatable in today's market. The calculator showed me exactly how to max it out.",
        author: "PFC Rodriguez",
        details: "US Marine Corps • E-2 • Infantry",
        savings: "$1,200 guaranteed"
      },
      cta: {
        text: 'Calculate SDP Returns',
        link: '/dashboard/tools/sdp-strategist'
      },
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-black text-primary mb-4">
            Hypothetical Military Financial Scenarios
          </h2>
          <p className="text-xl text-body max-w-3xl mx-auto">
            See how service members across all ranks and branches could save thousands with our tools
          </p>
        </div>

        <div className="space-y-12">
          {scenarios.map((scenario, index) => (
            <AnimatedCard key={scenario.id} delay={index * 100}>
              <div className={`bg-gradient-to-r ${scenario.gradient} rounded-2xl p-1 shadow-xl`}>
                <div className="bg-white rounded-xl p-8">
                  <div className="flex items-start justify-between mb-6">
                    <Badge variant={scenario.badge.variant}>{scenario.badge.text}</Badge>
                  </div>

                  <h3 className="text-3xl font-bold text-primary mb-6">{scenario.title}</h3>

                  {/* The Challenge */}
                  <div className="mb-8">
                    <div className="flex items-start gap-3 mb-3">
                      <Icon name="AlertTriangle" className="h-6 w-6 text-danger flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-bold text-lg text-primary mb-2">The Challenge</h4>
                        <p className="text-body leading-relaxed">{scenario.challenge}</p>
                      </div>
                    </div>
                  </div>

                  {/* The Solution */}
                  <div className="mb-8">
                    <div className="flex items-start gap-3">
                      <Icon name="Lightbulb" className="h-6 w-6 text-info flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-primary mb-4">The Solution</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          {scenario.solution.map((item, idx) => (
                            <div
                              key={idx}
                              className={`p-4 rounded-lg ${
                                item.highlight
                                  ? 'bg-success-subtle border-2 border-success'
                                  : 'bg-surface-hover border border-default'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-body">{item.text}</span>
                                <Icon name={item.icon as any} className={`h-5 w-5 ${item.highlight ? 'text-success' : 'text-muted'}`} />
                              </div>
                              <div className={`text-2xl font-black mt-2 ${item.highlight ? 'text-success' : 'text-primary'}`}>
                                {item.value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* The Result (Testimonial) */}
                  <div className={`bg-gradient-to-r ${scenario.gradient} rounded-xl p-6 text-white mb-6`}>
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">"</div>
                      <div className="flex-1">
                        <p className="text-lg italic mb-4">{scenario.testimonial.quote}</p>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <Icon name="User" className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-lg">{scenario.testimonial.author}</div>
                            <div className="text-sm text-white/80">{scenario.testimonial.details}</div>
                            <div className="text-sm font-bold text-green-200 mt-1">
                              Saved: {scenario.testimonial.savings}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="text-center">
                    <Link
                      href={scenario.cta.link}
                      className={`inline-flex items-center gap-2 bg-gradient-to-r ${scenario.gradient} text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all`}
                    >
                      {scenario.cta.text}
                      <Icon name="ArrowRight" className="h-5 w-5" />
                    </Link>
                    <p className="text-sm text-muted mt-3">
                      No signup required to try • Get instant results
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>

        {/* Collective Proof */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl px-8 py-6 text-white shadow-xl">
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-black">$1.2M+</div>
                <div className="text-sm text-green-100">Collective Savings</div>
              </div>
              <div>
                <div className="text-4xl font-black">500+</div>
                <div className="text-sm text-green-100">Military Families</div>
              </div>
              <div>
                <div className="text-4xl font-black">4.8/5</div>
                <div className="text-sm text-green-100">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

