"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, RotateCcw, User, MessageSquare, Clock, Brain, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SCENARIOS = [
  { id: "ielts", name: "IELTS Speaking Exam", persona: "Strict Band 9 Examiner", duration: 900, description: "Official 15-minute exam format. Part 1, 2, and 3." },
  { id: "boss", name: "Angry Boss", persona: "Demanding Manager", duration: 450, description: "You missed a deadline. Now explain yourself to an angry boss!" },
  { id: "date", name: "First Romantic Date", persona: "Charming Date", duration: 600, description: "Keep the conversation flowing and be attractive. Don't be awkward!" },
  { id: "mother", name: "Talking to Mother", persona: "Strict Indian Mother", duration: 300, description: "Discuss your future and chores. She won't let you give short answers!" },
  { id: "custom", name: "Custom AI Scenario", persona: "AI Multiverse", duration: 600, description: "Define your own world. Want to talk to an Alien? A King? You decide." },
];

export default function NeuralRoleplay() {
  const [step, setStep] = useState<"select" | "active">("select");
  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0]);
  const [customPersona, setCustomPersona] = useState("");
  const [customGoal, setCustomGoal] = useState("");
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "active" && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const startSession = async () => {
    setStep("active");
    setTimeLeft(selectedScenario.duration);
    setLoading(true);
    try {
      const scenarioName = selectedScenario.id === 'custom' ? customGoal : selectedScenario.name;
      const personaName = selectedScenario.id === 'custom' ? customPersona : selectedScenario.persona;

      const res = await fetch("/api/roleplay", {
        method: "POST",
        body: JSON.stringify({ 
          messages: [{ role: "user", content: "Hi, I'm ready to start." }],
          scenario: scenarioName,
          persona: personaName
        }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setMessages([{ role: "assistant", content: data.message }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeech = async (transcript: string) => {
    const newMessages = [...messages, { role: "user", content: transcript }];
    setMessages(newMessages);
    setLoading(true);
    
    try {
      const res = await fetch("/api/roleplay", {
        method: "POST",
        body: JSON.stringify({ 
          messages: newMessages,
          scenario: selectedScenario.name,
          persona: selectedScenario.persona
        }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.message }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <AnimatePresence mode="wait">
        {step === "select" ? (
          <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', textAlign: 'center' }}>
              Neural <span className="text-primary-gradient">Cosplay Lab</span>
            </h1>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '4rem', fontSize: '1.2rem' }}>
              Select a high-pressure scenario to rewire your brain for real-time English.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              {SCENARIOS.map(s => (
                <div 
                  key={s.id} 
                  onClick={() => setSelectedScenario(s)}
                  className="card" 
                  style={{ 
                    cursor: 'pointer', 
                    border: selectedScenario.id === s.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: selectedScenario.id === s.id ? 'rgba(99, 102, 241, 0.05)' : 'var(--card-bg)',
                    transition: 'all 0.3s'
                  }}
                >
                  <h3 style={{ marginBottom: '0.5rem' }}>{s.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{s.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
                    <Clock size={14} /> {s.duration / 60} Minutes
                  </div>
                </div>
              ))}
            </div>

            {selectedScenario.id === 'custom' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ marginTop: '2rem', border: '1px dashed var(--primary)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', opacity: 0.6 }}>WHO IS THE AI?</label>
                    <input 
                      type="text" 
                      value={customPersona}
                      onChange={(e) => setCustomPersona(e.target.value)}
                      placeholder="e.g. Angry Landlord, Alien King..."
                      style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '8px', color: 'white' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', opacity: 0.6 }}>WHAT IS THE SITUATION?</label>
                    <input 
                      type="text" 
                      value={customGoal}
                      onChange={(e) => setCustomGoal(e.target.value)}
                      placeholder="e.g. Asking for a rent discount..."
                      style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '8px', color: 'white' }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <button 
              onClick={startSession}
              disabled={selectedScenario.id === 'custom' && (!customPersona || !customGoal)}
              className="btn-primary" 
              style={{ width: '300px', margin: '4rem auto 0', display: 'block', fontSize: '1.2rem', padding: '1rem', opacity: (selectedScenario.id === 'custom' && (!customPersona || !customGoal)) ? 0.5 : 1 }}
            >
              Enter Immersion Mode
            </button>
          </motion.div>
        ) : (
          <motion.div key="active" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
             <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ margin: 0 }}>{selectedScenario.name}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Role: <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{selectedScenario.persona}</span></span>
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Clock size={12} /> {formatTime(timeLeft)}
                        </div>
                    </div>
                </div>
                <button onClick={() => setStep("select")} className="btn-secondary">
                    <RotateCcw size={16} /> End Session
                </button>
             </header>

             <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '2rem', height: '650px' }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 0, overflow: 'hidden' }}>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                <div style={{ 
                                    maxWidth: '80%',
                                    padding: '1.25rem', 
                                    borderRadius: '16px',
                                    background: msg.role === 'user' ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.05)',
                                    color: 'white',
                                    position: 'relative',
                                    boxShadow: msg.role === 'user' ? '0 4px 15px rgba(99, 102, 241, 0.3)' : 'none',
                                    border: msg.role === 'user' ? 'none' : '1px solid var(--border)'
                                }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.5rem', opacity: 0.6, textTransform: 'uppercase' }}>
                                        {msg.role === 'user' ? 'You' : selectedScenario.persona}
                                    </div>
                                    <div style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--text-muted)' }}>
                                <div className="animate-pulse">●</div>
                                <div className="animate-pulse" style={{ animationDelay: '0.2s' }}>●</div>
                                <div className="animate-pulse" style={{ animationDelay: '0.4s' }}>●</div>
                            </div>
                        )}
                    </div>

                    <div style={{ padding: '2rem', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>
                        <button 
                            onClick={toggleListening}
                            disabled={loading}
                            style={{ 
                                background: isListening ? 'var(--error)' : 'var(--gradient-primary)',
                                color: 'white',
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 4px 25px var(--primary-glow)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto'
                            }}
                        >
                            {isListening ? <MicOff size={32} /> : <Mic size={32} />}
                        </button>
                        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: isListening ? 'var(--error)' : 'var(--text-muted)', fontWeight: 600 }}>
                            {isListening ? "I'm listening... speak clearly." : "Tap to speak and immerse yourself."}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                            <Brain size={18} className="text-primary" /> Teacher's Live Review
                        </h3>
                        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                            As you speak, I am judging your:
                        </p>
                        <ul style={{ marginTop: '1rem', fontSize: '0.85rem', display: 'grid', gap: '0.5rem' }}>
                            <li>✓ Thinking Speed (No Hindi translation)</li>
                            <li>✓ Emotional Connection</li>
                            <li>✓ Complex Sentence Structure</li>
                            <li>✓ Vocabulary Accuracy</li>
                        </ul>
                    </div>

                    <div className="card" style={{ background: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', color: '#f59e0b' }}>
                            <AlertTriangle size={18} /> Immersion Pressure
                        </h3>
                        <p style={{ marginTop: '1rem', fontSize: '0.85rem', lineHeight: 1.6, opacity: 0.8 }}>
                            "In this mode, short answers are your enemy. If you don't speak enough, your 'Partner' will start getting annoyed or pushy. Keep the flow going!"
                        </p>
                    </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
