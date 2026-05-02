import { useState } from 'react';

interface PassageQuiz {
  id: number;
  passageText: string;
  questionText: string;
}

interface Props {
  passage: PassageQuiz;
  savedAnswer: string;
  aiFeedback?: string;
  onSave: (answer: string) => Promise<void>;
}

export default function PassageQuizComponent({ passage, savedAnswer, aiFeedback, onSave }: Props) {
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
        backgroundColor: 'var(--color-bg)',
        padding: '24px',
        borderRadius: 'var(--radius-md)',
        borderLeft: '4px solid var(--color-primary)',
        marginBottom: '24px',
        fontFamily: 'var(--font-serif)',
        fontSize: '16px',
        lineHeight: 1.6,
        color: 'var(--color-text)'
      }}>
        "{passage.passageText}"
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '8px' }}>
          Passage Analysis
        </h3>
        <p style={{ fontSize: '15px', color: 'var(--color-text)' }}>
          {passage.questionText}
        </p>
      </div>

      <textarea
        value={response}
        onChange={(e) => {
          setResponse(e.target.value);
          setIsSaved(false);
        }}
        placeholder="Type your analysis here..."
        style={{
          width: '100%',
          minHeight: '150px',
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
          {isThinking ? 'The Mentor is reading...' : isSaved ? 'Saved Analysis' : 'Save Analysis'}
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
            {isThinking ? 'Analyzing your interpretation...' : aiFeedback}
          </p>
        </div>
      )}
    </div>
  );
}
