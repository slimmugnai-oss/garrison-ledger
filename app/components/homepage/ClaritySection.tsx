import Icon from "../ui/Icon";

export default function ClaritySection() {
  return (
    <section className="bg-gradient-to-b from-white to-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-lora mb-12 text-center text-4xl font-bold text-gray-900">
          Financial intel built for YOUR military life
        </h2>

        {/* 3-column grid */}
        <div className="mb-12 grid gap-8 md:grid-cols-3">
          {/* Column 1: Official Data */}
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-2xl bg-blue-100 p-6">
                <Icon name="Database" className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            <h3 className="mb-3 text-2xl font-bold text-gray-900">Official Data</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center justify-center gap-2">
                <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                <span>16,368 BAH rates</span>
              </li>
              <li className="flex items-center justify-center gap-2">
                <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                <span>203 bases covered</span>
              </li>
              <li className="flex items-center justify-center gap-2">
                <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                <span>Current JTR rules</span>
              </li>
            </ul>
            <p className="mt-4 text-sm text-gray-600">DFAS, JTR, VA verified</p>
          </div>

          {/* Column 2: Your Situation */}
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-2xl bg-purple-100 p-6">
                <Icon name="Users" className="h-12 w-12 text-purple-600" />
              </div>
            </div>
            <h3 className="mb-3 text-2xl font-bold text-gray-900">Your Situation</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center justify-center gap-2">
                <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                <span>E-1 to O-10</span>
              </li>
              <li className="flex items-center justify-center gap-2">
                <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                <span>Every base</span>
              </li>
              <li className="flex items-center justify-center gap-2">
                <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                <span>Every family status</span>
              </li>
            </ul>
            <p className="mt-4 text-sm text-gray-600">Personalized to you</p>
          </div>

          {/* Column 3: Instant Answers */}
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-2xl bg-green-100 p-6">
                <Icon name="Zap" className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h3 className="mb-3 text-2xl font-bold text-gray-900">Instant Answers</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center justify-center gap-2">
                <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                <span>3-minute audits</span>
              </li>
              <li className="flex items-center justify-center gap-2">
                <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                <span>Real-time calculations</span>
              </li>
              <li className="flex items-center justify-center gap-2">
                <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                <span>No guesswork</span>
              </li>
            </ul>
            <p className="mt-4 text-sm text-gray-600">Accurate & fast</p>
          </div>
        </div>

        {/* Who This Is For */}
        <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-8 text-center">
          <p className="text-lg font-semibold text-gray-900">
            Built for active duty service members and military spouses managing your family&apos;s
            finances
          </p>
        </div>
      </div>
    </section>
  );
}

