import Link from "next/link";
import Icon from "./ui/Icon";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-200 bg-white transition-colors dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          {/* Brand with Authority */}
          <div>
            <div className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
              <Icon name="Shield" className="mr-1 inline h-5 w-5" /> Garrison Ledger
            </div>
            <p className="mb-4 leading-relaxed text-gray-600 dark:text-gray-400">
              Intelligent planning for military life.
            </p>
            {/* Authority Signals */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <Icon name="Star" className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold">Military Financial Experts</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <Icon name="Shield" className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="font-semibold">Trusted by 500+ Families</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <Icon name="CheckCircle" className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="font-semibold">67+ Years Serving Military Families</span>
              </div>
            </div>
          </div>

          {/* Premium Tools */}
          <div>
            <h3 className="mb-4 font-bold text-slate-900 dark:text-white">Premium Tools</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard/paycheck-audit"
                  className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  LES Auditor
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/pcs-copilot"
                  className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  PCS Copilot
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/navigator"
                  className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Base Navigator
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/tdy-voucher"
                  className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  TDY Copilot
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/ask"
                  className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Ask Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Toolkits */}
          <div>
            <h3 className="mb-4 font-bold text-slate-900 dark:text-white">Toolkits</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/pcs-hub"
                  className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  PCS Hub
                </Link>
              </li>
              <li>
                <Link
                  href="/career-hub"
                  className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Career Hub
                </Link>
              </li>
              <li>
                <Link
                  href="/deployment"
                  className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Deployment Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/on-base-shopping"
                  className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  On-Base Shopping
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 font-bold text-slate-900 dark:text-white">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard/listening-post"
                  className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Listening Post
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/directory"
                  className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Directory
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/referrals"
                  className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Refer & Earn
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/upgrade"
                  className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Upgrade
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="mb-4 font-bold text-slate-900 dark:text-white">Support & Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/contact"
                  className="font-semibold text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/disclosures"
                  className="font-semibold text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Disclosures
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy/cookies"
                  className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy/do-not-sell"
                  className="text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Do Not Sell (CA)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-gray-200 pt-8 text-center dark:border-slate-700">
          <div className="mb-3 flex items-center justify-center gap-3">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
              A FamilyMedia Company
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Garrison Ledger by FamilyMedia, LLC. All rights reserved.
          </p>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Serving Military Families Since 1958
          </p>
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            Not affiliated with the U.S. Department of Defense or any branch of the Armed Forces.
          </p>
        </div>
      </div>
    </footer>
  );
}
