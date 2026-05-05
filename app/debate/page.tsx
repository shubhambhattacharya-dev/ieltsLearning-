"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, RotateCcw, ChevronRight, Swords, Trophy, BarChart3 } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const DEBATE_TOPICS = [
  { id: 1, title: "Social media does more harm than good", description: "Discuss the impact of social platforms on mental health and society." },
  { id: 2, title: "AI will replace most human jobs", description: "Debate the future of automation and the role of humans in the workforce." },
  { id: 3, title: "Remote work is better than office work", description: "Compare productivity, flexibility, and social aspects of working environments." },
  { id: 4, title: "Public transport should be free", description: "Discuss economic, environmental, and social implications of free transit." },
];

export default function DebateRoom() {
  const [selectedTopic, setSelectedTopic] = useState<typeof DEBATE_TOPICS[0] | null>(null);
  const [side, setSide] = useState<'for' | 'against' | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startDebate = async (side: 'for' | 'against') => {
    setSide(side);
    const initialMessage = `I would like to debate "${selectedTopic?.title}". I am ${side === 'for' ? 'in favor of' : 'against'} this. Let's begin.`;
    const userMsg: Message = { role: 'user', content: initialMessage };
    setMessages([userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/debate", {
        method: "POST",
        body: JSON.stringify({ 
          messages: [userMsg], 
          topic: selectedTopic?.title, 
          side 
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/debate", {
        method: "POST",
        body: JSON.stringify({ 
          messages: newMessages, 
          topic: selectedTopic?.title, 
          side 
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedTopic) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '4rem' }}>
        <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>
            AI <span className="text-primary-gradient">Debate Room</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
            Choose a topic and sharpen your argumentative skills against a master debater.
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
          {DEBATE_TOPICS.map((topic) => (
            <div key={topic.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'white' }}>{topic.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>{topic.description}</p>
              </div>
              <button 
                onClick={() => setSelectedTopic(topic)}
                className="btn-secondary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                Select Topic <ChevronRight size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!side) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem' }}>
          <Swords size={48} style={{ color: 'var(--primary)', marginBottom: '1.5rem' }} />
          <h2 style={{ marginBottom: '1rem' }}>{selectedTopic.title}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Which side will you take?</p>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => startDebate('for')} className="btn-primary" style={{ flex: 1 }}>FOR</button>
            <button onClick={() => startDebate('against')} className="btn-secondary" style={{ flex: 1 }}>AGAINST</button>
          </div>
          <button 
            onClick={() => setSelectedTopic(null)} 
            style={{ marginTop: '2rem', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', border: 'none' }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedTopic.title}</h3>
          <span style={{ fontSize: '0.8rem', color: side === 'for' ? 'var(--accent)' : 'var(--error)', textTransform: 'uppercase', fontWeight: 600 }}>
            Arguing: {side}
          </span>
        </div>
        <button onClick={() => { setSelectedTopic(null); setSide(null); setMessages([]); }} className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RotateCcw size={16} /> Exit
        </button>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ 
            display: 'flex', 
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            animation: 'fadeInUp 0.3s ease-out'
          }}>
            <div className="card" style={{ 
              maxWidth: '85%', 
              background: msg.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
              color: 'white',
              borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
              padding: '1.25rem',
              border: msg.role === 'user' ? 'none' : '1px solid var(--border)'
            }}>
              <p style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <BarChart3 size={16} className="animate-pulse" /> AI is formulating a counter-argument...
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="card" style={{ padding: '0.75rem', marginTop: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', background: 'var(--glass-bg)' }}>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your argument..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: 'white',
            outline: 'none',
            fontSize: '1rem',
            padding: '0.5rem'
          }}
        />
        <button 
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="btn-primary"
          style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {loading ? "..." : <><Send size={18} /> Send</>}
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
}
