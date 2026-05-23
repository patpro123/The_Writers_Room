import React, { useState } from 'react';
import { Languages, ChevronLeft, ArrowRight, Award } from 'lucide-react';
import { DIAGNOSTIC_QUESTIONS } from './bengaliData';
import type { BengaliProgress } from './bengaliData';
import { API_BASE_URL } from '../../config';

interface OnboardingViewProps {
  token: string;
  progress: BengaliProgress | null;
  fetchProgress: () => Promise<void>;
  setView: (view: 'dashboard') => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  token,
  progress,
  fetchProgress,
  setView,
}) => {
  const [localView, setLocalView] = useState<'onboarding' | 'diagnostic-test' | 'diagnostic-results' | 'plan-select'>('onboarding');
  const [diagnosticStep, setDiagnosticStep] = useState(0);
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<number[]>([]);

  const selectLearningPlan = async (plan: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/progress/bengali/plan`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan })
      });
      if (res.ok) {
        await fetchProgress();
        setView('dashboard');
      }
    } catch (e) {
      console.error("Error setting plan:", e);
    }
  };

  const handleDiagnosticAnswer = async (ansIndex: number) => {
    const newAnswers = [...diagnosticAnswers, ansIndex];
    setDiagnosticAnswers(newAnswers);

    if (diagnosticStep + 1 < DIAGNOSTIC_QUESTIONS.length) {
      setDiagnosticStep(prev => prev + 1);
    } else {
      // Diagnostic complete, calculate score
      let score = 0;
      newAnswers.forEach((ans, idx) => {
        if (ans === DIAGNOSTIC_QUESTIONS[idx].correct) score += 1;
      });

      try {
        const res = await fetch(`${API_BASE_URL}/api/progress/bengali/diagnostic`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ score })
        });
        if (res.ok) {
          await fetchProgress();
          setLocalView('diagnostic-results');
        }
      } catch (e) {
        console.error("Error saving diagnostic score:", e);
        setLocalView('diagnostic-results');
      }
    }
  };

  const getRecommendedPlan = (score: number | null) => {
    const val = score || 0;
    if (val <= 3) {
      return { 
        name: "6-Month Plan (Deep Study)", 
        code: "6-month", 
        reason: "Starting from scratch. This plan allows gentle pacing to learn all drawing shapes, vowels, consonants, and 100+ basic terms." 
      };
    } else if (val <= 7) {
      return { 
        name: "3-Month Plan (Standard)", 
        code: "3-month", 
        reason: "Intermediate background. Focuses on structured weekly modules, vocabulary matching, and voice-checks." 
      };
    } else {
      return { 
        name: "2-Month Plan (Intensive)", 
        code: "2-month", 
        reason: "Advanced understanding. Covers basic characters quickly and transitions immediately into classic literature search." 
      };
    }
  };

  // ----------------------------------------------------
  // VIEW: Onboarding Welcome Screen
  // ----------------------------------------------------
  if (localView === 'onboarding') {
    return (
      <div style={{ animation: 'fadeIn 0.4s', paddingBottom: '40px' }} className="flex flex-col">
        <div className="text-center mb-6">
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--color-primary-light)', 
            color: 'white',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Languages size={32} />
          </div>
          <h1 className="font-serif mb-2" style={{ fontSize: '32px' }}>বাংলা শিখুন</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '15px' }}>
            Welcome to the Bengali learning corner. Expand your bilingual horizons through classic literary study.
          </p>
        </div>

        <div style={{
          backgroundColor: 'var(--color-surface)',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '24px'
        }}>
          <h3 className="font-serif mb-2" style={{ fontSize: '18px' }}>Placement Assessment</h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            If you have some experience reading or speaking Bengali, take a quick 10-question placement quiz. We will recommend the perfect study timeline.
          </p>
          <button 
            onClick={() => {
              setDiagnosticStep(0);
              setDiagnosticAnswers([]);
              setLocalView('diagnostic-test');
            }}
            className="btn-primary" 
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            Take 5-Min Diagnostic <ArrowRight size={16} />
          </button>
        </div>

        <div className="text-center">
          <button 
            onClick={() => setLocalView('plan-select')}
            style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'underline' }}
          >
            I want to select a plan directly
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW: Diagnostic Placement Test
  // ----------------------------------------------------
  if (localView === 'diagnostic-test') {
    const q = DIAGNOSTIC_QUESTIONS[diagnosticStep];
    const progressPercent = Math.round((diagnosticStep / DIAGNOSTIC_QUESTIONS.length) * 100);

    return (
      <div style={{ animation: 'fadeIn 0.4s', paddingBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <button onClick={() => setLocalView('onboarding')} style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <ChevronLeft size={24} />
          </button>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
            Diagnostic Quiz (Question {diagnosticStep + 1} of {DIAGNOSTIC_QUESTIONS.length})
          </span>
        </div>

        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-border)', borderRadius: '3px', marginBottom: '32px', overflow: 'hidden' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: 'var(--color-primary)', transition: 'width 0.3s' }} />
        </div>

        <div style={{
          backgroundColor: 'var(--color-surface)',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '24px'
        }}>
          <h2 className="font-serif mb-6" style={{ fontSize: '22px' }}>{q.question}</h2>
          
          <div className="flex flex-col gap-3">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleDiagnosticAnswer(idx)}
                style={{
                  textAlign: 'left',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '15px',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.backgroundColor = 'var(--color-bg)';
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW: Diagnostic Quiz Results
  // ----------------------------------------------------
  if (localView === 'diagnostic-results') {
    const recommended = getRecommendedPlan(progress?.diagnosticScore ?? 0);
    return (
      <div style={{ animation: 'fadeIn 0.4s', paddingBottom: '40px' }}>
        <h1 className="font-serif mb-2 text-center" style={{ fontSize: '28px' }}>Diagnostic Complete</h1>
        <p className="text-center mb-6" style={{ color: 'var(--color-text-muted)' }}>
          Here is your language proficiency diagnostic summary.
        </p>

        <div style={{
          backgroundColor: 'var(--color-surface)',
          padding: '32px 24px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
            Your Placement Score
          </div>
          <div className="font-serif" style={{ fontSize: '48px', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '24px' }}>
            {progress?.diagnosticScore} / 10
          </div>

          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '8px 16px', 
            borderRadius: 'var(--radius-full)', 
            backgroundColor: 'rgba(140, 74, 50, 0.08)',
            color: 'var(--color-primary)',
            fontWeight: 600,
            fontSize: '14px',
            marginBottom: '16px'
          }}>
            <Award size={18} /> Recommended: {recommended.name}
          </div>

          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
            {recommended.reason}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => selectLearningPlan(recommended.code)}
            className="btn-primary"
            style={{ width: '100%' }}
          >
            Enroll in Recommended Plan ({recommended.name})
          </button>
          
          <button 
            onClick={() => setLocalView('plan-select')}
            className="btn-secondary"
            style={{ width: '100%' }}
          >
            Review all learning plans
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW: Plan Selector (Timeline Choices)
  // ----------------------------------------------------
  if (localView === 'plan-select') {
    return (
      <div style={{ animation: 'fadeIn 0.4s', paddingBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <button onClick={() => setLocalView('onboarding')} style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-serif" style={{ fontSize: '24px' }}>Select Learning Plan</h1>
        </div>

        <p className="mb-6" style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
          Choose a timeline that fits your study cadence. Each plan is tailored with specific milestone targets:
        </p>

        <div className="flex flex-col gap-4 mb-6">
          {/* Plan 2 Month */}
          <div style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'border 0.2s'
          }}
          onClick={() => selectLearningPlan('2-month')}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
              <h3 className="font-serif" style={{ fontSize: '18px', color: 'var(--color-primary)' }}>2-Month Plan (Intensive)</h3>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>8 weeks</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
              Designed for quick script mastery and immediate reading start. Good if you already know basic phonetics.
            </p>
            <div style={{ fontSize: '12px', paddingLeft: '8px', borderLeft: '2px solid var(--color-primary-light)' }}>
              <strong>W1-2:</strong> Shorboborno & Byonjonborno alphabets<br />
              <strong>W3-5:</strong> Spoken vocabulary checks & writing practice<br />
              <strong>W6-8:</strong> Simple sentences & search classic texts
            </div>
          </div>

          {/* Plan 3 Month */}
          <div style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'border 0.2s'
          }}
          onClick={() => selectLearningPlan('3-month')}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
              <h3 className="font-serif" style={{ fontSize: '18px', color: 'var(--color-primary)' }}>3-Month Plan (Standard)</h3>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>12 weeks</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
              The standard track. Balanced pace focusing on letters, vocabulary building, pronunciation, and reading.
            </p>
            <div style={{ fontSize: '12px', paddingLeft: '8px', borderLeft: '2px solid var(--color-primary-light)' }}>
              <strong>W1-4:</strong> Script writing, pronunciations & vowels<br />
              <strong>W5-8:</strong> 100+ Vocabulary words & microphone speaking checks<br />
              <strong>W9-12:</strong> Short conversations & library book collection search
            </div>
          </div>

          {/* Plan 6 Month */}
          <div style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'border 0.2s'
          }}
          onClick={() => selectLearningPlan('6-month')}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
              <h3 className="font-serif" style={{ fontSize: '18px', color: 'var(--color-primary)' }}>6-Month Plan (Deep Study)</h3>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>24 weeks</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
              An immersive path. Deep focus on reading flow, calligraphy stroke orders, compound conjunct letters, and Tagore poetry study.
            </p>
            <div style={{ fontSize: '12px', paddingLeft: '8px', borderLeft: '2px solid var(--color-primary-light)' }}>
              <strong>W1-6:</strong> Complete letter-drawing strokes & pronunciation details<br />
              <strong>W7-14:</strong> Comprehensive grammar, vocabulary, and microphone dialogue<br />
              <strong>W15-24:</strong> Translate Bengali short stories & add literature to Shelf
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
