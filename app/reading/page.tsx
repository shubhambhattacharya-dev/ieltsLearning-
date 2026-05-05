"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Play, RotateCcw, Film, User, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MOVIES = [
  { id: "avengers", name: "Avengers: Endgame", characters: ["Iron Man", "Captain America", "Thanos"], scene: "The Final Stand" },
  { id: "kungfu", name: "Kung Fu Panda", characters: ["Po", "Master Shifu", "Oogway"], scene: "Dragon Scroll Training" },
  { id: "potter", name: "Harry Potter", characters: ["Harry", "Hermione", "Ron"], scene: "Spell Casting Practice" },
];

interface ScriptLine {
  character: string;
  text: string;
}

export default function ScriptReading() {
  const [selectedMovie, setSelectedMovie] = useState(MOVIES[0]);
  const [myCharacter, setMyCharacter] = useState("");
  const [step, setStep] = useState<"select" | "practice">("select");
  const [messages, setMessages] = useState<{ role: string, content: string, status?: 'correct' | 'wrong' | 'pending' }[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [script, setScript] = useState<ScriptLine[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const recognitionRef = useRef<any>(null);

  const startPractice = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reading", {
        method: "POST",
        body: JSON.stringify({ movie: selectedMovie.name, scene: selectedMovie.scene }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setScript(data.script);
      setStep("practice");
      
      // If AI starts first
      if (data.script[0].character !== myCharacter) {
        playAILine(data.script[0].text);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const playAILine = async (text: string) => {
    setMessages(prev => [...prev, { role: "assistant", content: text }]);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        body: JSON.stringify({ text, voiceId: 'pNInz6obpgnuMvtmW6Ba' }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
        audio.onended = () => {
           setCurrentLineIndex(prev => prev + 1);
        };
      }
    } catch (err) {
      console.error(err);
      setCurrentLineIndex(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (step === "practice" && script[currentLineIndex] && script[currentLineIndex].character !== myCharacter) {
        playAILine(script[currentLineIndex].text);
    }
  }, [currentLineIndex, script, myCharacter, step]);

  const handleSpeech = (transcript: string) => {
    const targetText = script[currentLineIndex]?.text || "";
    
    // Improved matching logic: check word overlap percentage
    const normalize = (str: string) => str.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();
    const targetWords = normalize(targetText).split(" ");
    const transcriptWords = normalize(transcript).split(" ");
    
    let matchCount = 0;
    targetWords.forEach(word => {
      if (transcriptWords.includes(word)) matchCount++;
    });

    const accuracy = matchCount / targetWords.length;
    const isCorrect = accuracy > 0.6; // 60% word match is usually enough for STT
    
    setMessages(prev => [...prev, { 
      role: "user", 
      content: transcript, 
      status: isCorrect ? 'correct' : 'wrong' 
    }]);

    if (!isCorrect) {
      setFeedback(`Almost! You said: "${transcript}". The script says: "${targetText}". Try again focusing on the keywords.`);
    } else {
      setFeedback("Excellent delivery! You're sounding like a pro.");
      setTimeout(() => {
        setFeedback("");
        setCurrentLineIndex(prev => prev + 1);
      }, 1500);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          handleSpeech(transcript);
        };
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
      }
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <AnimatePresence mode="wait">
        {step === "select" ? (
          <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>
              Select your <span className="text-primary-gradient">Movie Script</span>
            </h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div className="card">
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Film size={20} /> Choose Movie
                </h3>
                {MOVIES.map(m => (
                  <button 
                    key={m.id}
                    onClick={() => setSelectedMovie(m)}
                    className={selectedMovie.id === m.id ? 'btn-primary' : 'btn-secondary'}
                    style={{ width: '100%', marginBottom: '0.5rem', textAlign: 'left', display: 'block' }}
                  >
                    {m.name}
                  </button>
                ))}
              </div>

              <div className="card">
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={20} /> Choose Character
                </h3>
                {selectedMovie.characters.map(c => (
                  <button 
                    key={c}
                    onClick={() => setMyCharacter(c)}
                    className={myCharacter === c ? 'btn-primary' : 'btn-secondary'}
                    style={{ width: '100%', marginBottom: '0.5rem', textAlign: 'left', display: 'block' }}
                  >
                    {c}
                  </button>
                ))}
                
                <button 
                  onClick={startPractice}
                  disabled={!myCharacter || loading}
                  className="btn-primary" 
                  style={{ width: '100%', marginTop: '2rem' }}
                >
                  {loading ? "Generating Script..." : "Action! 🎬"}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="practice" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
             <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ margin: 0 }}>{selectedMovie.name}</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Role: <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{myCharacter}</span></p>
                </div>
                <button onClick={() => setStep("select")} className="btn-secondary">
                    <RotateCcw size={16} /> Change Script
                </button>
             </header>

             <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', height: '600px' }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                <div className={`message-bubble ${msg.role === 'user' ? 'user-bubble' : 'assistant-bubble'}`} style={{ 
                                    padding: '1rem', 
                                    borderRadius: '16px',
                                    position: 'relative'
                                }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem', opacity: 0.7 }}>
                                        {msg.role === 'user' ? myCharacter : 'Partner'}
                                    </div>
                                    {msg.content}
                                    {msg.status === 'correct' && <CheckCircle2 size={14} style={{ position: 'absolute', bottom: -5, right: -5, color: 'var(--accent)' }} />}
                                    {msg.status === 'wrong' && <AlertCircle size={14} style={{ position: 'absolute', bottom: -5, right: -5, color: 'var(--error)' }} />}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                        <p style={{ marginBottom: '1rem', color: 'var(--primary)', fontWeight: 600 }}>
                            {script[currentLineIndex]?.character === myCharacter ? "YOUR TURN! Read the line below:" : "Listen to your partner..."}
                        </p>
                        
                        {script[currentLineIndex]?.character === myCharacter && (
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                                &quot;{script[currentLineIndex].text}&quot;
                            </div>
                        )}

                        <button 
                            onClick={toggleListening}
                            disabled={script[currentLineIndex]?.character !== myCharacter}
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

                <div className="card">
                    <h3>Performance Feedback</h3>
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', minHeight: '100px' }}>
                        {feedback || "Waiting for your delivery..."}
                    </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
