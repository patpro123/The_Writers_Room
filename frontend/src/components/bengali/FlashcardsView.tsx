import React, { useState, useEffect } from 'react';
import { ChevronLeft, Volume2 } from 'lucide-react';
import { VOWELS, VOCAB_WORDS } from './bengaliData';
import { API_BASE_URL } from '../../config';

interface FlashcardsViewProps {
  setView: (view: 'dashboard') => void;
  speakWord: (text: string) => void;
  fetchProgress: () => Promise<void>;
  token: string;
  currentPhase: number;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  setView,
  speakWord,
  fetchProgress,
  token,
  currentPhase,
}) => {
  const [flashcardDeck, setFlashcardDeck] = useState<any[]>([]);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcardXP, setFlashcardXP] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Initialize and shuffle deck on mount
  useEffect(() => {
    const deck = [
      ...VOWELS.slice(0, 5).map(v => ({ type: 'letter', value: v.letter, sound: v.sound, meaning: v.desc, ex: v.example, exT: v.exTrans })),
      ...VOCAB_WORDS.slice(0, 5).map(w => ({ type: 'word', value: w.word, sound: w.sound, meaning: w.meaning, ex: "", exT: "" }))
    ];
    // Shuffle
    deck.sort(() => Math.random() - 0.5);
    setFlashcardDeck(deck);
    setFlashcardIndex(0);
    setIsFlipped(false);
    setFlashcardXP(0);
    setIsFinished(false);
  }, []);

  const handleFlashcardKnow = (know: boolean) => {
    let earnedXP = flashcardXP;
    if (know) {
      earnedXP += 2;
      setFlashcardXP(earnedXP);
    }
    setIsFlipped(false);
    
    setTimeout(async () => {
      if (flashcardIndex + 1 < flashcardDeck.length) {
        setFlashcardIndex(prev => prev + 1);
      } else {
        // Deck finished, award XP
        setIsFinished(true);
        if (earnedXP > 0) {
          try {
            await fetch(`${API_BASE_URL}/api/progress/bengali/quiz`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ phase: currentPhase, score: 0 }) // dummy trigger to refresh profile
            });
            await fetchProgress();
          } catch (e) {
            console.error(e);
          }
        }
      }
    }, 250);
  };

  if (flashcardDeck.length === 0) {
    return <div className="text-center" style={{ marginTop: '50px' }}>Preparing Flashcard Deck...</div>;
  }

  if (isFinished) {
    return (
      <div style={{ animation: 'fadeIn 0.4s', paddingBottom: '40px' }} className="flex flex-col items-center text-center">
        <h2 className="font-serif mb-2" style={{ fontSize: '28px' }}>Study Session Complete!</h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
          Great job reviewing your flashcards.
        </p>
        <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '16px' }}>
          +{flashcardXP} XP
        </div>
        <button 
          onClick={() => setView('dashboard')}
          className="btn-primary"
          style={{ width: '200px' }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const card = flashcardDeck[flashcardIndex];

  return (
    <div style={{ animation: 'fadeIn 0.4s', paddingBottom: '40px' }} className="flex flex-col items-center">
      <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <button onClick={() => setView('dashboard')} style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
          <ChevronLeft size={24} />
        </button>
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
          Flashcards Study (Card {flashcardIndex + 1} of {flashcardDeck.length})
        </span>
      </div>

      {/* 3D Flipping Flashcard */}
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        style={{
          perspective: '1000px',
          width: '300px',
          height: '240px',
          cursor: 'pointer',
          marginBottom: '32px'
        }}
      >
        <div style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transition: 'transform 0.6s',
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'none',
        }}>
          {/* Front Side */}
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            backgroundColor: 'var(--color-surface)',
            border: '2px dashed var(--color-primary-light)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-md)'
          }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
              {card.type}
            </span>
            <span className="font-serif" style={{ fontSize: '64px', fontWeight: 700, color: 'var(--color-primary)' }}>
              {card.value}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
              (Tap to Flip)
            </span>
          </div>

          {/* Back Side */}
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            backgroundColor: 'var(--color-surface)',
            border: '2px solid var(--color-primary)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-md)',
            transform: 'rotateY(180deg)',
            padding: '20px',
            textAlign: 'center'
          }}>
            <h2 className="font-serif mb-1" style={{ fontSize: '32px', color: 'var(--color-primary)' }}>{card.sound}</h2>
            <p style={{ fontWeight: 600, fontSize: '16px', marginBottom: '8px' }}>{card.meaning}</p>
            
            {card.ex && (
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                Example: <strong>{card.ex}</strong> ({card.exT})
              </div>
            )}

            <button 
              onClick={(e) => {
                e.stopPropagation();
                speakWord(card.value);
              }}
              style={{
                marginTop: '16px',
                backgroundColor: 'rgba(140, 74, 50, 0.08)',
                padding: '8px',
                borderRadius: '50%',
                color: 'var(--color-primary)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Volume2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '16px', width: '300px' }}>
        <button 
          onClick={() => handleFlashcardKnow(false)}
          className="btn-secondary" 
          style={{ flex: 1, padding: '12px', fontSize: '14px' }}
        >
          Review Later
        </button>
        <button 
          onClick={() => handleFlashcardKnow(true)}
          className="btn-primary" 
          style={{ flex: 1, padding: '12px', fontSize: '14px' }}
        >
          I Know It!
        </button>
      </div>

      <div style={{ marginTop: '24px', fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>
        Session XP Gained: +{flashcardXP} XP
      </div>
    </div>
  );
};
