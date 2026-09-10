import React, { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '../context/AuthContext';
import { OWNER_EMAIL } from '../firebase';

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
  subtitle = 'Connect with your Google account to confirm your order and track live dispatch statuses.',
}) => {
  const { loginWithGoogle, loginDirectly, isLoading } = useAuth();
  const [emailInput, setEmailInput] = useState(() => {
    try {
      return localStorage.getItem('torqmax_last_email') || '';
    } catch {
      return '';
    }
  });
  const [nameInput, setNameInput] = useState(() => {
    try {
      return localStorage.getItem('torqmax_last_name') || '';
    } catch {
      return '';
    }
  });
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const isNative = Capacitor.isNativePlatform();
  const isOwnerTyping = emailInput.trim().toLowerCase() === OWNER_EMAIL.toLowerCase();

  const handleDirectSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (isOwnerTyping) {
      if (pinInput.trim() !== '7077' && pinInput.trim().toLowerCase() !== 'torqmax') {
        setError('Incorrect Owner PIN. Enter 7077 to unlock Owner Privileges.');
        return;
      }
    }

    try {
      // Remember details locally for customer convenience
      try {
        localStorage.setItem('torqmax_last_email', cleanEmail);
        if (nameInput.trim()) localStorage.setItem('torqmax_last_name', nameInput.trim());
      } catch {
        // ignore
      }

      await loginDirectly(cleanEmail, nameInput.trim());
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check details.');
    }
  };

  const handleGooglePopup = async () => {
    setError('');
    if (isNative) {
      setError(
        'Google browser popup is not supported in the Android App WebView. Please enter your email above to sign in directly.',
      );
      return;
    }

    try {
      await loginWithGoogle();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.warn('Google sign-in attempt:', err);
      if (
        err?.code === 'auth/unauthorized-domain' ||
        err?.message?.includes('unauthorized-domain')
      ) {
        setError('UNAUTHORIZED_DOMAIN');
      } else if (err?.code === 'auth/popup-closed-by-user') {
        // User closed popup, do nothing
      } else {
        setError(
          'Google popup was blocked or unsupported. Please enter your email above to sign in directly.',
        );
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
          padding: '26px 22px',
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
            width: 54,
            height: 54,
            borderRadius: '50%',
            background: 'rgba(245,158,11,0.12)',
            border: '1.5px solid rgba(245,158,11,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            fontSize: '1.5rem',
          }}
        >
          👤
        </div>

        <div
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--amber)',
            marginBottom: 4,
          }}
        >
          TorqMax Account
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: 6, lineHeight: 1.25 }}>
          {title}
        </h3>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 18 }}>
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
              Firebase Google Sign-In only allows <strong>localhost</strong> by default, but you are browsing on <strong>{window.location.hostname}</strong>.
            </div>
            <div style={{ marginTop: 10 }}>
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
                  width: '100%',
                }}
              >
                👉 Click here to switch to http://localhost:5174
              </button>
            </div>
          </div>
        ) : error ? (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 10,
              padding: '10px 12px',
              color: '#fca5a5',
              fontSize: '0.78rem',
              marginBottom: 14,
              textAlign: 'left',
            }}
          >
            ⚠️ {error}
          </div>
        ) : null}

        {/* Direct In-App Sign In Form (works on Android APK & Web) */}
        <form onSubmit={handleDirectSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>
              Google Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="e.g. name@gmail.com"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 10,
                padding: '10px 12px',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>
              Your Name / Shop Name
            </label>
            <input
              type="text"
              placeholder="e.g. Ramesh / Apex Car Accessories"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 10,
                padding: '10px 12px',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Owner PIN field if typing owner email */}
          {isOwnerTyping && (
            <div style={{ textAlign: 'left', animation: 'fadeIn 0.2s ease' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--amber)', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                👑 Owner Access PIN (7077) *
              </label>
              <input
                type="password"
                required
                placeholder="Enter 7077"
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(245,158,11,0.08)',
                  border: '1.5px solid var(--amber)',
                  borderRadius: 10,
                  padding: '10px 12px',
                  color: '#fff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  letterSpacing: '0.2em',
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              marginTop: 4,
              padding: '12px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, var(--amber) 0%, #D97706 100%)',
              border: 'none',
              color: '#000',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: isLoading ? 'wait' : 'pointer',
              boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
              letterSpacing: '0.02em',
            }}
          >
            {isLoading ? 'Signing In...' : isOwnerTyping ? 'Sign In as Owner →' : 'Sign In as Partner →'}
          </button>
        </form>

        {/* Quick Owner Access Link */}
        <div style={{ marginTop: 8 }}>
          <button
            type="button"
            onClick={() => {
              setEmailInput(OWNER_EMAIL);
              setNameInput('TorqMax Owner');
              setPinInput('7077');
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--amber)',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '4px',
              opacity: 0.85,
            }}
          >
            👑 TorqMax Owner? Click for 1-Tap Login
          </button>
        </div>

        {/* Web Browser Google Popup Option (Hidden on Android APK to prevent blank WebView) */}
        {!isNative ? (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                margin: '14px 0 10px',
                color: 'var(--text-muted)',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              <span>Or via Browser</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            </div>

            <button
              type="button"
              onClick={handleGooglePopup}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: isLoading ? 'wait' : 'pointer',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
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
              <span>Continue with Google (Popup)</span>
            </button>
          </>
        ) : (
          <div
            style={{
              marginTop: 10,
              padding: '6px 10px',
              borderRadius: 8,
              background: 'rgba(245,158,11,0.06)',
              border: '1px solid rgba(245,158,11,0.15)',
              fontSize: '0.72rem',
              color: 'var(--amber)',
            }}
          >
            ⚡ Android App Mode: Direct in-app sign-in enabled.
          </div>
        )}

        {/* Benefits bullets */}
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'left' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span>✓</span> Tracks your complete dispatch & purchase history
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span>✓</span> Saves your delivery address & GSTIN automatically
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>✓</span> 100% Free & Secure B2B Partner Access
          </div>
        </div>
      </div>
    </div>
  );
};
