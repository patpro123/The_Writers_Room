import React, { useState } from 'react';

interface DebateCard {
  id: number;
  claim: string;
}

interface Props {
  debate: DebateCard;
  savedAnswer: string;
  aiFeedback?: string;
  onSave: (answer: string) => Promise<void>;
}

export default function DebateCardComponent({ debate, savedAnswer, aiFeedback, onSave }: Props) {
  const [response, setResponse] = useState(savedAnswer || '');
  const [isSaved, setIsSaved] = useState(!!savedAnswer);
  const [isThinking, setIsThinking] = useState(false);

  const handleSave = async () => {
    if (response.trim().length === 0) return;
    setIsThinking(true);
    await onSave(response);
    setIsThinking(false);
    setIsSaved(true);
  };



  return (
    <div style={{ animation: 'fadeIn 0.4s' }}>
      <div style={{
        backgroundColor: 'var(--color-surface)',
        padding: '32px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <span style={{ 
          display: 'inline-block',
          fontSize: '11px', 
          fontWeight: 700, 
          textTransform: 'uppercase', 
          letterSpacing: '1.5px',
          color: 'var(--color-primary-light)',
          marginBottom: '16px'
        }}>
          Thematic Claim
        </span>
        <h2 className="font-serif" style={{ 
          fontSize: '22px', 
          lineHeight: 1.4, 
          color: 'var(--color-primary)',
          margin: 0
        }}>
          "{debate.claim}"
        </h2>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '15px', color: 'var(--color-text)' }}>
          Write a 3-5 line position on this claim. Do you agree, disagree, or find a middle ground? Use specific evidence if possible.
        </p>
      </div>

      <textarea
        value={response}
        onChange={(e) => {
          setResponse(e.target.value);
          setIsSaved(false);
        }}
        placeholder="I argue that..."
        style={{
          width: '100%',
          minHeight: '120px',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          fontFamily: 'var(--font-serif)',
          fontSize: '15px',
          lineHeight: '1.6',
          resize: 'vertical',
          marginBottom: '16px',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)'
        }}
      />
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <button 
          onClick={handleSave}
          disabled={isSaved || response.trim().length === 0 || isThinking}
          className="btn btn-primary"
        >
          {isThinking ? 'The Mentor is thinking...' : isSaved ? 'Saved Position' : 'Save Position'}
        </button>
      </div>

      {(isThinking || aiFeedback) && (
        <div style={{
          backgroundColor: 'var(--color-surface)',
          borderLeft: '4px solid var(--color-primary)',
          padding: '24px',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
          animation: 'fadeIn 0.5s'
        }}>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: 700, 
            textTransform: 'uppercase', 
            letterSpacing: '1px',
            color: 'var(--color-primary)',
            marginBottom: '12px'
          }}>
            A Thought to Consider...
          </h3>
          <p style={{ fontSize: '15px', color: 'var(--color-text)', lineHeight: '1.6', fontStyle: 'italic' }}>
            {isThinking ? 'Reading your position...' : aiFeedback}
          </p>
        </div>
      )}
    </div>
  );
}
