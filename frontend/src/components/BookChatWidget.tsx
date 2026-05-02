import { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface Book {
  id: number;
  title: string;
  author: string;
  currentChapter: number | null;
}

interface ChatMessage {
  id: number;
  role: string;
  message: string;
  createdAt: string;
}

interface Props {
  book: Book;
  token: string | null;
  onClose: () => void;
}

export default function BookChatWidget({ book, token, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/books/${book.id}/chat`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [book.id, token]);

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
      const res = await fetch(`${API_BASE_URL}/api/books/${book.id}/chat`, {
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
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)',
      zIndex: 300,
      display: 'flex',
      flexDirection: 'column',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-bg)',
        maxWidth: '600px',
        width: '100%',
        margin: '0 auto',
        maxHeight: '100vh'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', flexShrink: 0
          }}>
            ✦
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: '15px', marginBottom: '1px' }}>Lyra</p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {book.title}
              {book.currentChapter ? ` · up to ch. ${book.currentChapter}` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ color: 'var(--color-text-muted)', padding: '4px', flexShrink: 0 }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {loading && (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>Loading conversation...</p>
          )}

          {!loading && messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>✦</div>
              <p className="font-serif" style={{ fontSize: '17px', marginBottom: '8px' }}>Hi, I'm Lyra.</p>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                I've been dying to talk about <em>{book.title}</em>. What's on your mind — a character, a moment, a question that's been nagging at you?
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
                  width: '28px', height: '28px', borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', flexShrink: 0, marginRight: '8px', alignSelf: 'flex-end'
                }}>
                  ✦
                </div>
              )}
              <div style={{
                maxWidth: '78%',
                padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                backgroundColor: msg.role === 'user' ? 'var(--color-primary)' : 'var(--color-surface)',
                color: msg.role === 'user' ? 'white' : 'var(--color-text)',
                fontSize: '14px',
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
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>✦</div>
              <div style={{
                padding: '10px 16px',
                borderRadius: '18px 18px 18px 4px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                display: 'flex', gap: '4px', alignItems: 'center'
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-text-muted)', animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-end',
          flexShrink: 0
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Say something about the book..."
            rows={1}
            disabled={sending}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '20px',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              fontSize: '14px',
              resize: 'none',
              outline: 'none',
              lineHeight: 1.5,
              maxHeight: '96px',
              overflowY: 'auto',
              fontFamily: 'var(--font-sans)'
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: input.trim() && !sending ? 'var(--color-primary)' : 'var(--color-border)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background-color 0.15s'
            }}
          >
            <Send size={17} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 60%, 100% { transform: scale(1); opacity: 0.5; }
          30% { transform: scale(1.3); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
