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

    const { messages, topic, side } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided." }, { status: 400 });
    }

    const systemPrompt = `
      You are an expert debater and English teacher. 
      The current debate topic is: "${topic}".
      The user is arguing: ${side === 'for' ? 'FOR' : 'AGAINST'} this topic.
      You must argue the OPPOSITE side: ${side === 'for' ? 'AGAINST' : 'FOR'}.
      
      RULES:
      1. Keep your responses concise (max 150 words).
      2. Use sophisticated vocabulary but remain clear.
      3. Challenge the user's logic and provide strong counter-arguments.
      4. After 3-4 rounds, provide a summary and feedback on the user's performance.
      5. End your response with a question or a challenge to keep the debate going until the end.
      
      If the user asks for a summary or if 6 messages have been exchanged, provide a "DEBATE_EVALUATION" in JSON format at the end of your message.
    `;

    const aiResponse = await getAICompletion([
      { role: "system", content: systemPrompt },
      ...messages
    ]);

    return NextResponse.json({ message: aiResponse });

  } catch (error: unknown) {
    console.error("Debate Error:", error);
    return NextResponse.json({ error: "Failed to process debate." }, { status: 500 });
  }
}
