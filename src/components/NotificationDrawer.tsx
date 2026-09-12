import React from 'react';
import { useNotifications } from '../context/NotificationContext';

interface NotificationDrawerProps {
  onNavigateToAccount?: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ onNavigateToAccount }) => {
  const {
    notifications,
    unreadCount,
    isDrawerOpen,
    closeDrawer,
    markAsRead,
    markAllAsRead,
    clearAll,
    permissionStatus,
    requestNativePermission,
  } = useNotifications();

  if (!isDrawerOpen) return null;

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    } catch {
      return '';
    }
  };

  const getIconAndStyle = (type: string) => {
    switch (type) {
      case 'order_placed':
        return {
          icon: '📦',
          accent: '#F59E0B',
          bg: 'rgba(245, 158, 11, 0.12)',
        };
      case 'order_dispatched':
        return {
          icon: '🚚',
          accent: '#38BDF8',
          bg: 'rgba(56, 189, 248, 0.12)',
        };
      case 'order_delivered':
        return {
          icon: '✅',
          accent: '#10B981',
          bg: 'rgba(16, 185, 129, 0.12)',
        };
      default:
        return {
          icon: '🔔',
          accent: '#F59E0B',
          bg: 'rgba(245, 158, 11, 0.12)',
        };
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99990,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      {/* Dark frosted backdrop */}
      <div
        onClick={closeDrawer}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      />

      {/* Drawer content panel */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '430px',
          height: '100%',
          background: '#111111',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 40px rgba(0,0,0,0.85)',
          animation: 'drawerSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 'calc(env(safe-area-inset-top, 0px) + 16px) 20px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(18,18,18,0.98)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h3
              style={{
                margin: 0,
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              Notifications
              {unreadCount > 0 && (
                <span
                  style={{
                    background: 'var(--amber)',
                    color: '#000',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '999px',
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {notifications.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={markAllAsRead}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    padding: '4px 6px',
                    borderRadius: '6px',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--amber)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                >
                  Mark read
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(239,68,68,0.7)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    padding: '4px 6px',
                    borderRadius: '6px',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(239,68,68,0.7)')}
                >
                  Clear
                </button>
              </>
            )}

            <button
              type="button"
              onClick={closeDrawer}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Permission Banner if not granted */}
        {permissionStatus !== 'granted' && permissionStatus !== 'unsupported' && (
          <div
            style={{
              margin: '12px 16px 0',
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.2rem' }}>🔔</span>
              <div>
                <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 600, color: '#fff' }}>
                  Enable Device Notifications
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: 'rgba(255,255,255,0.65)' }}>
                  Get real-time alerts when orders are dispatched
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                await requestNativePermission();
              }}
              style={{
                background: 'var(--amber)',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Enable
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {notifications.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'rgba(255,255,255,0.4)',
                textAlign: 'center',
                padding: '40px 20px',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px dashed rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.6rem',
                  marginBottom: 16,
                }}
              >
                📭
              </div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)' }}>
                No notifications yet
              </h4>
              <p style={{ margin: 0, fontSize: '0.78rem', lineHeight: 1.5, maxWidth: '280px' }}>
                When you place an order or your order is dispatched, you’ll see immediate alerts here.
              </p>
            </div>
          ) : (
            notifications.map(item => {
              const cfg = getIconAndStyle(item.type);
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    markAsRead(item.id);
                    if (onNavigateToAccount) {
                      closeDrawer();
                      onNavigateToAccount();
                    }
                  }}
                  style={{
                    padding: '14px',
                    borderRadius: '14px',
                    background: item.read ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
                    border: item.read ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${cfg.accent}55`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: cfg.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.15rem',
                      flexShrink: 0,
                    }}
                  >
                    {cfg.icon}
                  </div>

                  {/* Body */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                      <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fff' }}>
                        {item.title}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
                        {formatTime(item.createdAt)}
                      </span>
                    </div>

                    <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.45 }}>
                      {item.message}
                    </p>

                    {item.orderId && (
                      <div
                        style={{
                          marginTop: 8,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: 'rgba(245,158,11,0.1)',
                          border: '1px solid rgba(245,158,11,0.25)',
                          fontSize: '0.7rem',
                          fontFamily: 'monospace',
                          color: 'var(--amber)',
                        }}
                      >
                        <span>Order #{item.orderId}</span>
                      </div>
                    )}
                  </div>

                  {/* Unread indicator dot */}
                  {!item.read && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: 'var(--amber)',
                        boxShadow: '0 0 6px var(--amber)',
                      }}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <style>{`
        @keyframes drawerSlideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};
