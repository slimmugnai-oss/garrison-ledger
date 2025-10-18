import Link from 'next/link';
import Icon from './ui/Icon';

export default function Footer() {
  return (
    <footer className="bg-card dark:bg-slate-900 border-t border-border dark:border-slate-700 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand with Authority */}
          <div>
            <div className="text-xl font-bold text-text-headings dark:text-white/90 mb-4">
              <Icon name="BarChart" className="h-5 w-5 inline mr-1" /> Garrison Ledger
            </div>
            <p className="text-text-body dark:text-muted leading-relaxed mb-4">
              Intelligent planning for military life.
            </p>
            {/* Authority Signals */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-body dark:text-muted">
                <Icon name="Star" className="h-4 w-4 text-info dark:text-info" />
                <span className="font-semibold">Military Financial Experts</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-body dark:text-muted">
                <Icon name="Shield" className="h-4 w-4 text-success dark:text-green-400" />
                <span className="font-semibold">Trusted by 500+ Families</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-body dark:text-muted">
                <Icon name="CheckCircle" className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="font-semibold">67+ Years Serving Military Families</span>
              </div>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-bold text-text-headings dark:text-white/90 mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-text-body dark:text-muted hover:text-primary-accent dark:hover:text-info transition-colors">
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
              <li>
                <Link href="/dashboard/upgrade" className="text-text-body hover:text-primary-accent transition-colors">
                  Upgrade
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-text-headings dark:text-white/90 mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/career-hub" className="text-text-body hover:text-primary-accent transition-colors">
                  Career Hub
                </Link>
              </li>
              <li>
                <Link href="/pcs-hub" className="text-text-body hover:text-primary-accent transition-colors">
                  PCS Hub
                </Link>
              </li>
              <li>
                <Link href="/base-guides" className="text-text-body hover:text-primary-accent transition-colors">
                  Base Guides
                </Link>
              </li>
              <li>
                <Link href="/on-base-shopping" className="text-text-body hover:text-primary-accent transition-colors">
                  On-Base Shopping
                </Link>
              </li>
              <li>
                <Link href="/deployment" className="text-text-body hover:text-primary-accent transition-colors">
                  Deployment Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="font-bold text-text-headings dark:text-white/90 mb-4">Support & Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-text-body hover:text-primary-accent transition-colors font-semibold">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/disclosures" className="text-body hover:text-primary transition-colors font-semibold">
                  Disclosures
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-body hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy/cookies" className="text-body hover:text-primary transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy/do-not-sell" className="text-body hover:text-primary transition-colors text-sm">
                  Do Not Sell (CA)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border dark:border-slate-700 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="text-xs text-text-muted dark:text-muted font-medium">
              A FamilyMedia Company
            </div>
          </div>
          <p className="text-text-muted dark:text-muted text-sm">
            © {new Date().getFullYear()} Garrison Ledger by FamilyMedia, LLC. All rights reserved.
          </p>
          <p className="text-text-muted dark:text-muted text-xs mt-1">
            Serving Military Families Since 1958
          </p>
          <p className="text-text-muted dark:text-muted text-xs mt-2">
            Not affiliated with the U.S. Department of Defense or any branch of the Armed Forces.
          </p>
        </div>
      </div>
    </footer>
  );
}

