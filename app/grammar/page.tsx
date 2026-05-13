"use client";

import { useState } from "react";
import { Sparkles, CheckCircle2, AlertCircle, Info, ArrowRight, Brain } from "lucide-react";

interface GrammarResult {
  id: string;
  originalText: string;
  correctedText: string;
  explanation: string;
  futureTips: string;
  realWorldExample?: string;
  category?: string;
}

export default function GrammarLab() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GrammarResult | null>(null);
  const [error, setError] = useState("");

  const analyzeGrammar = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/grammar", {
        method: "POST",
        body: JSON.stringify({ text }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
          Grammar <span className="text-primary-gradient">Diagnosis Lab</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          Type any sentence and let AI dissect it for perfection.
        </p>
      </header>
      
      <div className="card" style={{ marginBottom: '2rem' }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Example: I has a apple since yesterday..."
          style={{
            width: '100%',
            height: '150px',
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1.25rem',
            color: 'white',
            fontSize: '1.1rem',
            marginBottom: '1.5rem',
            outline: 'none',
            resize: 'none',
            transition: 'border-color 0.3s'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
        />
        <button 
          onClick={analyzeGrammar} 
          disabled={loading || !text.trim()}
          className="btn-primary"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          {loading ? "Analyzing Mistakes..." : <><Sparkles size={18} /> Analyze Sentence</>}
        </button>
      </div>

      {error && (
        <div className="card" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--error)', textAlign: 'center', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {result && (
        <div className="animate-fade-up">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--error)' }}>
                <AlertCircle size={18} />
                <span style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase' }}>Original</span>
              </div>
              <p style={{ color: '#fca5a5', textDecoration: 'line-through' }}>{result.originalText}</p>
            </div>

            <div className="card" style={{ borderColor: 'rgba(16, 185, 129, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent)' }}>
                <CheckCircle2 size={18} />
                <span style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase' }}>Corrected</span>
              </div>
              <p style={{ color: 'var(--accent)', fontWeight: 600 }}>{result.correctedText}</p>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
              <Info size={18} />
              <span style={{ fontWeight: 600 }}>Linguistic Explanation</span>
            </div>
            <p style={{ lineHeight: 1.7, opacity: 0.9 }}>{result.explanation}</p>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem', background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#a855f7' }}>
              <Brain size={18} />
              <span style={{ fontWeight: 700 }}>Understanding Card (Bilingual)</span>
            </div>
            <p style={{ lineHeight: 1.7, fontStyle: 'italic', color: '#d8b4fe' }}>{(result as any).understandingCard}</p>
          </div>

          <div className="card" style={{ background: 'var(--gradient-primary)', color: 'white' }}>
            <h4 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowRight size={18} /> Pro Tip for Future
            </h4>
            <p style={{ opacity: 0.9 }}>{result.futureTips}</p>
          </div>
        </div>
      )}
    </div>
  );
}
