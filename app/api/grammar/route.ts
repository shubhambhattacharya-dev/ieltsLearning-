import { NextRequest, NextResponse } from "next/server";
import { getAICompletion } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { ratelimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await ratelimit.limit(ip);
    
    if (!success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { text } = await req.json();

    if (!text || text.length < 5) {
      return NextResponse.json({ error: "Text is too short." }, { status: 400 });
    }

    // 2. AI Prompt
    const systemPrompt = `
      You are an expert English Grammar Tutor. 
      Analyze the user's input for grammatical mistakes. 
      Provide your response in STRICTURED JSON format:
      {
        "originalText": "the text user provided",
        "correctedText": "the perfectly corrected version",
        "explanation": "why it was wrong and what is the rule",
        "futureTips": "how to avoid this specific mistake in the future",
        "realWorldExample": "another example using the correct form",
        "category": "tense/article/vocabulary/etc"
      }
    `;

    const aiResponse = await getAICompletion([
      { role: "system", content: systemPrompt },
      { role: "user", content: text }
    ]);

    // Robust JSON parsing
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response as JSON");
    const result = JSON.parse(jsonMatch[0]);

    // 3. Save to DB (Using a mock user ID for now or create one)
    // In a real app, you'd get this from the session
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({ data: { name: "Test User" } });
    }

    const mistake = await prisma.mistake.create({
      data: {
        userId: user.id,
        originalText: result.originalText,
        correctedText: result.correctedText,
        explanation: result.explanation,
        futureTips: result.futureTips,
        realWorldExample: result.realWorldExample || null,
        category: result.category || null,
      }
    });

    return NextResponse.json(mistake);

  } catch (error: unknown) {
    console.error("Grammar Lab Error:", error);
    return NextResponse.json({ error: "Failed to analyze grammar." }, { status: 500 });
  }
}
