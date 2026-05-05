export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * AI Completion using OpenRouter (Primary) or Groq (Secondary)
 */
export async function getAICompletion(
  messages: Message[],
  model: string = 'google/gemini-2.0-flash-001' // OpenRouter default
) {
  // Try OpenRouter first
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (openRouterKey) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'HTTP-Referer': 'https://lingomaster-ai.vercel.app',
          'X-Title': 'LingoMaster AI',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content;
      }
    } catch (e) {
      console.warn("OpenRouter failed, falling back to Groq...", e);
    }
  }

  // Fallback to Groq
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Service Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  throw new Error('No AI API keys configured');
}
