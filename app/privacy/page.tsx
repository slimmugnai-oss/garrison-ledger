import LegalLayout from "@/app/components/legal/LegalLayout";

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy">
      <section id="who-we-are">
        <h2>1) Who We Are</h2>
        <p>
          This Privacy Policy explains how <strong>Family Media, LLC</strong> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) collects,
          uses, and shares information about you when you use <strong>Garrison Ledger</strong> and related sites,
          apps, and services (collectively, the &quot;Services&quot;). If you do not agree with this Policy, do not use the Services.
        </p>
        <ul>
          <li>Legal entity: Family Media, LLC</li>
          <li>Contact: <a href="mailto:support@garrisonledger.com">support@garrisonledger.com</a></li>
          <li>Postal address: 33 Walt Whitman Rd, Suite 201e, Huntington Station, NY 11746</li>
        </ul>
      </section>

      <section id="scope">
        <h2>2) Scope & Audience</h2>
        <p>
          This Policy applies to end users, subscribers, site visitors, and provider directory contacts.
          We do not target or knowingly collect data from children under 13 (or 16 where applicable). If you believe
          we collected a child&apos;s data, contact us to request deletion.
        </p>
      </section>

      <section id="info-we-collect">
        <h2>3) Information We Collect</h2>
        <p>We collect information in the following categories:</p>
        <ul>
          <li><strong>Account & Auth:</strong> name, email, auth IDs and metadata from Clerk.</li>
          <li><strong>Subscription & Billing:</strong> limited Stripe metadata (customer id, status, period end). We do not store full card numbers.</li>
          <li><strong>Assessment & Saved Models:</strong> your questionnaire answers and tool inputs/outputs (TSP/SDP/house-hacking scenarios) saved to Supabase.</li>
          <li><strong>Directory Data:</strong> provider submissions (name, business details, contact info) and admin notes.</li>
          <li><strong>Support & Refunds:</strong> messages and fields you submit in support/refund forms.</li>
          <li><strong>Usage & Analytics:</strong> page views, events, device/browser data, timestamps, IP (short-retained), and coarse location inferred from IP.</li>
          <li><strong>Cookies & Similar Tech:</strong> session, auth, preference, and analytics cookies.</li>
        </ul>
      </section>

      <section id="sources">
        <h2>4) Sources of Data</h2>
        <ul>
          <li>Directly from you (forms, assessment, saved models, support)</li>
          <li>Automatically (cookies, logs, usage analytics)</li>
          <li>Processors: Clerk (auth), Supabase (database), Stripe (billing), Vercel (hosting)</li>
        </ul>
      </section>

      <section id="how-we-use">
        <h2>5) How We Use Information</h2>
        <ul>
          <li>Provide, secure, and improve the Services</li>
          <li>Personalize your dashboard, plan, and tools</li>
          <li>Process payments, manage entitlements, prevent fraud/abuse</li>
          <li>Respond to support requests and honor privacy rights</li>
          <li>Analyze aggregate usage to improve content and UX</li>
          <li>Send service emails; send marketing emails only with consent (opt-out anytime)</li>
          <li>Comply with law, enforce terms, and protect our rights</li>
        </ul>
      </section>

      <section id="sharing">
        <h2>6) When We Share Information</h2>
        <p>We share limited data with service providers who help us operate the Services:</p>
        <ul>
          <li><strong>Clerk</strong> (authentication & user management)</li>
          <li><strong>Supabase</strong> (database, Row Level Security)</li>
          <li><strong>Stripe</strong> (payments & subscription status)</li>
          <li><strong>Vercel</strong> (hosting & CDN)</li>
        </ul>
        <p>
          We may also share when required by law, in a merger or acquisition, or with your explicit direction.
          We do not sell personal information, and we do not share it for cross-context behavioral advertising without your consent.
        </p>
      </section>

      <section id="retention">
        <h2>7) Retention</h2>
        <p>
          We keep personal data only as long as needed for the purposes in this Policy, then delete or de-identify it.
          You may delete your account or request deletion of assessment/saved models at any time.
        </p>
      </section>

      <section id="security">
        <h2>8) Security</h2>
        <p>
          We use reasonable administrative, technical, and organizational measures, including HTTPS, access controls,
          database RLS, key management, and least-privilege principles. No method is 100% secure.
        </p>
      </section>

      <section id="your-rights">
        <h2>9) Your Rights</h2>
        <p>
          Depending on where you live (EEA/UK, California, Virginia, Colorado), you may have rights to access,
          correct, delete, port, or restrict processing of your data; to opt-out of selling/sharing; and to appeal denials.
          To exercise rights, contact <a href="mailto:support@garrisonledger.com">support@garrisonledger.com</a>.
        </p>
      </section>

      <section id="changes">
        <h2>10) Changes to this Policy</h2>
        <p>
          We may update this Policy. We will post the updated version with a new &quot;Effective&quot; date and, when appropriate, notify you.
        </p>
      </section>

      <section id="contact">
        <h2>11) Contact</h2>
        <p>
          Questions or requests: <a href="mailto:support@garrisonledger.com">support@garrisonledger.com</a>
        </p>
      </section>
    </LegalLayout>
  );
}

