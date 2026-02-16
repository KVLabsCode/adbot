import { NextRequest } from "next/server";
import { ChatRequestBody } from "@/types";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "anthropic/claude-sonnet-4.5";

function buildSystemPrompt(context: ChatRequestBody["context"]): string {
  return `You are the BlitzMode AI assistant for an advertiser platform that manages robot-native decision campaigns. You help advertisers understand their campaign performance, create and manage campaigns, and provide insights about their advertising metrics.

## Advertiser Context

### Campaigns
${JSON.stringify(context.campaigns, null, 2)}

### Reporting Data
${JSON.stringify(context.reportingData, null, 2)}

### Billing Data
${JSON.stringify(context.billingData, null, 2)}

### Campaign Draft (in progress)
${context.campaignDraft ? JSON.stringify(context.campaignDraft, null, 2) : "None"}

## Key Metrics
- ASP (Average Sponsorship Price): Average price per sponsored decision interaction
- DCV (Decision Conversion Volume): Total number of robot-mediated decisions influenced
- CPD (Cost Per Decision): Average cost for each decision conversion
- RDR (Robot Decision Rate): Percentage of robot interactions that result in a decision

## Campaign Types
- Decision Bid: Bid on pre-decision moments
- Preference Slot: Secure preference positioning
- Restock Sponsorship: Sponsor restocking triggers
- Comparison Placement: Influence comparison displays
- Route Sponsorship: Sponsor delivery route moments
- Voice & Display: Multi-modal voice + visual moments

## Guardrails
All campaigns operate under these guardrails:
- Consent verification before ad delivery
- Motion block (ads paused during robot motion)
- Quiet hours (10 PM - 7 AM)
- 10% holdout for measurement

## Instructions
- Be concise and helpful
- Use markdown formatting for clarity (bold for emphasis, lists for data)
- When showing metrics, use actual data from the context above
- When users want to take actions (launch, pause, resume campaigns, adjust budgets), acknowledge the request and explain what would happen
- Reference specific campaign names and real numbers from the data
- Keep responses focused and under 200 words unless the user asks for detailed analysis`;
}

export async function POST(request: NextRequest) {
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === "your-openrouter-api-key-here") {
    return new Response(
      JSON.stringify({ error: "OpenRouter API key not configured. Add your key to .env.local" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const body: ChatRequestBody = await request.json();

  const systemPrompt = buildSystemPrompt(body.context);

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...body.messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://blitzmode.app",
      "X-Title": "BlitzMode Advertiser Platform",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return new Response(
      JSON.stringify({ error: `OpenRouter API error: ${response.status}`, details: errorText }),
      { status: response.status, headers: { "Content-Type": "application/json" } }
    );
  }

  // Pass through the SSE stream
  return new Response(response.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
