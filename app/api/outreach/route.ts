import { NextRequest, NextResponse } from "next/server";
import { getAICompletion } from "@/lib/ai";
import { ratelimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await ratelimit.limit(ip);
    if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

    const { type, recipient, context, draft } = await req.json();

    const systemPrompt = `
      You are an expert Career Coach and Psychologist specializing in Professional Communication.
      Your goal is to help the user write a message that is:
      1. Human-Centric: Avoids "bot-like" formal language.
      2. Persuasive: Uses the "Hook-Value-Ask" framework.
      3. Psychologically Attractive: Shows genuine interest and research into the recipient.

      TYPE: ${type} (e.g., Cold LinkedIn Message, Internship Outreach, Job Application follow-up)
      RECIPIENT: ${recipient}
      CONTEXT: ${context}

      If the user provides a 'draft', CRITIQUE it using these psychological principles:
      - The Zeigarnik Effect (Creating curiosity)
      - Social Proof (Mentioning relevant skills/achievements)
      - The Principle of Reciprocity (How the user adds value to the recipient)

      Return your response in JSON format:
      {
        "improvedMessage": "The polished, human-sounding version",
        "psychologyBehindIt": "Explain why this version will trigger a positive response in the recipient's brain",
        "keyTips": ["Tip 1", "Tip 2", "Tip 3"],
        "commonMistakesToAvoid": "What most people do wrong in this context"
      }
    `;

    const userMessage = draft 
      ? `Improve this draft for ${recipient}: "${draft}". Context: ${context}`
      : `Write a high-impact ${type} for ${recipient}. Context: ${context}`;

    const aiResponse = await getAICompletion([
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage }
    ]);

    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");
    const result = JSON.parse(jsonMatch[0]);

    return NextResponse.json(result);

  } catch (error: unknown) {
    console.error("Outreach Lab Error:", error);
    return NextResponse.json({ error: "Failed to generate outreach message." }, { status: 500 });
  }
}
