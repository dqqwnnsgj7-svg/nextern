import Anthropic from "@anthropic-ai/sdk";
import { unstable_cache } from "next/cache";
import internships from "@/lib/internships.json";
import { MODEL } from "@/lib/config";

const client = new Anthropic();

// Hard-constraint filter before hitting Claude
function filterInternships(internshipList, { locationPreference, experienceLevel }) {
  return internshipList.filter((role) => {
    if (locationPreference === "remote" && role.location !== "remote") return false;
    if (experienceLevel === "no-experience") {
      const seniorKeywords = ["senior", "lead", "staff", "principal", "quant"];
      if (seniorKeywords.some((kw) => role.role.toLowerCase().includes(kw))) return false;
    }
    return true;
  });
}

async function scoreInternships(parsedResume, careerGoal, targetIndustries, filtered) {
  const systemPrompt = `You are an internship fit scorer. Respond with ONLY valid JSON — no markdown, no commentary.
Return an array of objects with this exact shape:
[{"id": "string", "score": number, "explanation": "string"}]
score is 0–100. explanation is one sentence (≤ 20 words) explaining the fit.`;

  const userMessage = `Student resume:
${parsedResume}

Career goal: ${careerGoal}
Target industries: ${targetIndustries.join(", ")}

Internships to score:
${JSON.stringify(filtered.map((r) => ({ id: r.id, role: r.role, company: r.company, description: r.description, requirements: r.requirements })), null, 2)}

Return the JSON array of scores.`;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const raw = message.content[0].text.trim();
  const scores = JSON.parse(raw);
  return scores;
}

// Cache keyed on the student inputs — revalidates every hour
function makeMatchFn(parsedResume, careerGoal, targetIndustries, locationPreference, experienceLevel) {
  const cacheKey = `match-${Buffer.from(parsedResume + careerGoal).toString("base64").slice(0, 40)}`;
  return unstable_cache(
    async () => {
      const filtered = filterInternships(internships, { locationPreference, experienceLevel });
      const scores = await scoreInternships(parsedResume, careerGoal, targetIndustries, filtered);

      // Merge scores back onto internship objects
      const scoreMap = Object.fromEntries(scores.map((s) => [s.id, s]));
      const results = filtered
        .map((role) => ({
          ...role,
          score: scoreMap[role.id]?.score ?? 0,
          explanation: scoreMap[role.id]?.explanation ?? "",
        }))
        .sort((a, b) => b.score - a.score);

      return results;
    },
    [cacheKey],
    { revalidate: 3600 }
  );
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      parsedResume = "",
      careerGoal = "",
      targetIndustries = [],
      locationPreference = "any",
      experienceLevel = "entry",
    } = body;

    if (!parsedResume || !careerGoal) {
      return Response.json({ error: "parsedResume and careerGoal are required" }, { status: 400 });
    }

    const cachedFn = makeMatchFn(parsedResume, careerGoal, targetIndustries, locationPreference, experienceLevel);
    const results = await cachedFn();
    return Response.json({ results });
  } catch (err) {
    console.error("/api/match error:", err);
    // Graceful fallback: return internships with neutral scores
    const fallback = internships.map((role) => ({
      ...role,
      score: 50,
      explanation: "Score unavailable — AI service error.",
    }));
    return Response.json({ results: fallback, fallback: true }, { status: 200 });
  }
}
