"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipForward, Volume2, Newspaper, RefreshCcw } from "lucide-react";

interface NewsArticle {
  title: string;
  description: string;
  content: string;
  source: string;
  publishedAt: string;
}

const SAMPLE_NEWS: NewsArticle[] = [
  {
    title: "AI Revolutionizes Language Learning",
    description: "New AI tools are transforming how people learn languages worldwide.",
    content: "Artificial Intelligence is revolutionizing language learning by providing personalized feedback and real-time corrections. Students can now practice speaking with AI tutors that never get tired and always provide constructive feedback. This technology is making language learning more accessible and effective than ever before.",
    source: "Tech Daily",
    publishedAt: "2026-05-04"
  },
  {
    title: "Global English Proficiency Index Released",
    description: "New study shows English proficiency varies significantly across regions.",
    content: "The latest Global English Proficiency Index reveals interesting trends in language learning worldwide. Northern European countries continue to lead in English proficiency, while developing nations are rapidly improving their English skills through digital learning platforms and online courses.",
    source: "Education Today",
    publishedAt: "2026-05-03"
  },
  {
    title: "Benefits of Reading Aloud for Language Learners",
    description: "New research highlights the importance of reading aloud in language acquisition.",
    content: "Reading aloud has been proven to enhance language learning significantly. When learners read aloud, they engage multiple senses simultaneously - seeing the text, hearing themselves speak, and feeling the mouth movements. This multi-sensory approach strengthens neural pathways and improves retention dramatically.",
    source: "Language Research Journal",
    publishedAt: "2026-05-02"
  }
];

export default function NewsReporter() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [completed, setCompleted] = useState<number[]>([]);
  const [showContent, setShowContent] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const currentNews = SAMPLE_NEWS[currentIndex];

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => { synthRef.current?.cancel(); };
  }, []);

  const speak = () => {
    if (!synthRef.current) return;
    
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(currentNews.content);
    utterance.lang = "en-US";
    utterance.rate = speed;
    utterance.onend = () => setIsPlaying(false);
    synthRef.current.speak(utterance);
    setIsPlaying(true);
  };

  const stop = () => {
    synthRef.current?.cancel();
    setIsPlaying(false);
  };

  const nextNews = () => {
    stop();
    setShowContent(false);
    setCurrentIndex(prev => (prev + 1) % SAMPLE_NEWS.length);
  };

  const markRead = () => {
    if (!completed.includes(currentIndex)) {
      setCompleted(prev => [...prev, currentIndex]);
    }
    nextNews();
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>News <span className="text-gradient">Reporter</span></h1>
        <span style={{ color: 'var(--text-muted)' }}>{completed.length}/{SAMPLE_NEWS.length} read</span>
      </div>

      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Newspaper size={24} style={{ color: 'var(--primary)' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{currentNews.source} • {currentNews.publishedAt}</span>
        </div>

        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>{currentNews.title}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>{currentNews.description}</p>

        <button 
          onClick={() => setShowContent(!showContent)}
          className="nav-link"
          style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {showContent ? 'Hide Article' : 'Show Full Article'}
        </button>

        {showContent && (
          <div 
            style={{ 
              background: 'var(--secondary)', 
              padding: '1.5rem', 
              borderRadius: '8px',
              lineHeight: '1.8',
              fontSize: '1.1rem',
              marginBottom: '1.5rem'
            }}
          >
            {currentNews.content}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={isPlaying ? stop : speak}
            className="btn-primary"
            style={{ 
              padding: '0.75rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {isPlaying ? <><Pause size={20} /> Stop</> : <><Play size={20} /> Read Aloud</>}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Volume2 size={18} style={{ color: 'var(--text-muted)' }} />
            <input 
              type="range" 
              min="0.5" 
              max="1.5" 
              step="0.1" 
              value={speed} 
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              style={{ width: '100px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{speed}x</span>
          </div>

          <button onClick={markRead} className="btn-primary" style={{ background: 'var(--accent)', padding: '0.75rem 1.5rem' }}>
            Mark as Read
          </button>

          <button onClick={nextNews} className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SkipForward size={16} /> Next
          </button>
        </div>
      </div>

      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
        Article {currentIndex + 1} of {SAMPLE_NEWS.length}
      </div>
    </div>
  );
}
