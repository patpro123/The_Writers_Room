import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface Props {
  onLoginSuccess: (token: string, user: any) => void;
}

export default function LoginScreen({ onLoginSuccess }: Props) {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Real-time password requirement indicators
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecialChar = /[@$!%*?&#]/.test(password);

  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasDigit && hasSpecialChar;

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    setSuccessMessage('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      onLoginSuccess(data.token, data.user);
    } catch (err) {
      console.error('Google login failed', err);
      setError('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError('User ID / Username is required');
      return;
    }

    if (activeTab === 'register') {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        setError('Email address is required');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setError('Please enter a valid email address.');
        return;
      }

      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(trimmedUsername)) {
        setError('User ID must be 3-20 characters and contain only letters, numbers, or underscores.');
        return;
      }

      if (!isPasswordValid) {
        setError('Password does not meet the complexity requirements.');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    const endpoint = activeTab === 'register' ? '/api/auth/register' : '/api/auth/login';

    try {
      const payload: any = { username: trimmedUsername, password };
      if (activeTab === 'register') {
        payload.email = email.trim();
      }

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Authentication failed. Please check your credentials.');
        return;
      }

      onLoginSuccess(data.token, data.user);
    } catch (err) {
      console.error('Auth error:', err);
      setError('Connection to server failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Email address is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Failed to request password reset.');
        return;
      }

      setSuccessMessage('If this email is registered, a temporary password has been generated. For local testing, check your backend server terminal logs.');
      setEmail('');
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Connection to server failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        padding: '24px',
        textAlign: 'center',
        animation: 'fadeIn 0.3s ease-in-out'
      }}>
        <style>{`
          @keyframes pulseRing {
            0% { transform: scale(0.85); opacity: 0.5; }
            50% { transform: scale(1.2); opacity: 0.15; }
            100% { transform: scale(0.85); opacity: 0.5; }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        
        {/* Pulsing Loading Animation */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '32px'
        }}>
          {/* Pulsing ring */}
          <div style={{
            position: 'absolute',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: '2px solid var(--color-primary)',
            animation: 'pulseRing 2s infinite ease-in-out'
          }} />
          {/* Rotating Spinner */}
          <Loader2 
            size={40} 
            style={{ 
              color: 'var(--color-primary)', 
              animation: 'spin 1.2s linear infinite' 
            }} 
          />
        </div>

        <h2 className="font-serif mb-2" style={{ fontSize: '24px', color: 'var(--color-primary)' }}>
          Warming up the room...
        </h2>
        
        <p style={{ 
          color: 'var(--color-text)', 
          fontSize: '15px', 
          maxWidth: '320px', 
          lineHeight: '1.5',
          marginBottom: '28px'
        }}>
          Please wait while we connect to the server and organize your writing space.
        </p>

        {/* Cold-start info notice */}
        <div style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px 20px',
          maxWidth: '340px',
          boxShadow: 'var(--shadow-sm)',
          fontSize: '12px',
          color: 'var(--color-text-muted)',
          lineHeight: '1.4',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <strong style={{ color: 'var(--color-primary)' }}>Notice on Cold Starts:</strong>
          <span>
            If the application has been inactive for a while, the backend container might take up to 40 seconds to spin up.
          </span>
          <span>Thank you for your patience! 🕯️</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg)',
      padding: '24px',
      overflowY: 'auto'
    }}>
      <h1 className="font-serif mb-2 text-center" style={{ fontSize: '36px', color: 'var(--color-primary)' }}>
        The Writer's Room
      </h1>
      <p className="mb-6 text-center" style={{ color: 'var(--color-text-muted)', fontSize: '15px' }}>
        Your private space for literary growth.
      </p>
      
      <div style={{
        backgroundColor: 'var(--color-surface)',
        width: '100%',
        maxWidth: '400px',
        padding: '32px 28px',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Tab Toggle (Only show if not in forgot password state) */}
        {activeTab !== 'forgot' && (
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--color-bg)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)'
          }}>
            <button
              onClick={() => { setActiveTab('login'); setError(''); setSuccessMessage(''); setPassword(''); }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                textAlign: 'center',
                backgroundColor: activeTab === 'login' ? 'var(--color-surface)' : 'transparent',
                color: activeTab === 'login' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                boxShadow: activeTab === 'login' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab('register'); setError(''); setSuccessMessage(''); setPassword(''); }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                textAlign: 'center',
                backgroundColor: activeTab === 'register' ? 'var(--color-surface)' : 'transparent',
                color: activeTab === 'register' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                boxShadow: activeTab === 'register' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              Register
            </button>
          </div>
        )}

        {activeTab === 'forgot' && (
          <h2 className="font-serif text-center" style={{ fontSize: '20px', color: 'var(--color-primary)', margin: 0 }}>
            Reset Password
          </h2>
        )}

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#DC2626',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            lineHeight: '1.4'
          }}>
            {error}
          </div>
        )}

        {successMessage && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            color: '#059669',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            lineHeight: '1.4'
          }}>
            {successMessage}
          </div>
        )}

        {/* Forgot Password View */}
        {activeTab === 'forgot' ? (
          <form onSubmit={handleForgotPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#FFF',
                border: 'none',
                padding: '14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '8px',
                opacity: loading ? 0.7 : 1,
                transition: 'opacity 0.2s'
              }}
            >
              {loading ? 'Sending...' : 'Send Temporary Password'}
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('login'); setError(''); setSuccessMessage(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'center',
                textDecoration: 'underline',
                padding: '4px'
              }}
            >
              Back to Sign In
            </button>
          </form>
        ) : (
          /* Sign In / Register Forms */
          <form onSubmit={handleLocalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeTab === 'register' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>
                User ID
              </label>
              <input
                type="text"
                placeholder="e.g. writer_jane"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>
                  Password
                </label>
                {activeTab === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setActiveTab('forgot'); setError(''); setSuccessMessage(''); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-muted)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: 0
                    }}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            {activeTab === 'register' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Password checklist */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  padding: '8px 12px',
                  backgroundColor: 'var(--color-bg)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)'
                }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                    Password requirements:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                    <span style={{ color: hasMinLength ? '#10B981' : '#EF4444' }}>
                      {hasMinLength ? '✔' : '✖'}
                    </span>
                    <span style={{ color: 'var(--color-text-muted)' }}>At least 8 characters</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                    <span style={{ color: hasUppercase && hasLowercase ? '#10B981' : '#EF4444' }}>
                      {hasUppercase && hasLowercase ? '✔' : '✖'}
                    </span>
                    <span style={{ color: 'var(--color-text-muted)' }}>Uppercase & lowercase letter</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                    <span style={{ color: hasDigit && hasSpecialChar ? '#10B981' : '#EF4444' }}>
                      {hasDigit && hasSpecialChar ? '✔' : '✖'}
                    </span>
                    <span style={{ color: 'var(--color-text-muted)' }}>A number & special char (@$!%*?&#)</span>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#FFF',
                border: 'none',
                padding: '14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '8px',
                opacity: loading ? 0.7 : 1,
                transition: 'opacity 0.2s'
              }}
            >
              {loading ? 'Processing...' : activeTab === 'register' ? 'Create Account' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Separator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '8px 0'
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
        </div>

        {/* Google Authentication */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google sign-in failed. Please try again.')}
            useOneTap={false}
            theme="outline"
            shape="pill"
          />
        </div>
      </div>
    </div>
  );
}
