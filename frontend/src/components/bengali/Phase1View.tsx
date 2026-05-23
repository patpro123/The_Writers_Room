import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, CheckCircle2, X, Volume2, Eraser, Check, BookOpen } from 'lucide-react';
import {
  VOWELS, CONSONANTS, BENGALI_MATRAS, BENGALI_JUKTAKHOR, BASIC_PRIMERS,
  DIAGNOSTIC_QUESTIONS
} from './bengaliData';
import type { BengaliProgress } from './bengaliData';
import { API_BASE_URL } from '../../config';

interface Phase1ViewProps {
  progress: BengaliProgress | null;
  setView: (view: 'dashboard') => void;
  speakWord: (text: string) => void;
  toggleLetterMastery: (letter: string, isMastered: boolean) => Promise<void>;
  toggleWordMastery: (word: string, isMastered: boolean) => Promise<void>;
  fetchProgress: () => Promise<void>;
  token: string;
}

export const Phase1View: React.FC<Phase1ViewProps> = ({
  progress,
  setView,
  speakWord,
  toggleLetterMastery,
  toggleWordMastery,
  fetchProgress,
  token,
}) => {
  const [activeTab, setActiveTab] = useState<'vowels' | 'consonants' | 'matras' | 'juktakhor' | 'primers'>('vowels');
  const [selectedLetter, setSelectedLetter] = useState<any | null>(null);
  const [activePrimerIdx, setActivePrimerIdx] = useState<number>(0);

  // Canvas states
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Quiz states
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [currentQuizQ, setCurrentQuizQ] = useState(0);
  const [quizSelectedAns, setQuizSelectedAns] = useState<number | null>(null);

  const masteredLettersArray = progress?.masteredLetters ? progress.masteredLetters.split(',').filter(Boolean) : [];
  const masteredWordsArray = progress?.masteredWords ? progress.masteredWords.split(',').filter(Boolean) : [];

  // Drawing Canvas setup
  useEffect(() => {
    if (selectedLetter && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = 300 * 2; // high res
      canvas.height = 300 * 2;
      canvas.style.width = '300px';
      canvas.style.height = '300px';

      const context = canvas.getContext('2d');
      if (context) {
        context.scale(2, 2);
        context.lineCap = 'round';
        context.strokeStyle = 'var(--color-primary)';
        context.lineWidth = 6;
        contextRef.current = context;

        // Draw the background watermark letter
        context.font = 'bold 150px Merriweather, serif';
        context.fillStyle = 'rgba(140, 74, 50, 0.1)';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        const symbol = selectedLetter.letter || selectedLetter.symbol;
        context.fillText(symbol, 150, 140);
      }
    }
  }, [selectedLetter]);

  const startDrawing = ({ nativeEvent }: React.MouseEvent | React.TouchEvent) => {
    let clientX, clientY;
    if ('touches' in nativeEvent) {
      clientX = nativeEvent.touches[0].clientX;
      clientY = nativeEvent.touches[0].clientY;
    } else {
      clientX = nativeEvent.clientX;
      clientY = nativeEvent.clientY;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect && contextRef.current) {
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      contextRef.current.beginPath();
      contextRef.current.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const draw = ({ nativeEvent }: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !contextRef.current) return;

    let clientX, clientY;
    if ('touches' in nativeEvent) {
      clientX = nativeEvent.touches[0].clientX;
      clientY = nativeEvent.touches[0].clientY;
    } else {
      clientX = nativeEvent.clientX;
      clientY = nativeEvent.clientY;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      contextRef.current.lineTo(x, y);
      contextRef.current.stroke();
    }
  };

  const stopDrawing = () => {
    if (contextRef.current) {
      contextRef.current.closePath();
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (canvasRef.current && contextRef.current && selectedLetter) {
      const canvas = canvasRef.current;
      contextRef.current.clearRect(0, 0, canvas.width, canvas.height);

      // Redraw watermark
      contextRef.current.font = 'bold 150px Merriweather, serif';
      contextRef.current.fillStyle = 'rgba(140, 74, 50, 0.1)';
      contextRef.current.textAlign = 'center';
      contextRef.current.textBaseline = 'middle';
      const symbol = selectedLetter.letter || selectedLetter.symbol;
      contextRef.current.fillText(symbol, 150, 140);
    }
  };

  // Quiz Handlers
  const startPhaseQuiz = () => {
    setQuizScore(0);
    setCurrentQuizQ(0);
    setQuizSelectedAns(null);
    setShowQuiz(true);
  };

  const handleQuizAnswer = (index: number) => {
    setQuizSelectedAns(index);
  };

  const submitQuizAnswer = async () => {
    if (quizSelectedAns === null) return;

    const isCorrect = quizSelectedAns === DIAGNOSTIC_QUESTIONS[currentQuizQ].correct;
    let newScore = quizScore;
    if (isCorrect) {
      newScore += 1;
      setQuizScore(newScore);
    }

    if (currentQuizQ + 1 < 5) {
      setCurrentQuizQ(prev => prev + 1);
      setQuizSelectedAns(null);
    } else {
      // Save quiz score
      try {
        await fetch(`${API_BASE_URL}/api/progress/bengali/quiz`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ phase: 1, score: Math.round((newScore / 5) * 100) })
        });
        setCurrentQuizQ(5); // finished view
      } catch (e) {
        console.error(e);
        setCurrentQuizQ(5);
      }
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <button onClick={() => setView('dashboard')} style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-serif" style={{ fontSize: '24px' }}>Phase 1: Basic Alphabets & Primers</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '20px', overflowX: 'auto' }}>
        {(['vowels', 'consonants', 'matras', 'juktakhor', 'primers'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 16px',
              fontWeight: 600,
              borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : 'none',
              color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-muted)',
              whiteSpace: 'nowrap',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {tab === 'vowels' && 'Vowels (স্বরবর্ণ)'}
            {tab === 'consonants' && 'Consonants (ব্যঞ্জনবর্ণ)'}
            {tab === 'matras' && 'Matras (কার চিহ্ন)'}
            {tab === 'juktakhor' && 'Juktakhor (যুক্তাক্ষর)'}
            {tab === 'primers' && 'Primers (সহজ পাঠ)'}
          </button>
        ))}
      </div>

      {/* Grids / Primers Content */}
      {activeTab === 'vowels' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {VOWELS.map(item => {
            const isMastered = masteredLettersArray.includes(item.letter);
            return (
              <div
                key={item.letter}
                onClick={() => setSelectedLetter(item)}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: `1px solid ${isMastered ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative'
                }}
              >
                {isMastered && (
                  <CheckCircle2 size={12} color="var(--color-primary)" style={{ position: 'absolute', top: '4px', right: '4px' }} />
                )}
                <span style={{ fontSize: '28px', fontWeight: 'bold', fontFamily: 'Merriweather' }}>{item.letter}</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>{item.sound}</span>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'consonants' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {CONSONANTS.map(item => {
            const isMastered = masteredLettersArray.includes(item.letter);
            return (
              <div
                key={item.letter}
                onClick={() => setSelectedLetter(item)}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: `1px solid ${isMastered ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative'
                }}
              >
                {isMastered && (
                  <CheckCircle2 size={12} color="var(--color-primary)" style={{ position: 'absolute', top: '4px', right: '4px' }} />
                )}
                <span style={{ fontSize: '28px', fontWeight: 'bold', fontFamily: 'Merriweather' }}>{item.letter}</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>{item.sound}</span>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'matras' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {BENGALI_MATRAS.map(item => {
            const isMastered = masteredLettersArray.includes(item.symbol);
            return (
              <div
                key={item.symbol}
                onClick={() => setSelectedLetter({
                  letter: item.symbol,
                  sound: item.sound,
                  desc: item.name,
                  example: item.example,
                  exTrans: item.meaning
                })}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: `1px solid ${isMastered ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative'
                }}
              >
                {isMastered && (
                  <CheckCircle2 size={12} color="var(--color-primary)" style={{ position: 'absolute', top: '4px', right: '4px' }} />
                )}
                <span style={{ fontSize: '28px', fontWeight: 'bold', fontFamily: 'Merriweather' }}>{item.symbol}</span>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>{item.name.split(' ')[0]}</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>sound: {item.sound}</span>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'juktakhor' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {BENGALI_JUKTAKHOR.map(item => {
            const isMastered = masteredLettersArray.includes(item.symbol);
            return (
              <div
                key={item.symbol}
                onClick={() => setSelectedLetter({
                  letter: item.symbol,
                  sound: item.sound,
                  desc: `${item.name} (${item.components})`,
                  example: item.example,
                  exTrans: item.meaning
                })}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: `1px solid ${isMastered ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative'
                }}
              >
                {isMastered && (
                  <CheckCircle2 size={12} color="var(--color-primary)" style={{ position: 'absolute', top: '4px', right: '4px' }} />
                )}
                <span style={{ fontSize: '28px', fontWeight: 'bold', fontFamily: 'Merriweather' }}>{item.symbol}</span>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>{item.name}</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{item.components}</span>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'primers' && (
        <div>
          {/* Primer selector buttons */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            {BASIC_PRIMERS.map((primer, idx) => (
              <button
                key={primer.title}
                onClick={() => setActivePrimerIdx(idx)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: activePrimerIdx === idx ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: activePrimerIdx === idx ? 'white' : 'var(--color-text)',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <BookOpen size={16} /> {primer.title.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Selected Primer Details */}
          <div style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            animation: 'fadeIn 0.3s'
          }}>
            <h2 className="font-serif mb-1" style={{ fontSize: '22px' }}>{BASIC_PRIMERS[activePrimerIdx].title}</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
              Author: <strong>{BASIC_PRIMERS[activePrimerIdx].author}</strong> (Basic Primer Reading Material)
            </p>

            {/* Primer Vocabulary */}
            <h3 className="font-serif mb-3" style={{ fontSize: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
              Vocabulary Words (শব্দাবলী)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
              {BASIC_PRIMERS[activePrimerIdx].words.map(w => {
                const isMastered = masteredWordsArray.includes(w.word);
                return (
                  <div
                    key={w.word}
                    style={{
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px',
                      backgroundColor: 'var(--color-bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <span className="font-serif" style={{ fontSize: '18px', fontWeight: 'bold' }}>{w.word}</span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginLeft: '8px' }}>({w.sound})</span>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{w.meaning}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => speakWord(w.word)}
                        style={{ padding: '6px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}
                      >
                        <Volume2 size={16} />
                      </button>
                      <button
                        onClick={() => toggleWordMastery(w.word, isMastered)}
                        style={{
                          padding: '6px',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          color: isMastered ? 'var(--color-primary)' : 'var(--color-text-muted)'
                        }}
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Primer Sentences */}
            <h3 className="font-serif mb-3" style={{ fontSize: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
              Reading Practice (পঠন অনুশীলন)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {BASIC_PRIMERS[activePrimerIdx].sentences.map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-serif text-primary" style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-primary)' }}>{s.text}</span>
                    <button
                      onClick={() => speakWord(s.text)}
                      className="btn-secondary"
                      style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                    >
                      <Volume2 size={14} /> Listen
                    </button>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                    Pronunciation: {s.sound}
                  </div>
                  <div style={{ fontSize: '13px' }}>
                    Translation: {s.translation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Practice Quiz Trigger */}
      {activeTab !== 'primers' && (
        <div className="text-center" style={{ marginTop: '32px' }}>
          <button
            onClick={startPhaseQuiz}
            className="btn-primary"
            style={{ width: '100%' }}
          >
            Take Phase 1 Practice Quiz
          </button>
        </div>
      )}

      {/* Detailed letter modal overlay */}
      {selectedLetter && (
        <div className="overlay" style={{ padding: '16px' }} onClick={() => setSelectedLetter(null)}>
          <div className="modal" style={{ width: '100%', maxWidth: '360px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                Character Study
              </span>
              <button onClick={() => setSelectedLetter(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '44px',
                fontWeight: 'bold',
                fontFamily: 'Merriweather'
              }}>
                {selectedLetter.letter}
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <h3 className="font-serif" style={{ fontSize: '22px' }}>Pronounced: "{selectedLetter.sound}"</h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{selectedLetter.desc}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <button
                onClick={() => speakWord(selectedLetter.letter)}
                className="btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, padding: '10px', fontSize: '13px', justifyContent: 'center' }}
              >
                <Volume2 size={16} /> Listen Letter
              </button>
              <button
                onClick={() => speakWord(selectedLetter.example)}
                className="btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, padding: '10px', fontSize: '13px', justifyContent: 'center' }}
              >
                <Volume2 size={16} /> Listen Word
              </button>
            </div>

            <div style={{ backgroundColor: 'var(--color-bg)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '13px', textAlign: 'left' }}>
              <strong>Example Vocabulary:</strong><br />
              <span className="font-serif" style={{ fontSize: '18px', color: 'var(--color-primary)' }}>{selectedLetter.example}</span>
              <span style={{ color: 'var(--color-text-muted)', marginLeft: '8px' }}>({selectedLetter.exTrans})</span>
            </div>

            {/* Tracing canvas watermark */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                Draw & Practice Stroke Order
              </div>
              <div style={{ position: 'relative', width: '300px', height: '300px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: '#fff', overflow: 'hidden' }}>
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                <button
                  onClick={clearCanvas}
                  style={{ position: 'absolute', bottom: '12px', right: '12px', padding: '6px', borderRadius: '50%', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                >
                  <Eraser size={16} />
                </button>
              </div>
            </div>

            {/* Mastery toggle */}
            <button
              onClick={() => {
                const alreadyMastered = masteredLettersArray.includes(selectedLetter.letter);
                toggleLetterMastery(selectedLetter.letter, alreadyMastered);
              }}
              className="btn-primary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {masteredLettersArray.includes(selectedLetter.letter) ? (
                <> <Check size={16} /> Mastered! (Click to Undo) </>
              ) : (
                <> Mark as Mastered (+10 XP) </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Phase Quiz Modal */}
      {showQuiz && (
        <div className="overlay" style={{ padding: '16px' }}>
          <div className="modal" style={{ width: '100%', maxWidth: '380px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                Phase 1 Quiz
              </span>
              <button onClick={() => setShowQuiz(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {currentQuizQ < 5 ? (
              <div style={{ textAlign: 'left' }}>
                <h3 className="font-serif mb-6" style={{ fontSize: '20px' }}>
                  {DIAGNOSTIC_QUESTIONS[currentQuizQ].question}
                </h3>

                <div className="flex flex-col gap-2 mb-6">
                  {DIAGNOSTIC_QUESTIONS[currentQuizQ].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuizAnswer(idx)}
                      style={{
                        textAlign: 'left',
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${quizSelectedAns === idx ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        backgroundColor: quizSelectedAns === idx ? 'rgba(140, 74, 50, 0.05)' : 'var(--color-bg)',
                        fontSize: '14px',
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                <button
                  onClick={submitQuizAnswer}
                  disabled={quizSelectedAns === null}
                  className="btn-primary"
                  style={{ width: '100%', opacity: quizSelectedAns === null ? 0.6 : 1 }}
                >
                  Submit Answer
                </button>
              </div>
            ) : (
              <div className="text-center">
                <h3 className="font-serif mb-2" style={{ fontSize: '24px' }}>Quiz Finished!</h3>
                <div style={{ fontSize: '44px', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '16px' }}>
                  {quizScore} / 5
                </div>
                <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
                  {quizScore === 5 ? "Excellent! Perfect score earned." : "Great attempt! Keep practicing."}
                </p>
                <button
                  onClick={() => {
                    setShowQuiz(false);
                    fetchProgress();
                  }}
                  className="btn-primary"
                  style={{ width: '100%' }}
                >
                  Back to Study
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
