import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface JournalEntry {
  id: number;
  createdAt: string;
  content: string;
  dailySpark: {
    prompt: string;
    category: string;
    dayNumber: number;
  };
}

export default function JournalView({ token }: { token: string }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/journal`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setEntries(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load journal entries", err);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return <div className="text-center" style={{ marginTop: '50px' }}>Loading...</div>;
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s' }}>
      <div className="mb-6 flex items-center gap-2">
        <BookOpen size={28} color="var(--color-primary)" />
        <h1 className="font-serif" style={{ fontSize: '28px' }}>Your Archive</h1>
      </div>

      {entries.length === 0 ? (
        <div style={{ 
          padding: '48px 24px', 
          textAlign: 'center',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--color-border)'
        }}>
          <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            The pages are empty. Respond to a Daily Spark to begin your journal.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {entries.map(entry => (
            <div key={entry.id} style={{
              backgroundColor: 'var(--color-surface)',
              padding: '24px',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div className="mb-3 flex justify-between items-center">
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: 600, 
                  textTransform: 'uppercase', 
                  letterSpacing: '1px',
                  color: 'var(--color-primary-light)' 
                }}>
                  {entry.dailySpark.category} • Day {entry.dailySpark.dayNumber}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              
              <h3 className="font-serif mb-4" style={{ fontSize: '16px', lineHeight: '1.4', color: 'var(--color-text-muted)' }}>
                "{entry.dailySpark.prompt}"
              </h3>
              
              <div style={{ 
                fontFamily: 'var(--font-serif)', 
                fontSize: '15px', 
                lineHeight: '1.7',
                whiteSpace: 'pre-wrap'
              }}>
                {entry.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
