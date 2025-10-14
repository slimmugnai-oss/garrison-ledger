type Feature = {
  name: string;
  free: string | boolean;
  premium: string | boolean;
};

const features: Feature[] = [
  { name: "Resource Hubs (PCS, Career, Deployment, Shopping, Base Guides)", free: true, premium: true },
  { name: "Personal Assessment", free: "1x per day", premium: "Unlimited" },
  { name: "AI-Generated Strategic Plan", free: "1x per day", premium: "Unlimited regeneration" },
  { name: "TSP Retirement Calculator", free: "Preview only (5 years)", premium: "Full projection (30+ years)" },
  { name: "SDP Deployment Savings Calculator", free: false, premium: true },
  { name: "House Hacking ROI Calculator", free: false, premium: true },
  { name: "PCS Financial Planner & PPM Estimator", free: false, premium: true },
  { name: "On-Base Savings Calculator", free: false, premium: true },
  { name: "Salary & Relocation Calculator", free: false, premium: true },
  { name: "Intel Library (400+ Searchable Content Blocks)", free: false, premium: true },
  { name: "Save & Export Calculations", free: false, premium: true },
  { name: "Priority Email Support (24-hour response)", free: false, premium: true },
  { name: "Future Tools & Features", free: false, premium: true },
];

export default function ComparisonTable() {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Free vs Premium</h2>
        <p className="text-gray-300">See exactly what you get with each tier</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              <th className="text-left p-6 text-gray-700 font-semibold">Feature</th>
              <th className="text-center p-6 text-gray-700 font-semibold w-32">
                <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                  Free Forever
                </div>
              </th>
              <th className="text-center p-6 text-amber-700 font-semibold w-32">
                <div className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-bold">
                  ⭐ Premium
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr key={index} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="p-6 text-gray-800">{feature.name}</td>
                <td className="p-6 text-center">
                  {typeof feature.free === 'boolean' ? (
                    feature.free ? (
                      <span className="text-2xl text-green-500">✓</span>
                    ) : (
                      <span className="text-2xl text-gray-300">—</span>
                    )
                  ) : (
                    <span className="text-sm text-gray-600 font-medium">{feature.free}</span>
                  )}
                </td>
                <td className="p-6 text-center">
                  {typeof feature.premium === 'boolean' ? (
                    feature.premium ? (
                      <span className="text-2xl text-amber-500">✓</span>
                    ) : (
                      <span className="text-2xl text-gray-300">—</span>
                    )
                  ) : (
                    <span className="text-sm text-gray-700 font-semibold">{feature.premium}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-center">
        <p className="text-white font-bold text-lg mb-3">
          Upgrade to Premium for just $9.99/month
        </p>
        <p className="text-indigo-100 text-sm">
          Less than a coffee per week · Cancel anytime · 7-day money-back guarantee
        </p>
      </div>
    </div>
  );
}

