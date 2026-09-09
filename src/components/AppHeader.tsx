import React from 'react';

interface AppHeaderProps {
  title?: string;
  showLogo?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title, showLogo = true }) => {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(13,13,13,0.95)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10px)',
      paddingBottom: '10px',
      paddingLeft: '20px',
      paddingRight: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: '56px',
    }}>
      {showLogo ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Real TorqMax Logo — mix-blend-mode:screen removes the white bg */}
          <img
            src="./torqmax-logo.png"
            alt="TorqMax"
            style={{
              height: 44,
              width: 'auto',
              mixBlendMode: 'screen',
              filter: 'brightness(1.05)',
              display: 'block',
            }}
          />
        </div>
      ) : (
        <h2 style={{
          fontFamily: 'var(--font-brand)',
          fontSize: '1.1rem',
          fontWeight: 700,
          letterSpacing: '0.06em',
          color: '#fff',
        }}>{title}</h2>
      )}

      {/* Top-right: WhatsApp quick action */}
      <button
        onClick={() => {
          try {
            const opened = window.open('https://wa.me/918401304787?text=Hi+TorqMax%2C+I+have+an+enquiry.', '_system');
            if (!opened) window.location.href = 'https://wa.me/918401304787?text=Hi+TorqMax%2C+I+have+an+enquiry.';
          } catch { window.location.href = 'https://wa.me/918401304787?text=Hi+TorqMax%2C+I+have+an+enquiry.'; }
        }}
        aria-label="WhatsApp"
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: '#25D366',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          cursor: 'pointer',
          boxShadow: '0 2px 12px rgba(37,211,102,0.35)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,211,102,0.5)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(37,211,102,0.35)'; }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 012.41 5.83c.02 4.54-3.68 8.23-8.22 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.65 4.2 3.71.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.17-.47-.29z" />
        </svg>
      </button>
    </header>
  );
};
