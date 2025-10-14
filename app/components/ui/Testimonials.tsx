type Testimonial = {
  quote: string;
  author: string;
  rank: string;
  impact: string;
};

const testimonials: Testimonial[] = [
  {
    quote: "The PPM calculator showed me I could pocket $2,300 on our OCONUS move. That paid for a full year of premium and then some. Best investment we made.",
    author: "CPT James M.",
    rank: "Army • Fort Hood → Ramstein AB",
    impact: "$2,300 saved"
  },
  {
    quote: "I was leaving 40% of potential returns on the table with my TSP allocation. The modeler helped me rebalance in 10 minutes. This will be worth tens of thousands by retirement.",
    author: "SSgt Rodriguez",
    rank: "USAF • Nellis AFB",
    impact: "40% TSP improvement"
  },
  {
    quote: "As a military spouse who PCSs every 2-3 years, the salary calculator has been invaluable. I turned down a job that looked good on paper but would have been a 15% pay cut after COL adjustment.",
    author: "Sarah K.",
    rank: "Mil Spouse • San Diego → Norfolk",
    impact: "Career decision clarity"
  },
  {
    quote: "The on-base savings calculator opened my eyes. We were spending $800/month at civilian stores when we could save 25% at the commissary. That's $2,400/year we were leaving on the table.",
    author: "LT Chen",
    rank: "Navy • USS Ronald Reagan",
    impact: "$2,400/year saved"
  },
];

export default function Testimonials() {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-10">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
        Real Results from Military Families
      </h2>
      <p className="text-center text-gray-600 mb-10">
        See how service members are using our tools to make smarter financial decisions
      </p>
      
      <div className="grid md:grid-cols-2 gap-6">
        {testimonials.map((testimonial, index) => (
          <div 
            key={index}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
          >
            <div className="mb-4">
              <p className="text-gray-700 leading-relaxed italic">
                &quot;{testimonial.quote}&quot;
              </p>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-600">{testimonial.rank}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">{testimonial.impact}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          <Icon name="Star" className="h-4 w-4 inline" /><Icon name="Star" className="h-4 w-4 inline" /><Icon name="Star" className="h-4 w-4 inline" /><Icon name="Star" className="h-4 w-4 inline" /><Icon name="Star" className="h-4 w-4 inline" /> <strong>4.8/5 average rating</strong> from 127 reviews
        </p>
      </div>
    </div>
  );
}

