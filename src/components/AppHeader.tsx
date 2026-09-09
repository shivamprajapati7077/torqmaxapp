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
      <a
        href="https://wa.me/918401304787?text=Hi+TorqMax%2C+I+have+an+enquiry."
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
          <path d="M17.47 14.82c-.3-.16-1.77-.87-2.04-.97-.28-.1-.48-.15-.67.15-.2.3-.76.97-.93 1.17-.17.2-.34.22-.64.06-.3-.16-1.27-.47-2.41-1.49-.9-.8-1.5-1.78-1.67-2.08-.18-.3-.02-.46.13-.61.13-.13.3-.35.44-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.16-.66-1.59-.9-2.18-.24-.57-.49-.49-.66-.5-.17-.01-.38-.01-.58-.01-.2 0-.53.07-.81.37C7 8.34 6.16 9.17 6.16 11c0 1.83 1.33 3.6 1.52 3.85.18.24 2.6 3.98 6.3 5.58.88.38 1.57.61 2.1.78.88.28 1.68.24 2.32.14.71-.11 2.18-.89 2.49-1.75.31-.86.31-1.6.21-1.75-.09-.16-.3-.23-.6-.39z"/>
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.07-1.35A9.95 9.95 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.72 0-3.33-.47-4.72-1.29L4 20l1.29-3.27A7.95 7.95 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
        </svg>
      </a>
    </header>
  );
};
