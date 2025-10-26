/**
 * EMBEDDING API ENDPOINT
 *
 * Embeds official data sources into vector database
 * Triggered by admin visiting: /api/admin/embed-official
 *
 * Usage:
 *   Visit: https://your-domain.vercel.app/api/admin/embed-official
 *
 * Environment variables required (already in Vercel):
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - OPENAI_API_KEY
 *
 * Created: 2025-01-25
 * Part of: Ask Military Expert RAG System
 */

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Data interfaces
interface BAHRateRow {
  id: number;
  paygrade: string;
  with_dependents: boolean;
  rate_cents: number;
  mha: string;
  location_name?: string;
  effective_date: string;
  zip_code?: string;
}

interface PayTableRow {
  id: number;
  paygrade: string;
  monthly_rate_cents: number;
  effective_date: string;
  years_of_service: number;
  effective_year: number;
}

// Helper: Generate embedding
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    encoding_format: "float",
  });
  return response.data[0].embedding;
}

// Data formatters
function formatBAHRate(row: BAHRateRow) {
  const withDeps = row.with_dependents ? "with dependents" : "without dependents";
  const amount = (row.rate_cents / 100).toFixed(2);

  return {
    id: `bah_${row.id}`,
    text: `BAH (Basic Allowance for Housing) for paygrade ${row.paygrade} ${withDeps} at MHA ${row.mha} (${row.location_name || "location"}): $${amount} per month. Effective date: ${row.effective_date}. ZIP code: ${row.zip_code || "N/A"}.`,
    metadata: {
      data_type: "bah_rate",
      paygrade: row.paygrade,
      mha: row.mha,
      with_dependents: row.with_dependents,
      rate_cents: row.rate_cents,
      effective_date: row.effective_date,
      location_name: row.location_name,
      zip_code: row.zip_code,
      source_url: "https://www.dfas.mil/militarymembers/payentitlements/bah/",
      source_name: "DFAS BAH Calculator",
    },
  };
}

function formatPayTable(row: PayTableRow) {
  const amount = (row.monthly_rate_cents / 100).toFixed(2);

  return {
    id: `pay_${row.id}`,
    text: `Military base pay for paygrade ${row.paygrade} with ${row.years_of_service} years of service: $${amount} per month. Effective year: ${row.effective_year}. Effective date: ${row.effective_date}.`,
    metadata: {
      data_type: "military_pay",
      paygrade: row.paygrade,
      years_of_service: row.years_of_service,
      monthly_rate_cents: row.monthly_rate_cents,
      effective_year: row.effective_year,
      effective_date: row.effective_date,
      source_url: "https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/",
      source_name: "DFAS Military Pay Tables",
    },
  };
}

export async function GET(_request: NextRequest) {
  try {
    // Auth check: Admin only
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: entitlement } = await supabase
      .from("entitlements")
      .select("tier")
      .eq("user_id", userId)
      .single();

    if (entitlement?.tier !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Stream response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (message: string) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ message })}\n\n`));
        };

        try {
          send("🚀 Starting official data embedding...");

          // Create embedding job
          const { data: job, error: jobError } = await supabase
            .from("embedding_jobs")
            .insert({
              job_type: "initial",
              content_type: "official_data",
              status: "running",
              items_total: 14700,
            })
            .select()
            .single();

          if (jobError) throw jobError;
          send(`✅ Created embedding job: ${job.id}`);

          let totalProcessed = 0;

          // 1. BAH Rates (sample first 100 for speed)
          send("\n🏠 Processing BAH Rates...");
          const { data: bahRates } = await supabase.from("bah_rates").select("*").limit(100);

          if (bahRates) {
            const bahChunks = bahRates.map(formatBAHRate);
            const bahEmbeddings = await Promise.all(
              bahChunks.map((chunk) => generateEmbedding(chunk.text))
            );

            const bahRecords = bahChunks.map((chunk, idx) => ({
              content_id: chunk.id,
              content_type: chunk.metadata.data_type,
              content_text: chunk.text,
              embedding: bahEmbeddings[idx],
              metadata: chunk.metadata,
            }));

            await supabase.from("knowledge_embeddings").insert(bahRecords);
            totalProcessed += bahRecords.length;
            send(`  ✅ Embedded ${bahRecords.length} BAH rates`);
          }

          // 2. Military Pay Tables
          send("\n💰 Processing Military Pay Tables...");
          const { data: payTables } = await supabase.from("military_pay_tables").select("*");

          if (payTables) {
            const payChunks = payTables.map(formatPayTable);
            const payEmbeddings = await Promise.all(
              payChunks.map((chunk) => generateEmbedding(chunk.text))
            );

            const payRecords = payChunks.map((chunk, idx) => ({
              content_id: chunk.id,
              content_type: chunk.metadata.data_type,
              content_text: chunk.text,
              embedding: payEmbeddings[idx],
              metadata: chunk.metadata,
            }));

            await supabase.from("knowledge_embeddings").insert(payRecords);
            totalProcessed += payRecords.length;
            send(`  ✅ Embedded ${payRecords.length} pay tables`);
          }

          // Update job status
          await supabase
            .from("embedding_jobs")
            .update({
              status: "completed",
              items_processed: totalProcessed,
              completed_at: new Date().toISOString(),
            })
            .eq("id", job.id);

          send("\n\n🎉 EMBEDDING COMPLETE!");
          send(`   Total embedded: ${totalProcessed} items`);
          send(`   Cost: ~$${((totalProcessed / 1000) * 0.0001).toFixed(4)}`);
          send("\n✅ Your military expert now has official data loaded!");

          controller.close();
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          send(`\n❌ Error: ${errorMessage}`);
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
