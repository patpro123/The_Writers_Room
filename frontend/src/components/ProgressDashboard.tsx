import React, { useState, useEffect } from 'react';
import { Award, Flame, Zap, GraduationCap, TrendingUp, ChevronRight } from 'lucide-react';

interface Progress {
  currentStreak: number;
  longestStreak: number;
  badges: string[];
  xp: number;
}

const RANKS = [
  { name: 'Matriculator', xpRequired: 0 },
  { name: 'Scholar', xpRequired: 50 },
  { name: 'Fellow', xpRequired: 150 },
  { name: 'Don', xpRequired: 300 },
];

function getRankInfo(xp: number) {
  let currentRank = RANKS[0];
  let nextRank = RANKS[1];
  
  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].xpRequired) {
      currentRank = RANKS[i];
      nextRank = RANKS[i + 1] || null;
    }
  }
  
  return { currentRank, nextRank };
}

export default function ProgressDashboard({ token }: { token: string }) {
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    fetch(`http://localhost:3001/api/progress`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProgress(data))
      .catch(err => console.error("Failed to load progress", err));
  }, [token]);

  if (!progress) {
    return <div className="text-center" style={{ marginTop: '50px' }}>Loading...</div>;
  }

  const { currentRank, nextRank } = getRankInfo(progress.xp);
  const progressToNext = nextRank 
    ? ((progress.xp - currentRank.xpRequired) / (nextRank.xpRequired - currentRank.xpRequired)) * 100 
    : 100;

  const BADGE_MAP: Record<string, { icon: React.ReactNode, color: string, desc: string }> = {
    'First Spark': { icon: <Zap size={24} />, color: '#F59E0B', desc: 'Wrote your very first response.' },
    '3-Day Streak': { icon: <Flame size={24} />, color: '#EF4444', desc: 'Wrote for 3 consecutive days.' },
    '7-Day Streak': { icon: <Award size={24} />, color: '#8B5CF6', desc: 'Wrote for 7 consecutive days.' }
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s', paddingBottom: '40px' }}>
      <h1 className="mb-6 font-serif" style={{ fontSize: '28px' }}>Your Academic Journey</h1>

      {/* Gamification Rank Card */}
      <div style={{
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        padding: '32px',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '32px',
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background element */}
        <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.1 }}>
          <GraduationCap size={150} />
        </div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, marginBottom: '4px' }}>
                Current Rank
              </div>
              <div className="font-serif" style={{ fontSize: '32px', lineHeight: 1 }}>
                {currentRank.name}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '32px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                {progress.xp} <span style={{ fontSize: '14px', fontWeight: 500, opacity: 0.8 }}>XP</span>
              </div>
            </div>
          </div>

          {nextRank && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', opacity: 0.9 }}>
                <span>Progress to {nextRank.name}</span>
                <span>{nextRank.xpRequired - progress.xp} XP remaining</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${progressToNext}%`, height: '100%', backgroundColor: 'white', borderRadius: '4px', transition: 'width 0.5s ease-out' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '32px' 
      }}>
        <div style={{ 
          flex: 1, 
          padding: '24px', 
          backgroundColor: 'var(--color-surface)', 
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <Flame size={32} color="#EF4444" className="mb-2" />
          <div style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'var(--font-serif)' }}>
            {progress.currentStreak}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Day Streak
          </div>
        </div>

        <div style={{ 
          flex: 1, 
          padding: '24px', 
          backgroundColor: 'var(--color-surface)', 
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <Award size={32} color="var(--color-primary)" className="mb-2" />
          <div style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'var(--font-serif)' }}>
            {progress.badges.length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Badges
          </div>
        </div>
      </div>

      <h2 className="mb-4 font-serif" style={{ fontSize: '20px' }}>Badges Unlocked</h2>
      
      {progress.badges.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '24px' }}>
          Complete your first Deep Dive or Daily Spark to earn XP and unlock badges!
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {progress.badges.filter(Boolean).map(badge => {
            const badgeMeta = BADGE_MAP[badge] || { icon: <Award size={24} />, color: 'var(--color-primary)', desc: 'Special Achievement' };
            return (
              <div key={badge} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                padding: '16px',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  backgroundColor: `${badgeMeta.color}15`, 
                  color: badgeMeta.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {badgeMeta.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '2px' }}>{badge}</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{badgeMeta.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
