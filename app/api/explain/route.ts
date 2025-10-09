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
        "- We model three paths over 15 years.\n",
        "- The baseline (4%) represents a high-yield savings account—low risk, liquid.\n",
        "- The conservative (6%) and moderate (8%) scenarios reflect diversified index portfolios.\n\n",
        `Inputs: ${trunc(inputs)}\n`,
        `Outputs: ${trunc(outputs)}\n\n`,
        "Rule of thumb: if you have <6 months emergency savings, keep part in cash; otherwise, consider tax-advantaged accounts (e.g., spousal Roth IRA) for long-term growth.\n"
      ].join("");
    case "tsp":
      return [
        "About your TSP projection:\n\n",
        "- We compared your default mix vs. your custom allocation.\n",
        "- Small allocation changes compound over decades; focus on contribution rate first, then mix.\n\n",
        `Inputs: ${trunc(inputs)}\n`,
        `Outputs: ${trunc(outputs)}\n\n`,
        "Reminder: projections are illustrative; rebalance annually and increase contributions when possible.\n"
      ].join("");
    case "house":
      return [
        "House-hacking analysis:\n\n",
        "- We calculated PITI using a 30-year fixed VA structure and compared to BAH + tenant rent.\n",
        "- Positive cash flow doesn't include vacancy/maintenance; bake in reserves.\n\n",
        `Inputs: ${trunc(inputs)}\n`,
        `Outputs: ${trunc(outputs)}\n\n`,
        "Next steps: request quotes for taxes/insurance; sanity-check rents; consider a 5–10% maintenance/vacancy buffer.\n"
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
