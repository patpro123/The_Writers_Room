import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import type { BengaliProgress } from './bengali/bengaliData';
import { OnboardingView } from './bengali/OnboardingView';
import { DashboardView } from './bengali/DashboardView';
import { Phase1View } from './bengali/Phase1View';
import { Phase2View } from './bengali/Phase2View';
import { Phase3View } from './bengali/Phase3View';
import { FlashcardsView } from './bengali/FlashcardsView';

export default function BengaliLearning({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<BengaliProgress | null>(null);
  
  // Navigation states
  const [view, setView] = useState<'onboarding' | 'diagnostic-test' | 'diagnostic-results' | 'plan-select' | 'dashboard' | 'phase1' | 'phase2' | 'phase3' | 'flashcards'>('onboarding');

  useEffect(() => {
    fetchProgress();
  }, [token]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/progress/bengali`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setProgress(data);
      if (data.learningPlan) {
        setView('dashboard');
      } else {
        setView('onboarding');
      }
    } catch (err) {
      console.error("Error loading progress:", err);
    } finally {
      setLoading(false);
    }
  };

  // Web Speech API Pronunciation (TTS)
  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      // Clear previous spoken items
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'bn-BD';
      
      // Try to find a Bengali voice specifically
      const voices = window.speechSynthesis.getVoices();
      const bnVoice = voices.find(voice => voice.lang.startsWith('bn'));
      if (bnVoice) {
        utterance.voice = bnVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech not supported in this browser.");
    }
  };

  // Letter Mastery Toggle API Call
  const toggleLetterMastery = async (letter: string, isMastered: boolean) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/progress/bengali/letter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ letter, mastered: !isMastered })
      });
      const data = await res.json();
      setProgress(data);
    } catch (e) {
      console.error("Error toggling letter mastery:", e);
    }
  };

  // Word Mastery Toggle API Call
  const toggleWordMastery = async (word: string, isMastered: boolean) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/progress/bengali/word`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ word, mastered: !isMastered, isSpoken: false })
      });
      const data = await res.json();
      setProgress(data);
    } catch (e) {
      console.error("Error toggling word mastery:", e);
    }
  };

  // Phase update
  const updatePhase = async (phase: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/progress/bengali/phase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phase })
      });
      const data = await res.json();
      setProgress(data);
      setView(`phase${phase}` as any);
    } catch (e) {
      console.error("Error updating phase:", e);
      setView(`phase${phase}` as any);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <div style={{
          border: '4px solid var(--color-border)',
          borderTop: '4px solid var(--color-primary)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }} />
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}} />
        <span style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
          Loading learning progress...
        </span>
      </div>
    );
  }

  // Routing Views
  if (view === 'onboarding' || view === 'diagnostic-test' || view === 'diagnostic-results' || view === 'plan-select') {
    return (
      <OnboardingView 
        token={token} 
        progress={progress} 
        fetchProgress={fetchProgress} 
        setView={setView} 
      />
    );
  }

  if (view === 'dashboard') {
    return (
      <DashboardView 
        progress={progress} 
        setView={setView} 
        updatePhase={updatePhase} 
      />
    );
  }

  if (view === 'phase1') {
    return (
      <Phase1View 
        progress={progress} 
        setView={setView} 
        speakWord={speakWord} 
        toggleLetterMastery={toggleLetterMastery} 
        toggleWordMastery={toggleWordMastery} 
        fetchProgress={fetchProgress} 
        token={token} 
      />
    );
  }

  if (view === 'phase2') {
    return (
      <Phase2View 
        progress={progress} 
        setView={setView} 
        speakWord={speakWord} 
        toggleWordMastery={toggleWordMastery} 
        fetchProgress={fetchProgress} 
        token={token} 
      />
    );
  }

  if (view === 'phase3') {
    return (
      <Phase3View 
        setView={setView} 
        speakWord={speakWord} 
        fetchProgress={fetchProgress} 
        token={token} 
      />
    );
  }

  if (view === 'flashcards') {
    return (
      <FlashcardsView 
        setView={setView} 
        speakWord={speakWord} 
        fetchProgress={fetchProgress} 
        token={token} 
        currentPhase={progress?.currentPhase || 1} 
      />
    );
  }

  return (
    <div style={{ padding: '24px', textAlign: 'center' }}>
      <h3>Unknown View State</h3>
      <button onClick={() => setView('dashboard')} className="btn-primary" style={{ marginTop: '12px' }}>
        Go to Dashboard
      </button>
    </div>
  );
}
