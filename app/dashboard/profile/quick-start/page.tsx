import type { Metadata } from "next";
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import MultiStepProfileWizard from '@/app/components/profile/MultiStepProfileWizard';
import { generatePageMeta } from "@/lib/seo-config";

export const metadata: Metadata = generatePageMeta({
  title: "Quick Profile Setup - Get Started in 2 Minutes",
  description: "Complete your essential profile information to unlock AI-powered personalized financial planning",
  path: "/dashboard/profile/quick-start"
});

export default async function QuickStartProfilePage() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-success-subtle text-success px-4 py-2 rounded-full text-sm font-bold mb-4">
              <span className="inline-block w-2 h-2 bg-success rounded-full animate-pulse"></span>
              Quick Setup - Just 2 Minutes
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-black text-primary mb-4">
              Let&apos;s Get You Set Up
            </h1>
            <p className="text-xl text-body max-w-2xl mx-auto">
              Answer a few quick questions so AI can curate the perfect financial plan for your military situation
            </p>
          </div>

          {/* Wizard */}
          <MultiStepProfileWizard />

          {/* Trust signals */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-6 text-sm text-body">
              <div className="flex items-center gap-2">
                <span className="text-success">✓</span>
                <span>Bank-level encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-success">✓</span>
                <span>Never shared</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-success">✓</span>
                <span>100% private</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

