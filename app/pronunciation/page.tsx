"use client";

import { useState } from "react";
import { Play, Pause, Volume2, CheckCircle, RotateCcw } from "lucide-react";

const EXERCISES = [
  { text: "The quick brown fox jumps over the lazy dog", focus: "Articulation of all English sounds" },
  { text: "She sells seashells by the seashore", focus: "Sibilant sounds (s/sh)" },
  { text: "How can a clam cram in a clean cream can?", focus: "Clusters and rhythm" },
  { text: "Peter Piper picked a peck of pickled peppers", focus: "P sound and alliteration" },
  { text: "Unique New York, Unique New York, Unique New York", focus: "Nasal sounds and rhythm" },
  { text: "Red leather, yellow leather, red leather, yellow leather", focus: "Liquid consonants (l/r)" },
  { text: "Which witch switched the Swiss wristwatches?", focus: "W and wh sounds" },
  { text: "Thirty-three thousand feathers on a thrush's throat", focus: "Th sound and tongue twister" },
];

export default function PronunciationPractice() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);

  const currentExercise = EXERCISES[currentIndex];

  const speak = (rate: number = 0.8) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentExercise.text);
    utterance.lang = "en-US";
    utterance.rate = rate;
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(false);
  };

  const speakSlow = () => speak(0.6);
  const speakNormal = () => speak(0.9);

  const nextExercise = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentIndex(prev => (prev + 1) % EXERCISES.length);
    setAttempts(0);
  };

  const markComplete = () => {
    if (!completed.includes(currentIndex)) {
      setCompleted(prev => [...prev, currentIndex]);
    }
    nextExercise();
  };

  const retry = () => {
    setAttempts(prev => prev + 1);
    speakNormal();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Pronunciation <span className="text-gradient">Practice</span></h1>
        <span style={{ color: 'var(--text-muted)' }}>{completed.length}/{EXERCISES.length} completed</span>
      </div>

      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Volume2 size={48} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Focus: {currentExercise.focus}</h3>
        </div>

        <div style={{ 
          background: 'var(--secondary)', 
          padding: '2rem', 
          borderRadius: '12px', 
          marginBottom: '2rem',
          fontSize: '1.5rem',
          lineHeight: '1.6',
          fontStyle: 'italic'
        }}>
          &quot;{currentExercise.text}&quot;
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button 
            onClick={speakSlow}
            disabled={isPlaying}
            className="btn-primary"
            style={{ background: 'var(--secondary)', border: '1px solid var(--border)', padding: '0.75rem 1.5rem' }}
          >
            <Play size={20} style={{ marginRight: '0.5rem' }} />
            Slow (0.6x)
          </button>

          <button 
            onClick={speakNormal}
            disabled={isPlaying}
            className="btn-primary"
            style={{ padding: '0.75rem 1.5rem' }}
          >
            {isPlaying ? <><Pause size={20} style={{ marginRight: '0.5rem' }} />Playing...</> : <><Play size={20} style={{ marginRight: '0.5rem' }} />Normal (0.9x)</>}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={retry} className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RotateCcw size={16} /> Retry ({attempts})
          </button>
          
          <button onClick={markComplete} className="btn-primary" style={{ background: 'var(--accent)', padding: '0.75rem 1.5rem' }}>
            <CheckCircle size={20} style={{ marginRight: '0.5rem' }} />
            Mark Complete
          </button>
          
          <button onClick={nextExercise} className="nav-link">
            Skip
          </button>
        </div>
      </div>

      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
        Exercise {currentIndex + 1} of {EXERCISES.length}
      </div>
    </div>
  );
}
