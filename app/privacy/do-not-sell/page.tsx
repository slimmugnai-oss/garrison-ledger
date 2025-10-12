import LegalLayout from "@/app/components/legal/LegalLayout";

export default function DoNotSellPage() {
  return (
    <LegalLayout title="Do Not Sell or Share My Personal Information">
      <section>
        <h2>California Privacy Rights (CPRA)</h2>
        <p>
          California residents have the right to opt-out of the &quot;sale&quot; or &quot;sharing&quot; of personal information
          as defined by the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA).
        </p>
      </section>

      <section>
        <h2>Our Practice</h2>
        <p>
          <strong>Garrison Ledger does not sell personal information.</strong> We do not share your data for cross-context
          behavioral advertising. Your personal data is only shared with our service providers (Clerk, Supabase, Stripe, Vercel)
          as necessary to operate the Services, as described in our <a href="/privacy">Privacy Policy</a>.
        </p>
      </section>

      <section>
        <h2>Submit a Request</h2>
        <p>
          If you have concerns or want to exercise your California privacy rights, please contact us at{' '}
          <a href="mailto:support@familymedia.com">support@familymedia.com</a> with:
        </p>
        <ul>
          <li>Your name and email address</li>
          <li>Description of your request (access, deletion, opt-out, etc.)</li>
          <li>Verification information (we&apos;ll verify your identity before processing)</li>
        </ul>
        <p>
          We will respond within 45 days as required by law.
        </p>
      </section>

      <section>
        <h2>Authorized Agent</h2>
        <p>
          California residents may designate an authorized agent to submit requests on their behalf.
          The agent must provide written authorization signed by you.
        </p>
      </section>
    </LegalLayout>
  );
}

