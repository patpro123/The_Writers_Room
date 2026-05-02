import React, { useState, useEffect } from 'react';
import { Home, Flame, BookOpen, Library } from 'lucide-react';
import DailySparkView from './components/DailySparkView';
import MoodTrackerModal from './components/MoodTrackerModal';
import ProgressDashboard from './components/ProgressDashboard';
import JournalView from './components/JournalView';
import LoginScreen from './components/LoginScreen';
import DeepDiveLibrary from './components/DeepDiveLibrary';
import DeepDiveDetail from './components/DeepDiveDetail';
import { API_BASE_URL } from './config';
import './index.css';

const DISABLE_AUTH = true;

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'progress' | 'journal' | 'deepdives'>('home');
  const [selectedDeepDiveId, setSelectedDeepDiveId] = useState<number | null>(null);
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [hasLoggedMood, setHasLoggedMood] = useState(false);
  
  // Auth state
  const [token, setToken] = useState<string | null>(DISABLE_AUTH ? 'mock-token' : localStorage.getItem('token'));
  const [user, setUser] = useState<any>(DISABLE_AUTH ? { name: 'Mock User', id: 1 } : null);

  useEffect(() => {
    if (DISABLE_AUTH) {
      const lastLogged = localStorage.getItem('lastMoodDate');
      const today = new Date().toDateString();
      if (lastLogged !== today) setShowMoodTracker(true);
      else setHasLoggedMood(true);
      return;
    }

    if (!token) return;

    // Fetch user details with JWT
    fetch(`${API_BASE_URL}/api/user/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Invalid token');
        return res.json();
      })
      .then(data => setUser(data))
      .catch(err => {
        console.error(err);
        handleLogout();
      });

    // Check if user has logged mood today
    const lastLogged = localStorage.getItem('lastMoodDate');
    const today = new Date().toDateString();
    
    if (lastLogged !== today) {
      setShowMoodTracker(true);
    } else {
      setHasLoggedMood(true);
    }
  }, [token]);

  const handleLoginSuccess = (jwtToken: string, userData: any) => {
    localStorage.setItem('token', jwtToken);
    setToken(jwtToken);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const handleMoodLogged = async (mood: string, reflection: string) => {
    try {
      if (!token) return;
      await fetch(`${API_BASE_URL}/api/mood`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mood, reflection })
      });
      localStorage.setItem('lastMoodDate', new Date().toDateString());
      setHasLoggedMood(true);
      setShowMoodTracker(false);
    } catch (err) {
      console.error('Failed to log mood', err);
      setShowMoodTracker(false);
    }
  };

  if (!token) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  if (!user) {
    return <div className="text-center" style={{ marginTop: '50px' }}>Loading your room...</div>;
  }

  return (
    <>
      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8 }}>
            {user.avatarUrl && <img src={user.avatarUrl} alt="Avatar" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />}
            <span style={{ fontSize: '12px', fontWeight: 600 }}>{user.name}</span>
            <button onClick={handleLogout} style={{ fontSize: '11px', textDecoration: 'underline', marginLeft: '8px' }}>Log out</button>
          </div>
        </div>

        {activeTab === 'home' && <DailySparkView token={token} />}
        {activeTab === 'progress' && <ProgressDashboard token={token} />}
        {activeTab === 'journal' && <JournalView token={token} />}
        
        {activeTab === 'deepdives' && !selectedDeepDiveId && (
          <DeepDiveLibrary token={token} onSelect={setSelectedDeepDiveId} />
        )}
        {activeTab === 'deepdives' && selectedDeepDiveId && (
          <DeepDiveDetail 
            token={token} 
            deepDiveId={selectedDeepDiveId} 
            onBack={() => setSelectedDeepDiveId(null)} 
          />
        )}
      </div>

      <nav className="navbar">
        <button 
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <Home size={24} />
          <span>Spark</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          <Flame size={24} />
          <span>Progress</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'journal' ? 'active' : ''}`}
          onClick={() => setActiveTab('journal')}
        >
          <BookOpen size={24} />
          <span>Archive</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'deepdives' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('deepdives');
            setSelectedDeepDiveId(null);
          }}
        >
          <Library size={24} />
          <span>Library</span>
        </button>
      </nav>

      {showMoodTracker && (
        <MoodTrackerModal 
          onClose={() => setShowMoodTracker(false)}
          onSave={handleMoodLogged} 
        />
      )}
    </>
  );
}

export default App;
