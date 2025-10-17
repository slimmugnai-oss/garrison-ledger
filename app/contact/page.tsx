import type { Metadata } from 'next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ContactForm from '../components/contact/ContactForm';
import Icon from '../components/ui/Icon';

export const metadata: Metadata = {
  title: 'Contact Us | Garrison Ledger',
  description: 'Get in touch with the Garrison Ledger team. We are here to help with questions about our military financial planning platform.',
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#0A0F1E] text-white pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Get in Touch
            </h1>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              Have a question or need assistance? Our team is here to help you succeed with your military financial planning.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-6 shadow-lg">
                <h3 className="text-lg font-bold mb-4 text-white">Why Contact Us?</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-[#00E5A0]/10 p-2 rounded-lg">
                      <Icon name="HelpCircle" className="w-5 h-5 text-[#00E5A0]" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Questions</p>
                      <p className="text-sm text-muted">Learn more about our features and plans</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-[#00E5A0]/10 p-2 rounded-lg">
                      <Icon name="Wrench" className="w-5 h-5 text-[#00E5A0]" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Technical Support</p>
                      <p className="text-sm text-muted">Get help with using the platform</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-[#00E5A0]/10 p-2 rounded-lg">
                      <Icon name="Lightbulb" className="w-5 h-5 text-[#00E5A0]" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Feature Requests</p>
                      <p className="text-sm text-muted">Share ideas to improve the platform</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-6 shadow-lg">
                <h3 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                  <Icon name="Timer" className="w-5 h-5 text-[#00E5A0]" />
                  Response Time
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted">General Inquiries</span>
                    <span className="text-white font-semibold">24-48h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Technical Issues</span>
                    <span className="text-white font-semibold">12-24h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Urgent Matters</span>
                    <span className="text-[#00E5A0] font-semibold">4-12h</span>
                  </div>
                </div>
                <p className="mt-4 text-xs text-muted">
                  * Response times are business day estimates
                </p>
              </div>

              {/* Alternative Contact */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-6 shadow-lg">
                <h3 className="text-lg font-bold mb-4 text-white">Other Ways to Reach Us</h3>
                <div className="space-y-3 text-sm">
                  <p className="text-muted">
                    <strong className="text-white">Documentation:</strong>
                    <br />
                    <a href="/pcs-hub" className="text-[#00E5A0] hover:underline">
                      Browse our resource hubs →
                    </a>
                  </p>
                  <p className="text-muted">
                    <strong className="text-white">Premium Support:</strong>
                    <br />
                    <a href="/dashboard/support" className="text-[#00E5A0] hover:underline">
                      Access dashboard support →
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-8 shadow-lg">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Send Us a Message</h2>
                  <p className="text-muted">
                    Fill out the form below and we&apos;ll get back to you as soon as possible.
                  </p>
                </div>
                
                <ContactForm variant="public" />
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Icon name="HelpCircle" className="w-5 h-5 text-[#00E5A0]" />
                  How long does it take to get a response?
                </h3>
                <p className="text-sm text-muted">
                  We typically respond within 24-48 hours for general inquiries and 12-24 hours for technical issues.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Icon name="HelpCircle" className="w-5 h-5 text-[#00E5A0]" />
                  Do I need an account to contact you?
                </h3>
                <p className="text-sm text-muted">
                  No! Anyone can use this form. However, account holders can also access support through the dashboard.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Icon name="HelpCircle" className="w-5 h-5 text-[#00E5A0]" />
                  What information should I include?
                </h3>
                <p className="text-sm text-muted">
                  Be as specific as possible about your question or issue. Include screenshots if relevant (you can attach them in your follow-up email).
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Icon name="HelpCircle" className="w-5 h-5 text-[#00E5A0]" />
                  Is my information secure?
                </h3>
                <p className="text-sm text-muted">
                  Absolutely. Your information is encrypted and only used to respond to your inquiry. We never share your data with third parties.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

