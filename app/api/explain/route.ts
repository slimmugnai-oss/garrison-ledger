import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const runtime = "edge";

function formatDeterministic(tool: string, inputs: Record<string, unknown>, outputs: Record<string, unknown>) {
  // Format numbers nicely
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  
  switch (tool) {
    case "sdp": {
      const amount = Number(inputs.amount) || 0;
      const hy = Number(outputs.hy) || 0;
      const cons = Number(outputs.cons) || 0;
      const mod = Number(outputs.mod) || 0;
      const bestGain = mod - hy;
      
      return [
        "💰 SDP Investment Strategy Analysis\n\n",
        `You're planning to invest ${fmt(amount)} from your SDP payout. Here's how it could grow over 15 years:\n\n`,
        "📊 Three Growth Scenarios:\n",
        `• High-Yield Savings (4%): ${fmt(hy)}\n`,
        cons > 0 ? `• Conservative Mix (6%): ${fmt(cons)}\n` : "",
        mod > 0 ? `• Moderate Growth (8%): ${fmt(mod)}\n` : "",
        mod > 0 ? `\n💡 Potential Gain: ${fmt(bestGain)} more with moderate growth vs. savings\n\n` : "\n",
        "🎯 Smart Next Steps:\n",
        "• Build 6 months emergency fund first (keep in high-yield savings)\n",
        "• Consider tax-advantaged accounts like Spousal Roth IRA\n",
        "• Start with conservative mix if new to investing\n",
        "• Diversify across index funds for long-term growth\n"
      ].filter(Boolean).join("");
    }
    case "tsp": {
      const age = Number(inputs.age) || 30;
      const retire = Number(inputs.retire) || 50;
      const bal = Number(inputs.balance) || 0;
      const monthly = Number(inputs.monthly) || 0;
      const endDefault = Number(outputs.endDefault) || 0;
      const endCustom = Number(outputs.endCustom) || 0;
      const diff = Number(outputs.diff) || 0;
      const years = retire - age;
      
      return [
        "📈 TSP Retirement Projection\n\n",
        `Starting at age ${age} with ${fmt(bal)}, contributing ${fmt(monthly)}/month until retirement at ${retire}:\n\n`,
        "🎯 Projected Balance at Retirement:\n",
        `• L2050 Default Mix: ${fmt(endDefault)}\n`,
        `• Your Custom Mix: ${fmt(endCustom)}\n`,
        diff !== 0 ? `\n💡 Difference: ${diff > 0 ? '+' : ''}${fmt(diff)} ${diff > 0 ? 'more' : 'less'} with your custom allocation\n\n` : "\n",
        "🔑 Key Insights:\n",
        "• Small allocation changes compound over decades\n",
        "• Focus on maximizing contributions first, then optimize mix\n",
        `• You have ${years} years to let compound growth work\n`,
        "• Rebalance annually and increase contributions when possible\n\n",
        "⚠️ Remember: These are illustrative projections based on historical averages, not guarantees.\n"
      ].join("");
    }
    case "house": {
      const price = Number(inputs.price) || 0;
      const costs = Number(outputs.costs) || 0;
      const income = Number(outputs.income) || 0;
      const verdict = Number(outputs.verdict);
      const isPositive = verdict !== undefined && verdict >= 0;
      
      return [
        "🏡 House Hacking Cash Flow Analysis\n\n",
        `Property Price: ${fmt(price)}\n\n`,
        "💵 Monthly Cash Flow:\n",
        `• Housing Costs (PITI): ${fmt(costs)}\n`,
        `• Total Income (BAH + Rent): ${fmt(income)}\n`,
        verdict !== undefined ? `\n${isPositive ? '✅' : '⚠️'} Net Cash Flow: ${fmt(verdict)}/month ${isPositive ? '(Positive!)' : '(Negative)'}\n\n` : "\n",
        "📋 What This Means:\n",
        isPositive 
          ? `• You'd have ${fmt(verdict)}/month extra after covering the mortgage\n`
          : verdict !== undefined ? `• You'd need ${fmt(Math.abs(verdict))}/month from other sources\n` : "",
        "• PITI = Principal + Interest + Taxes + Insurance\n",
        "• This doesn't include vacancy, maintenance, or property management fees\n\n",
        "🎯 Next Steps:\n",
        "• Get actual quotes for property taxes and insurance\n",
        "• Research realistic rental rates in the area\n",
        "• Budget 5-10% for maintenance and vacancy\n",
        "• Talk to a lender about current VA loan rates\n",
        "• Consider property management costs if needed\n"
      ].join("");
    }
    default:
      return "This explanation is currently unavailable for the selected tool.";
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { tool, inputs, outputs } = await req.json().catch(() => ({}));
  const text = formatDeterministic(String(tool || ""), inputs || {}, outputs || {});
  
  // Replace newlines with HTML breaks for proper rendering
  const htmlText = text.replace(/\n/g, '<br/>');

  // Stream the text in chunks
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const parts = htmlText.match(/.{1,220}/g) || [];
      let i = 0;
      const push = () => {
        if (i >= parts.length) { 
          controller.close(); 
          return; 
        }
        controller.enqueue(encoder.encode(parts[i]));
        i += 1;
        setTimeout(push, 20); // smooth stream
      };
      push();
    }
  });
  
  return new Response(stream, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    }
  });
}
