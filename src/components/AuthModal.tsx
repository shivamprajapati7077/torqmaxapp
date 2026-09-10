import React from 'react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Sign In to Proceed',
  subtitle = 'Sign in with your Google account to confirm your order and access order tracking.',
}) => {
  const { loginWithGoogle, isLoading } = useAuth();
  const [error, setError] = React.useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await loginWithGoogle();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.warn('Google sign-in attempt:', err);
      if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        setError('UNAUTHORIZED_DOMAIN');
      } else {
        setError(err?.message || 'Unable to sign in with Google. Please try again.');
      }
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 250,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: '#12131A',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: 20,
          padding: '28px 24px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.8), 0 0 24px rgba(245,158,11,0.15)',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: 'rgba(255,255,255,0.06)',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            color: 'var(--text-muted)',
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ✕
        </button>

        {/* Brand Icon */}
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: '50%',
            background: 'rgba(245,158,11,0.12)',
            border: '1.5px solid rgba(245,158,11,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '1.6rem',
          }}
        >
          👤
        </div>

        {/* Eyebrow */}
        <div
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--amber)',
            marginBottom: 6,
          }}
        >
          TorqMax Account
        </div>

        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: 8, lineHeight: 1.25 }}>
          {title}
        </h3>

        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 24 }}>
          {subtitle}
        </p>

        {error === 'UNAUTHORIZED_DOMAIN' ? (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 12,
              padding: '12px 14px',
              color: '#fca5a5',
              fontSize: '0.8rem',
              marginBottom: 16,
              textAlign: 'left',
              lineHeight: 1.4,
            }}
          >
            <div style={{ fontWeight: 800, color: '#fff', marginBottom: 4 }}>
              ⚠️ Domain Authorization Notice
            </div>
            <div>
              Firebase Google Sign-In only allows <strong>localhost</strong> by default, but you are currently browsing on <strong>{window.location.hostname}</strong>.
            </div>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button
                onClick={() => {
                  window.location.href = window.location.href.replace(window.location.hostname, 'localhost');
                }}
                style={{
                  background: 'var(--amber)',
                  color: '#000',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                👉 Click here to switch to http://localhost:5174
              </button>
              <div style={{ fontSize: '0.7rem', color: '#ccc', marginTop: 4 }}>
                Or in <em>Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains</em>, add <strong>127.0.0.1</strong>.
              </div>
            </div>
          </div>
        ) : error ? (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 10,
              padding: '10px',
              color: '#fca5a5',
              fontSize: '0.8rem',
              marginBottom: 16,
              textAlign: 'left',
            }}
          >
            ⚠️ {error}
          </div>
        ) : null}

        {/* Sign In with Google Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '14px 18px',
            borderRadius: 12,
            background: '#ffffff',
            border: 'none',
            color: '#1a1a1a',
            fontSize: '0.95rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            cursor: isLoading ? 'wait' : 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            transition: 'transform 0.15s ease',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{isLoading ? 'Signing In...' : 'Continue with Google'}</span>
        </button>

        {/* Benefits bullets */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span>✓</span> Tracks your complete dispatch & purchase history
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span>✓</span> Saves your delivery address & GSTIN automatically
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>✓</span> 100% Free & Secure B2B Partner Access
          </div>
        </div>
      </div>
    </div>
  );
};
