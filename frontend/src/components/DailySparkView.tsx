import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Send } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface Spark {
  id: number;
  dayNumber: number;
  prompt: string;
  category: string;
}

export default function DailySparkView({ token }: { token: string }) {
  const [spark, setSpark] = useState<Spark | null>(null);
  const [response, setResponse] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/spark/today`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSpark(data))
      .catch(err => console.error("Failed to load spark", err));

    // Setup Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setResponse(prev => prev + ' ' + finalTranscript.trim());
        }
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListenPrompt = () => {
    if (!spark) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(spark.prompt);
    utterance.rate = 0.9; // Slightly slower for thoughtful reading
    window.speechSynthesis.speak(utterance);
  };

  const toggleDictation = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSubmit = async () => {
    if (!spark || !response.trim()) return;
    try {
      await fetch(`${API_BASE_URL}/api/journal`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ dailySparkId: spark.id, content: response })
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error("Failed to submit response", err);
    }
  };

  if (!spark) {
    return <div className="text-center" style={{ marginTop: '50px' }}>Loading the room...</div>;
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ height: '70vh', animation: 'fadeIn 0.5s' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🕯️</div>
        <h2 className="mb-2 font-serif text-center">Your thought is preserved.</h2>
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>
          Check your progress to see your updated streak.
        </p>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s' }}>
      <div className="mb-6 flex justify-between items-center">
        <span style={{ 
          fontSize: '12px', 
          fontWeight: 600, 
          textTransform: 'uppercase', 
          letterSpacing: '1px',
          color: 'var(--color-primary)' 
        }}>
          {spark.category} • Day {spark.dayNumber}
        </span>
        <button onClick={toggleListenPrompt} style={{ color: 'var(--color-primary)' }}>
          <Volume2 size={20} />
        </button>
      </div>

      <h1 className="mb-6 font-serif" style={{ fontSize: '28px', lineHeight: '1.4' }}>
        {spark.prompt}
      </h1>

      <div style={{ position: 'relative' }}>
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Start writing..."
          style={{
            width: '100%',
            height: '250px',
            padding: '16px',
            paddingBottom: '60px',
            fontSize: '16px',
            fontFamily: 'var(--font-serif)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            resize: 'none',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
          }}
        />
        
        <div style={{ 
          position: 'absolute', 
          bottom: '12px', 
          left: '12px', 
          right: '12px', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button 
            onClick={toggleDictation}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isListening ? '#fef2f2' : 'var(--color-bg)',
              color: isListening ? '#ef4444' : 'var(--color-text-muted)',
              border: `1px solid ${isListening ? '#fca5a5' : 'var(--color-border)'}`
            }}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            <span style={{ fontSize: '12px', fontWeight: 500 }}>{isListening ? 'Listening...' : 'Talk'}</span>
          </button>

          <button 
            onClick={handleSubmit}
            disabled={!response.trim()}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: response.trim() ? 'var(--color-primary)' : 'var(--color-border)',
              color: response.trim() ? '#fff' : 'var(--color-text-muted)',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Save</span>
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
