"use client";

import { useState } from "react";
import { PenTool, Send, RotateCcw, CheckCircle } from "lucide-react";

const TOPICS = [
  { id: 1, title: "Describe your favorite hobby", prompt: "Write a paragraph about your favorite hobby. Explain why you enjoy it and how long you've been doing it." },
  { id: 2, title: "A memorable journey", prompt: "Describe a memorable journey you took. Where did you go, who were you with, and what made it special?" },
  { id: 3, title: "Technology in daily life", prompt: "Discuss how technology has changed your daily life in the past five years. Include both positive and negative aspects." },
  { id: 4, title: "Your dream job", prompt: "Describe your dream job. What skills are required, and why does it appeal to you?" },
];

export default function WritingPractice() {
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState<number[]>([]);

  const currentTopic = TOPICS.find(t => t.id === selectedTopic);

  const analyzeWriting = async () => {
    if (!text.trim() || !currentTopic) return;
    
    setLoading(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, topic: currentTopic.title }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to analyze");
      
      setFeedback(data.feedback);
      if (!completed.includes(selectedTopic!)) {
        setCompleted(prev => [...prev, selectedTopic!]);
      }
    } catch (err) {
      console.error("Writing analysis error:", err);
      setFeedback("Sorry, unable to analyze your writing at the moment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetWriting = () => {
    setText("");
    setFeedback(null);
  };

  const selectTopic = (id: number) => {
    setSelectedTopic(id);
    setText("");
    setFeedback(null);
  };

  if (!selectedTopic) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '2rem' }}>Writing <span className="text-gradient">Practice</span></h1>
        
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
          {TOPICS.map(topic => (
            <button
              key={topic.id}
              onClick={() => selectTopic(topic.id)}
              className="card"
              style={{
                width: '100%',
                textAlign: 'left',
                background: completed.includes(topic.id) ? 'rgba(16, 185, 129, 0.1)' : 'var(--card-bg)',
                border: completed.includes(topic.id) ? '1px solid var(--accent)' : '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                padding: '1.5rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ marginBottom: '0.5rem' }}>{topic.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{topic.prompt}</p>
                </div>
                {completed.includes(topic.id) && <CheckCircle size={24} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
              </div>
            </button>
          ))}
        </div>

        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          {completed.length} of {TOPICS.length} topics completed
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Writing <span className="text-gradient">Practice</span></h1>
        <button onClick={() => setSelectedTopic(null)} className="nav-link">
          ← Back to Topics
        </button>
      </div>

       <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{currentTopic?.title}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{currentTopic?.prompt}</p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start writing your paragraph here..."
          style={{
            width: '100%',
            minHeight: '200px',
            background: 'var(--secondary)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '1rem',
            color: 'white',
            fontSize: '1.1rem',
            lineHeight: '1.6',
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'inherit'
          }}
        />

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{text.split(/\s+/).filter(w => w.length > 0).length} words</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={resetWriting} className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RotateCcw size={16} /> Reset
            </button>
            <button 
              onClick={analyzeWriting}
              disabled={loading || text.trim().length < 50}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
            >
              <Send size={18} />
              {loading ? "Analyzing..." : "Submit for Feedback"}
            </button>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <PenTool size={20} style={{ color: 'var(--primary)' }} />
            <h3>AI Feedback</h3>
          </div>
          <div style={{ lineHeight: '1.8', fontSize: '1.05rem' }}>
            {feedback.split('\n').map((line, idx) => (
              <p key={idx} style={{ marginBottom: '0.5rem' }}>{line}</p>
            ))}
          </div>
          <button 
            onClick={() => { setText(""); setFeedback(null); }}
            className="btn-primary"
            style={{ marginTop: '1.5rem' }}
          >
            Write Another
          </button>
        </div>
      )}
    </div>
  );
}
