import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, voiceId } = await req.json();
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'ElevenLabs API Key not configured' }, { status: 500 });
    }

    // Default Voice: 'Adam' (pNInz6obpgnuMvtmW6Ba)
    let selectedVoiceId = voiceId || 'pNInz6obpgnuMvtmW6Ba';

    // Verify if voice exists, otherwise get first available
    const voicesRes = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': apiKey }
    });
    
    if (voicesRes.ok) {
      const voicesData = await voicesRes.json();
      const voiceExists = voicesData.voices.some((v: any) => v.voice_id === selectedVoiceId);
      if (!voiceExists && voicesData.voices.length > 0) {
        selectedVoiceId = voicesData.voices[0].voice_id;
        console.log(`Fallback to voice: ${selectedVoiceId}`);
      }
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}/stream`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2', // More modern model
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("ElevenLabs Error:", errorData);
      return NextResponse.json({ error: 'TTS Synthesis failed' }, { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: { 'Content-Type': 'audio/mpeg' },
    });

  } catch (error) {
    console.error("TTS Route Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
