"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Send, Volume2, RotateCcw, Award, CheckCircle2, ChevronRight, Settings, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import InterviewerHeader from "./InterviewerHeader";


interface Message {
  role: 'user' | 'assistant';
  content: string;
}

declare global {
  interface Window {
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof SpeechRecognition;
  }
}

export default function IELTSInterview() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const handleSendRef = useRef<((textToSend?: string) => void) | null>(null);

  const [currentQuestion, setCurrentQuestion] = useState("");
  const [testPart, setTestPart] = useState<1 | 2 | 3>(1);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else if (timer === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  const startPart2Mock = () => {
    setIsMockMode(true);
    setTimer(60); // 1 minute preparation
    setTimerActive(true);
    setMessages([{ role: 'assistant', content: "[Examiner]: You have 1 minute to prepare for your Part 2 topic. You can make notes. Then you must speak for 2 minutes." }]);
  };

  const handleSend = useCallback(async (textToSend?: string) => {
    const content = textToSend || input;
    if (!content.trim() || loading) return;

    // Stop timer if user starts speaking before 1 min ends in Part 2
    if (isMockMode && timerActive) setTimerActive(false);

    setMessages(prev => [...prev, { role: 'user', content }]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        body: JSON.stringify({ 
          messages: [...messages, { role: 'user', content }],
          testPart 
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get AI response");

      const aiMessage = data.message;
      setMessages(prev => [...prev, { role: 'assistant', content: aiMessage }]);
      setCurrentQuestion(aiMessage);

      // --- Professional TTS Integration (Unreal Speech) ---
      try {
        const ttsResponse = await fetch("/api/tts", {
          method: "POST",
          body: JSON.stringify({ text: aiMessage, voiceId: 'pNInz6obpgnuMvtmW6Ba' }), // Adam - Professional Examiner Voice
        });

        if (ttsResponse.ok) {
          const blob = await ttsResponse.blob();
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audio.play();
        } else {
          throw new Error("Professional TTS failed");
        }
      } catch (ttsErr) {
        console.warn("Unreal Speech fallback to browser voice:", ttsErr);
        // Fallback to Browser Voice
        const utterance = new SpeechSynthesisUtterance(aiMessage);
        const voices = window.speechSynthesis.getVoices();
        const premiumVoice = voices.find(v => v.lang.includes("US") && (v.name.includes("Neural") || v.name.includes("Natural"))) || voices[0];
        utterance.voice = premiumVoice;
        utterance.lang = "en-US";
        utterance.rate = 0.95;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [input, messages, testPart]);

  const validateLastAnswer = async () => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMessage || !currentQuestion) return;

    setIsValidating(true);
    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        body: JSON.stringify({ 
          answer: lastUserMessage.content,
          question: currentQuestion 
        }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setEvaluation(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsValidating(false);
    }
  };


  // Keep handleSend ref updated
  useEffect(() => {
    handleSendRef.current = handleSend;
  }, [handleSend]);

  // Initialize speech synthesis and recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
      
       const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
       if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true; // Show text as user speaks
        recognition.lang = "en-US";

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              const transcript = event.results[i][0].transcript;
              setIsListening(false);
              handleSendRef.current?.(transcript);
            } else {
              interimTranscript += event.results[i][0].transcript;
              setInput(interimTranscript); // Live preview
            }
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech Recognition Error:", event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            setError("Microphone access denied. Please allow microphone access.");
          } else if (event.error === 'no-speech') {
            setError("No speech detected. Try again.");
          } else {
            setError(`Voice error: ${event.error}`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        // Use setTimeout to avoid setState in useEffect
        setTimeout(() => {
          setError("Speech recognition not supported in this browser.");
        }, 0);
      }
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setError("");
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch {
        setError("Error starting voice recognition. Try again.");
      }
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="icon-badge">
            <Award size={20} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>IELTS <span className="text-gradient">Examiner</span></h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>BAND 8+ PREP</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setShowSettings(!showSettings)} className="btn-secondary" style={{ padding: '0.5rem' }}>
            <Settings size={18} />
          </button>
          <button onClick={() => { setMessages([]); setCurrentQuestion(""); setEvaluation(null); }} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </header>

      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', marginBottom: '1rem' }}
          >
            <div className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Test Part:</span>
              {[1, 2, 3].map((p) => (
                <button 
                  key={p}
                  onClick={() => setTestPart(p as any)}
                  className={testPart === p ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                >
                  Part {p}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer UI placement */}
      {timer > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="card" 
          style={{ 
            marginBottom: '1rem', 
            textAlign: 'center', 
            padding: '1rem',
            borderColor: timer < 10 ? 'var(--error)' : 'var(--primary)',
            background: 'rgba(255,255,255,0.02)'
          }}
        >
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
            {timerActive ? "Mock Preparation Time" : "Start Speaking Now!"}
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: timer < 10 ? 'var(--error)' : 'var(--primary)' }}>
            {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
          </div>
        </motion.div>
      )}

      <InterviewerHeader question={currentQuestion} />

      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card" 
            style={{ textAlign: 'center', padding: '3rem', marginTop: '2rem' }}
          >
            <div className="icon-badge" style={{ width: '64px', height: '64px', margin: '0 auto 1.5rem', borderRadius: '20px' }}>
              <Volume2 size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Start Practice</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Ready to improve your IELTS Speaking? Choose a part and begin.</p>
            <button onClick={() => handleSend("Hello, I am ready to start Part " + testPart)} className="btn-primary">
              Begin Interview
            </button>
          </motion.div>
        )}
        
        {messages.map((msg, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ 
              display: 'flex', 
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div className={`message-bubble ${msg.role === 'user' ? 'user-bubble' : 'assistant-bubble'}`} style={{ 
              maxWidth: '85%', 
              padding: '1rem 1.25rem',
              borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              fontSize: '1rem',
              lineHeight: '1.6'
            }}>
              {msg.content.split('\n').map((line, idx) => (
                <p key={idx} style={{ margin: line.startsWith('[') ? '0.5rem 0' : '0' }}>
                  {line.startsWith('[Evaluation]') ? (
                    <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.9rem' }}>{line}</span>
                  ) : line.startsWith('[Examiner]') ? (
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{line}</span>
                  ) : line}
                </p>
              ))}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <span className="dot-pulse"></span> Examiner is evaluating...
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <AnimatePresence>
        {evaluation && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="card"
            style={{ 
              marginBottom: '1rem', 
              border: '1px solid var(--accent)', 
              background: 'rgba(16, 185, 129, 0.05)',
              position: 'relative'
            }}
          >
            <button 
              onClick={() => setEvaluation(null)}
              style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
            >
              ✕
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h4 style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={18} /> Band {evaluation.bandScore} Evaluation
              </h4>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time Analysis</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
              <div>
                <strong>Grammar:</strong> <p style={{ margin: '0.25rem 0', fontSize: '0.85rem' }}>{evaluation.grammar}</p>
              </div>
              <div>
                <strong>Vocab:</strong> <p style={{ margin: '0.25rem 0', fontSize: '0.85rem' }}>{evaluation.vocabulary}</p>
              </div>
            </div>
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <strong>Band 9 Suggestion:</strong>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--primary)' }}>&quot;{evaluation.improvedVersion}&quot;</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button 
          onClick={validateLastAnswer}
          disabled={isValidating || messages.length < 2}
          className="btn-secondary"
          style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          {isValidating ? "Analyzing..." : "Analyze Last Answer"} <ChevronRight size={14} />
        </button>
      </div>

      <div className="card" style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'var(--glass-bg)' }}>
        <button 
          onClick={toggleListening}
          style={{ 
            background: isListening ? 'var(--error)' : 'var(--gradient-primary)',
            color: 'white',
            padding: '0.8rem',
            borderRadius: '50%',
            boxShadow: isListening ? '0 0 20px var(--error)' : '0 4px 15px var(--primary-glow)',
            border: 'none'
          }}
        >
          {isListening ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
        
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isListening ? "Listening to your response..." : "Type your answer..."}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: 'white',
            outline: 'none',
            fontSize: '1.05rem',
            padding: '0 0.5rem'
          }}
        />
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={() => setShowSettings(!showSettings)} 
            className="btn-secondary"
            style={{ width: '45px', height: '45px', borderRadius: '50%', padding: 0 }}
          >
            <Settings size={20} />
          </button>
          <button 
            onClick={startPart2Mock} 
            className="btn-primary"
            style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Trophy size={16} /> Mock Test
          </button>
        </div>

        <button 
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="btn-primary"
          style={{ padding: '0.75rem', borderRadius: '12px' }}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
