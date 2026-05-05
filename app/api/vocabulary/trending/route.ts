import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function GET() {
  try {
    const systemPrompt = `
      Suggest 6 high-level, unique, and trending English vocabulary words suitable for IELTS Band 8-9. 
      Vary the words every time. Provide them in a clean JSON array of strings.
      Example: ["Ameliorate", "Facetious", "Pernicious", "Ephemeral", "Pragmatic", "Resilient"]
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "system", content: systemPrompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content || '{"words": []}';
    const result = JSON.parse(content);
    
    return NextResponse.json(result.words || result);

  } catch (error) {
    console.error("Trending Words Error:", error);
    return NextResponse.json(["Ubiquitous", "Pragmatic", "Mitigate", "Paradigm", "Ephemeral", "Resilient"]);
  }
}
