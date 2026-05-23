import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Volume2, Mic, Keyboard, CheckCircle2, AlertCircle, X, RefreshCw, BookOpen } from 'lucide-react';
import { VOCAB_WORDS, BASIC_PRIMERS } from './bengaliData';
import type { BengaliProgress } from './bengaliData';
import { API_BASE_URL } from '../../config';

interface Phase2ViewProps {
  progress: BengaliProgress | null;
  setView: (view: 'dashboard') => void;
  speakWord: (text: string) => void;
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

export const Phase2View: React.FC<Phase2ViewProps> = ({
  progress,
  setView,
  speakWord,
  toggleWordMastery,
  fetchProgress,
  token,
}) => {
  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<'vocab' | 'primers'>('vocab');
  const [activePrimerIdx, setActivePrimerIdx] = useState<number>(0);
  const [displayedWords, setDisplayedWords] = useState<typeof VOCAB_WORDS>([]);

  // Speech states
  const [isListening, setIsListening] = useState(false);
  const [speechSuccess, setSpeechSuccess] = useState<boolean | null>(null);
  const [spokenText, setSpokenText] = useState("");
  const [micError, setMicError] = useState("");
  const recognitionRef = useRef<any>(null);

  // Typing states
  const [typingTarget, setTypingTarget] = useState<any | null>(null);
  const [typingInput, setTypingInput] = useState("");
  const [typingSuccess, setTypingSuccess] = useState<boolean | null>(null);

  // Quiz states
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [currentQuizQ, setCurrentQuizQ] = useState(0);
  const [quizSelectedAns, setQuizSelectedAns] = useState<number | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

  const masteredWordsArray = progress?.masteredWords ? progress.masteredWords.split(',').filter(Boolean) : [];

  const generateNewWords = () => {
    // Shuffle VOCAB_WORDS and pick 6 random ones
    const shuffled = [...VOCAB_WORDS].sort(() => 0.5 - Math.random());
    setDisplayedWords(shuffled.slice(0, 6));
  };

  useEffect(() => {
    generateNewWords();
  }, []);

  // Speech recognition
  const startSpeechRecognition = (targetWord: string) => {
    setMicError("");
    setSpeechSuccess(null);
    setSpokenText("");

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicError("Speech recognition is not supported in this browser.");
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = 'bn-BD';
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript.trim();
        setSpokenText(transcript);

        // Clean both strings of punctuation for comparison
        const cleanTranscript = transcript.replace(/[।,.:?!]/g, '').trim();
        const cleanTarget = targetWord.replace(/[।,.:?!]/g, '').trim();

        if (cleanTranscript === cleanTarget || cleanTranscript.includes(cleanTarget) || cleanTarget.includes(cleanTranscript)) {
          setSpeechSuccess(true);
          try {
            await fetch(`${API_BASE_URL}/api/progress/bengali/word`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ word: targetWord, mastered: false, isSpoken: true })
            });
            await fetchProgress();
          } catch (e) {
            console.error("Error saving speaking progress", e);
          }
        } else {
          setSpeechSuccess(false);
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech Recognition Error", event.error);
        if (event.error === 'not-allowed') {
          setMicError("Microphone access denied. Please check permissions.");
        } else {
          setMicError(`Speech error: ${event.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      console.error(e);
      setMicError("Failed to initiate microphone.");
    }
  };

  const checkTypingResult = async () => {
    if (!typingTarget) return;

    const cleanTarget = typingTarget.text.trim().replace(/[।.?!,]/g, "");
    const cleanInput = typingInput.trim().replace(/[।.?!,]/g, "");

    const isCorrect = cleanTarget === cleanInput;
    setTypingSuccess(isCorrect);

    if (isCorrect) {
      try {
        await fetch(`${API_BASE_URL}/api/progress/bengali/quiz`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ phase: progress?.currentPhase || 2, score: 0 })
        });
        await fetchProgress();
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Dynamic Quiz Generator for Phase 2
  const startPhaseQuiz = () => {
    const generated: QuizQuestion[] = [];

    // Q1: Vocab word translation (English to Bengali)
    const w1 = VOCAB_WORDS[Math.floor(Math.random() * VOCAB_WORDS.length)];
    const w1Others = shuffleArray(VOCAB_WORDS.filter(w => w.word !== w1.word).map(w => w.word)).slice(0, 3);
    const q1Opts = shuffleArray([w1.word, ...w1Others]);
    generated.push({
      question: `Which of the following is the Bengali word for "${w1.meaning}"?`,
      options: q1Opts,
      correct: q1Opts.indexOf(w1.word)
    });

    // Q2: Vocab word translation (Bengali to English)
    const w2 = VOCAB_WORDS[Math.floor(Math.random() * VOCAB_WORDS.length)];
    const w2Others = shuffleArray(VOCAB_WORDS.filter(w => w.word !== w2.word).map(w => w.meaning)).slice(0, 3);
    const q2Opts = shuffleArray([w2.meaning, ...w2Others]);
    generated.push({
      question: `What does the Bengali word "${w2.word}" (${w2.sound}) mean in English?`,
      options: q2Opts,
      correct: q2Opts.indexOf(w2.meaning)
    });

    // Q3: Primer word meaning
    const allPrimerWords = BASIC_PRIMERS.flatMap(p => p.words);
    const pw = allPrimerWords[Math.floor(Math.random() * allPrimerWords.length)];
    const pwOthers = shuffleArray(allPrimerWords.filter(w => w.word !== pw.word).map(w => w.meaning)).slice(0, 3);
    const q3Opts = shuffleArray([pw.meaning, ...pwOthers]);
    generated.push({
      question: `In the primary readings (Borno Porichoy/Sahaj Path), what does "${pw.word}" mean?`,
      options: q3Opts,
      correct: q3Opts.indexOf(pw.meaning)
    });

    // Q4: Primer sentence translation
    const allPrimerSentences = BASIC_PRIMERS.flatMap(p => p.sentences);
    const ps1 = allPrimerSentences[Math.floor(Math.random() * allPrimerSentences.length)];
    const ps1Others = shuffleArray(allPrimerSentences.filter(s => s.text !== ps1.text).map(s => s.translation)).slice(0, 3);
    const q4Opts = shuffleArray([ps1.translation, ...ps1Others]);
    generated.push({
      question: `Translate this primary reading sentence: "${ps1.text}"`,
      options: q4Opts,
      correct: q4Opts.indexOf(ps1.translation)
    });

    // Q5: Primer sentence pronunciation
    const ps2 = allPrimerSentences[Math.floor(Math.random() * allPrimerSentences.length)];
    const ps2Others = shuffleArray(allPrimerSentences.filter(s => s.text !== ps2.text).map(s => s.sound)).slice(0, 3);
    const q5Opts = shuffleArray([ps2.sound, ...ps2Others]);
    generated.push({
      question: `How is the classic line "${ps2.text}" pronounced phonetically?`,
      options: q5Opts,
      correct: q5Opts.indexOf(ps2.sound)
    });

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
          body: JSON.stringify({ phase: 2, score: Math.round((newScore / 5) * 100) })
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
        <h1 className="font-serif" style={{ fontSize: '24px' }}>Phase 2: Vocabulary, Speech & Primers</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('vocab')}
          style={{
            padding: '12px 16px',
            fontWeight: 600,
            borderBottom: activeTab === 'vocab' ? '2px solid var(--color-primary)' : 'none',
            color: activeTab === 'vocab' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Vocabulary & Speech (শব্দাবলী)
        </button>
        <button
          onClick={() => setActiveTab('primers')}
          style={{
            padding: '12px 16px',
            fontWeight: 600,
            borderBottom: activeTab === 'primers' ? '2px solid var(--color-primary)' : 'none',
            color: activeTab === 'primers' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Basic Primers (সহজ পাঠ ও বর্ণপরিচয়)
        </button>
      </div>

      {activeTab === 'vocab' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', textAlign: 'left', margin: 0 }}>
              Practice speaking, listening, and typing on this set of vocabulary words. Use the refresh button to get a new set.
            </p>
            <button 
              onClick={generateNewWords} 
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '13px', whiteSpace: 'nowrap' }}
            >
              <RefreshCw size={14} /> Refresh Word Set
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {displayedWords.map(item => {
              const isMastered = masteredWordsArray.includes(item.word);
              return (
                <div 
                  key={item.word}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${isMastered ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ textAlign: 'left' }}>
                      <h3 className="font-serif" style={{ fontSize: '20px', color: 'var(--color-primary)' }}>{item.word}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                        <strong>{item.sound}</strong> — {item.meaning}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => speakWord(item.word)}
                        style={{
                          padding: '8px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-bg)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-primary)',
                          cursor: 'pointer'
                        }}
                        title="Read Aloud"
                      >
                        <Volume2 size={16} />
                      </button>
                      <button 
                        onClick={() => startSpeechRecognition(item.word)}
                        style={{
                          padding: '8px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-bg)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-primary)',
                          cursor: 'pointer'
                        }}
                        title="Practice Pronunciation"
                      >
                        <Mic size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          setTypingTarget({ text: item.word, type: 'word', pronunciation: item.sound, translation: item.meaning });
                          setTypingInput("");
                          setTypingSuccess(null);
                        }}
                        style={{
                          padding: '8px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-bg)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-primary)',
                          cursor: 'pointer'
                        }}
                        title="Practice Typing"
                      >
                        <Keyboard size={16} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-bg)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      Practice microphone audio check to earn XP
                    </span>
                    
                    <button 
                      onClick={() => toggleWordMastery(item.word, isMastered)}
                      style={{
                        fontSize: '12px',
                        color: isMastered ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {isMastered ? (
                        <> <CheckCircle2 size={14} /> Mastered </>
                      ) : (
                        <> Mark Mastered (+15 XP) </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
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
      <div className="text-center" style={{ marginTop: '32px' }}>
        <button 
          onClick={startPhaseQuiz}
          className="btn-primary" 
          style={{ width: '100%' }}
        >
          Take Phase 2 Practice Quiz
        </button>
      </div>

      {/* Phase Quiz Modal */}
      {showQuiz && (
        <div className="overlay" style={{ padding: '16px' }}>
          <div className="modal" style={{ width: '100%', maxWidth: '380px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                Phase 2 Quiz
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

      {/* Microphone Recognition Modal */}
      {isListening && (
        <div className="overlay">
          <div className="modal text-center" style={{ width: '100%', maxWidth: '300px' }} onClick={e => e.stopPropagation()}>
            <div style={{ animation: 'pulse 1.5s infinite', display: 'inline-flex', padding: '16px', borderRadius: '50%', backgroundColor: 'rgba(140, 74, 50, 0.1)', color: 'var(--color-primary)', marginBottom: '16px' }}>
              <Mic size={32} />
            </div>
            <h3 className="font-serif mb-2">Listening...</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
              Pronounce the word into your microphone now.
            </p>
            <button
              onClick={() => {
                if (recognitionRef.current) recognitionRef.current.stop();
                setIsListening(false);
              }}
              className="btn-secondary"
              style={{ width: '100%' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Microphone Result Overlay */}
      {(speechSuccess !== null || micError) && (
        <div className="overlay">
          <div className="modal text-center" style={{ width: '100%', maxWidth: '320px' }} onClick={e => e.stopPropagation()}>
            {micError ? (
              <>
                <AlertCircle size={48} color="#EF4444" className="mb-4" style={{ display: 'inline-block' }} />
                <h3 className="font-serif mb-2">Microphone Error</h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
                  {micError}
                </p>
              </>
            ) : speechSuccess ? (
              <>
                <CheckCircle2 size={48} color="var(--color-primary)" className="mb-4" style={{ display: 'inline-block' }} />
                <h3 className="font-serif mb-2">Excellent Pronunciation!</h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                  You spoke: <strong>"{spokenText}"</strong>
                </p>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '24px' }}>
                  Awarded +10 XP!
                </p>
              </>
            ) : (
              <>
                <X size={48} color="#EF4444" className="mb-4" style={{ display: 'inline-block', border: '2px solid #EF4444', borderRadius: '50%', padding: '8px' }} />
                <h3 className="font-serif mb-2">Try Again</h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                  Spoken audio evaluated as: <strong>"{spokenText || "(unrecognized)"}"</strong>
                </p>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
                  Please speak clearly and close to your microphone.
                </p>
              </>
            )}

            <button
              onClick={() => {
                setSpeechSuccess(null);
                setMicError("");
              }}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Typing Practice Modal */}
      {typingTarget && (
        <div className="overlay" style={{ zIndex: 1000 }}>
          <div className="modal" style={{ width: '95%', maxWidth: '500px', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="font-serif" style={{ fontSize: '18px' }}>Typing Practice (টাইপিং অনুশীলন)</h3>
              <button onClick={() => setTypingTarget(null)} style={{ color: 'var(--color-text-muted)', border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '20px', padding: '16px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                Target text
              </div>
              <div className="font-serif" style={{ fontSize: '28px', color: 'var(--color-primary)', fontWeight: 'bold', marginBottom: '8px' }}>
                {typingTarget.text}
              </div>
              {typingTarget.pronunciation && (
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  Pronunciation: <strong>{typingTarget.pronunciation}</strong>
                </div>
              )}
              {typingTarget.translation && (
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  Translation: <em>{typingTarget.translation}</em>
                </div>
              )}
            </div>

            {/* Text Input */}
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                value={typingInput}
                onChange={e => {
                  setTypingInput(e.target.value);
                  setTypingSuccess(null);
                }}
                placeholder="Type in Bengali here..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${typingSuccess === true ? '#10B981' : typingSuccess === false ? '#EF4444' : 'var(--color-border)'}`,
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: '18px',
                  textAlign: 'center',
                  outline: 'none'
                }}
                autoFocus
              />
            </div>

            {/* Bengali Helper Keyboard */}
            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  Bengali Character Helper:
                </span>
                <button
                  onClick={() => {
                    setTypingInput(prev => prev.slice(0, -1));
                    setTypingSuccess(null);
                  }}
                  style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline', border: 'none', background: 'none', cursor: 'pointer' }}
                >
                  Backspace
                </button>
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                maxHeight: '120px',
                overflowY: 'auto',
                padding: '8px',
                backgroundColor: 'var(--color-bg)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)'
              }}>
                {/* Vowels */}
                {["অ", "আ", "ই", "ঈ", "উ", "ঊ", "ঋ", "এ", "ঐ", "ও", "ঔ", "া", "ি", "ী", "ু", "ূ", "ৃ", "ে", "ৈ", "ো", "ৌ", "্"].map(char => (
                  <button
                    key={char}
                    onClick={() => {
                      setTypingInput(prev => prev + char);
                      setTypingSuccess(null);
                    }}
                    style={{
                      padding: '6px 10px',
                      fontSize: '14px',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    {char}
                  </button>
                ))}

                {/* Divider */}
                <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--color-border)', margin: '4px 0' }} />

                {/* Consonants */}
                {["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ", "ঝ", "ঞ", "ট", "ঠ", "ড", "ঢ", "ণ", "ত", "থ", "দ", "ধ", "ন", "প", "ফ", "ব", "ভ", "ম", "য", "র", "ল", "শ", "ষ", "স", "হ", "ড়", "ঢ়", "য়", "ৎ", "ং", "ঃ", "ঁ", "।"].map(char => (
                  <button
                    key={char}
                    onClick={() => {
                      setTypingInput(prev => prev + char);
                      setTypingSuccess(null);
                    }}
                    style={{
                      padding: '6px 10px',
                      fontSize: '14px',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    {char}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setTypingInput("")}
                className="btn-secondary"
                style={{ flex: 1, padding: '10px' }}
              >
                Clear
              </button>
              <button
                onClick={checkTypingResult}
                className="btn-primary"
                style={{ flex: 2, padding: '10px' }}
              >
                Verify
              </button>
            </div>

            {/* Feedback Success/Error */}
            {typingSuccess === true && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#10B981',
                fontSize: '14px',
                fontWeight: 600,
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={16} /> Perfect Match! +10 XP Awarded!
              </div>
            )}

            {typingSuccess === false && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#EF4444',
                fontSize: '14px',
                fontWeight: 600,
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <X size={16} style={{ border: '2px solid currentColor', borderRadius: '50%', padding: '1px' }} /> Typing does not match. Please verify characters.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
