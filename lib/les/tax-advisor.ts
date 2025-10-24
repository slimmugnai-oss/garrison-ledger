/**
 * LES TAX ADVISOR
 *
 * AI-powered explanations for tax discrepancies and advisories.
 * Uses Gemini 2.5 Flash to generate 4-6 sentence explanations for:
 * - FICA validation failures
 * - Medicare validation failures
 * - Federal tax reasonableness advisories
 * - State tax reasonableness advisories
 * - Total tax burden warnings
 */

export async function generateTaxAdvisory(
  type: "federal" | "state" | "fica" | "medicare" | "total",
  userValue: number,
  expectedValue: number,
  taxableGross: number,
  rank?: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.error("[TaxAdvisor] No API key found");
    return "";
  }

  try {
    const prompt = buildTaxAdvisoryPrompt(type, userValue, expectedValue, taxableGross, rank);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500, // Brief explanation (4-6 sentences)
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("[TaxAdvisor] Gemini API error:", response.status);
      return "";
    }

    const result = await response.json();
    const explanation = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log(
      `[TaxAdvisor] Generated ${type} explanation:`,
      explanation.substring(0, 100) + "..."
    );

    return explanation;
  } catch (error) {
    console.error("[TaxAdvisor] Error generating explanation:", error);
    return "";
  }
}

function buildTaxAdvisoryPrompt(
  type: string,
  userValue: number,
  expectedValue: number,
  taxableGross: number,
  rank?: string
): string {
  // Convert cents to dollars for display
  const userDollars = userValue / 100;
  const expectedDollars = expectedValue / 100;
  const grossDollars = taxableGross / 100;

  const percent = ((userValue / taxableGross) * 100).toFixed(1);
  const expectedPercent = ((expectedValue / taxableGross) * 100).toFixed(1);

  return `You are a military financial advisor helping a service member ${rank ? `(${rank})` : ""} understand a ${type} tax withholding discrepancy on their Leave and Earnings Statement (LES).

Their ${type} tax: $${userDollars.toFixed(2)} (${percent}% of gross)
Expected typical: $${expectedDollars.toFixed(2)} (${expectedPercent}% of gross)
Taxable gross pay: $${grossDollars.toFixed(2)}

Provide a brief 4-6 sentence explanation covering:
1. Why this difference might be happening (W-4 settings, YTD catch-up, bonuses, state residency, SCRA protections, deployment tax exclusions, etc.)
2. Whether this is concerning or normal for military members
3. What they should do next (check W-4 with myPay, contact base finance office, verify state tax filing status, check for combat zone tax exclusion if deployed)

Write in a conversational, reassuring, professional tone - like a knowledgeable friend explaining this over coffee. Be specific and actionable. Military members value straight talk and practical next steps.

Do NOT use markdown formatting or special characters. Just plain text sentences.`;
}
