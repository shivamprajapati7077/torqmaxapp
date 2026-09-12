import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import type { Tab } from '../App';

interface AppHeaderProps {
  title?: string;
  showLogo?: boolean;
  setActiveTab?: (tab: Tab) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title, showLogo = true, setActiveTab }) => {
  const { totalItems } = useCart();
  const { user, isOwner } = useAuth();
  const { unreadCount, openDrawer } = useNotifications();
  const pressTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const startLongPress = () => {
    pressTimerRef.current = setTimeout(() => {
      try {
        if (navigator.vibrate) navigator.vibrate(80);
      } catch {
        // ignore vibration error
      }
      setActiveTab?.('admin');
    }, 2200);
  };

  const cancelLongPress = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

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
        <div
          onMouseDown={startLongPress}
          onMouseUp={cancelLongPress}
          onMouseLeave={cancelLongPress}
          onTouchStart={startLongPress}
          onTouchEnd={cancelLongPress}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            cursor: 'pointer',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
          title="TorqMax"
        >
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
              pointerEvents: 'none',
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

      {/* Right side: Account + Cart + WhatsApp */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* User / Account Button */}
        <button
          onClick={() => setActiveTab?.('account')}
          aria-label="Account"
          title={user ? (isOwner ? "Owner Console" : (user.displayName || user.email || "Account")) : "Sign In / Account"}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: user ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.06)',
            border: user ? '1.5px solid rgba(245,158,11,0.5)' : '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            cursor: 'pointer',
            position: 'relative',
            transition: 'all 0.2s ease',
            padding: 0,
            overflow: 'hidden',
          }}
        >
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : user ? (
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--amber)' }}>
              {isOwner ? '👑' : (user.displayName ? user.displayName.charAt(0).toUpperCase() : '👤')}
            </span>
          ) : (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="7" r="4" />
              <path d="M5.5 21a8.38 8.38 0 0113 0" />
            </svg>
          )}
        </button>

        {/* TorqMax In-App Notifications Bell */}
        <button
          onClick={openDrawer}
          aria-label="Notifications"
          title="TorqMax Notifications"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: unreadCount > 0 ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.06)',
            border: unreadCount > 0 ? '1.5px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            cursor: 'pointer',
            position: 'relative',
            transition: 'all 0.2s ease',
          }}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={unreadCount > 0 ? '#F59E0B' : '#888'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>

          {/* Badge */}
          {unreadCount > 0 && (
            <div
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                minWidth: 18,
                height: 18,
                padding: '0 4px',
                borderRadius: '999px',
                background: 'var(--amber)',
                color: '#000',
                fontSize: '0.62rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #0D0D0D',
                animation: 'cartBadgePop 0.3s ease-out',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </button>

        {/* Cart icon with badge */}
        <button
          onClick={() => setActiveTab?.('cart')}
          aria-label="Cart"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: totalItems > 0 ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.06)',
            border: totalItems > 0 ? '1.5px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            cursor: 'pointer',
            position: 'relative',
            transition: 'all 0.2s ease',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={totalItems > 0 ? '#F59E0B' : '#888'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
          </svg>

          {/* Badge */}
          {totalItems > 0 && (
            <div
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'var(--amber)',
                color: '#000',
                fontSize: '0.62rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #0D0D0D',
                animation: 'cartBadgePop 0.3s ease-out',
              }}
            >
              {totalItems > 9 ? '9+' : totalItems}
            </div>
          )}
        </button>

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
      </div>
    </header>
  );
};
