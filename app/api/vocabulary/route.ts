import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { word } = await req.json();

    if (!word) {
      return NextResponse.json({ error: "Word is required" }, { status: 400 });
    }

    const systemPrompt = `
      You are an expert English Lexicographer. 
      Analyze the word provided and return a detailed response in STRICT JSON format:
      {
        "word": "string",
        "phonetic": "string (IPA notation)",
        "meaning": "string (clear, concise)",
        "partOfSpeech": "string",
        "synonyms": ["string", "string"],
        "example": "string (a high-level IELTS context sentence)",
        "ieltsLevel": "Band 7/8/9",
        "commonMistakes": "string"
      }
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze the word: ${word}` },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json(result);

  } catch (error: unknown) {
    console.error("Vocabulary API Error:", error);
    return NextResponse.json({ error: "Failed to fetch word details." }, { status: 500 });
  }
}
