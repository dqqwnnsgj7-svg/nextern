import Anthropic from "@anthropic-ai/sdk";
import { MODEL } from "@/lib/config";

const client = new Anthropic();

export async function POST(request) {
  try {
    const body = await request.json();
    const { parsedResume = "", careerGoal = "" } = body;

    if (!parsedResume || !careerGoal) {
      return Response.json({ error: "parsedResume and careerGoal are required" }, { status: 400 });
    }

    const systemPrompt = `You are a career coach for college students. Respond with ONLY valid JSON — no markdown, no commentary.
Return an object with this exact shape:
{
  "summary": "string",
  "actions": [
    {"category": "string", "title": "string", "why": "string"}
  ]
}
summary: 1–2 sentences on overall readiness.
actions: 3–5 concrete, specific items. category is one of: Skills, Projects, Experience, Network, Credentials.
title: imperative phrase (≤ 8 words). why: one sentence (≤ 20 words) on the impact.`;

    const userMessage = `Student resume:
${parsedResume}

Career goal: ${careerGoal}

Return the action plan JSON.`;

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const raw = message.content[0].text.trim();
    const plan = JSON.parse(raw);
    return Response.json(plan);
  } catch (err) {
    console.error("/api/action-plan error:", err);
    return Response.json({
      summary: "Action plan temporarily unavailable.",
      actions: [
        { category: "Skills", title: "Try again shortly", why: "The AI service encountered an error." },
      ],
      fallback: true,
    }, { status: 200 });
  }
}
