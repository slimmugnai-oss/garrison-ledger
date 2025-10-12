import LegalLayout from "@/app/components/legal/LegalLayout";

export default function CookiePolicyPage() {
  return (
    <LegalLayout title="Cookie Policy">
      <section>
        <h2>What Are Cookies?</h2>
        <p>
          Cookies are small text files stored on your device when you visit websites. They help us provide and improve the Services.
        </p>
      </section>

      <section>
        <h2>Types of Cookies We Use</h2>
        
        <h3>Essential Cookies (Always Active)</h3>
        <p>Required for the Services to function. These cannot be disabled:</p>
        <ul>
          <li><strong>Authentication:</strong> Clerk session cookies to keep you logged in</li>
          <li><strong>Security:</strong> CSRF tokens and security headers</li>
          <li><strong>Preferences:</strong> Your cookie consent choices</li>
        </ul>

        <h3>Analytics Cookies (Optional)</h3>
        <p>Help us understand how visitors use the Services:</p>
        <ul>
          <li><strong>Usage tracking:</strong> Page views, clicks, navigation patterns</li>
          <li><strong>Performance:</strong> Load times, errors, feature usage</li>
        </ul>
      </section>

      <section>
        <h2>Your Choices</h2>
        <p>
          You can manage cookie preferences through our banner (shown on first visit) or through your browser settings.
          Blocking essential cookies will prevent the Services from working properly.
        </p>
      </section>

      <section>
        <h2>Third-Party Cookies</h2>
        <p>Our service providers may set their own cookies:</p>
        <ul>
          <li><strong>Clerk:</strong> Authentication and session management</li>
          <li><strong>Stripe:</strong> Payment processing and fraud prevention</li>
          <li><strong>Vercel:</strong> Hosting and performance optimization</li>
        </ul>
      </section>

      <section>
        <h2>Updates</h2>
        <p>
          We may update this Cookie Policy. Changes will be reflected with a new effective date.
        </p>
      </section>
    </LegalLayout>
  );
}

