import { NextRequest, NextResponse } from "next/server";
import { getAICompletion } from "@/lib/ai";
import { ratelimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await ratelimit.limit(ip);
    if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

    const { messages, scenario, persona } = await req.json();

    const systemPrompt = `
      You are an expert English Immersion Teacher. You are currently in a 'Cosplay Roleplay' session.
      SCENARIO: ${scenario}
      YOUR PERSONA: ${persona}
      
      RULES:
      1. STAY IN CHARACTER: If you are the mother, speak like a mother. If a classmate, speak casually.
      2. PRESSURE: Force the user to speak. If they give short answers, push them: "Don't just say 'yes', tell me WHY!"
      3. JUDGMENT: You are judging their fluency, pronunciation (based on transcript), and social appropriateness.
      4. BILINGUAL CORRECTION: At the end of your response, if the user made a mistake, provide a "MENTOR_NOTE" in this format:
         [Mentor Note]:
         - Error: "What you said"
         - Correction: "How to say it perfectly"
         - Explanation (English): "The grammatical rule"
         - Understanding Card (Hinglish): "Jese hum normal baat karte hain: [Easy explanation in the user's conversational style]"
      
      5. IELTS STANDARDS: Even in casual talk, keep an eye on Band 8+ vocabulary.
    `;

    const aiResponse = await getAICompletion([
      { role: "system", content: systemPrompt },
      ...messages
    ]);

    return NextResponse.json({ message: aiResponse });

  } catch (error: unknown) {
    console.error("Roleplay Error:", error);
    return NextResponse.json({ error: "Failed to process roleplay." }, { status: 500 });
  }
}
