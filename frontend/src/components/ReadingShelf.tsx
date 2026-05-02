import { useState, useEffect } from 'react';
import { BookMarked, Plus, Search, X, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface Book {
  id: number;
  title: string;
  author: string;
  genre: string | null;
  coverUrl: string | null;
  status: string;
  currentChapter: number | null;
  notes: BookNote[];
  updatedAt: string;
}

interface BookNote {
  id: number;
  content: string;
  noteType: string | null;
}

interface GoogleBook {
  googleId: string;
  title: string;
  author: string;
  genre: string | null;
  coverUrl: string | null;
}

interface Props {
  token: string | null;
  onSelectBook: (id: number) => void;
}

const STATUS_GROUPS = [
  { key: 'Reading', label: 'Currently Reading', color: '#8C4A32' },
  { key: 'Want to Read', label: 'Want to Read', color: '#6B7280' },
  { key: 'Completed', label: 'Completed', color: '#059669' },
];

export default function ReadingShelf({ token, onSelectBook }: Props) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GoogleBook[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  const fetchBooks = () => {
    fetch(`${API_BASE_URL}/api/books`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { setBooks(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchBooks(); }, [token]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const res = await fetch(`${API_BASE_URL}/api/books/google-search?q=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSearchResults(data);
    } catch {
      // silently fail
    } finally {
      setSearching(false);
    }
  };

  const handleAddBook = async (googleBook: GoogleBook) => {
    setAdding(googleBook.googleId);
    try {
      await fetch(`${API_BASE_URL}/api/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          title: googleBook.title,
          author: googleBook.author,
          genre: googleBook.genre,
          coverUrl: googleBook.coverUrl,
          status: 'Want to Read'
        })
      });
      fetchBooks();
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch {
      // silently fail
    } finally {
      setAdding(null);
    }
  };

  const handleAddManually = async () => {
    if (!searchQuery.trim()) return;
    setAdding('manual');
    try {
      await fetch(`${API_BASE_URL}/api/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title: searchQuery.trim(), author: 'Unknown Author', status: 'Want to Read' })
      });
      fetchBooks();
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch {
      // silently fail
    } finally {
      setAdding(null);
    }
  };

  if (loading) {
    return <div className="text-center" style={{ marginTop: '48px', color: 'var(--color-text-muted)' }}>Loading your shelf...</div>;
  }

  const grouped = STATUS_GROUPS.map(g => ({
    ...g,
    items: books.filter(b => b.status === g.key)
  }));

  return (
    <div style={{ animation: 'fadeIn 0.4s', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BookMarked size={28} color="var(--color-primary)" />
          <h1 className="font-serif" style={{ fontSize: '28px' }}>My Shelf</h1>
        </div>
        <button
          onClick={() => { setShowSearch(!showSearch); setSearchQuery(''); setSearchResults([]); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            padding: '8px 14px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 600
          }}
        >
          <Plus size={16} /> Add Book
        </button>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
        Your personal reading journal. Track books, save notes, and chat with Lyra about what you're reading.
      </p>

      {showSearch && (
        <div style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          padding: '16px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                placeholder="Search by title or author..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  fontSize: '14px',
                  outline: 'none'
                }}
                autoFocus
              />
            </div>
            <button
              onClick={handleSearch}
              style={{ padding: '10px 14px', backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '13px' }}
            >
              <Search size={15} />
            </button>
            <button
              onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); }}
              style={{ padding: '10px', color: 'var(--color-text-muted)' }}
            >
              <X size={18} />
            </button>
          </div>

          {searching && (
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '12px' }}>Searching...</p>
          )}

          {searchResults.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
              {searchResults.map(book => (
                <div
                  key={book.googleId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s'
                  }}
                  onClick={() => handleAddBook(book)}
                >
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} style={{ width: '40px', height: '56px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: '40px', height: '56px', backgroundColor: 'var(--color-border)', borderRadius: '4px', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</p>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{book.author}</p>
                    {book.genre && <p style={{ fontSize: '11px', color: 'var(--color-primary)', marginTop: '2px' }}>{book.genre}</p>}
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600, flexShrink: 0 }}>
                    {adding === book.googleId ? 'Adding...' : '+ Add'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {searchResults.length === 0 && !searching && searchQuery && (
            <div style={{ textAlign: 'center', padding: '12px' }}>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>No results found.</p>
              <button
                onClick={handleAddManually}
                style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline' }}
              >
                Add "{searchQuery}" manually
              </button>
            </div>
          )}
        </div>
      )}

      {books.length === 0 && !showSearch && (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--color-border)'
        }}>
          <BookMarked size={40} color="var(--color-border)" style={{ margin: '0 auto 16px' }} />
          <p className="font-serif" style={{ fontSize: '18px', marginBottom: '8px' }}>Your shelf is empty</p>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Add your first book to start tracking your reading journey.</p>
        </div>
      )}

      {grouped.map(group => group.items.length > 0 && (
        <div key={group.key} style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: group.color, flexShrink: 0 }} />
            <h2 className="font-serif" style={{ fontSize: '20px' }}>{group.label}</h2>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>({group.items.length})</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {group.items.map(book => (
              <BookCard key={book.id} book={book} accentColor={group.color} onSelect={onSelectBook} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function BookCard({ book, accentColor, onSelect }: { book: Book; accentColor: string; onSelect: (id: number) => void }) {
  return (
    <div
      onClick={() => onSelect(book.id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        padding: '14px',
        boxShadow: 'var(--shadow-sm)',
        cursor: 'pointer',
        transition: 'transform 0.15s',
        border: '1px solid var(--color-border)'
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateX(3px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'translateX(0)')}
    >
      {book.coverUrl ? (
        <img
          src={book.coverUrl}
          alt={book.title}
          style={{ width: '48px', height: '68px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
        />
      ) : (
        <div style={{
          width: '48px', height: '68px', borderRadius: '4px', flexShrink: 0,
          backgroundColor: accentColor, opacity: 0.8,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <BookMarked size={20} color="white" />
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="font-serif" style={{ fontSize: '16px', fontWeight: 600, marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {book.title}
        </p>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>{book.author}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {book.genre && (
            <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px', backgroundColor: 'var(--color-border)', color: 'var(--color-text-muted)', letterSpacing: '0.3px' }}>
              {book.genre}
            </span>
          )}
          {book.currentChapter && (
            <span style={{ fontSize: '10px', color: 'var(--color-primary)', fontWeight: 600 }}>
              Ch. {book.currentChapter}
            </span>
          )}
          {book.notes.length > 0 && (
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
              {book.notes.length} note{book.notes.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <ChevronRight size={18} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
    </div>
  );
}
