import { NextRequest, NextResponse } from "next/server";
import { getAICompletion } from "@/lib/ai";
import { ratelimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { text, topic } = await req.json();

    if (!text || text.length < 50) {
      return NextResponse.json({ error: "Please write at least 50 characters." }, { status: 400 });
    }

    const systemPrompt = `
      You are an expert English writing tutor.
      Analyze the following writing sample based on the given topic.
      
      Provide feedback in this format:
      
      1. OVERALL SCORE: (out of 10)
      2. GRAMMAR & PUNCTUATION: (mention specific errors found)
      3. VOCABULARY: (comment on word choice and variety)
      4. COHERENCE & STRUCTURE: (how well ideas flow together)
      5. SUGGESTIONS FOR IMPROVEMENT: (3-4 actionable tips)
      6. STRENGTHS: (what was done well)
    `;

    const aiResponse = await getAICompletion([
      { role: "system", content: systemPrompt },
      { role: "user", content: `Topic: ${topic}\n\nWriting Sample:\n${text}` }
    ]);

    return NextResponse.json({ feedback: aiResponse });
  } catch (error: unknown) {
    console.error("Writing Analysis Error:", error);
    return NextResponse.json({ error: "Failed to analyze writing." }, { status: 500 });
  }
}
