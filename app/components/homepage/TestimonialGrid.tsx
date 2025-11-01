import Icon from "../ui/Icon";

export default function TestimonialGrid() {
  const testimonials = [
    {
      quote: "Found $1,200 in missing COLA. Took 2 minutes.",
      name: "Staff Sergeant Martinez",
      rank: "E-5",
      branch: "Army",
      base: "Fort Hood, TX",
      icon: "Star" as const,
    },
    {
      quote: "PCS profit was $2,400. Paid for a year of premium in one move.",
      name: "Lieutenant Commander Johnson",
      rank: "O-3",
      branch: "Navy",
      base: "San Diego, CA",
      icon: "Star" as const,
    },
    {
      quote: "Finally understand our BAH and special pays. Game changer.",
      name: "Sarah Thompson",
      rank: "Military Spouse",
      branch: "Air Force",
      base: "Ramstein AB, Germany",
      icon: "Star" as const,
    },
  ];

  const branchColors: Record<string, string> = {
    Army: "text-green-600",
    Navy: "text-blue-600",
    "Air Force": "text-sky-600",
    Marines: "text-red-600",
    "Coast Guard": "text-orange-600",
  };

  return (
    <section className="bg-gradient-to-b from-slate-50 to-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-lora mb-4 text-4xl font-bold text-gray-900">
            Real members. Real results.
          </h2>
          <p className="text-lg text-gray-600">
            Join thousands of military families taking command of their finances
          </p>
        </div>

        {/* 3-column grid (responsive to 1-column on mobile) */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-sm transition-all hover:border-blue-300 hover:shadow-lg"
            >
              {/* Rating stars */}
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Icon key={i} name="Star" className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="mb-6 text-lg font-medium text-gray-900">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              {/* Author info */}
              <div className="border-t border-gray-200 pt-4">
                <div className="font-bold text-gray-900">{testimonial.name}</div>
                <div className="text-sm text-gray-600">
                  {testimonial.rank} • <span className={branchColors[testimonial.branch]}>{testimonial.branch}</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                  <Icon name="MapPin" className="h-4 w-4" />
                  {testimonial.base}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badge */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-6 py-3">
            <Icon name="Shield" className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-900">
              Trusted by military families across all 5 branches
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

