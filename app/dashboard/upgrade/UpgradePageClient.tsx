"use client";

import { useState } from "react";
import PaymentButton from "../../components/PaymentButton";
import BillingPeriodToggle from "../../components/BillingPeriodToggle";
import QuestionPackCard from "../../components/QuestionPackCard";
import Icon from "../../components/ui/Icon";

interface PricingData {
  subscription: {
    monthly: {
      priceUSD: number;
      priceId: string;
      productId: string;
    };
    annual: {
      priceUSD: number;
      priceId: string;
      productId: string;
      savings: number;
    };
  };
  questionPacks: {
    pack25: {
      questions: number;
      priceUSD: number;
      priceId: string;
      productId: string;
      perQuestionCost: number;
    };
    pack100: {
      questions: number;
      priceUSD: number;
      priceId: string;
      productId: string;
      perQuestionCost: number;
    };
    pack250: {
      questions: number;
      priceUSD: number;
      priceId: string;
      productId: string;
      perQuestionCost: number;
    };
  };
}

interface UpgradePageClientProps {
  pricingData: PricingData;
}

export default function UpgradePageClient({ pricingData }: UpgradePageClientProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");

  const currentPrice =
    billingPeriod === "monthly"
      ? pricingData.subscription.monthly
      : pricingData.subscription.annual;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-16 text-center">
          <h1 className="font-lora mb-4 text-5xl font-bold text-gray-900">Upgrade to Premium</h1>
          <p className="mb-2 text-2xl text-gray-600">
            Unlock unlimited access to all 5 premium tools
          </p>
          <p className="text-lg text-gray-500">Or buy Ask Assistant question credits as needed</p>
        </div>

        {/* Premium Subscription (Primary) */}
        <div className="mx-auto mb-16 max-w-2xl">
          <div className="rounded-2xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 p-10 shadow-xl">
            {/* Billing Period Toggle */}
            <BillingPeriodToggle period={billingPeriod} onChange={setBillingPeriod} />

            {/* Pricing Display */}
            <div className="mb-8 text-center">
              <div className="mb-2 text-6xl font-black text-gray-900">
                ${currentPrice.priceUSD}
                <span className="text-2xl text-gray-600">
                  {billingPeriod === "monthly" ? "/month" : "/year"}
                </span>
              </div>
              {billingPeriod === "annual" && (
                <p className="font-semibold text-green-600">
                  Save ${pricingData.subscription.annual.savings} compared to monthly
                </p>
              )}
            </div>

            {/* Benefits */}
            <div className="mb-8 space-y-4">
              <div className="flex items-start gap-3">
                <Icon name="CheckCircle" className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600" />
                <div>
                  <p className="font-semibold text-gray-900">Unlimited LES Audits</p>
                  <p className="text-sm text-gray-600">Catch pay errors every month</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Icon name="CheckCircle" className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600" />
                <div>
                  <p className="font-semibold text-gray-900">Full Base Navigator</p>
                  <p className="text-sm text-gray-600">See ALL neighborhoods, not just top 3</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Icon name="CheckCircle" className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600" />
                <div>
                  <p className="font-semibold text-gray-900">Unlimited TDY Receipts</p>
                  <p className="text-sm text-gray-600">
                    Build compliant vouchers with unlimited uploads
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Icon name="CheckCircle" className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600" />
                <div>
                  <p className="font-semibold text-gray-900">50 Ask Assistant Questions/Month</p>
                  <p className="text-sm text-gray-600">
                    Get expert answers to military financial questions
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Icon name="CheckCircle" className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600" />
                <div>
                  <p className="font-semibold text-gray-900">Premium Intel Cards</p>
                  <p className="text-sm text-gray-600">
                    Advanced tax, investment, and benefits guides
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Icon name="CheckCircle" className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600" />
                <div>
                  <p className="font-semibold text-gray-900">All Calculators</p>
                  <p className="text-sm text-gray-600">TSP, SDP, House Hacking, and more</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <PaymentButton
              priceId={currentPrice.priceId}
              buttonText={`Upgrade to Premium - $${currentPrice.priceUSD}${billingPeriod === "monthly" ? "/month" : "/year"}`}
              className="w-full rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-blue-700"
            />

            <p className="mt-4 text-center text-sm text-gray-600">
              7-day money-back guarantee • Cancel anytime
            </p>
          </div>
        </div>

        {/* Ask Assistant Question Packs */}
        <div className="mx-auto mb-16 max-w-4xl">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-3xl font-bold text-gray-900">Or Buy Ask Assistant Credits</h2>
            <p className="text-lg text-gray-600">
              Perfect for occasional questions. One-time purchase, credits never expire.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <QuestionPackCard
              questions={pricingData.questionPacks.pack25.questions}
              price={pricingData.questionPacks.pack25.priceUSD}
              priceId={pricingData.questionPacks.pack25.priceId}
              perQuestionCost={pricingData.questionPacks.pack25.perQuestionCost}
            />

            <QuestionPackCard
              questions={pricingData.questionPacks.pack100.questions}
              price={pricingData.questionPacks.pack100.priceUSD}
              priceId={pricingData.questionPacks.pack100.priceId}
              perQuestionCost={pricingData.questionPacks.pack100.perQuestionCost}
              mostPopular
            />

            <QuestionPackCard
              questions={pricingData.questionPacks.pack250.questions}
              price={pricingData.questionPacks.pack250.priceUSD}
              priceId={pricingData.questionPacks.pack250.priceId}
              perQuestionCost={pricingData.questionPacks.pack250.perQuestionCost}
            />
          </div>
        </div>

        {/* Free vs Premium Comparison */}
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">Free vs Premium</h2>

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Free
                  </th>
                  <th className="bg-blue-50 px-6 py-4 text-center text-sm font-semibold text-blue-900">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">LES Audits</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">1/month</td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">
                    Unlimited
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Base Navigator</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">Top 3 results</td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">
                    Full rankings
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">TDY Receipts</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">3 per trip</td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">
                    Unlimited
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Ask Assistant</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">5 questions/month</td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">
                    50 questions/month
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Binder Storage</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">1 GB</td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">
                    5 GB
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Intel Library</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">Basic cards</td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">
                    All premium cards
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Calculators</td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">
                    ✓ All 6 tools
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">
                    ✓ All 6 tools
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
