import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { movie, scene } = await req.json();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a script writer. Generate a short movie script for the following movie and scene. 
          Return ONLY a JSON array of objects, each with 'character' and 'text' keys. 
          The script should have 6-8 lines total. Ensure characters are accurate to the movie.`
        },
        {
          role: "user",
          content: `Movie: ${movie}, Scene: ${scene}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("No content from Groq");
    
    // Sometimes LLM wraps it in a root object like { "script": [...] }
    const parsed = JSON.parse(content);
    const script = Array.isArray(parsed) ? parsed : (parsed.script || Object.values(parsed)[0]);

    return NextResponse.json({ script });
  } catch (error) {
    console.error("Reading API Error:", error);
    return NextResponse.json({ error: "Failed to generate script" }, { status: 500 });
  }
}
