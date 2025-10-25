import type { Metadata } from "next";

import { generatePageMeta } from "@/lib/seo-config";

export const metadata: Metadata = generatePageMeta({
  title: "Listening Post - Military Financial News & Updates",
  description: "Real-time military financial news from trusted sources including Military Times, Stars & Stripes, Task & Purpose. Stay informed on PCS, TSP, BAH, deployment, and military benefits updates.",
  path: "/dashboard/listening-post",
  keywords: [
    "military financial news",
    "military times finance",
    "stars and stripes money",
    "military pay news",
    "tsp updates",
    "bah changes",
    "pcs news",
    "deployment pay news",
    "military benefits updates",
    "military spouse news"
  ]
});

