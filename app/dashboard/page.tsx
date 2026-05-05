"use client";

import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, Award, Clock, Target, ChevronRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

const MOCK_DATA = [
  { day: 'Mon', band: 6.0, wpm: 95 },
  { day: 'Tue', band: 6.5, wpm: 102 },
  { day: 'Wed', band: 6.5, wpm: 108 },
  { day: 'Thu', band: 7.0, wpm: 115 },
  { day: 'Fri', band: 7.5, wpm: 122 },
  { day: 'Sat', band: 7.5, wpm: 130 },
  { day: 'Sun', band: 8.0, wpm: 135 },
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    avgBand: 7.5,
    totalSessions: 24,
    topVocabulary: "Ameliorate",
    streak: 12
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '5rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Your <span className="text-primary-gradient">Progress Analytics</span>
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Visualize your journey to Band 8+ fluency.</p>
      </header>

      {/* Top Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        {[
          { label: 'Current Band', value: stats.avgBand, icon: Award, color: 'var(--primary)' },
          { label: 'Total Practice', value: stats.totalSessions, icon: Clock, color: 'var(--accent)' },
          { label: 'Top Vocab', value: stats.topVocabulary, icon: Target, color: 'var(--primary)' },
          { label: 'Day Streak', value: stats.streak, icon: Zap, color: 'var(--error)' },
        ].map((s, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1 }}
            className="card" 
            style={{ textAlign: 'center' }}
          >
            <div style={{ background: s.color, width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'white' }}>
              <s.icon size={20} />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginTop: '0.25rem' }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        
        {/* Band Score Progress Chart */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} /> Band Score Trend
          </h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_DATA}>
                <defs>
                  <linearGradient id="colorBand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} domain={[5, 9]} />
                <Tooltip 
                  contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px' }}
                  itemStyle={{ color: 'var(--primary)' }}
                />
                <Area type="monotone" dataKey="band" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorBand)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fluency / WPM Chart */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={20} /> Speaking Fluency (WPM)
          </h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px' }}
                />
                <Line type="stepAfter" dataKey="wpm" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4, fill: 'var(--accent)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recent Mistakes / Recommendations */}
      <div style={{ marginTop: '3rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Weak Areas to Strengthen</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="card" style={{ borderLeft: '4px solid var(--error)' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Subject-Verb Agreement</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>You often say "He don't" instead of "He doesn't". Practice in Grammar Lab.</p>
            <button className="nav-link" style={{ marginTop: '1rem', padding: 0, fontSize: '0.85rem' }}>Practice Now <ChevronRight size={14} /></button>
          </div>
          <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Lexical Resource (Synonyms)</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>You use "important" too much. Try: "Pivotal", "Crucial", or "Paramount".</p>
            <button className="nav-link" style={{ marginTop: '1rem', padding: 0, fontSize: '0.85rem' }}>Explore Vocab <ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
