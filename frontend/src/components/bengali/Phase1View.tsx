import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, CheckCircle2, X, Volume2, Eraser, Check } from 'lucide-react';
import {
  VOWELS, CONSONANTS, BENGALI_MATRAS, BENGALI_JUKTAKHOR
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

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

const shuffleArray = <T,>(arr: T[]): T[] => {
  return [...arr].sort(() => 0.5 - Math.random());
};

export const Phase1View: React.FC<Phase1ViewProps> = ({
  progress,
  setView,
  speakWord,
  toggleLetterMastery,
  toggleWordMastery,
  fetchProgress,
  token,
}) => {
  const [activeTab, setActiveTab] = useState<'vowels' | 'consonants' | 'matras' | 'juktakhor'>('vowels');
  const [selectedLetter, setSelectedLetter] = useState<any | null>(null);

  // Mark toggleWordMastery as read for typescript
  void toggleWordMastery;

  // Canvas states
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Quiz states
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [currentQuizQ, setCurrentQuizQ] = useState(0);
  const [quizSelectedAns, setQuizSelectedAns] = useState<number | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

  const masteredLettersArray = progress?.masteredLetters ? progress.masteredLetters.split(',').filter(Boolean) : [];

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
    const generated: QuizQuestion[] = [];

    if (activeTab === 'vowels') {
      const shuffledVowels = shuffleArray(VOWELS);
      for (let i = 0; i < Math.min(5, shuffledVowels.length); i++) {
        const v = shuffledVowels[i];
        const qType = Math.floor(Math.random() * 4); // 0: sound, 1: desc, 2: example, 3: match letter
        
        if (qType === 0) {
          const others = shuffleArray(VOWELS.filter(x => x.letter !== v.letter).map(x => x.sound)).slice(0, 3);
          const opts = shuffleArray([v.sound, ...others]);
          generated.push({
            question: `What phonetic sound does the vowel "${v.letter}" make?`,
            options: opts,
            correct: opts.indexOf(v.sound)
          });
        } else if (qType === 1) {
          const others = shuffleArray(VOWELS.filter(x => x.letter !== v.letter).map(x => x.desc)).slice(0, 3);
          const opts = shuffleArray([v.desc, ...others]);
          generated.push({
            question: `Which of the following best describes the pronunciation of the vowel "${v.letter}"?`,
            options: opts,
            correct: opts.indexOf(v.desc)
          });
        } else if (qType === 2) {
          const correctText = `${v.example} (${v.exTrans})`;
          const others = shuffleArray(VOWELS.filter(x => x.letter !== v.letter).map(x => `${x.example} (${x.exTrans})`)).slice(0, 3);
          const opts = shuffleArray([correctText, ...others]);
          generated.push({
            question: `Which of the following is a classic example word starting with the vowel "${v.letter}"?`,
            options: opts,
            correct: opts.indexOf(correctText)
          });
        } else {
          const others = shuffleArray(VOWELS.filter(x => x.letter !== v.letter).map(x => x.letter)).slice(0, 3);
          const opts = shuffleArray([v.letter, ...others]);
          generated.push({
            question: `Which Bengali vowel represents the sound "${v.sound}"?`,
            options: opts,
            correct: opts.indexOf(v.letter)
          });
        }
      }
    } else if (activeTab === 'consonants') {
      const shuffledCons = shuffleArray(CONSONANTS);
      for (let i = 0; i < Math.min(5, shuffledCons.length); i++) {
        const c = shuffledCons[i];
        const qType = Math.floor(Math.random() * 4); // 0: sound, 1: desc, 2: example, 3: match letter
        
        if (qType === 0) {
          const others = shuffleArray(CONSONANTS.filter(x => x.letter !== c.letter).map(x => x.sound)).slice(0, 3);
          const opts = shuffleArray([c.sound, ...others]);
          generated.push({
            question: `What phonetic sound does the consonant "${c.letter}" make?`,
            options: opts,
            correct: opts.indexOf(c.sound)
          });
        } else if (qType === 1) {
          const others = shuffleArray(CONSONANTS.filter(x => x.letter !== c.letter).map(x => x.desc)).slice(0, 3);
          const opts = shuffleArray([c.desc, ...others]);
          generated.push({
            question: `Which of the following best describes the pronunciation of the consonant "${c.letter}"?`,
            options: opts,
            correct: opts.indexOf(c.desc)
          });
        } else if (qType === 2) {
          const correctText = `${c.example} (${c.exTrans})`;
          const others = shuffleArray(CONSONANTS.filter(x => x.letter !== c.letter).map(x => `${x.example} (${x.exTrans})`)).slice(0, 3);
          const opts = shuffleArray([correctText, ...others]);
          generated.push({
            question: `Which of the following is a classic example word starting with the consonant "${c.letter}"?`,
            options: opts,
            correct: opts.indexOf(correctText)
          });
        } else {
          const others = shuffleArray(CONSONANTS.filter(x => x.letter !== c.letter).map(x => x.letter)).slice(0, 3);
          const opts = shuffleArray([c.letter, ...others]);
          generated.push({
            question: `Which Bengali consonant represents the sound "${c.sound}"?`,
            options: opts,
            correct: opts.indexOf(c.letter)
          });
        }
      }
    } else if (activeTab === 'matras') {
      const shuffledMatras = shuffleArray(BENGALI_MATRAS);
      for (let i = 0; i < Math.min(5, shuffledMatras.length); i++) {
        const m = shuffledMatras[i];
        const qType = Math.floor(Math.random() * 4); // 0: symbol for name, 1: sound for symbol, 2: example for symbol, 3: meaning of example
        
        if (qType === 0) {
          const others = shuffleArray(BENGALI_MATRAS.filter(x => x.symbol !== m.symbol).map(x => x.symbol)).slice(0, 3);
          const opts = shuffleArray([m.symbol, ...others]);
          generated.push({
            question: `Which symbol represents the Matra "${m.name}"?`,
            options: opts,
            correct: opts.indexOf(m.symbol)
          });
        } else if (qType === 1) {
          const others = shuffleArray(BENGALI_MATRAS.filter(x => x.symbol !== m.symbol).map(x => x.sound)).slice(0, 3);
          const opts = shuffleArray([m.sound, ...others]);
          generated.push({
            question: `What phonetic sound does the Matra symbol "${m.symbol}" make?`,
            options: opts,
            correct: opts.indexOf(m.sound)
          });
        } else if (qType === 2) {
          const others = shuffleArray(BENGALI_MATRAS.filter(x => x.symbol !== m.symbol).map(x => x.example)).slice(0, 3);
          const opts = shuffleArray([m.example, ...others]);
          generated.push({
            question: `Which of the following is an example of using the Matra "${m.symbol}" in a syllable/word?`,
            options: opts,
            correct: opts.indexOf(m.example)
          });
        } else {
          const others = shuffleArray(BENGALI_MATRAS.filter(x => x.symbol !== m.symbol).map(x => x.meaning)).slice(0, 3);
          const opts = shuffleArray([m.meaning, ...others]);
          generated.push({
            question: `What is the meaning of the example word "${m.example}" (which uses the Matra "${m.symbol}")?`,
            options: opts,
            correct: opts.indexOf(m.meaning)
          });
        }
      }
    } else {
      // juktakhor
      const shuffledJuk = shuffleArray(BENGALI_JUKTAKHOR);
      for (let i = 0; i < Math.min(5, shuffledJuk.length); i++) {
        const j = shuffledJuk[i];
        const qType = Math.floor(Math.random() * 4); // 0: components, 1: sound, 2: name, 3: example word
        
        if (qType === 0) {
          const others = shuffleArray(BENGALI_JUKTAKHOR.filter(x => x.symbol !== j.symbol).map(x => x.components)).slice(0, 3);
          const opts = shuffleArray([j.components, ...others]);
          generated.push({
            question: `What are the constituent characters in the Juktakhor (conjunct) "${j.symbol}"?`,
            options: opts,
            correct: opts.indexOf(j.components)
          });
        } else if (qType === 1) {
          const others = shuffleArray(BENGALI_JUKTAKHOR.filter(x => x.symbol !== j.symbol).map(x => x.sound)).slice(0, 3);
          const opts = shuffleArray([j.sound, ...others]);
          generated.push({
            question: `What phonetic sound does the Juktakhor (conjunct) "${j.symbol}" represent?`,
            options: opts,
            correct: opts.indexOf(j.sound)
          });
        } else if (qType === 2) {
          const others = shuffleArray(BENGALI_JUKTAKHOR.filter(x => x.symbol !== j.symbol).map(x => x.name)).slice(0, 3);
          const opts = shuffleArray([j.name, ...others]);
          generated.push({
            question: `What is the phonetic name of the Juktakhor conjunct "${j.symbol}"?`,
            options: opts,
            correct: opts.indexOf(j.name)
          });
        } else {
          const correctText = `${j.example} (${j.meaning})`;
          const others = shuffleArray(BENGALI_JUKTAKHOR.filter(x => x.symbol !== j.symbol).map(x => `${x.example} (${x.meaning})`)).slice(0, 3);
          const opts = shuffleArray([correctText, ...others]);
          generated.push({
            question: `Which of the following is a classic example word using the Juktakhor "${j.symbol}"?`,
            options: opts,
            correct: opts.indexOf(correctText)
          });
        }
      }
    }

    setQuizQuestions(generated);
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

    const isCorrect = quizSelectedAns === quizQuestions[currentQuizQ].correct;
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
        <h1 className="font-serif" style={{ fontSize: '24px' }}>Phase 1: Basic Alphabets & Script</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '20px', overflowX: 'auto' }}>
        {(['vowels', 'consonants', 'matras', 'juktakhor'] as const).map(tab => (
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

      {/* Practice Quiz Trigger */}
      <div className="text-center" style={{ marginTop: '32px' }}>
        <button
          onClick={startPhaseQuiz}
          className="btn-primary"
          style={{ width: '100%' }}
        >
          Take Phase 1 Practice Quiz
        </button>
      </div>

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
                  {quizQuestions[currentQuizQ]?.question}
                </h3>

                <div className="flex flex-col gap-2 mb-6">
                  {quizQuestions[currentQuizQ]?.options.map((opt, idx) => (
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
