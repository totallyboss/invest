import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { PRINCIPLES } from "@/lib/principles";

export const maxDuration = 60;

function buildSystemPrompt(): string {
  const principleList = PRINCIPLES.map(
    (p) =>
      `${p.id}. ${p.question} (${p.book}) — ${
        p.type === "personal"
          ? "personal/contextual: don't force yes or no, explain what to weigh"
          : "evidence-based: answer yes, no, or unsure and ground it in something you found"
      }`,
  ).join("\n");

  return `You are the analysis engine behind "The Ledger of Ten," a tool that evaluates whether to buy a stock or fund against ten principles distilled from five investing books: The Simple Path to Wealth (J.L. Collins), The Coffeehouse Investor (Bill Schultheis), The Little Book of Common Sense Investing (John C. Bogle), A Random Walk Down Wall Street (Burton Malkiel), and Reminiscences of a Stock Operator (Edwin Lefèvre).

Given a company or fund name or ticker, use web search to find:
- Its recent stock price history: trend direction, any large run-up or drawdown, current valuation multiples (e.g. P/E) versus its own history and its industry.
- Recent news from roughly the last 6-12 months: earnings results, major announcements (acquisitions, leadership changes, guidance changes), and named risks (competitive, regulatory, macro).

Then evaluate it against these ten principles:

${principleList}

Rules:
- Ground every "evidence" answer in something you actually found via search — a number, a date, a named event. Never guess, and never rely on stale trained knowledge as if it were current; if search results conflict or are thin, say so and answer "unsure" rather than invent precision.
- For "personal" principles, don't force a yes/no verdict — explain what the investor should personally weigh, using whatever evidence you found as context (e.g. position sizing given the company's actual volatility).
- If the input is not a real, identifiable company or fund, or you cannot find enough data to analyze it, set verdict.label to "Not enough evidence" and explain why in the summary, leaving principles evidence-light but still present.
- Be honest about a rich valuation, a weak trend, or a real risk even when other signals are positive — this tool exists to counter overconfidence, not confirm it. Likewise don't manufacture bearishness if the evidence is genuinely solid.
- Cite the real sources you used.

Write a short prose analysis first (a few sentences covering the overall picture is enough — you do not need to restate every principle in prose since the structured data below carries the detail). Then end your final message with exactly one fenced code block, starting with \`\`\`json and ending with \`\`\`, containing ONLY a JSON object with this exact shape and nothing else inside that block:

{
  "company": string,
  "resolvedTicker": string | null,
  "asOf": string,
  "summary": string,
  "verdict": { "label": string, "evidenceScore": number, "evidenceMax": number },
  "principles": [
    { "id": number, "question": string, "book": string, "type": "evidence" | "personal", "answer": "yes" | "no" | "unsure" | "n/a", "rationale": string }
  ],
  "risksToWatch": [string],
  "sources": [{ "title": string, "url": string }]
}

verdict.label must be one of: "Worth the exception", "Weak case — re-read your doubts", "Buy the index instead", "Not enough evidence". evidenceScore counts only the "evidence"-type principles (1 point per "yes", 0.5 per "unsure", 0 per "no"); evidenceMax is the count of evidence-type principles. Include all ten principles in the array, in order, every time.`;
}

export async function POST(req: NextRequest) {
  let body: { query?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const query = (body.query ?? "").trim();
  if (!query) {
    return NextResponse.json({ error: "Enter a company or fund name." }, { status: 400 });
  }
  if (query.length > 200) {
    return NextResponse.json(
      { error: "That's too long — try a company name or ticker." },
      { status: 400 },
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        error:
          "Server is missing ANTHROPIC_API_KEY. Add it in your deployment's environment variables.",
      },
      { status: 500 },
    );
  }

  const client = new Anthropic();
  const system = buildSystemPrompt();
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: `Analyze this company or fund: ${query}` },
  ];

  try {
    let finalText = "";

    for (let round = 0; round < 6; round++) {
      const stream = client.messages.stream({
        model: "claude-opus-5",
        max_tokens: 8000,
        system,
        tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 8 }],
        messages,
      });
      const message = await stream.finalMessage();

      if (message.stop_reason === "pause_turn") {
        messages.push({ role: "assistant", content: message.content });
        continue;
      }

      const textBlock = message.content.find(
        (b): b is Anthropic.TextBlock => b.type === "text",
      );
      finalText = textBlock?.text ?? "";
      break;
    }

    const match = finalText.match(/```json\s*([\s\S]*?)```/);
    if (!match) {
      return NextResponse.json(
        {
          error: "Couldn't parse a result. Try again, or rephrase the company name.",
          raw: finalText,
        },
        { status: 502 },
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(match[1]);
    } catch {
      return NextResponse.json(
        { error: "Got a malformed result. Try again.", raw: finalText },
        { status: 502 },
      );
    }

    const prose = finalText.slice(0, match.index).trim();
    return NextResponse.json({ result: parsed, prose });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Rate limited — try again in a moment." },
        { status: 429 },
      );
    }
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: "Invalid ANTHROPIC_API_KEY." }, { status: 500 });
    }
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Claude API error: ${error.message}` },
        { status: 502 },
      );
    }
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
