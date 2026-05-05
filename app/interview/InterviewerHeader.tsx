import React from 'react';
import Lottie from 'lottie-react';

// Use a placeholder or let the user provide the animation data
const animationData = null; 

interface InterviewerHeaderProps {
  question: string;
}

export const InterviewerHeader: React.FC<InterviewerHeaderProps> = ({ question }) => {
  const [hasError, setHasError] = React.useState(false);

  return (
    <header className="interviewer-header" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1.25rem',
      padding: '1.25rem',
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(16px)',
      border: '1px solid var(--glass-border)',
      borderRadius: '20px',
      marginBottom: '1.5rem',
      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)',
      transition: 'all 0.4s ease'
    }}>
      <div style={{ 
        width: 80, 
        height: 80, 
        borderRadius: '50%', 
        background: 'var(--gradient-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        boxShadow: '0 0 20px var(--primary-glow)'
      }}>
        {!hasError && animationData ? (
          <Lottie 
            animationData={animationData} 
            loop={true} 
            onError={() => setHasError(true)}
          />
        ) : (
          <div style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>AI</div>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ 
          fontSize: '0.85rem', 
          color: 'var(--primary)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.1em',
          fontWeight: 600,
          margin: '0 0 0.25rem 0'
        }}>
          Current Question
        </p>
        <h2 style={{ 
          margin: 0, 
          fontSize: '1.25rem', 
          fontWeight: 600,
          color: 'var(--foreground)',
          lineHeight: 1.4
        }}>
          {question || 'Hello! I am your IELTS examiner. Shall we begin with some introductory questions?'}
        </h2>
      </div>
    </header>
  );
};

export default InterviewerHeader;
