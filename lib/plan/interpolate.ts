export type DoNowItem = { id: string; text: string };
export type EstImpact = { label: string; value: string };

export function whyItMattersBullets(ctx: Record<string, unknown>): string[] {
  const out: string[] = [];
  const deps = Number((ctx as any).dependents || 0);
  const bah = Number((ctx as any).bah || 0);
  const pcsSoon = Number((ctx as any).timelineMonths || 24) <= 6;
  if (pcsSoon) out.push('You have limited runway — handle time-sensitive items first.');
  if (bah > 0) out.push('BAH enables off-base options — optimize housing decisions.');
  if (deps > 0) out.push('With dependents, plan around school calendars and childcare.');
  if (out.length === 0) out.push('This section is tailored to your current stage and goals.');
  return out.slice(0, 3);
}

export function doThisNowFromChecklist(html: string, max = 5): DoNowItem[] {
  // naive extraction: take first up to 5 <li> items' text
  const matches = Array.from(html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)).map(m => m[1]);
  const items = matches.map((t, i) => ({ id: `do-${i}`, text: t.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() })).filter(x => x.text);
  return items.slice(0, max);
}

export function estImpact(ctx: Record<string, unknown>): EstImpact[] {
  const out: EstImpact[] = [];
  const grocery = 600; // assumed monthly
  out.push({ label: 'Commissary savings (est.)', value: `$${Math.round(grocery * 0.25)}/mo` });
  const tspCont = Number((ctx as any).tspContribution || 0);
  if (tspCont > 0) {
    const oneYear = Math.round(tspCont * 12 * 1.07);
    out.push({ label: 'TSP 12-month at 7% (illustrative)', value: `$${oneYear.toLocaleString()}` });
  }
  const bah = Number((ctx as any).bah || 0);
  if (bah > 0) out.push({ label: 'Compare rent vs BAH', value: bah.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) });
  return out;
}
