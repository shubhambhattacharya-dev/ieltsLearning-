"use client";

import { useState, useRef } from "react";
import { Mic, MicOff, Play, CheckCircle2, TrendingUp, Zap, Info } from "lucide-react";
import { motion } from "framer-motion";

const SHADOW_TOPICS = [
  { 
    id: 1, 
    title: "The Importance of Language", 
    text: "Language is much more than just a tool for communication; it is a fundamental aspect of human culture and identity. It allows us to express our thoughts, emotions, and complex ideas with others, fostering understanding and collaboration across diverse communities. When we learn a new language, we are not just memorizing words and grammar rules; we are opening a window into a different way of seeing the world. This process enhances our cognitive abilities, improves our problem-solving skills, and makes us more empathetic individuals. In today's globalized world, the ability to communicate effectively in multiple languages is an invaluable asset that can lead to personal and professional growth." 
  },
  { 
    id: 2, 
    title: "Climate Change Impact", 
    text: "Climate change represents one of the most significant challenges facing our planet today. The accumulation of greenhouse gases in the atmosphere, primarily due to human activities like burning fossil fuels and deforestation, has led to a steady increase in global temperatures. This warming trend is causing ice caps to melt, sea levels to rise, and weather patterns to become increasingly unpredictable. We are seeing more frequent and severe natural disasters, such as hurricanes, floods, and droughts, which threaten ecosystems and human settlements alike. Addressing this crisis requires a collective global effort to transition towards renewable energy sources and implement sustainable practices that can protect our environment for future generations." 
  }
];

export default function ShadowingPage() {
  const [selectedTopic, setSelectedTopic] = useState(SHADOW_TOPICS[0]);
  const [isListening, setIsListening] = useState(false);
  const [userTranscript, setUserTranscript] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1); // Default speed
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState<number | null>(null);

  const playReference = async () => {
    setIsPlaying(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        body: JSON.stringify({ text: selectedTopic.text, voiceId: 'pNInz6obpgnuMvtmW6Ba' }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.playbackRate = playbackRate; // Apply custom speed
        audio.play();
        audio.onended = () => setIsPlaying(false);
      }
    } catch (err) {
      console.error(err);
      setIsPlaying(false);
    }
  };

  const calculateScore = (transcript: string) => {
    const endTime = Date.now();
    const durationInSeconds = startTime ? (endTime - startTime) / 1000 : 5;
    
    const original = selectedTopic.text.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
    const user = transcript.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
    
    const originalWords = original.split(" ");
    const userWords = user.split(" ");
    
    let matches = 0;
    userWords.forEach(word => {
      if (originalWords.includes(word)) matches++;
    });

    const accuracy = Math.round((matches / originalWords.length) * 100);
    const calculatedWpm = Math.round((userWords.length / durationInSeconds) * 60);
    
    setScore(accuracy);
    setWpm(calculatedWpm);
    
    if (accuracy > 85) {
      if (calculatedWpm > 130) setFeedback("Excellent! Your speed is native-like and accurate.");
      else if (calculatedWpm > 90) setFeedback("Great accuracy! Try to pick up the pace slightly for more fluency.");
      else setFeedback("Perfect accuracy, but try speaking a bit faster to sound more natural.");
    } else {
      setFeedback("Focus on clarity first, then work on your speed.");
    }
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.onstart = () => setStartTime(Date.now());
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setUserTranscript(transcript);
          calculateScore(transcript);
        };
        recognition.onend = () => setIsListening(false);
        recognition.start();
        setIsListening(true);
      }
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>
        Shadow <span className="text-primary-gradient">Reading</span>
      </h1>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          {SHADOW_TOPICS.map(topic => (
            <button 
              key={topic.id}
              onClick={() => { setSelectedTopic(topic); setScore(null); setUserTranscript(""); }}
              className={selectedTopic.id === topic.id ? 'btn-primary' : 'btn-secondary'}
              style={{ flex: 1 }}
            >
              {topic.title}
            </button>
          ))}
        </div>

        {/* Playback Speed Control */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Playback Speed:</span>
            <input 
                type="range" 
                min="0.5" 
                max="1.5" 
                step="0.25" 
                value={playbackRate} 
                onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--primary)' }}
            />
            <span style={{ minWidth: '40px', fontWeight: 700, color: 'var(--primary)' }}>{playbackRate}x</span>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '2rem', maxHeight: '300px', overflowY: 'auto' }}>
          <p style={{ fontSize: '1.2rem', lineHeight: '1.8', fontWeight: 400, color: isPlaying ? 'var(--primary)' : 'inherit' }}>
            {selectedTopic.text}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', alignItems: 'center' }}>
          <button 
            onClick={playReference}
            disabled={isPlaying}
            className="btn-secondary"
            style={{ width: '60px', height: '60px', borderRadius: '50%', padding: 0 }}
          >
            <Play size={24} fill={isPlaying ? 'currentColor' : 'none'} />
          </button>

          <button 
            onClick={toggleListening}
            style={{ 
              background: isListening ? 'var(--error)' : 'var(--gradient-primary)',
              color: 'white',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 20px var(--primary-glow)'
            }}
          >
            {isListening ? <MicOff size={32} /> : <Mic size={32} />}
          </button>
        </div>
      </div>

      {score !== null && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '3rem' }}>
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <TrendingUp size={20} /> Accuracy: {score}%
                </h3>
                <p style={{ color: 'var(--text-muted)' }}>{feedback}</p>
              </div>
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <Zap size={20} /> Speed: {wpm} WPM
                </h3>
                <p style={{ color: 'var(--text-muted)' }}>{wpm && wpm > 100 ? "Native Pace" : "Steady Pace"}</p>
              </div>
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)' }}>
              {score >= 85 ? 'A' : score >= 70 ? 'B' : 'C'}
            </div>
          </div>
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '0.9rem' }}>
            <strong>Your Transcript:</strong> &quot;{userTranscript}&quot;
          </div>
        </motion.div>
      )}

      <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', opacity: 0.6 }}>
        <Info size={16} />
        <p style={{ fontSize: '0.85rem' }}>
          <strong>Pro Tip:</strong> Listen to the reference audio multiple times to catch the intonation and pauses. Then, try to record your voice immediately after the audio ends.
        </p>
      </div>
    </div>
  );
}
