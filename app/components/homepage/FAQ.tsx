"use client";

import { useState } from "react";

import Icon from "../ui/Icon";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Is my data safe?",
      answer:
        "Absolutely. We use military-grade security with zero-storage policy for sensitive data. Your LES is processed in-memory only—we extract the line items (BAH, BAS, etc.) and immediately delete the PDF. We never store your SSN, bank account, or routing number. All data is encrypted at rest and in transit.",
    },
    {
      question: "How accurate is this?",
      answer:
        "We use only official sources: DFAS for pay tables and BAH rates, JTR for PCS entitlements, VA for benefits data. Our 16,368 BAH rates and 203 base guides are updated quarterly. Every calculation is based on current 2025 rates with verification dates clearly shown.",
    },
    {
      question: "What's included in the free tier?",
      answer:
        "Free members get: 1 LES audit per month, 5 Ask Military Expert questions, 2 base comparisons, 2 timeline planners, and access to all basic calculators (TSP, SDP, House Hacking, PCS Planner, etc.). Premium ($9.99/month) unlocks unlimited usage of all tools.",
    },
    {
      question: "Can I cancel anytime?",
      answer:
        "Yes, absolutely. No contracts, no commitments. Cancel your premium subscription anytime and you'll retain access through the end of your billing period. We built this to be military-friendly—we understand PCS moves, deployments, and changing circumstances.",
    },
    {
      question: "Do you support all ranks and branches?",
      answer:
        "Yes. We support E-1 through O-10 across all 5 branches (Army, Navy, Air Force, Marines, Coast Guard) plus Guard and Reserve. Our data covers all 203 CONUS and OCONUS bases. Whether you're a junior enlisted member or a senior officer, the platform personalizes to your specific situation.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-lora mb-4 text-4xl font-bold text-gray-900">Common questions</h2>
          <p className="text-lg text-gray-600">Everything you need to know before getting started</p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white transition-all hover:border-gray-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-gray-50"
              >
                <span className="pr-8 text-lg font-bold text-gray-900">{faq.question}</span>
                <Icon
                  name="ChevronDown"
                  className={`h-6 w-6 flex-shrink-0 text-gray-600 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openIndex === index && (
                <div className="border-t border-gray-200 bg-gray-50 p-6">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still have questions CTA */}
        <div className="mt-12 rounded-2xl border-2 border-blue-200 bg-blue-50 p-8 text-center">
          <h3 className="mb-2 text-xl font-bold text-gray-900">Still have questions?</h3>
          <p className="mb-4 text-gray-700">
            Reach out to our support team at{" "}
            <a href="mailto:support@garrisonledger.com" className="font-semibold text-blue-600 hover:text-blue-700">
              support@garrisonledger.com
            </a>
          </p>
          <p className="text-sm text-gray-600">We typically respond within 24 hours</p>
        </div>
      </div>
    </section>
  );
}

