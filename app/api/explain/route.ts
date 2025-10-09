import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const runtime = "edge";

function formatDeterministic(tool: string, inputs: Record<string, unknown>, outputs: Record<string, unknown>) {
  // Trim giant payloads
  const trunc = (o: unknown) => JSON.stringify(o).slice(0, 1200);
  
  switch (tool) {
    case "sdp":
      return [
        "Here's what your SDP projection means:\n\n",
        "• We model three investment paths over 15 years.\n",
        "• The baseline (4%) represents a high-yield savings account—low risk, liquid.\n",
        "• The conservative (6%) and moderate (8%) scenarios reflect diversified index portfolios.\n\n",
        "Your Inputs:\n",
        `${trunc(inputs)}\n\n`,
        "Projected Growth:\n",
        `${trunc(outputs)}\n\n`,
        "Rule of thumb: If you have less than 6 months emergency savings, keep part in cash. Otherwise, consider tax-advantaged accounts (e.g., spousal Roth IRA) for long-term growth.\n"
      ].join("");
    case "tsp":
      return [
        "About your TSP projection:\n\n",
        "• We compared your default mix vs. your custom allocation.\n",
        "• Small allocation changes compound over decades; focus on contribution rate first, then mix.\n\n",
        "Your Inputs:\n",
        `${trunc(inputs)}\n\n`,
        "Projected Results:\n",
        `${trunc(outputs)}\n\n`,
        "Key Takeaway: Projections are illustrative only. Rebalance annually and increase contributions when possible for best results.\n"
      ].join("");
    case "house":
      return [
        "House-hacking Analysis:\n\n",
        "• We calculated PITI (Principal, Interest, Taxes, Insurance) using a 30-year fixed VA loan structure.\n",
        "• Compared monthly costs to your BAH + tenant rent income.\n",
        "• Note: Positive cash flow doesn't include vacancy rates or maintenance costs.\n\n",
        "Your Property Details:\n",
        `${trunc(inputs)}\n\n`,
        "Cash Flow Results:\n",
        `${trunc(outputs)}\n\n`,
        "Next Steps: Request quotes for taxes and insurance. Sanity-check rental rates in your area. Budget a 5-10% buffer for maintenance and vacancy.\n"
      ].join("");
    default:
      return "This explanation is currently unavailable for the selected tool.";
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { tool, inputs, outputs } = await req.json().catch(() => ({}));
  const text = formatDeterministic(String(tool || ""), inputs || {}, outputs || {});

  // Stream the text in chunks
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const parts = text.match(/.{1,220}/g) || [];
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
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    }
  });
}
