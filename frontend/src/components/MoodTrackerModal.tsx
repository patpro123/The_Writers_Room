import React, { useState } from 'react';

const MOODS = [
  { label: 'Restless', emoji: '🌪️' },
  { label: 'Curious', emoji: '🔍' },
  { label: 'Stuck', emoji: '🧱' },
  { label: 'Flowing', emoji: '🌊' },
  { label: 'Sharp', emoji: '⚡' }
];

interface Props {
  onClose: () => void;
  onSave: (mood: string, reflection: string) => void;
}

export default function MoodTrackerModal({ onClose, onSave }: Props) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [reflection, setReflection] = useState('');

  return (
    <div className="overlay">
      <div className="modal">
        <h2 className="mb-2 text-center">Before we begin</h2>
        <p className="text-center mb-6" style={{ color: 'var(--color-text-muted)' }}>
          How is your creative energy today?
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {MOODS.map(m => (
            <button
              key={m.label}
              onClick={() => setSelectedMood(m.label)}
              style={{
                padding: '16px 8px',
                borderRadius: '12px',
                border: `2px solid ${selectedMood === m.label ? 'var(--color-primary)' : 'var(--color-border)'}`,
                backgroundColor: selectedMood === m.label ? 'var(--color-primary-light)' : 'transparent',
                color: selectedMood === m.label ? '#fff' : 'inherit',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '24px' }}>{m.emoji}</span>
              <span style={{ fontSize: '12px', fontWeight: 500 }}>{m.label}</span>
            </button>
          ))}
        </div>

        {selectedMood && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <p className="mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>One quick reflection (optional)</p>
            <textarea
              className="mb-4"
              placeholder="Why do you feel this way?"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                background: 'transparent',
                color: 'var(--color-text)',
                fontFamily: 'inherit',
                resize: 'none',
                height: '80px'
              }}
            />
          </div>
        )}

        <div className="flex justify-between gap-4">
          <button className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>
            Skip
          </button>
          <button 
            className="btn-primary" 
            style={{ flex: 1, opacity: selectedMood ? 1 : 0.5 }}
            disabled={!selectedMood}
            onClick={() => selectedMood && onSave(selectedMood, reflection)}
          >
            Enter Room
          </button>
        </div>
      </div>
    </div>
  );
}
