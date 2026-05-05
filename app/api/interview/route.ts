import { NextRequest, NextResponse } from "next/server";
import { getAICompletion, Message } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { ratelimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await ratelimit.limit(ip);
    if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

    const { messages } = await req.json();

    // 1. Sliding Window Logic
    // Limit history to last 10 messages for context efficiency
    const contextMessages = messages.slice(-10);

    const systemPrompt = `
      You are an elite IELTS Speaking Examiner (Band 9 Level). 
      Your goal is to help the user achieve a Band 8+ score.
      
      BEHAVIOR:
      1. Conduct a realistic 1-to-1 interview.
      2. After EVERY response from the user, briefly evaluate it based on:
         - Fluency (Did they hesitate? Did they answer directly?)
         - Lexical Resource (Could they use better synonyms or idiomatic expressions?)
         - Grammar (Identify 1 key mistake or suggest a more complex structure).
      3. Use a polite, encouraging but professional tone.
      
      IELTS BAND 8 CRITERIA TO ENFORCE:
      - Encourage the user to speak at length without effort.
      - Suggest rare or idiomatic vocabulary where appropriate.
      - Prompt for complex sentence structures (conditionals, relative clauses).
      
      FEEDBACK FORMAT:
      [Evaluation]: (Concise feedback on their last answer)
      [Examiner]: (Your next natural question or follow-up)
      
      Keep the conversation flowing. Do not be too verbose in evaluation, keep it actionable.
    `;

    const fullMessages: Message[] = [
      { role: "system", content: systemPrompt },
      ...contextMessages
    ];

    const aiResponse = await getAICompletion(fullMessages);

    // 2. Save to DB
    // In a real app, find user by session
    const user = await prisma.user.findFirst() || await prisma.user.create({ data: { name: "Test User" } });

    // Save user's last message if it exists
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage && lastUserMessage.role === 'user') {
      await prisma.conversation.create({
        data: {
          userId: user.id,
          role: 'user',
          content: lastUserMessage.content,
          type: 'ielts'
        }
      });
    }

    // Save AI's response
    await prisma.conversation.create({
      data: {
        userId: user.id,
        role: 'assistant',
        content: aiResponse,
        type: 'ielts'
      }
    });

    return NextResponse.json({ message: aiResponse });

  } catch (error: unknown) {
    console.error("IELTS Interview Error:", error);
    return NextResponse.json({ error: "Failed to process interview." }, { status: 500 });
  }
}
