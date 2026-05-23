import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface ChatMessage {
  id: number;
  role: string;
  message: string;
  createdAt: string;
}

interface DailyObservationLyraChatProps {
  journalEntryId: number;
  token: string;
}

export default function DailyObservationLyraChat({
  journalEntryId,
  token
}: DailyObservationLyraChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/journal/${journalEntryId}/lyra-chat`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [journalEntryId, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const optimisticMsg: ChatMessage = { id: Date.now(), role: 'user', message: text, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, optimisticMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/journal/${journalEntryId}/lyra-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      const aiMsg: ChatMessage = { id: data.messageId, role: 'model', message: data.reply, createdAt: new Date().toISOString() };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errorMsg: ChatMessage = { id: Date.now() + 1, role: 'model', message: "I lost my train of thought there. Could you try again?", createdAt: new Date().toISOString() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      borderTop: '1px solid var(--color-border)',
      marginTop: '24px',
      paddingTop: '24px',
      animation: 'fadeIn 0.3s ease'
    }}>
      <h3 className="font-serif" style={{ fontSize: '16px', marginBottom: '16px' }}>Lyra's Perspective</h3>

      {/* Messages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px', maxHeight: '400px', overflowY: 'auto' }}>
        {loading && (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>Starting conversation with Lyra...</p>
        )}

        {!loading && messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>✦</div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              Waiting for Lyra's thoughts...
            </p>
          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            {msg.role === 'model' && (
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', flexShrink: 0, marginRight: '8px', alignSelf: 'flex-end'
              }}>
                ✦
              </div>
            )}
            <div style={{
              maxWidth: '85%',
              padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              backgroundColor: msg.role === 'user' ? 'var(--color-primary)' : 'var(--color-surface)',
              color: msg.role === 'user' ? 'white' : 'var(--color-text)',
              fontSize: '13px',
              lineHeight: 1.55,
              boxShadow: 'var(--shadow-sm)',
              border: msg.role === 'model' ? '1px solid var(--color-border)' : 'none'
            }}>
              {msg.message}
            </div>
          </div>
        ))}

        {sending && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>✦</div>
            <div style={{
              padding: '8px 12px',
              borderRadius: '16px 16px 16px 4px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              display: 'flex', gap: '3px', alignItems: 'center'
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--color-text-muted)', animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-end'
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What else would you like to explore?"
          rows={2}
          disabled={sending}
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text)',
            fontSize: '13px',
            resize: 'none',
            outline: 'none',
            lineHeight: 1.5,
            maxHeight: '80px',
            overflowY: 'auto',
            fontFamily: 'var(--font-sans)'
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: input.trim() && !sending ? 'var(--color-primary)' : 'var(--color-border)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background-color 0.15s',
            cursor: input.trim() && !sending ? 'pointer' : 'default'
          }}
        >
          <Send size={15} />
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 60%, 100% { transform: scale(1); opacity: 0.5; }
          30% { transform: scale(1.3); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
