/**
 * LES TAX ADVISOR
 * 
 * Generates AI-powered explanations for tax withholding advisories
 * when user's tax amounts differ from typical ranges.
 */

export async function generateTaxAdvisory(
  type: 'federal' | 'state' | 'fica' | 'medicare' | 'total',
  userValue: number,
  expectedValue: number,
  taxableGross: number,
  rank?: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.warn('[TaxAdvisor] No API key found, skipping AI explanation');
    return '';
  }

  try {
    const prompt = buildTaxAdvisoryPrompt(type, userValue, expectedValue, taxableGross, rank);
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      console.error('[TaxAdvisor] Gemini API error:', response.status);
      return '';
    }

    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (error) {
    console.error('[TaxAdvisor] Error generating advisory:', error);
    return '';
  }
}

function buildTaxAdvisoryPrompt(
  type: string,
  userValue: number,
  expectedValue: number,
  taxableGross: number,
  rank?: string
): string {
  const percent = ((userValue / taxableGross) * 100).toFixed(1);
  const expectedPercent = ((expectedValue / taxableGross) * 100).toFixed(1);
  
  return `You are a military financial advisor. A service member ${rank ? `(${rank})` : ''} has a ${type} tax withholding that differs from typical amounts.

Their ${type} tax: $${userValue.toFixed(2)} (${percent}% of gross)
Expected typical: $${expectedValue.toFixed(2)} (${expectedPercent}% of gross)
Taxable gross: $${taxableGross.toFixed(2)}

Provide a brief 4-6 sentence explanation covering:
1. Why this might be happening (W-4 settings, YTD catch-up, bonuses, etc.)
2. Whether this is concerning or normal
3. What they should do next (check W-4, contact finance, verify LES)

Write in a conversational, reassuring tone. Be specific and actionable. Do NOT use markdown or formatting - just plain text.`;
}

