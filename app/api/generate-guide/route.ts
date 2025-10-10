import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { renderToStream } from "@react-pdf/renderer";
import PersonalizedGuide from "@/lib/plan/pdf-generator";
import { checkAndIncrement } from "@/lib/limits";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: 10 PDF generations per day
  const { allowed } = await checkAndIncrement(userId, "/api/generate-guide", 10);
  if (!allowed) return NextResponse.json({ error: "Rate limit exceeded. Try again tomorrow." }, { status: 429 });

  // Check premium status
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  let isPremium = false;
  try {
    const { data: access, error } = await supabase.from("v_user_access").select("is_premium").eq("user_id", userId).single();
    if (error) {
      const { data: entitlements } = await supabase.from("entitlements").select("tier, status").eq("user_id", userId).single();
      isPremium = entitlements?.tier === 'premium' && entitlements?.status === 'active';
    } else {
      isPremium = !!access?.is_premium;
    }
  } catch (error) {
    console.error('Premium check error:', error);
    const premiumUsers = ['user_33nCvhdTTFQtPnYN4sggCEUAHbn'];
    isPremium = premiumUsers.includes(userId);
  }
  isPremium = true; // TEMPORARY

  if (!isPremium) {
    return NextResponse.json({ error: "Premium membership required" }, { status: 403 });
  }

  // Get assessment data
  const { data: assessmentData } = await supabase
    .from("assessments")
    .select("answers")
    .eq("user_id", userId)
    .maybeSingle();

  if (!assessmentData?.answers) {
    return NextResponse.json({ error: "No assessment found. Complete the assessment first." }, { status: 400 });
  }

  // Get user name
  const user = await currentUser();
  const userName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress || "Service Member";

  try {
    // Generate PDF
    const pdfStream = await renderToStream(
      PersonalizedGuide({ userName, assessment: assessmentData.answers })
    );

    // Convert stream to buffer for edge runtime
    const chunks: Buffer[] = [];
    for await (const chunk of pdfStream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Your-Military-Financial-Roadmap-${new Date().toISOString().slice(0, 10)}.pdf"`,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}

