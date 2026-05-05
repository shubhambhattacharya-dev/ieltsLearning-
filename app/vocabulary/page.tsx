"use client";

import { useState, useEffect } from "react";
import { Search, Volume2, Mic, MicOff, CheckCircle2, AlertCircle, BookOpen, Star, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WordDetails {
  word: string;
  phonetic: string;
  meaning: string;
  partOfSpeech: string;
  synonyms: string[];
  example: string;
  ieltsLevel: string;
  commonMistakes: string;
}

export default function VocabularyMaster() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [wordData, setWordData] = useState<WordDetails | null>(null);
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [userPronunciation, setUserPronunciation] = useState("");
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);
  const [trendingWords, setTrendingWords] = useState<string[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(false);

  const fetchTrendingWords = async () => {
    setTrendingLoading(true);
    try {
      const res = await fetch("/api/vocabulary/trending");
      const data = await res.json();
      setTrendingWords(Array.isArray(data) ? data : data.words || []);
    } catch (err) {
      setTrendingWords(['Ubiquitous', 'Pragmatic', 'Mitigate']);
    } finally {
      setTrendingLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingWords();
  }, []);

  const fetchWord = async (wordToSearch?: string) => {
    const word = wordToSearch || query;
    if (!word.trim()) return;
    setLoading(true);
    setError("");
    setWordData(null);
    setPronunciationScore(null);
    
    try {
      const res = await fetch("/api/vocabulary", {
        method: "POST",
        body: JSON.stringify({ word: word }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setWordData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const playPronunciation = async () => {
    if (!wordData) return;
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        body: JSON.stringify({ text: wordData.word, voiceId: 'pNInz6obpgnuMvtmW6Ba' }), // Professional voice
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        new Audio(url).play();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startPractice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        setUserPronunciation(transcript);
        
        // Calculate accuracy
        const target = wordData?.word.toLowerCase() || "";
        const accuracy = transcript.includes(target) ? 100 : 0; // Simple check for individual words
        setPronunciationScore(accuracy);
      };
      recognition.onend = () => setIsListening(false);
      recognition.start();
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '5rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>
          Vocabulary <span className="text-primary-gradient">& Pronunciation</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
          Master high-level IELTS vocabulary with AI-powered feedback.
        </p>
      </header>

      {/* Search Bar */}
      <div className="card" style={{ padding: '0.75rem', display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '3rem', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
        <Search style={{ marginLeft: '1rem', opacity: 0.5 }} />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && fetchWord()}
          placeholder="Search for a word (e.g., 'Exacerbate', 'Ameliorate')..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '1.2rem',
            outline: 'none',
            padding: '0.5rem'
          }}
        />
        <button 
          onClick={() => fetchWord()}
          disabled={loading || !query.trim()}
          className="btn-primary"
          style={{ padding: '0.8rem 2rem' }}
        >
          {loading ? "Analyzing..." : "Master Word"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ borderColor: 'var(--error)', color: 'var(--error)', textAlign: 'center' }}>
            {error}
          </motion.div>
        )}

        {wordData && (
          <motion.div 
            key={wordData.word}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
              
              {/* Left Column: Word Details */}
              <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>{wordData.word}</h2>
                    <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '1.1rem' }}>{wordData.phonetic}</p>
                  </div>
                  <div style={{ background: 'var(--gradient-primary)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
                    {wordData.ieltsLevel}
                  </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Meaning ({wordData.partOfSpeech})</span>
                  <p style={{ fontSize: '1.15rem', marginTop: '0.5rem', lineHeight: 1.6 }}>{wordData.meaning}</p>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Usage Example</span>
                  <div style={{ marginTop: '1rem', padding: '1.25rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', borderLeft: '4px solid var(--accent)', fontStyle: 'italic' }}>
                    "{wordData.example}"
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {wordData.synonyms.map(s => (
                    <span key={s} style={{ background: 'rgba(255,255,255,0.1)', padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem' }}>{s}</span>
                  ))}
                </div>
              </div>

              {/* Right Column: Practice */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Listen Card */}
                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                  <Volume2 size={32} style={{ margin: '0 auto 1rem', color: 'var(--primary)' }} />
                  <h4 style={{ marginBottom: '1rem' }}>Hear Pronunciation</h4>
                  <button onClick={playPronunciation} className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Volume2 size={18} /> Listen AI Voice
                  </button>
                </div>

                {/* Practice Card */}
                <div className="card" style={{ textAlign: 'center', padding: '2rem', background: isListening ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.02)' }}>
                  <Mic size={32} style={{ margin: '0 auto 1rem', color: isListening ? 'var(--error)' : 'var(--accent)' }} />
                  <h4 style={{ marginBottom: '1rem' }}>Practice Saying It</h4>
                  <button 
                    onClick={startPractice} 
                    disabled={isListening}
                    className="btn-primary" 
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: isListening ? 'var(--error)' : 'var(--gradient-primary)' }}
                  >
                    {isListening ? "Listening..." : <><Mic size={18} /> Tap to Record</>}
                  </button>

                  {pronunciationScore !== null && (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ marginTop: '1.5rem' }}>
                      <div style={{ fontSize: '0.9rem', color: pronunciationScore === 100 ? 'var(--accent)' : 'var(--error)', fontWeight: 700, marginBottom: '0.5rem' }}>
                        {pronunciationScore === 100 ? "Perfect Match!" : "Keep Trying!" }
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        You said: "{userPronunciation}"
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Mistake Alert */}
                <div className="card" style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', marginBottom: '0.5rem' }}>
                    <AlertCircle size={16} />
                    <span style={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>Avoid This Mistake</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>{wordData.commonMistakes}</p>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recommended Section */}
      {!wordData && !loading && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: 'var(--text-muted)' }}>
              <Sparkles size={16} /> AI Suggested: Trending IELTS Words
            </h3>
            <button 
              onClick={fetchTrendingWords} 
              disabled={trendingLoading}
              style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
            >
              {trendingLoading ? "Refreshing..." : "Get New Words"}
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            {trendingWords.length > 0 ? trendingWords.map(w => (
              <motion.div 
                key={w} 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => { setQuery(w); fetchWord(w); }}
                className="card" 
                style={{ cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <span style={{ fontWeight: 600 }}>{w}</span>
              </motion.div>
            )) : (
              [1, 2, 3].map(i => <div key={i} className="card animate-pulse" style={{ height: '50px' }}></div>)
            )}
          </div>
        </div>
      )}
    </div>
  );
}
