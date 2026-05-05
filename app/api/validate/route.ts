import { NextRequest, NextResponse } from "next/server";
import { getAICompletion, Message } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { answer, question } = await req.json();

    if (!answer || !question) {
      return NextResponse.json({ error: "Missing answer or question" }, { status: 400 });
    }

    const systemPrompt = `
      You are an expert IELTS Writing and Speaking coach.
      Analyze the user's answer to the given question and provide a Band 8+ evaluation.
      
      STRUCTURE YOUR RESPONSE AS JSON:
      {
        "bandScore": number (0-9),
        "fluency": "string",
        "vocabulary": "string",
        "grammar": "string",
        "pronunciationHint": "string (how to pronounce complex words in the answer)",
        "improvedVersion": "string (a Band 9 version of the user's answer)"
      }
      
      Keep it encouraging but rigorous.
    `;

    const messages: Message[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Question: ${question}\nUser Answer: ${answer}` }
    ];

    const aiResponse = await getAICompletion(messages);
    
    // Parse JSON from AI response (handle potential markdown formatting)
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Failed to parse evaluation" };

    return NextResponse.json(result);

  } catch (error: unknown) {
    console.error("Validation Error:", error);
    return NextResponse.json({ error: "Failed to validate answer." }, { status: 500 });
  }
}
