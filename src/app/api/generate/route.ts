import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { prompt, framework } = await req.json();

  if (!prompt || !framework) {
    return NextResponse.json({ error: "Missing prompt or framework" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
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
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || "API error" }, { status: 500 });
    }

    const snippet = data.content?.[0]?.text ?? "";
    return NextResponse.json({ snippet });
  } catch {
    return NextResponse.json({ error: "Failed to reach AI service" }, { status: 500 });
  }
}
