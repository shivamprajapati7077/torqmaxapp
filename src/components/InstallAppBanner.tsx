import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallAppBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already running in standalone app mode
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(Boolean(isStandaloneMode));
    };
    checkStandalone();

    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem('torqmax_pwa_dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }

    // Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Listen for Chrome / Android PWA install event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // If already installed or dismissed, do not render banner
  if (isStandalone || isDismissed) {
    return null;
  }

  // On Android/Chrome, we only show once deferredPrompt is available or if on iOS
  if (!deferredPrompt && !isIOS) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Trigger native Android install prompt
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsDismissed(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      // Show iOS Add to Home Screen step-by-step modal
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('torqmax_pwa_dismissed', 'true');
  };

  return (
    <>
      {/* Floating Bottom App Installation Card */}
      <div
        style={{
          position: 'fixed',
          bottom: '76px', // sits right above BottomNav
          left: '12px',
          right: '12px',
          maxWidth: '480px',
          margin: '0 auto',
          zIndex: 90,
          background: 'rgba(20, 24, 33, 0.96)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(217, 119, 6, 0.35)',
          borderRadius: '16px',
          padding: '12px 14px',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.65), 0 0 20px rgba(217, 119, 6, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* App Icon */}
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '11px',
            overflow: 'hidden',
            flexShrink: 0,
            background: '#0D0D0D',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src="/icon-192.png"
            alt="TorqMax App"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontFamily: 'var(--font-brand, sans-serif)',
                fontWeight: 700,
                fontSize: '0.95rem',
                color: '#fff',
                letterSpacing: '0.02em',
              }}
            >
              Install TorqMax App
            </span>
            <span
              style={{
                background: 'rgba(217, 119, 6, 0.2)',
                color: '#F59E0B',
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                textTransform: 'uppercase',
              }}
            >
              Fast & Offline
            </span>
          </div>
          <p
            style={{
              margin: '2px 0 0',
              fontSize: '0.74rem',
              color: 'rgba(255, 255, 255, 0.65)',
              lineHeight: 1.25,
            }}
          >
            Add to home screen for full-screen 3D studio experience
          </p>
        </div>

        {/* Install Button */}
        <button
          onClick={handleInstallClick}
          id="btn-install-pwa"
          style={{
            background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '9px',
            padding: '8px 14px',
            fontWeight: 700,
            fontSize: '0.8rem',
            fontFamily: 'var(--font-brand, sans-serif)',
            letterSpacing: '0.04em',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.35)',
          }}
        >
          INSTALL
        </button>

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          aria-label="Close"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '1.1rem',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSGuide && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#151A23',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '24px',
              maxWidth: '400px',
              width: '100%',
              color: '#fff',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                margin: '0 auto 12px',
                borderRadius: '14px',
                overflow: 'hidden',
                background: '#0D0D0D',
              }}
            >
              <img src="/icon-192.png" alt="TorqMax" style={{ width: '100%', height: '100%' }} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 8px' }}>
              Install on iOS
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', margin: '0 0 20px' }}>
              To install the TorqMax app on your iPhone:
            </p>

            <div
              style={{
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '12px',
                padding: '14px',
                textAlign: 'left',
                fontSize: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    background: '#D97706',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    flexShrink: 0,
                  }}
                >
                  1
                </span>
                <span>
                  Tap the Safari <strong>Share button</strong> (square with arrow ↑)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    background: '#D97706',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    flexShrink: 0,
                  }}
                >
                  2
                </span>
                <span>
                  Scroll down and tap <strong>Add to Home Screen ⊞</strong>
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
