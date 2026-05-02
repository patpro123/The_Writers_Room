import { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Plus, Trash2, Quote, Lightbulb, HelpCircle, BookMarked } from 'lucide-react';
import { API_BASE_URL } from '../config';
import BookChatWidget from './BookChatWidget';

interface Book {
  id: number;
  title: string;
  author: string;
  genre: string | null;
  coverUrl: string | null;
  status: string;
  currentChapter: number | null;
  notes: BookNote[];
}

interface BookNote {
  id: number;
  content: string;
  noteType: string | null;
  createdAt: string;
}

interface Props {
  bookId: number;
  token: string | null;
  onBack: () => void;
}

const STATUS_OPTIONS = ['Want to Read', 'Reading', 'Completed'];
const NOTE_TYPES = ['Quote', 'Thought', 'Question'];

const noteTypeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  Quote: { icon: <Quote size={11} />, color: '#8C4A32' },
  Thought: { icon: <Lightbulb size={11} />, color: '#D97706' },
  Question: { icon: <HelpCircle size={11} />, color: '#2563EB' },
};

export default function BookDetailPage({ bookId, token, onBack }: Props) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('Thought');
  const [savingNote, setSavingNote] = useState(false);
  const [chapterInput, setChapterInput] = useState<string>('');
  const [updatingChapter, setUpdatingChapter] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchBook = () => {
    fetch(`${API_BASE_URL}/api/books`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then((books: Book[]) => {
        const found = books.find(b => b.id === bookId);
        if (found) {
          setBook(found);
          setChapterInput(found.currentChapter?.toString() || '');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchBook(); }, [bookId, token]);

  const handleStatusChange = async (newStatus: string) => {
    if (!book) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/books/${book.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      const updated = await res.json();
      setBook(prev => prev ? { ...prev, status: updated.status } : prev);
    } catch {
      // silently fail
    }
  };

  const handleChapterSave = async () => {
    if (!book) return;
    setUpdatingChapter(true);
    try {
      const chapter = chapterInput.trim() ? parseInt(chapterInput) : null;
      await fetch(`${API_BASE_URL}/api/books/${book.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ currentChapter: chapter })
      });
      setBook(prev => prev ? { ...prev, currentChapter: chapter } : prev);
    } catch {
      // silently fail
    } finally {
      setUpdatingChapter(false);
    }
  };

  const handleAddNote = async () => {
    if (!book || !noteContent.trim()) return;
    setSavingNote(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/books/${book.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: noteContent.trim(), noteType })
      });
      const newNote = await res.json();
      setBook(prev => prev ? { ...prev, notes: [newNote, ...prev.notes] } : prev);
      setNoteContent('');
      setShowAddNote(false);
    } catch {
      // silently fail
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteBook = async () => {
    if (!book) return;
    setDeleting(true);
    try {
      await fetch(`${API_BASE_URL}/api/books/${book.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      onBack();
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!book) return;
    try {
      await fetch(`${API_BASE_URL}/api/books/${book.id}/notes/${noteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setBook(prev => prev ? { ...prev, notes: prev.notes.filter(n => n.id !== noteId) } : prev);
    } catch {
      // silently fail
    }
  };

  if (loading || !book) {
    return <div className="text-center" style={{ marginTop: '48px', color: 'var(--color-text-muted)' }}>Loading book...</div>;
  }

  const canChat = book.status === 'Reading' || book.status === 'Completed';

  return (
    <div style={{ animation: 'fadeIn 0.4s', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontSize: '14px' }}
        >
          <ArrowLeft size={16} /> Back to Shelf
        </button>

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--color-text-muted)', opacity: 0.6 }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.6')}
          >
            <Trash2 size={14} /> Remove
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Remove book?</span>
            <button
              onClick={handleDeleteBook}
              disabled={deleting}
              style={{ fontSize: '12px', fontWeight: 700, color: 'white', backgroundColor: '#DC2626', padding: '5px 12px', borderRadius: '8px', opacity: deleting ? 0.6 : 1 }}
            >
              {deleting ? 'Removing...' : 'Yes, remove'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Book Header */}
      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '28px',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        padding: '20px',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={book.title} style={{ width: '80px', height: '112px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }} />
        ) : (
          <div style={{ width: '80px', height: '112px', borderRadius: '6px', flexShrink: 0, backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookMarked size={32} color="white" />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="font-serif" style={{ fontSize: '22px', lineHeight: 1.2, marginBottom: '6px' }}>{book.title}</h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '10px' }}>{book.author}</p>
          {book.genre && (
            <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '12px', backgroundColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
              {book.genre}
            </span>
          )}
        </div>
      </div>

      {/* Status Selector */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '10px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Status</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              style={{
                flex: 1,
                padding: '9px 4px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 600,
                border: `2px solid ${book.status === s ? 'var(--color-primary)' : 'var(--color-border)'}`,
                backgroundColor: book.status === s ? 'var(--color-primary)' : 'transparent',
                color: book.status === s ? 'white' : 'var(--color-text-muted)',
                transition: 'all 0.15s'
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Current Chapter (only when Reading) */}
      {book.status === 'Reading' && (
        <div style={{ marginBottom: '24px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '10px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Current Chapter</p>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
            Lyra will only discuss up to this chapter — no spoilers.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="number"
              min="1"
              placeholder="e.g. 5"
              value={chapterInput}
              onChange={e => setChapterInput(e.target.value)}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button
              onClick={handleChapterSave}
              disabled={updatingChapter}
              style={{ padding: '9px 16px', backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 600, opacity: updatingChapter ? 0.6 : 1 }}
            >
              {updatingChapter ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Chat with Lyra */}
      {canChat && (
        <button
          onClick={() => setShowChat(true)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '14px',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            borderRadius: 'var(--radius-md)',
            fontSize: '15px',
            fontWeight: 700,
            marginBottom: '28px',
            boxShadow: '0 4px 16px rgba(140,74,50,0.25)',
            transition: 'transform 0.15s'
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <MessageCircle size={20} />
          Chat with Lyra about this book
        </button>
      )}

      {/* Notes Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
          <h2 className="font-serif" style={{ fontSize: '20px' }}>My Notes</h2>
          <button
            onClick={() => setShowAddNote(!showAddNote)}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}
          >
            <Plus size={15} /> Add Note
          </button>
        </div>

        {showAddNote && (
          <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '16px', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {NOTE_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setNoteType(type)}
                  style={{
                    flex: 1,
                    padding: '7px 6px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: `2px solid ${noteType === type ? noteTypeConfig[type].color : 'var(--color-border)'}`,
                    backgroundColor: noteType === type ? `${noteTypeConfig[type].color}15` : 'transparent',
                    color: noteType === type ? noteTypeConfig[type].color : 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    transition: 'all 0.15s'
                  }}
                >
                  {noteTypeConfig[type].icon} {type}
                </button>
              ))}
            </div>
            <textarea
              placeholder="Write your note here..."
              value={noteContent}
              onChange={e => setNoteContent(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                fontSize: '14px',
                resize: 'none',
                outline: 'none',
                lineHeight: 1.5,
                marginBottom: '10px',
                fontFamily: 'var(--font-sans)'
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowAddNote(false); setNoteContent(''); }} style={{ fontSize: '13px', color: 'var(--color-text-muted)', padding: '8px 14px' }}>
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                disabled={savingNote || !noteContent.trim()}
                style={{ fontSize: '13px', fontWeight: 600, backgroundColor: 'var(--color-primary)', color: 'white', padding: '8px 16px', borderRadius: '8px', opacity: savingNote || !noteContent.trim() ? 0.6 : 1 }}
              >
                {savingNote ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        )}

        {book.notes.length === 0 && !showAddNote && (
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '32px', fontStyle: 'italic' }}>
            No notes yet. Add quotes, thoughts, or questions as you read.
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {book.notes.map(note => {
            const config = note.noteType ? noteTypeConfig[note.noteType] : null;
            return (
              <div
                key={note.id}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px',
                  border: '1px solid var(--color-border)',
                  borderLeft: config ? `4px solid ${config.color}` : '4px solid var(--color-border)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <p style={{ fontSize: '14px', lineHeight: 1.6, flex: 1, color: 'var(--color-text)' }}>{note.content}</p>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    style={{ color: 'var(--color-text-muted)', opacity: 0.5, flexShrink: 0, padding: '2px' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
                    onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.5')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {note.noteType && config && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                    <span style={{ color: config.color, display: 'flex', alignItems: 'center' }}>{config.icon}</span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: config.color }}>{note.noteType}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showChat && (
        <BookChatWidget
          book={book}
          token={token}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}
