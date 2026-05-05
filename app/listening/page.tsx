"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Check, X, Headphones, RefreshCcw } from "lucide-react";

interface ListeningExercise {
  text: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
}

const EXERCISES: ListeningExercise[] = [
  {
    text: "Hello and welcome to today's weather report. We're expecting heavy rainfall in the northern regions throughout the day, with temperatures dropping to around fifteen degrees Celsius. Southern areas will see partial sunshine with temperatures reaching twenty-five degrees. Please drive safely if you're in the northern region.",
    questions: [
      { question: "What is the weather like in northern regions?", options: ["Sunny and warm", "Heavy rainfall and cold", "Partly cloudy", "Snow and ice"], correctAnswer: 1 },
      { question: "What temperature will southern areas reach?", options: ["15°C", "20°C", "25°C", "30°C"], correctAnswer: 2 }
    ]
  },
  {
    text: "The library will be closed for renovations starting next Monday. The project is expected to take approximately three months. During this time, online resources will remain available, and the downtown branch will extend its hours to accommodate affected patrons. We apologize for any inconvenience.",
    questions: [
      { question: "When will the library close?", options: ["Next Friday", "Next Monday", "Next Month", "Tomorrow"], correctAnswer: 1 },
      { question: "How long will renovations take?", options: ["One month", "Two months", "Three months", "Six months"], correctAnswer: 2 }
    ]
  }
];

export default function ListeningComprehension() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [showResults, setShowResults] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const currentExercise = EXERCISES[currentIndex];

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => { synthRef.current?.cancel(); };
  }, []);

  const speak = (rate: number = 1) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(currentExercise.text);
    utterance.lang = "en-US";
    utterance.rate = rate;
    utterance.onend = () => setIsPlaying(false);
    synthRef.current.speak(utterance);
    setIsPlaying(true);
  };

  const stop = () => {
    synthRef.current?.cancel();
    setIsPlaying(false);
  };

  const handleAnswer = (answerIndex: number) => {
    if (showResults) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < currentExercise.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const resetExercise = () => {
    setSelectedAnswers([]);
    setCurrentQuestion(0);
    setShowResults(false);
    stop();
  };

  const nextExercise = () => {
    resetExercise();
    setCurrentIndex(prev => (prev + 1) % EXERCISES.length);
  };

  const currentQ = currentExercise.questions[currentQuestion];
  const score = selectedAnswers.reduce((acc: number, answer, idx) => {
    return answer === currentExercise.questions[idx]?.correctAnswer ? acc + 1 : acc;
  }, 0);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Listening <span className="text-gradient">Comprehension</span></h1>
        <button onClick={resetExercise} className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCcw size={16} /> Reset
        </button>
      </div>

      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Headphones size={24} style={{ color: 'var(--primary)' }} />
          <span style={{ color: 'var(--text-muted)' }}>Exercise {currentIndex + 1} of {EXERCISES.length}</span>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
          <button 
            onClick={() => speak(0.9)}
            disabled={isPlaying}
            className="btn-primary"
            style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {isPlaying ? <><Pause size={18} /> Playing...</> : <><Play size={18} /> Play Audio (0.9x)</>}
          </button>
          <button 
            onClick={stop}
            className="nav-link"
            style={{ padding: '0.75rem 1rem' }}
          >
            Stop
          </button>
        </div>

        {!showResults ? (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>
                Question {currentQuestion + 1} of {currentExercise.questions.length}
              </h3>
              <p style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>{currentQ.question}</p>
            </div>

            <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {currentQ.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  style={{
                    padding: '1rem',
                    background: selectedAnswers[currentQuestion] === idx ? 'rgba(59, 130, 246, 0.2)' : 'var(--secondary)',
                    border: selectedAnswers[currentQuestion] === idx ? '2px solid var(--primary)' : '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'white',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {option}
                </button>
              ))}
            </div>

            <button 
              onClick={nextQuestion}
              className="btn-primary"
              disabled={selectedAnswers[currentQuestion] === null}
              style={{ padding: '0.75rem 2rem' }}
            >
              {currentQuestion < currentExercise.questions.length - 1 ? 'Next Question' : 'See Results'}
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Results</h3>
            <p style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
              Score: <strong>{score}/{currentExercise.questions.length}</strong>
            </p>
            <button onClick={nextExercise} className="btn-primary" style={{ padding: '0.75rem 2rem' }}>
              Next Exercise
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
