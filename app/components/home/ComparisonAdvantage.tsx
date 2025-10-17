'use client';

import AnimatedCard from '../ui/AnimatedCard';
import Icon from '../ui/Icon';
import Badge from '../ui/Badge';

export default function ComparisonAdvantage() {
  return (
    <section className="py-20 bg-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-black text-primary mb-4">
            What Makes Garrison Ledger Different?
          </h2>
          <p className="text-xl text-body">
            Not a bank. Not selling products. Just intelligent planning.
          </p>
        </div>

        {/* Side by Side Comparison */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Traditional Banks */}
          <AnimatedCard delay={0}>
            <div className="card p-8 border-danger/20">
              <h3 className="text-2xl font-bold mb-6 text-center text-primary">Traditional Military Banks</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-danger-subtle rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="XCircle" className="h-5 w-5 text-danger" />
                  </div>
                  <div>
                    <div className="font-semibold text-primary">Generic Financial Tools</div>
                    <div className="text-sm text-body">One-size-fits-all calculators that don't understand military compensation</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-danger-subtle rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="XCircle" className="h-5 w-5 text-danger" />
                  </div>
                  <div>
                    <div className="font-semibold text-primary">Product Sales Focus</div>
                    <div className="text-sm text-body">Trying to sell you loans, credit cards, insurance</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-danger-subtle rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="XCircle" className="h-5 w-5 text-danger" />
                  </div>
                  <div>
                    <div className="font-semibold text-primary">No Personalization</div>
                    <div className="text-sm text-body">Same advice for E-2 and O-6</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-danger-subtle rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="XCircle" className="h-5 w-5 text-danger" />
                  </div>
                  <div>
                    <div className="font-semibold text-primary">Complex Navigation</div>
                    <div className="text-sm text-body">Overwhelming menus and product pages</div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Garrison Ledger */}
          <AnimatedCard delay={100}>
            <div className="card p-8 border-success/20 shadow-elevated">
              <div className="flex items-center justify-center gap-2 mb-6">
                <h3 className="text-2xl font-bold text-center text-primary">Garrison Ledger</h3>
                <Badge variant="success" size="sm">BEST CHOICE</Badge>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-success-subtle rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="CheckCircle" className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <div className="font-bold text-primary">Military-Specific Calculators</div>
                    <div className="text-sm text-body">TSP, SDP, PCS, House Hacking, BAH - built for military comp</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-success-subtle rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="CheckCircle" className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <div className="font-bold text-primary">Education-First Mission</div>
                    <div className="text-sm text-body">No products to sell. Just helping you maximize your benefits.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-success-subtle rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="CheckCircle" className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <div className="font-bold text-primary">AI-Personalized Plan</div>
                    <div className="text-sm text-body">Tailored to YOUR rank, branch, family, and situation</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-success-subtle rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="CheckCircle" className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <div className="font-bold text-primary">Simple, Clean Interface</div>
                    <div className="text-sm text-body">Get to answers fast, no overwhelming menus</div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* What We're NOT Section */}
        <div className="text-center mt-12 max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-primary">What We're NOT</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card p-6 border-danger/20">
              <div className="w-12 h-12 bg-danger-subtle rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="XCircle" className="h-6 w-6 text-danger" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-primary">Not a Bank</h4>
              <p className="text-body leading-relaxed">
                We don't offer financial products. We help you make smart decisions about the ones you have.
              </p>
            </div>
            <div className="card p-6 border-danger/20">
              <div className="w-12 h-12 bg-danger-subtle rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="XCircle" className="h-6 w-6 text-danger" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-primary">Not Commission-Based</h4>
              <p className="text-body leading-relaxed">
                We don't get paid to recommend specific products. Our only revenue is premium subscriptions.
              </p>
            </div>
            <div className="card p-6 border-danger/20">
              <div className="w-12 h-12 bg-danger-subtle rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="XCircle" className="h-6 w-6 text-danger" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-primary">Not Affiliated with DoD</h4>
              <p className="text-body leading-relaxed">
                Independent platform. Not endorsed by DoD. We exist to serve the community, not sell to it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}