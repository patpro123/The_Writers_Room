import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, MessageSquare } from 'lucide-react';
import PassageQuizComponent from './PassageQuizComponent';
import DebateCardComponent from './DebateCardComponent';
import { API_BASE_URL } from '../config';

interface Props {
  deepDiveId: number;
  token: string | null;
  onBack: () => void;
}

export default function DeepDiveDetail({ deepDiveId, token, onBack }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'passages' | 'debates'>('passages');

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/deepdives/${deepDiveId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(result => {
        setData(result);
        setLoading(false);
        // Mark as EXPLORING if NOT_STARTED
        if (result.progress?.status === 'NOT_STARTED') {
          saveProgress('EXPLORING');
        }
      })
      .catch(err => {
        console.error("Failed to load deep dive", err);
        setLoading(false);
      });
  }, [deepDiveId, token]);

  const saveProgress = async (status: string, newAnswers?: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/deepdives/${deepDiveId}/progress`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, newAnswers })
      });
      const updatedProgress = await res.json();
      setData((prev: any) => ({ ...prev, progress: updatedProgress }));
    } catch (err) {
      console.error("Failed to save progress", err);
    }
  };

  const handlePassageSave = async (passageId: number, answer: string) => {
    await saveProgress('EXPLORING', { [`passage_${passageId}`]: answer });
  };

  const handleDebateSave = async (debateId: number, answer: string) => {
    await saveProgress('EXPLORING', { [`debate_${debateId}`]: answer });
  };

  if (loading || !data) {
    return <div className="text-center mt-12">Loading Deep Dive...</div>;
  }

  const { deepDive, progress } = data;
  let answersObj: any = {};
  try {
    answersObj = JSON.parse(progress.answers || '{}');
  } catch (e) {}

  return (
    <div style={{ animation: 'fadeIn 0.4s' }}>
      <button 
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--color-text-muted)' }}
      >
        <ArrowLeft size={16} /> Back to Library
      </button>

      <div style={{
        backgroundColor: deepDive.coverColor,
        padding: '32px 24px',
        borderRadius: 'var(--radius-md)',
        color: 'white',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px'
      }}>
        {deepDive.author === 'Virginia Woolf' && (
          <img src="/images/woolf.jpg" alt="Virginia Woolf" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.2)' }} />
        )}
        {deepDive.author === 'F. Scott Fitzgerald' && (
          <img src="/images/fitzgerald.jpg" alt="F. Scott Fitzgerald" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.2)' }} />
        )}
        <div>
          <h1 className="font-serif" style={{ fontSize: '32px', marginBottom: '8px', lineHeight: 1.1 }}>
            {deepDive.title}
          </h1>
          <p style={{ opacity: 0.9, fontSize: '16px', marginBottom: '16px' }}>{deepDive.author}</p>
          <p style={{ opacity: 0.8, fontSize: '14px', lineHeight: 1.5, maxWidth: '600px' }}>
            {deepDive.description}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--color-border)', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('passages')}
          style={{
            padding: '12px 16px',
            borderBottom: activeTab === 'passages' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'passages' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'passages' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FileText size={18} /> Passage Analysis
        </button>
        <button
          onClick={() => setActiveTab('debates')}
          style={{
            padding: '12px 16px',
            borderBottom: activeTab === 'debates' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'debates' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'debates' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <MessageSquare size={18} /> Thematic Debates
        </button>
      </div>

      {activeTab === 'passages' && (
        <div>
          {deepDive.passages.map((p: any) => (
            <PassageQuizComponent 
              key={p.id} 
              passage={p} 
              savedAnswer={answersObj[`passage_${p.id}`] || ''}
              aiFeedback={answersObj[`passage_feedback_${p.id}`] || ''}
              onSave={(ans) => handlePassageSave(p.id, ans)}
            />
          ))}
          {deepDive.passages.length === 0 && <p>No passages available yet.</p>}
        </div>
      )}

      {activeTab === 'debates' && (
        <div>
          {deepDive.debates.map((d: any) => (
            <DebateCardComponent 
              key={d.id} 
              debate={d} 
              savedAnswer={answersObj[`debate_${d.id}`] || ''}
              aiFeedback={answersObj[`debate_feedback_${d.id}`] || ''}
              onSave={(ans) => handleDebateSave(d.id, ans)}
            />
          ))}
          {deepDive.debates.length === 0 && <p>No debates available yet.</p>}
        </div>
      )}
    </div>
  );
}
