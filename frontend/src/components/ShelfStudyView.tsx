import { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, ClipboardType, BookMarked } from 'lucide-react';
import PassageQuizComponent from './PassageQuizComponent';
import { API_BASE_URL } from '../config';

interface Book {
  id: number;
  title: string;
  author: string;
  genre: string | null;
  coverUrl: string | null;
  status: string;
}

interface ShelfPassage {
  id: number;
  bookId: number;
  passageText: string;
  questionText: string;
  savedAnswer: string;
  aiFeedback: string;
  createdAt: string;
}

interface Props {
  bookId: number;
  token: string | null;
  onBack: () => void;
}

export default function ShelfStudyView({ bookId, token, onBack }: Props) {
  const [book, setBook] = useState<Book | null>(null);
  const [passages, setPassages] = useState<ShelfPassage[]>([]);
  const [loadingBook, setLoadingBook] = useState(true);
  const [loadingPassages, setLoadingPassages] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showAddExcerpt, setShowAddExcerpt] = useState(false);
  const [excerptText, setExcerptText] = useState('');
  const [submittingExcerpt, setSubmittingExcerpt] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/books`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then((books: Book[]) => {
        const found = books.find(b => b.id === bookId) || null;
        setBook(found);
        setLoadingBook(false);
      })
      .catch(() => setLoadingBook(false));

    fetchPassages();
  }, [bookId, token]);

  const fetchPassages = () => {
    setLoadingPassages(true);
    fetch(`${API_BASE_URL}/api/books/${bookId}/passages`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { setPassages(data); setLoadingPassages(false); })
      .catch(() => setLoadingPassages(false));
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/books/${bookId}/passages/generate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const newPassage = await res.json();
      setPassages(prev => [newPassage, ...prev]);
    } catch {
      // silently fail
    } finally {
      setGenerating(false);
    }
  };

  const handleAddExcerpt = async () => {
    if (!excerptText.trim()) return;
    setSubmittingExcerpt(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/books/${bookId}/passages/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ passageText: excerptText.trim() })
      });
      const newPassage = await res.json();
      setPassages(prev => [newPassage, ...prev]);
      setExcerptText('');
      setShowAddExcerpt(false);
    } catch {
      // silently fail
    } finally {
      setSubmittingExcerpt(false);
    }
  };

  const handlePassageSave = async (passageId: number, answer: string) => {
    const res = await fetch(`${API_BASE_URL}/api/books/passages/${passageId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ answer })
    });
    const data = await res.json();
    setPassages(prev => prev.map(p =>
      p.id === passageId ? { ...p, savedAnswer: data.answer, aiFeedback: data.aiFeedback || '' } : p
    ));
  };

  if (loadingBook) {
    return <div className="text-center" style={{ marginTop: '48px', color: 'var(--color-text-muted)' }}>Loading...</div>;
  }

  if (!book) {
    return (
      <div className="text-center" style={{ marginTop: '48px' }}>
        <p>Book not found.</p>
        <button onClick={onBack} style={{ color: 'var(--color-primary)', marginTop: '12px' }}>← Back</button>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s', paddingBottom: '40px' }}>
      <button
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--color-text-muted)', fontSize: '14px' }}
      >
        <ArrowLeft size={16} /> Back to My Shelf
      </button>

      {/* Book Header */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '28px',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        padding: '18px',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={book.title} style={{ width: '60px', height: '84px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} />
        ) : (
          <div style={{ width: '60px', height: '84px', borderRadius: '4px', flexShrink: 0, backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookMarked size={24} color="white" />
          </div>
        )}
        <div>
          <h1 className="font-serif" style={{ fontSize: '20px', lineHeight: 1.2, marginBottom: '5px' }}>{book.title}</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>{book.author}</p>
          <span style={{
            fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '12px',
            backgroundColor: book.status === 'Reading' ? '#8C4A3220' : book.status === 'Completed' ? '#05966920' : 'var(--color-border)',
            color: book.status === 'Reading' ? '#8C4A32' : book.status === 'Completed' ? '#059669' : 'var(--color-text-muted)'
          }}>
            {book.status}
          </span>
        </div>
      </div>

      {/* Intro */}
      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
        Generate a passage from this book for Oxbridge-style close reading, or paste your own excerpt and the tutor will craft a question for it.
      </p>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 700,
            opacity: generating ? 0.6 : 1,
            transition: 'opacity 0.15s'
          }}
        >
          <Sparkles size={16} />
          {generating ? 'Curating passage...' : 'Generate a Passage'}
        </button>
        <button
          onClick={() => { setShowAddExcerpt(!showAddExcerpt); setExcerptText(''); }}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: 'transparent',
            color: 'var(--color-primary)',
            border: '2px solid var(--color-primary)',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 700,
            transition: 'background-color 0.15s'
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-primary)10')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent')}
        >
          <ClipboardType size={16} />
          Add My Own Excerpt
        </button>
      </div>

      {/* Add Excerpt Panel */}
      {showAddExcerpt && (
        <div style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          marginBottom: '28px',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          animation: 'slideUp 0.3s ease'
        }}>
          <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text)' }}>
            Paste your excerpt from <em>{book.title}</em>
          </p>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '12px', lineHeight: 1.5 }}>
            Pick a passage that struck you — a sentence, a paragraph, anything that made you stop. The tutor will generate a close reading question for it.
          </p>
          <textarea
            value={excerptText}
            onChange={e => setExcerptText(e.target.value)}
            placeholder={`"Paste the passage here..."`}
            rows={5}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              fontSize: '14px',
              fontFamily: 'var(--font-serif)',
              lineHeight: 1.6,
              resize: 'vertical',
              outline: 'none',
              marginBottom: '12px'
            }}
            autoFocus
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => { setShowAddExcerpt(false); setExcerptText(''); }}
              style={{ padding: '9px 16px', fontSize: '13px', color: 'var(--color-text-muted)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddExcerpt}
              disabled={submittingExcerpt || !excerptText.trim()}
              style={{
                padding: '9px 18px',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                fontWeight: 700,
                opacity: submittingExcerpt || !excerptText.trim() ? 0.6 : 1
              }}
            >
              {submittingExcerpt ? 'Generating question...' : 'Generate Question'}
            </button>
          </div>
        </div>
      )}

      {/* Passages */}
      {loadingPassages && (
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px', padding: '24px' }}>Loading passages...</p>
      )}

      {!loadingPassages && passages.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--color-border)'
        }}>
          <p className="font-serif" style={{ fontSize: '17px', marginBottom: '8px' }}>No passages yet</p>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            Generate one from this book, or paste a passage that caught your attention.
          </p>
        </div>
      )}

      {passages.map((passage, i) => (
        <div key={passage.id} style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <span style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px',
              color: 'var(--color-text-muted)', textTransform: 'uppercase'
            }}>
              Passage {passages.length - i}
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
          </div>
          <PassageQuizComponent
            passage={{ id: passage.id, passageText: passage.passageText, questionText: passage.questionText }}
            savedAnswer={passage.savedAnswer}
            aiFeedback={passage.aiFeedback}
            onSave={(answer) => handlePassageSave(passage.id, answer)}
          />
        </div>
      ))}
    </div>
  );
}
