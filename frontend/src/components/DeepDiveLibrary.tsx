import React, { useState, useEffect } from 'react';
import { BookMarked, Sparkles, ExternalLink } from 'lucide-react';
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
  const [library, setLibrary] = useState<DeepDiveSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  const fetchLibrary = () => {
    fetch(`${API_BASE_URL}/api/deepdives`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setLibrary(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load library", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLibrary();
  }, [token]);

  const handleGenerate = async (period: string) => {
    setGenerating(period);
    try {
      const res = await fetch(`${API_BASE_URL}/api/deepdives/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ period })
      });
      const newDive = await res.json();
      if (newDive && newDive.id) {
        fetchLibrary(); // Refresh library
      }
    } catch (err) {
      console.error("Failed to generate", err);
    } finally {
      setGenerating(null);
    }
  };

  if (loading) {
    return <div className="text-center mt-12">Loading Library...</div>;
  }

  // Group library by period
  const byPeriod: Record<string, DeepDiveSummary[]> = {};
  OXFORD_PERIODS.forEach(p => byPeriod[p] = []);
  byPeriod['Uncategorized'] = [];

  library.forEach(work => {
    if (work.period && byPeriod[work.period] !== undefined) {
      byPeriod[work.period].push(work);
    } else {
      byPeriod['Uncategorized'].push(work);
    }
  });

  return (
    <div style={{ animation: 'fadeIn 0.4s', paddingBottom: '40px' }}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookMarked size={28} color="var(--color-primary)" />
          <h1 className="font-serif" style={{ fontSize: '28px' }}>Oxford Syllabus Library</h1>
        </div>
      </div>
      
      <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
        Dynamic exercises mapped to the <a href="https://www.english.ox.ac.uk/ba-english-language-and-literature" target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>BA English Language and Literature syllabus <ExternalLink size={12} /></a>. Generate endless modules to test your close reading.
      </p>

      {OXFORD_PERIODS.map(period => (
        <div key={period} style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '16px' }}>
            <h2 className="font-serif" style={{ fontSize: '20px', color: 'var(--color-text)' }}>
              {period}
            </h2>
            <button 
              onClick={() => handleGenerate(period)}
              disabled={generating !== null}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-primary)',
                backgroundColor: 'var(--color-primary-light)',
                padding: '6px 12px',
                borderRadius: '16px',
                color: 'white',
                opacity: generating ? 0.5 : 1
              }}
            >
              <Sparkles size={14} />
              {generating === period ? 'Curating...' : 'Generate Work'}
            </button>
          </div>

          {byPeriod[period].length === 0 ? (
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '24px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)' }}>
              No works explored yet for this period. Generate one to begin.
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
          <h2 className="font-serif" style={{ fontSize: '20px', color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '16px' }}>
            Curated Classics
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            {byPeriod['Uncategorized'].map(work => (
              <LibraryCard key={work.id} work={work} onSelect={onSelect} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LibraryCard({ work, onSelect }: { work: DeepDiveSummary, onSelect: (id: number) => void }) {
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
      <div style={{ 
        height: '80px', 
        backgroundColor: work.coverColor,
        display: 'flex',
        alignItems: 'flex-end',
        padding: '16px'
      }}>
        <div>
          <h3 className="font-serif" style={{ color: 'white', fontSize: '20px', lineHeight: 1.1 }}>
            {work.title}
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
            {work.author}
          </p>
        </div>
      </div>
      
      <div style={{ padding: '16px' }}>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
          {work.description}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ 
            fontSize: '11px', 
            fontWeight: 600, 
            padding: '4px 8px',
            borderRadius: '12px',
            backgroundColor: work.status === 'NOT_STARTED' ? '#f0f0f0' : 'var(--color-primary-light)',
            color: work.status === 'NOT_STARTED' ? '#888' : 'white',
            letterSpacing: '0.5px'
          }}>
            {work.status.replace('_', ' ')}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>
            Enter Dive →
          </span>
        </div>
      </div>
    </div>
  );
}
