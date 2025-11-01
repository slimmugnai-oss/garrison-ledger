import Icon from "../ui/Icon";

interface TrustBadgesProps {
  userCount?: number;
  basesCount?: number;
  errorsCaught?: string;
}

export default function TrustBadges({
  userCount = 12000,
  basesCount = 203,
  errorsCaught = "$4.2M",
}: TrustBadgesProps) {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
          Why military families trust Garrison Ledger
        </h2>

        {/* 4-column trust signals grid */}
        <div className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Veteran-Owned */}
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-blue-100 p-4">
                <Icon name="Shield" className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-900">Veteran-Owned</h3>
            <p className="text-sm text-gray-600">Built by those who served</p>
          </div>

          {/* Official Data */}
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-green-100 p-4">
                <Icon name="CheckCircle" className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-900">Official Data</h3>
            <p className="text-sm text-gray-600">DFAS, JTR, VA verified sources</p>
          </div>

          {/* Military-Grade Security */}
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-purple-100 p-4">
                <Icon name="Lock" className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-900">Military-Grade Security</h3>
            <p className="text-sm text-gray-600">Zero SSN/bank storage</p>
          </div>

          {/* Always Current */}
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-orange-100 p-4">
                <Icon name="Calendar" className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-900">Always Current</h3>
            <p className="text-sm text-gray-600">2025 rates, updated quarterly</p>
          </div>
        </div>

        {/* Stats line */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {userCount.toLocaleString()}+
              </div>
              <div className="text-sm font-medium text-gray-600">Military Families</div>
            </div>
            <div className="hidden h-12 w-px bg-gray-300 sm:block" />
            <div>
              <div className="text-3xl font-bold text-blue-600">{basesCount}</div>
              <div className="text-sm font-medium text-gray-600">Bases Covered</div>
            </div>
            <div className="hidden h-12 w-px bg-gray-300 sm:block" />
            <div>
              <div className="text-3xl font-bold text-blue-600">{errorsCaught}</div>
              <div className="text-sm font-medium text-gray-600">In Errors Caught</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

