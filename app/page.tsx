"use client";

import Link from "next/link";
import { 
  Sparkles, 
  Mic2, 
  BookOpen, 
  MessageSquare, 
  Zap, 
  Target,
  ArrowRight,
  Languages,
  Swords
} from "lucide-react";

export default function Home() {
  const exercises = [
    { name: "Grammar Lab", desc: "Diagnose and fix grammar mistakes with AI precision.", href: "/grammar", icon: <Sparkles className="text-blue-400" />, color: "#3b82f6" },
    { name: "Neural Speaking Lab", desc: "Rewire your brain to think in English and stop translating from Hindi.", href: "/interview", icon: <Brain className="text-pink-400" />, color: "#ec4899" },
    { name: "Outreach Lab", desc: "Master the psychology of persuasive job & internship messaging.", href: "/outreach", icon: <Target className="text-indigo-400" />, color: "#6366f1" },
    { name: "Debate Room", desc: "Sharpen your logic and fluency by debating AI on hot topics.", href: "/debate", icon: <Swords className="text-red-400" />, color: "#ef4444" },
    { name: "Script Reading", desc: "Master your delivery by roleplaying movie scripts.", href: "/reading", icon: <BookOpen className="text-emerald-400" />, color: "#10b981" },
    { name: "Shadowing", desc: "Perfect your rhythm and native-like intonation.", href: "/shadowing", icon: <MessageSquare className="text-orange-400" />, color: "#f59e0b" },
  ];

  return (
    <div style={{ padding: '2rem 0 6rem' }}>
      {/* Hero Section */}
      <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: '6rem' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          padding: '0.5rem 1rem', 
          background: 'rgba(99, 102, 241, 0.1)', 
          borderRadius: '100px',
          color: 'var(--primary)',
          fontSize: '0.9rem',
          fontWeight: 600,
          marginBottom: '2rem',
          border: '1px solid rgba(99, 102, 241, 0.2)'
        }}>
          <Languages size={16} />
          <span>The Future of English Learning</span>
        </div>
        
        <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', lineHeight: 1.1, marginBottom: '1.5rem', fontWeight: 800 }}>
          Master English with <br />
          <span className="text-primary-gradient">AI Intelligence</span>
        </h1>
        
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto 3rem' }}>
          Stop memorizing. Start communicating. Our AI-powered laboratory helps you diagnose 
          mistakes, practice interviews, and master pronunciation in real-time.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/grammar">
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Start Learning <ArrowRight size={18} />
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="btn-secondary">View Progress</button>
          </Link>
        </div>
      </div>
      
      {/* Exercises Grid */}
      <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Core Modules</h2>
            <p style={{ color: 'var(--text-muted)' }}>Choose an exercise to sharpen your skills</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {exercises.map((ex) => (
            <Link key={ex.href} href={ex.href} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '12px', 
                  background: `${ex.color}15`, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  border: `1px solid ${ex.color}30`
                }}>
                  {ex.icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'white' }}>{ex.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>{ex.desc}</p>
                
                <div style={{ 
                  marginTop: '1.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  color: 'var(--primary)',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}>
                  Practice Now <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .text-blue-400 { color: #60a5fa; }
        .text-purple-400 { color: #c084fc; }
        .text-emerald-400 { color: #34d399; }
        .text-orange-400 { color: #fb923c; }
        .text-yellow-400 { color: #fbbf24; }
        .text-pink-400 { color: #f472b6; }
      `}</style>
    </div>
  );
}
