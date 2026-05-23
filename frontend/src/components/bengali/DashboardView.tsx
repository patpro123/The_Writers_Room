import React from 'react';
import { Compass, RefreshCw, ChevronLeft } from 'lucide-react';
import type { BengaliProgress } from './bengaliData';

interface DashboardViewProps {
  progress: BengaliProgress | null;
  setView: (view: 'onboarding' | 'plan-select' | 'phase1' | 'phase2' | 'phase3' | 'flashcards') => void;
  updatePhase: (phase: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  progress,
  setView,
  updatePhase,
}) => {
  const getWeeksElapsed = () => {
    if (!progress?.planStartDate) return 1;
    const start = new Date(progress.planStartDate).getTime();
    const now = new Date().getTime();
    const elapsedDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.floor(elapsedDays / 7) + 1);
  };

  const planName = progress?.learningPlan === '2-month' ? '2-Month Plan (Intensive)' : 
                   progress?.learningPlan === '3-month' ? '3-Month Plan (Standard)' : 
                   '6-Month Plan (Deep Study)';
  
  const weeksElapsed = getWeeksElapsed();
  const totalWeeks = progress?.learningPlan === '2-month' ? 8 : 
                     progress?.learningPlan === '3-month' ? 12 : 24;

  const progressPercentage = Math.round((weeksElapsed / totalWeeks) * 100);

  // Dynamic focus based on plan and active week
  let currentFocus = "Study basic vowels and consonants.";
  if (progress?.learningPlan === '2-month') {
    if (weeksElapsed <= 2) currentFocus = "Phase 1: Memorizing vowels & consonants.";
    else if (weeksElapsed <= 5) currentFocus = "Phase 2: Master 50 vocabulary words and pronunciation.";
    else currentFocus = "Phase 3: Read simple Bengali sentences & find literature classics.";
  } else if (progress?.learningPlan === '3-month') {
    if (weeksElapsed <= 4) currentFocus = "Phase 1: Alphabet drawing strokes & basic sounds.";
    else if (weeksElapsed <= 8) currentFocus = "Phase 2: Master 100 core vocabulary words and microphone checks.";
    else currentFocus = "Phase 3: Conversational sentence matching & search Bengali books.";
  } else {
    if (weeksElapsed <= 6) currentFocus = "Phase 1: Calligraphy stroke-order details & compounds.";
    else if (weeksElapsed <= 14) currentFocus = "Phase 2: Advanced vocabulary words, grammar, and pronunciation.";
    else currentFocus = "Phase 3: Literary translations, poetry, and book-shelf collection.";
  }

  const masteredLCount = progress?.masteredLetters ? progress.masteredLetters.split(',').filter(Boolean).length : 0;
  const masteredWCount = progress?.masteredWords ? progress.masteredWords.split(',').filter(Boolean).length : 0;

  return (
    <div style={{ animation: 'fadeIn 0.4s', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="font-serif" style={{ fontSize: '28px' }}>বাংলা পাঠশালা</h1>
        <button 
          onClick={() => setView('plan-select')}
          style={{ fontSize: '11px', color: 'var(--color-primary)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Change Plan
        </button>
      </div>

      {/* Plan Progress Card */}
      <div style={{
        backgroundColor: 'var(--color-surface)',
        padding: '20px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
          <span>Active: <strong>{planName}</strong></span>
          <span>Week {weeksElapsed} of {totalWeeks}</span>
        </div>
        
        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-bg)', borderRadius: '3px', marginBottom: '16px', overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(100, progressPercentage)}%`, height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: '3px' }} />
        </div>

        <div style={{ fontSize: '13px', backgroundColor: 'var(--color-bg)', padding: '12px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--color-primary)' }}>
          <strong>Current Target:</strong> {currentFocus}
        </div>
      </div>

      {/* Study Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div 
          onClick={() => setView('flashcards')}
          style={{
            backgroundColor: 'var(--color-surface)',
            padding: '20px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}
        >
          <RefreshCw size={28} color="var(--color-primary)" className="mb-2" />
          <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Flashcards</h4>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Quick Study Review</span>
        </div>

        <div 
          onClick={() => {
            const currentP = progress?.currentPhase || 1;
            setView(`phase${currentP}` as any);
          }}
          style={{
            backgroundColor: 'var(--color-surface)',
            padding: '20px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}
        >
          <Compass size={28} color="var(--color-primary)" className="mb-2" />
          <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Active Phase</h4>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Resume Phase {progress?.currentPhase || 1}</span>
        </div>
      </div>

      {/* Phases Tracker */}
      <h3 className="font-serif mb-3" style={{ fontSize: '18px' }}>Learning Phases</h3>
      <div className="flex flex-col gap-3">
        {/* Phase 1 Card */}
        <div 
          onClick={() => updatePhase(1)}
          style={{
            backgroundColor: 'var(--color-surface)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${progress?.currentPhase === 1 ? 'var(--color-primary)' : 'var(--color-border)'}`,
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%'
          }}
        >
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: 'rgba(140, 74, 50, 0.1)', color: 'var(--color-primary)', padding: '2px 6px', borderRadius: '4px' }}>
                PHASE 1
              </span>
              <span style={{ fontWeight: 600, fontSize: '15px' }}>Basic Alphabets & Reading Primers</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Master {masteredLCount} / 50 vowels and consonants, plus Matras, Juktakhor, and Bornoporichoy/Sahaj Path basic reading content.
            </div>
          </div>
          <ChevronLeft style={{ transform: 'rotate(180deg)', color: 'var(--color-text-muted)' }} size={20} />
        </div>

        {/* Phase 2 Card */}
        <div 
          onClick={() => updatePhase(2)}
          style={{
            backgroundColor: 'var(--color-surface)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${progress?.currentPhase === 2 ? 'var(--color-primary)' : 'var(--color-border)'}`,
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%'
          }}
        >
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: 'rgba(140, 74, 50, 0.1)', color: 'var(--color-primary)', padding: '2px 6px', borderRadius: '4px' }}>
                PHASE 2
              </span>
              <span style={{ fontWeight: 600, fontSize: '15px' }}>Words & Speech Recognition</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Learn {masteredWCount} / 10 words. Practice speaking via microphone check.
            </div>
          </div>
          <ChevronLeft style={{ transform: 'rotate(180deg)', color: 'var(--color-text-muted)' }} size={20} />
        </div>

        {/* Phase 3 Card */}
        <div 
          onClick={() => updatePhase(3)}
          style={{
            backgroundColor: 'var(--color-surface)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${progress?.currentPhase === 3 ? 'var(--color-primary)' : 'var(--color-border)'}`,
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%'
          }}
        >
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: 'rgba(140, 74, 50, 0.1)', color: 'var(--color-primary)', padding: '2px 6px', borderRadius: '4px' }}>
                PHASE 3
              </span>
              <span style={{ fontWeight: 600, fontSize: '15px' }}>Sentences & Literary Search</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Practice reading sentences. Search and save Bengali literature with custom difficulty levels.
            </div>
          </div>
          <ChevronLeft style={{ transform: 'rotate(180deg)', color: 'var(--color-text-muted)' }} size={20} />
        </div>
      </div>
    </div>
  );
};
