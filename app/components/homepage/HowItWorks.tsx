import { SignedOut, SignUpButton } from "@clerk/nextjs";

import Icon from "../ui/Icon";

export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Tell us about you",
      description: "Rank, base, family status",
      time: "30 seconds",
      icon: "User" as const,
    },
    {
      number: "2",
      title: "Ask or audit",
      description: "Upload LES or ask a question",
      time: "30 seconds",
      icon: "Upload" as const,
    },
    {
      number: "3",
      title: "Get your answer",
      description: "Personalized to YOUR situation",
      time: "Instant",
      icon: "Zap" as const,
    },
  ];

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-lora mb-4 text-4xl font-bold text-gray-900">
            Get started in 60 seconds
          </h2>
          <p className="text-lg text-gray-600">
            Most members get their first win in under 3 minutes
          </p>
        </div>

        {/* 3-step visual */}
        <div className="mb-12 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line (desktop only) */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-16 hidden h-1 w-full md:block">
                  <div className="h-full w-full border-t-2 border-dashed border-gray-300" />
                </div>
              )}

              <div className="relative z-10 text-center">
                {/* Step number badge */}
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-2xl font-bold text-white shadow-lg">
                    {step.number}
                  </div>
                </div>

                {/* Icon */}
                <div className="mb-4 flex justify-center">
                  <div className="rounded-xl bg-blue-50 p-4">
                    <Icon name={step.icon} className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="mb-2 text-xl font-bold text-gray-900">{step.title}</h3>
                <p className="mb-2 text-gray-700">{step.description}</p>
                <p className="text-sm font-semibold text-blue-600">{step.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl">
                Start Your Free Account →
              </button>
            </SignUpButton>
            <p className="mt-3 text-sm text-gray-600">No credit card required • Free forever tier</p>
          </SignedOut>
        </div>
      </div>
    </section>
  );
}

