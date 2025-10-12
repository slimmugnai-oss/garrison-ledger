import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="text-xl font-bold text-text-headings mb-4">
              📊 Garrison Ledger
            </div>
            <p className="text-text-body leading-relaxed">
              Intelligent financial planning for military families.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-text-headings mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-text-body hover:text-primary-accent transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/assessment" className="text-text-body hover:text-primary-accent transition-colors">
                  Assessment
                </Link>
              </li>
              <li>
                <Link href="/dashboard/plan" className="text-text-body hover:text-primary-accent transition-colors">
                  Your Plan
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-text-headings mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/disclosures" className="text-gray-700 hover:text-primary transition-colors font-semibold">
                  Disclosures
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-700 hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy/cookies" className="text-gray-700 hover:text-primary transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy/do-not-sell" className="text-gray-700 hover:text-primary transition-colors text-sm">
                  Do Not Sell (CA)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-text-muted text-sm">
            © {new Date().getFullYear()} Garrison Ledger by FamilyMedia, LLC. All rights reserved.
          </p>
          <p className="text-text-muted text-xs mt-2">
            Not affiliated with the U.S. Department of Defense or any branch of the Armed Forces.
          </p>
        </div>
      </div>
    </footer>
  );
}

