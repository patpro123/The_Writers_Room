import React, { useState, useRef } from 'react';
import { ChevronLeft, Volume2, Mic, Keyboard, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { VOCAB_WORDS } from './bengaliData';
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

export const Phase2View: React.FC<Phase2ViewProps> = ({
  progress,
  setView,
  speakWord,
  toggleWordMastery,
  fetchProgress,
  token,
}) => {
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

  const masteredWordsArray = progress?.masteredWords ? progress.masteredWords.split(',').filter(Boolean) : [];

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

  return (
    <div style={{ animation: 'fadeIn 0.4s', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <button onClick={() => setView('dashboard')} style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-serif" style={{ fontSize: '24px' }}>Phase 2: Vocabulary & Speech</h1>
      </div>

      <p className="mb-6" style={{ color: 'var(--color-text-muted)', fontSize: '14px', textAlign: 'left' }}>
        Master key nouns and conversational words. Toggle mastery to earn XP, and practice speaking using the voice-recognition check.
      </p>

      <div className="flex flex-col gap-4">
        {VOCAB_WORDS.map(item => {
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
