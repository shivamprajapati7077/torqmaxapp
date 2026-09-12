import React from 'react';
import { useNotifications } from '../context/NotificationContext';

export const NotificationToast: React.FC = () => {
  const { activeToast, dismissToast, openDrawer } = useNotifications();

  if (!activeToast) return null;

  const getTypeStyles = () => {
    switch (activeToast.type) {
      case 'order_placed':
        return {
          icon: '📦',
          accent: '#F59E0B',
          bg: 'rgba(245, 158, 11, 0.12)',
          border: 'rgba(245, 158, 11, 0.4)',
        };
      case 'order_dispatched':
        return {
          icon: '🚚',
          accent: '#38BDF8',
          bg: 'rgba(56, 189, 248, 0.12)',
          border: 'rgba(56, 189, 248, 0.45)',
        };
      case 'order_delivered':
        return {
          icon: '✅',
          accent: '#10B981',
          bg: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.45)',
        };
      default:
        return {
          icon: '🔔',
          accent: '#F59E0B',
          bg: 'rgba(245, 158, 11, 0.12)',
          border: 'rgba(245, 158, 11, 0.4)',
        };
    }
  };

  const styleConfig = getTypeStyles();

  return (
    <aside
      aria-label="Notification Alert"
      style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        width: 'calc(100% - 32px)',
        maxWidth: '460px',
        background: 'rgba(18, 18, 18, 0.96)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1.5px solid ${styleConfig.border}`,
        borderRadius: '16px',
        boxShadow: `0 12px 36px rgba(0,0,0,0.8), 0 0 24px ${styleConfig.accent}25`,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        cursor: 'pointer',
        animation: 'toastSlideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onClick={() => {
        openDrawer();
        dismissToast();
      }}
    >
      {/* Icon badge */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: styleConfig.bg,
          border: `1px solid ${styleConfig.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.25rem',
          flexShrink: 0,
        }}
      >
        {styleConfig.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <h4
            style={{
              margin: 0,
              fontSize: '0.92rem',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '0.02em',
            }}
          >
            {activeToast.title}
          </h4>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: styleConfig.accent,
              background: styleConfig.bg,
              padding: '2px 7px',
              borderRadius: '999px',
              border: `1px solid ${styleConfig.border}`,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            TorqMax Alert
          </span>
        </div>

        <p
          style={{
            margin: '4px 0 0 0',
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.78)',
            lineHeight: 1.45,
          }}
        >
          {activeToast.message}
        </p>

        {activeToast.orderId && (
          <div
            style={{
              marginTop: 6,
              fontSize: '0.72rem',
              fontFamily: 'monospace',
              color: 'var(--amber)',
              fontWeight: 600,
            }}
          >
            Order ID: {activeToast.orderId}
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        type="button"
        aria-label="Dismiss alert"
        onClick={e => {
          e.stopPropagation();
          dismissToast();
        }}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.4)',
          fontSize: '1.2rem',
          padding: '2px 4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
          transition: 'color 0.15s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = '#FFFFFF';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
        }}
      >
        ✕
      </button>

      <style>{`
        @keyframes toastSlideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -24px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }
      `}</style>
    </aside>
  );
};
