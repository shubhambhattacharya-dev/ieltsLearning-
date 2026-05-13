"use client";

import { useState } from "react";
import { Send, Brain, Sparkles, Target, AlertCircle, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OutreachResult {
  improvedMessage: string;
  psychologyBehindIt: string;
  keyTips: string[];
  commonMistakesToAvoid: string;
}

export default function OutreachLab() {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("Cold LinkedIn Message");
  const [recipient, setRecipient] = useState("");
  const [context, setContext] = useState("");
  const [draft, setDraft] = useState("");
  const [result, setResult] = useState<OutreachResult | null>(null);
  const [copied, setCopied] = useState(false);

  const generateOutreach = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/outreach", {
        method: "POST",
        body: JSON.stringify({ type, recipient, context, draft }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result.improvedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '5rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>
          Professional <span className="text-primary-gradient">Outreach Lab</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
          Master the psychology of persuasive, human-centric communication.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={20} className="text-primary" /> Target Details
          </h3>
          
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>MESSAGE TYPE</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ width: '100%', background: 'var(--secondary)', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '8px', color: 'white' }}
            >
              <option>Cold LinkedIn Message</option>
              <option>Internship Outreach</option>
              <option>Job Application Follow-up</option>
              <option>Networking Request</option>
              <option>Request for Mentorship</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>RECIPIENT (e.g. Hiring Manager at Google)</label>
            <input 
              type="text" 
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Who are you messaging?"
              style={{ width: '100%', background: 'var(--secondary)', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '8px', color: 'white' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>CONTEXT & GOAL</label>
            <textarea 
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="What do you want to achieve? Any specific details about them?"
              style={{ width: '100%', height: '100px', background: 'var(--secondary)', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '8px', color: 'white', resize: 'none' }}
            />
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} className="text-accent" /> Your Draft (Optional)
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Provide your current draft to get a psychological critique and improvement.
          </p>
          <textarea 
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Paste your rough draft here..."
            style={{ width: '100%', height: '220px', background: 'var(--secondary)', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '8px', color: 'white', resize: 'none' }}
          />
          <button 
            onClick={generateOutreach}
            disabled={loading || !recipient || !context}
            className="btn-primary"
            style={{ width: '100%', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {loading ? "Analyzing Psychology..." : <><Brain size={18} /> Generate High-Impact Message</>}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="animate-fade-up">
            <div className="card" style={{ marginBottom: '2rem', borderTop: '4px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>The Improved Message</h3>
                <button onClick={copyToClipboard} className="btn-secondary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy Message</>}
                </button>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', whiteSpace: 'pre-wrap', fontSize: '1.1rem', lineHeight: 1.6, border: '1px solid var(--border)' }}>
                {result.improvedMessage}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
              <div className="card" style={{ borderLeft: '4px solid var(--accent)' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Brain size={18} className="text-accent" /> Psychological Strategy
                </h4>
                <p style={{ lineHeight: 1.7, opacity: 0.9 }}>{result.psychologyBehindIt}</p>
                
                <div style={{ marginTop: '2rem' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>Pro Tips for Success</h4>
                  <ul style={{ paddingLeft: '1.25rem', display: 'grid', gap: '0.75rem' }}>
                    {result.keyTips.map((tip, i) => <li key={i}>{tip}</li>)}
                  </ul>
                </div>
              </div>

              <div className="card" style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', marginBottom: '1rem' }}>
                  <AlertCircle size={18} />
                  <h4 style={{ margin: 0 }}>Common Mistakes</h4>
                </div>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6, opacity: 0.8 }}>{result.commonMistakesToAvoid}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
