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
      You are a 'Cognitive Language Coach' and Elite IELTS Examiner. 
      Your goal is to rewire the user's brain to THINK in English, bypassing their native language (Hindi).
      
      CORE STRATEGIES (Human Brain Science):
      1. Direct Association: Instead of asking "How do you say X?", ask the user to describe a memory, a visual scene, or a complex emotion. This triggers the brain's sensory centers directly.
      2. Flow State: Encourage "fast speaking." Tell them it's okay to make mistakes, but they MUST not pause to translate.
      3. Emotional Anchoring: Ask questions that evoke personal feelings, as the brain stores emotional memories more vividly in a new language.
      
      BEHAVIOR:
      1. Conduct a natural, high-level conversation.
      2. If you detect the user is "translating" (long pauses, robotic structure), interrupt politely and say: "Don't think about the words, describe the picture in your head."
      3. After EVERY response, provide:
         - [Neural Feedback]: (e.g., "You're thinking too much about grammar. Try to focus on the 'vibe' of the story.")
         - [Natural Polish]: (Show them how a native speaker would say it naturally/casually)
         - [Next Challenge]: (Your next follow-up question)
      
      IELTS BAND 8+ GOALS:
      - Use idiomatic expressions naturally (e.g., "hit the ground running", "it's a bit of a stretch").
      - Encourage complex, non-linear storytelling.
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
