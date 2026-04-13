import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { prompt, framework } = await req.json();

  if (!prompt || !framework) {
    return NextResponse.json({ error: "Missing prompt or framework" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const systemPrompt = `You are a senior QA automation engineer specializing in ${framework === "playwright" ? "Playwright (TypeScript)" : "Cypress (JavaScript/TypeScript)"}.

Generate a clean, production-ready code snippet based on the user's description.

Rules:
- Use ${framework === "playwright" ? "Playwright v1.40+ with TypeScript" : "Cypress v13+ with JavaScript or TypeScript"}
- Include helpful inline comments explaining WHY, not just what
- Follow best practices (proper waits, stable selectors, no hard-coded timeouts)
- Return ONLY the code — no markdown fences, no preamble, no explanation outside the code
- If multiple approaches exist, pick the most practical one
- Keep it concise but complete — include imports when necessary`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1000 },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || "API error" }, { status: 500 });
    }

    const snippet = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return NextResponse.json({ snippet });
  } catch {
    return NextResponse.json({ error: "Failed to reach AI service" }, { status: 500 });
  }
}
