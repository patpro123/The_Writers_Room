import { useState, useEffect } from 'react';
import { BookMarked, Sparkles, ExternalLink, GraduationCap, BookOpen, ChevronRight } from 'lucide-react';
import ShelfStudyView from './ShelfStudyView';
import { API_BASE_URL } from '../config';

interface DeepDiveSummary {
  id: number;
  title: string;
  author: string;
  description: string;
  coverColor: string;
  period: string | null;
  status: 'NOT_STARTED' | 'EXPLORING' | 'COMPLETED';
}

interface ShelfBook {
  id: number;
  title: string;
  author: string;
  genre: string | null;
  coverUrl: string | null;
  status: string;
}

interface Props {
  token: string | null;
  onSelect: (id: number) => void;
}

const OXFORD_PERIODS = [
  'Prelims: 1830–1910',
  'Prelims: 1910–present',
  'FHS: 1350–1550',
  'FHS: 1550–1660',
  'FHS: 1660–1760',
  'FHS: 1760–1830'
];

export default function DeepDiveLibrary({ token, onSelect }: Props) {
  const [activeSection, setActiveSection] = useState<'oxford' | 'shelf'>('oxford');
  const [selectedShelfBookId, setSelectedShelfBookId] = useState<number | null>(null);

  // Oxford state
  const [library, setLibrary] = useState<DeepDiveSummary[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  // Shelf state
  const [shelfBooks, setShelfBooks] = useState<ShelfBook[]>([]);
  const [loadingShelf, setLoadingShelf] = useState(false);

  const fetchLibrary = () => {
    fetch(`${API_BASE_URL}/api/deepdives`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { setLibrary(data); setLoadingLibrary(false); })
      .catch(() => setLoadingLibrary(false));
  };

  const fetchShelfBooks = () => {
    setLoadingShelf(true);
    fetch(`${API_BASE_URL}/api/books`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { setShelfBooks(data); setLoadingShelf(false); })
      .catch(() => setLoadingShelf(false));
  };

  useEffect(() => { fetchLibrary(); }, [token]);

  useEffect(() => {
    if (activeSection === 'shelf' && shelfBooks.length === 0) {
      fetchShelfBooks();
    }
  }, [activeSection]);

  const handleGenerate = async (period: string) => {
    setGenerating(period);
    try {
      const res = await fetch(`${API_BASE_URL}/api/deepdives/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ period })
      });
      const newDive = await res.json();
      if (newDive && newDive.id) fetchLibrary();
    } catch {
      // silently fail
    } finally {
      setGenerating(null);
    }
  };

  // If studying a shelf book, hand off to ShelfStudyView
  if (selectedShelfBookId) {
    return (
      <ShelfStudyView
        bookId={selectedShelfBookId}
        token={token}
        onBack={() => setSelectedShelfBookId(null)}
      />
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s', paddingBottom: '40px' }}>
      <div className="mb-2 flex items-center gap-2">
        <BookMarked size={28} color="var(--color-primary)" />
        <h1 className="font-serif" style={{ fontSize: '28px' }}>Study Library</h1>
      </div>

      {/* Section Tab Switcher */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', backgroundColor: 'var(--color-surface)', padding: '6px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
        <button
          onClick={() => setActiveSection('oxford')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '7px',
            padding: '10px 12px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 700,
            backgroundColor: activeSection === 'oxford' ? 'var(--color-primary)' : 'transparent',
            color: activeSection === 'oxford' ? 'white' : 'var(--color-text-muted)',
            transition: 'all 0.2s'
          }}
        >
          <GraduationCap size={16} /> Oxford Syllabus
        </button>
        <button
          onClick={() => setActiveSection('shelf')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '7px',
            padding: '10px 12px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 700,
            backgroundColor: activeSection === 'shelf' ? 'var(--color-primary)' : 'transparent',
            color: activeSection === 'shelf' ? 'white' : 'var(--color-text-muted)',
            transition: 'all 0.2s'
          }}
        >
          <BookOpen size={16} /> My Shelf
        </button>
      </div>

      {/* ── Oxford Syllabus ── */}
      {activeSection === 'oxford' && (
        <>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
            Dynamic exercises mapped to the <a href="https://www.english.ox.ac.uk/ba-english-language-and-literature" target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>BA English Language and Literature syllabus <ExternalLink size={12} /></a>. Generate endless modules to test your close reading.
          </p>

          {loadingLibrary ? (
            <div className="text-center" style={{ marginTop: '48px', color: 'var(--color-text-muted)' }}>Loading Library...</div>
          ) : (
            (() => {
              const byPeriod: Record<string, DeepDiveSummary[]> = {};
              OXFORD_PERIODS.forEach(p => (byPeriod[p] = []));
              byPeriod['Uncategorized'] = [];
              library.forEach(work => {
                if (work.period && byPeriod[work.period] !== undefined) {
                  byPeriod[work.period].push(work);
                } else {
                  byPeriod['Uncategorized'].push(work);
                }
              });

              return (
                <>
                  {OXFORD_PERIODS.map(period => (
                    <div key={period} style={{ marginBottom: '40px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '16px' }}>
                        <h2 className="font-serif" style={{ fontSize: '20px' }}>{period}</h2>
                        <button
                          onClick={() => handleGenerate(period)}
                          disabled={generating !== null}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            fontSize: '12px', fontWeight: 600,
                            backgroundColor: 'var(--color-primary-light)',
                            padding: '6px 12px', borderRadius: '16px',
                            color: 'white', opacity: generating ? 0.5 : 1
                          }}
                        >
                          <Sparkles size={14} />
                          {generating === period ? 'Curating...' : 'Generate Work'}
                        </button>
                      </div>

                      {byPeriod[period].length === 0 ? (
                        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '24px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)' }}>
                          No works explored yet. Generate one to begin.
                        </p>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                          {byPeriod[period].map(work => (
                            <LibraryCard key={work.id} work={work} onSelect={onSelect} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {byPeriod['Uncategorized'].length > 0 && (
                    <div style={{ marginBottom: '40px' }}>
                      <h2 className="font-serif" style={{ fontSize: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '16px' }}>
                        Curated Classics
                      </h2>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                        {byPeriod['Uncategorized'].map(work => (
                          <LibraryCard key={work.id} work={work} onSelect={onSelect} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()
          )}
        </>
      )}

      {/* ── My Shelf ── */}
      {activeSection === 'shelf' && (
        <>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
            Study the books on your personal shelf. Generate Oxbridge-style passage quizzes from anything you're reading, or paste your own excerpts for close reading practice.
          </p>

          {loadingShelf && (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '48px', fontSize: '13px' }}>Loading your shelf...</p>
          )}

          {!loadingShelf && shelfBooks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border)' }}>
              <BookOpen size={40} color="var(--color-border)" style={{ margin: '0 auto 16px' }} />
              <p className="font-serif" style={{ fontSize: '18px', marginBottom: '8px' }}>Your shelf is empty</p>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Add books to your shelf first, then come back here to study them.
              </p>
            </div>
          )}

          {!loadingShelf && shelfBooks.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {shelfBooks.map(book => (
                <ShelfBookCard key={book.id} book={book} onStudy={setSelectedShelfBookId} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Oxford Library Card ─────────────────────────────────────────────────────────

function LibraryCard({ work, onSelect }: { work: DeepDiveSummary; onSelect: (id: number) => void }) {
  return (
    <div
      onClick={() => onSelect(work.id)}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      <div style={{ height: '80px', backgroundColor: work.coverColor, display: 'flex', alignItems: 'flex-end', padding: '16px' }}>
        <div>
          <h3 className="font-serif" style={{ color: 'white', fontSize: '20px', lineHeight: 1.1 }}>{work.title}</h3>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>{work.author}</p>
        </div>
      </div>
      <div style={{ padding: '16px' }}>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
          {work.description}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontSize: '11px', fontWeight: 600, padding: '4px 8px', borderRadius: '12px',
            backgroundColor: work.status === 'NOT_STARTED' ? '#f0f0f0' : 'var(--color-primary-light)',
            color: work.status === 'NOT_STARTED' ? '#888' : 'white', letterSpacing: '0.5px'
          }}>
            {work.status.replace('_', ' ')}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>Enter Dive →</span>
        </div>
      </div>
    </div>
  );
}

// ── Shelf Book Card ─────────────────────────────────────────────────────────────

function ShelfBookCard({ book, onStudy }: { book: ShelfBook; onStudy: (id: number) => void }) {
  const statusColor = book.status === 'Reading' ? '#8C4A32' : book.status === 'Completed' ? '#059669' : '#6B7280';

  return (
    <div
      onClick={() => onStudy(book.id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        padding: '14px',
        boxShadow: 'var(--shadow-sm)',
        cursor: 'pointer',
        border: '1px solid var(--color-border)',
        transition: 'transform 0.15s'
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateX(3px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'translateX(0)')}
    >
      {book.coverUrl ? (
        <img src={book.coverUrl} alt={book.title} style={{ width: '44px', height: '62px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }} />
      ) : (
        <div style={{ width: '44px', height: '62px', borderRadius: '4px', flexShrink: 0, backgroundColor: statusColor, opacity: 0.7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BookOpen size={18} color="white" />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="font-serif" style={{ fontSize: '15px', fontWeight: 600, marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {book.title}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>{book.author}</p>
        <span style={{
          fontSize: '10px', fontWeight: 700, letterSpacing: '0.4px',
          color: statusColor, textTransform: 'uppercase'
        }}>
          {book.status}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)' }}>Study</span>
        <ChevronRight size={16} color="var(--color-primary)" />
      </div>
    </div>
  );
}
