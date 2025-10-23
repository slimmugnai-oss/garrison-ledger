import Link from "next/link";
import Icon from "./ui/Icon";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-card transition-colors dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          {/* Brand with Authority */}
          <div>
            <div className="text-text-headings mb-4 text-xl font-bold dark:text-white/90">
              <Icon name="BarChart" className="mr-1 inline h-5 w-5" /> Garrison Ledger
            </div>
            <p className="text-text-body mb-4 leading-relaxed dark:text-muted">
              Intelligent planning for military life.
            </p>
            {/* Authority Signals */}
            <div className="space-y-2">
              <div className="text-body flex items-center gap-2 text-xs dark:text-muted">
                <Icon name="Star" className="text-info dark:text-info h-4 w-4" />
                <span className="font-semibold">Military Financial Experts</span>
              </div>
              <div className="text-body flex items-center gap-2 text-xs dark:text-muted">
                <Icon name="Shield" className="h-4 w-4 text-success dark:text-green-400" />
                <span className="font-semibold">Trusted by 500+ Families</span>
              </div>
              <div className="text-body flex items-center gap-2 text-xs dark:text-muted">
                <Icon name="CheckCircle" className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="font-semibold">67+ Years Serving Military Families</span>
              </div>
            </div>
          </div>

          {/* Premium Tools */}
          <div>
            <h3 className="text-text-headings mb-4 font-bold dark:text-white/90">Premium Tools</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard/paycheck-audit"
                  className="text-text-body hover:text-primary-accent dark:hover:text-info transition-colors dark:text-muted"
                >
                  LES Auditor
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/pcs-copilot"
                  className="text-text-body hover:text-primary-accent transition-colors"
                >
                  PCS Copilot
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/navigator"
                  className="text-text-body hover:text-primary-accent transition-colors"
                >
                  Base Navigator
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/tdy-voucher"
                  className="text-text-body hover:text-primary-accent transition-colors"
                >
                  TDY Copilot
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/ask"
                  className="text-text-body hover:text-primary-accent transition-colors"
                >
                  Ask Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Toolkits */}
          <div>
            <h3 className="text-text-headings mb-4 font-bold dark:text-white/90">Toolkits</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/pcs-hub"
                  className="text-text-body hover:text-primary-accent transition-colors"
                >
                  PCS Hub
                </Link>
              </li>
              <li>
                <Link
                  href="/career-hub"
                  className="text-text-body hover:text-primary-accent transition-colors"
                >
                  Career Hub
                </Link>
              </li>
              <li>
                <Link
                  href="/deployment"
                  className="text-text-body hover:text-primary-accent transition-colors"
                >
                  Deployment Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/on-base-shopping"
                  className="text-text-body hover:text-primary-accent transition-colors"
                >
                  On-Base Shopping
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-text-headings mb-4 font-bold dark:text-white/90">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard/listening-post"
                  className="text-text-body hover:text-primary-accent transition-colors"
                >
                  Listening Post
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/directory"
                  className="text-text-body hover:text-primary-accent transition-colors"
                >
                  Directory
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/referrals"
                  className="text-text-body hover:text-primary-accent transition-colors"
                >
                  Refer & Earn
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/upgrade"
                  className="text-text-body hover:text-primary-accent transition-colors"
                >
                  Upgrade
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="text-text-headings mb-4 font-bold dark:text-white/90">
              Support & Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/contact"
                  className="text-text-body hover:text-primary-accent font-semibold transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/disclosures"
                  className="text-body font-semibold transition-colors hover:text-primary"
                >
                  Disclosures
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-body transition-colors hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy/cookies"
                  className="text-body transition-colors hover:text-primary"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy/do-not-sell"
                  className="text-body text-sm transition-colors hover:text-primary"
                >
                  Do Not Sell (CA)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-border pt-8 text-center dark:border-slate-700">
          <div className="mb-3 flex items-center justify-center gap-3">
            <div className="text-text-muted text-xs font-medium dark:text-muted">
              A FamilyMedia Company
            </div>
          </div>
          <p className="text-text-muted text-sm dark:text-muted">
            © {new Date().getFullYear()} Garrison Ledger by FamilyMedia, LLC. All rights reserved.
          </p>
          <p className="text-text-muted mt-1 text-xs dark:text-muted">
            Serving Military Families Since 1958
          </p>
          <p className="text-text-muted mt-2 text-xs dark:text-muted">
            Not affiliated with the U.S. Department of Defense or any branch of the Armed Forces.
          </p>
        </div>
      </div>
    </footer>
  );
}
