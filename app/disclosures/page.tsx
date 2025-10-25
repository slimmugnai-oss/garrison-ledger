import Link from 'next/link';

import Header from '../components/Header';

export default function Disclosures() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-serif font-black text-text-headings mb-4">
              Disclosures & Important Information
            </h1>
            <p className="text-lg text-text-muted">Last Updated: October 12, 2025</p>
          </div>

          {/* Content */}
          <div className="bg-card rounded-2xl shadow-lg p-10 md:p-12 border border-border">
            <div className="prose prose-lg max-w-none
              prose-headings:font-serif prose-headings:font-bold prose-headings:text-text-headings
              prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b prose-h2:border-border
              prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
              prose-p:text-text-body prose-p:leading-relaxed prose-p:mb-5
              prose-a:text-primary-accent prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
              prose-ul:my-6 prose-ul:space-y-3
              prose-li:text-text-body prose-li:leading-relaxed
              prose-strong:text-text-headings prose-strong:font-bold">
              
              <p className="text-xl text-text-body leading-relaxed mb-8">
                The Garrison Ledger is a financial education and information platform. The information and tools provided are designed to help military families understand the unique aspects of their financial lives and make more informed decisions. Your trust is our top priority, and in the spirit of transparency, we ask that you review the following important disclosures.
              </p>

              <h2>Not Financial, Legal, or Tax Advice</h2>
              <p>
                The content provided on this platform—including all articles, guides, tools, and personalized plans—is for <strong>informational and educational purposes only</strong>.
              </p>
              <p>
                FamilyMedia, LLC is a publisher and is <strong>not</strong> a registered investment advisor, broker-dealer, financial analyst, financial bank, securities broker, or financial planner. The information provided is not intended to be and should not be construed as personalized financial, investment, legal, or tax advice.
              </p>
              <p>
                You alone are responsible for evaluating the merits and risks associated with the use of any information or tools provided on this platform before making any decisions based on such information. You should consult with a qualified and credentialed professional (such as a Certified Financial Planner®, tax advisor, or attorney) who is aware of your individual circumstances before making any financial decisions.
              </p>

              <h2>Projections & Forward-Looking Statements</h2>
              <p>
                Our &quot;Wealth-Builder&quot; tools, including the TSP Allocation Modeler, SDP Payout Strategist, and House Hacking Calculator, provide projections based on user inputs and historical market data.
              </p>
              <p>
                <strong>Past performance is not an indicator of future results.</strong> These projections are hypothetical, for illustrative purposes only, and are not guarantees of future investment performance or financial outcomes. The actual results you experience will vary based on a multitude of factors, including market fluctuations and your personal financial decisions.
              </p>

              <h2>Affiliate & Partner Disclosure</h2>
              <p>
                In our mission to provide the best resources, we may partner with or recommend other companies, products, or services.
              </p>
              <p>
                In some cases, we may have a financial relationship with the companies or professionals mentioned on this platform. For example, if you connect with a real estate agent through our Vetted Professional Directory, we may receive a referral fee. This does not impact the price you pay or our editorial independence. These relationships help support our platform and allow us to continue providing high-quality resources to the military community. <strong>We only recommend products and professionals that we believe provide real value.</strong>
              </p>

              <h2>Military Affiliation</h2>
              <p>
                The Garrison Ledger is an independent platform created to serve military families. We are not affiliated with, endorsed by, or officially connected to the U.S. Department of Defense, any branch of the U.S. Armed Forces, or any government agency.
              </p>
              <p>
                All information about military benefits, programs, and policies is based on publicly available sources and is provided for educational purposes. For official guidance, always consult your command, base legal office, or the relevant government agency.
              </p>

              <h2>Terms of Use & Privacy</h2>
              <p>
                Your use of the Garrison Ledger application is subject to our full Terms of Use and Privacy Policy. These documents govern your rights and responsibilities as a user of this platform. Please review them carefully.
              </p>

              <h2>Contact Information</h2>
              <p>
                If you have questions about these disclosures or any aspect of the Garrison Ledger platform, please contact us at <a href="mailto:support@garrisonledger.com">support@garrisonledger.com</a>.
              </p>

              <div className="mt-12 pt-8 border-t-2 border-border">
                <p className="text-sm text-text-muted italic">
                  By using the Garrison Ledger platform, you acknowledge that you have read, understood, and agree to these disclosures.
                </p>
              </div>
            </div>
          </div>

          {/* Back Link */}
          <div className="mt-12 text-center">
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-2 text-primary-accent hover:text-primary-hover font-semibold text-lg transition-colors"
            >
              <span>←</span>
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
