
import { GoogleLogin } from '@react-oauth/google';
import { API_BASE_URL } from '../config';

interface Props {
  onLoginSuccess: (token: string, user: any) => void;
}

export default function LoginScreen({ onLoginSuccess }: Props) {
  const handleSuccess = async (credentialResponse: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      
      if (data.error) {
        alert(data.error);
        return;
      }
      
      onLoginSuccess(data.token, data.user);
    } catch (err) {
      console.error('Login failed', err);
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: 'var(--color-bg)',
      padding: '20px'
    }}>
      <h1 className="font-serif mb-2 text-center" style={{ fontSize: '32px', color: 'var(--color-primary)' }}>
        The Writer's Room
      </h1>
      <p className="mb-6 text-center" style={{ color: 'var(--color-text-muted)' }}>
        Your private space for literary growth.
      </p>
      
      <div style={{
        backgroundColor: 'var(--color-surface)',
        padding: '32px',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        <p style={{ fontSize: '14px', fontWeight: 500 }}>Sign in to continue</p>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => console.log('Login Failed')}
          useOneTap
          theme="outline"
          shape="pill"
        />
      </div>
    </div>
  );
}
