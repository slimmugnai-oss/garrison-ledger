import { Engine } from "json-rules-engine";

/** Facts shape arriving from assessment */
export type AssessmentFacts = {
  stage?: "pcs_soon" | "pcs_later" | "deployment" | "reintegration";
  housing?: "on_base" | "off_base" | "unsure";
  kids?: boolean;
  goals?: { tsp?: boolean; sdp?: boolean; house?: boolean };
  financeStress?: "low" | "med" | "high";
};

export type RuleEvent = { type: "recommendContent"; params: { tag: string } };

/** Seed rules (easy to extend in JSON later) */
const ruleDefs = [
  // Stage-based recommendations
  {
    conditions: { all: [{ fact: "stage", operator: "equal", value: "pcs_soon" }] },
    event: { type: "recommendContent", params: { tag: "stage:pcs_soon" } }
  },
  {
    conditions: { all: [{ fact: "stage", operator: "equal", value: "pcs_soon" }] },
    event: { type: "recommendContent", params: { tag: "topic:pcs" } }
  },
  {
    conditions: { all: [{ fact: "stage", operator: "equal", value: "deployment" }] },
    event: { type: "recommendContent", params: { tag: "stage:deployment" } }
  },
  {
    conditions: { all: [{ fact: "stage", operator: "equal", value: "deployment" }] },
    event: { type: "recommendContent", params: { tag: "topic:deployment" } }
  },
  {
    conditions: { all: [{ fact: "stage", operator: "equal", value: "reintegration" }] },
    event: { type: "recommendContent", params: { tag: "stage:reintegration" } }
  },
  {
    conditions: { all: [{ fact: "stage", operator: "equal", value: "pcs_later" }] },
    event: { type: "recommendContent", params: { tag: "stage:pcs_later" } }
  },
  
  // Housing-based recommendations
  {
    conditions: { all: [{ fact: "housing", operator: "equal", value: "off_base" }] },
    event: { type: "recommendContent", params: { tag: "housing:off_base" } }
  },
  {
    conditions: { all: [{ fact: "housing", operator: "equal", value: "on_base" }] },
    event: { type: "recommendContent", params: { tag: "housing:on_base" } }
  },
  {
    conditions: { all: [{ fact: "housing", operator: "equal", value: "on_base" }] },
    event: { type: "recommendContent", params: { tag: "topic:shopping" } }
  },
  
  // Family-based recommendations
  {
    conditions: { all: [{ fact: "kids", operator: "equal", value: true }] },
    event: { type: "recommendContent", params: { tag: "audience:with_kids" } }
  },
  
  // Goal-based recommendations (tools)
  {
    conditions: { all: [{ fact: "goals.tsp", operator: "equal", value: true }] },
    event: { type: "recommendContent", params: { tag: "tool:tsp" } }
  },
  {
    conditions: { all: [{ fact: "goals.tsp", operator: "equal", value: true }] },
    event: { type: "recommendContent", params: { tag: "topic:finance" } }
  },
  {
    conditions: { all: [{ fact: "goals.sdp", operator: "equal", value: true }] },
    event: { type: "recommendContent", params: { tag: "tool:sdp" } }
  },
  {
    conditions: { all: [{ fact: "goals.house", operator: "equal", value: true }] },
    event: { type: "recommendContent", params: { tag: "tool:house" } }
  },
  
  // Career always relevant for military spouses
  {
    conditions: { all: [{ fact: "stage", operator: "in", value: ["pcs_soon", "pcs_later", "reintegration"] }] },
    event: { type: "recommendContent", params: { tag: "topic:career" } }
  },
  
  // Finance stress
  {
    conditions: { all: [{ fact: "financeStress", operator: "equal", value: "high" }] },
    event: { type: "recommendContent", params: { tag: "topic:financial_first_aid" } }
  }
];

export async function runPlanRules(facts: AssessmentFacts): Promise<Set<string>> {
  const engine = new Engine([], { allowUndefinedFacts: true });
  ruleDefs.forEach(r => engine.addRule(r as unknown as Parameters<typeof engine.addRule>[0]));
  const { events } = await engine.run(facts);
  const tags = new Set<string>();
  for (const e of events as RuleEvent[]) tags.add(e.params.tag);
  // Always add a general audience tag
  tags.add("audience:all");
  return tags;
}

/** Score toolkit items by tag overlap */
export function scoreResources(tags: Set<string>, toolkit: Array<{ title: string; url: string; tags: string[] }>) {
  return toolkit
    .map(item => {
      const itemTags: string[] = item.tags || [];
      const score = itemTags.reduce((s, t) => s + (tags.has(t) ? 1 : 0), 0);
      return { item, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(x => x.item);
}

