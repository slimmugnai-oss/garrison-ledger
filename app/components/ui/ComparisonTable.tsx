import Icon from './Icon';

type Feature = {
  name: string;
  free: string | boolean;
  premium: string | boolean;
};

const features: Feature[] = [
  { name: "Resource Hubs (PCS, Career, Deployment, Shopping, Base Guides)", free: true, premium: true },
  { name: "Personal Assessment", free: "1x per week", premium: "3x per day" },
  { name: "AI-Curated Personalized Plan", free: "Preview (2 blocks)", premium: "Full plan (8-10 blocks)" },
  { name: "Executive Summary", free: "First 2 paragraphs", premium: "Complete summary" },
  { name: "All 6 Financial Calculators", free: true, premium: true },
  { name: "AI Calculator Explanations", free: "Preview (2-3 sentences)", premium: "Full AI analysis" },
  { name: "Intel Library (410+ Content Blocks)", free: "5 articles/day", premium: "Unlimited access" },
  { name: "Bookmarking & Ratings", free: false, premium: true },
  { name: "Personalized Recommendations", free: false, premium: true },
  { name: "Priority Support", free: false, premium: true },
];

export default function ComparisonTable() {
  return (
    <div className="bg-surface border-2 border-subtle rounded-2xl overflow-hidden shadow-lg">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Free vs Premium</h2>
        <p className="text-muted">See exactly what you get with each tier</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-hover border-b-2 border-subtle">
              <th className="text-left p-6 text-body font-semibold">Feature</th>
              <th className="text-center p-6 text-body font-semibold w-32">
                <div className="inline-flex items-center px-3 py-1 bg-success-subtle text-success rounded-full text-sm font-bold">
                  Free Forever
                </div>
              </th>
              <th className="text-center p-6 text-amber-700 font-semibold w-32">
                <div className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-bold">
                  <Icon name="Star" className="h-4 w-4 inline" /> Premium
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr key={index} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="p-6 text-primary">{feature.name}</td>
                <td className="p-6 text-center">
                  {typeof feature.free === 'boolean' ? (
                    feature.free ? (
                      <Icon name="Check" className="h-6 w-6 text-green-500" />
                    ) : (
                      <span className="text-2xl text-muted">—</span>
                    )
                  ) : (
                    <span className="text-sm text-body font-medium">{feature.free}</span>
                  )}
                </td>
                <td className="p-6 text-center">
                  {typeof feature.premium === 'boolean' ? (
                    feature.premium ? (
                      <Icon name="Check" className="h-6 w-6 text-amber-500" />
                    ) : (
                      <span className="text-2xl text-muted">—</span>
                    )
                  ) : (
                    <span className="text-sm text-body font-semibold">{feature.premium}</span>
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

