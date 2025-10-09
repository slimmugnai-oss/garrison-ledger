import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tool, inputs, outputs } = await req.json();

    // Simple template (no external API): keep it deterministic now
    // Later you can swap to OpenAI with your chosen model.
    const text = makeExplanation(tool, inputs, outputs);
    return NextResponse.json({ text });
  } catch (error) {
    console.error('Error in explain API:', error);
    return NextResponse.json({ error: 'Failed to generate explanation' }, { status: 500 });
  }
}

function makeExplanation(tool: string, inputs: Record<string, unknown>, outputs: Record<string, unknown>) {
  if (tool === 'sdp') {
    const amt = inputs?.amount ?? 0;
    const hy = outputs?.hy ?? 0;
    const mod = outputs?.mod ?? 0;
    const diff = mod - hy;
    return [
      `You entered $${amt.toLocaleString()} for your SDP payout.`,
      `At ~4% over 15 years, that grows to about $${Math.round(hy).toLocaleString()}.`,
      `At ~8%, it's about $${Math.round(mod).toLocaleString()}.`,
      `The illustrative gap is ~$${Math.round(diff).toLocaleString()}.`,
      `Next steps: consider opening/using a Spousal Roth IRA or similar diversified index approach if eligible; build an emergency buffer before investing; confirm contribution limits and timelines.`
    ].join(' ');
  }
  
  if (tool === 'tsp') {
    const age = inputs?.age ?? 30;
    const retire = inputs?.retire ?? 50;
    const bal = inputs?.bal ?? 50000;
    const diff = outputs?.diff ?? 0;
    return [
      `At age ${age}, retiring at ${retire}, with a current balance of $${bal.toLocaleString()},`,
      `your custom allocation could potentially generate $${Math.round(diff).toLocaleString()} more than the default mix.`,
      `Consider factors like your risk tolerance, time horizon, and other retirement accounts when making allocation decisions.`,
      `This is illustrative only - past performance doesn't predict future results.`
    ].join(' ');
  }
  
  if (tool === 'house') {
    const price = inputs?.price ?? 400000;
    const verdict = outputs?.verdict ?? 0;
    return [
      `For a $${price.toLocaleString()} property, your estimated monthly cash flow is $${Math.round(verdict).toLocaleString()}.`,
      `Remember to factor in vacancy rates, maintenance costs, property management fees, and potential rent increases.`,
      `This is a simplified calculation for educational purposes - consult with financial and real estate professionals for actual investment decisions.`
    ].join(' ');
  }
  
  return 'This explanation will reference your inputs and outputs. Education only.';
}
