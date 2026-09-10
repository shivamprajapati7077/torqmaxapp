import React, { useState, useEffect } from 'react';
import { AppHeader } from '../components/AppHeader';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from '../components/AuthModal';
import { fetchDispatchOrders } from '../firebase';
import type { DispatchOrder, OrderStatus } from '../types/order';
import type { Tab } from '../App';

interface AccountScreenProps {
  setActiveTab: (tab: Tab) => void;
}

export const AccountScreen: React.FC<AccountScreenProps> = ({ setActiveTab }) => {
  const { user, isOwner, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [orders, setOrders] = useState<DispatchOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadCustomerOrders = async () => {
      setIsLoadingOrders(true);
      try {
        const all = await fetchDispatchOrders();
        if (isMounted) {
          if (user) {
            // Filter orders for this customer (by email, uid, or saved customer phone)
            const userEmail = (user.email || '').toLowerCase();
            const filtered = all.filter(o => {
              if (o.customerEmail && o.customerEmail.toLowerCase() === userEmail) return true;
              if (o.customerUid && user.uid && o.customerUid === user.uid) return true;
              return false;
            });
            // If none matched yet by email (e.g. placed before logging in), show recent local orders
            setOrders(filtered.length > 0 ? filtered : all.slice(0, 5));
          } else {
            setOrders([]);
          }
        }
      } catch (err) {
        console.warn('Order fetch notice:', err);
      } finally {
        if (isMounted) setIsLoadingOrders(false);
      }
    };

    loadCustomerOrders();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return { label: '🟡 Order Received', bg: 'rgba(234, 179, 8, 0.15)', color: '#facc15' };
      case 'confirmed':
        return { label: '🟢 Confirmed / In Crafting', bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' };
      case 'dispatched':
        return { label: '🔵 Dispatched', bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' };
      case 'delivered':
        return { label: '✅ Delivered', bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' };
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
      <AppHeader setActiveTab={setActiveTab} />

      <div className="scroll-page page-enter" style={{ padding: '0 0 120px' }}>
        {/* Top Header */}
        <div
          style={{
            padding: '24px 20px 16px',
            background: 'linear-gradient(180deg, rgba(245,158,11,0.08) 0%, transparent 100%)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--amber-muted)',
              border: '1px solid rgba(245,158,11,0.25)',
              borderRadius: 20,
              padding: '4px 12px',
              marginBottom: 10,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)' }} />
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--amber)',
              }}
            >
              Partner Profile
            </span>
          </div>

          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', lineHeight: 1.15, margin: 0 }}>
            My <span style={{ color: 'var(--amber)' }}>Account</span>
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 4, marginBottom: 0 }}>
            Manage your dealer profile and track all past dispatch orders
          </p>
        </div>

        <div style={{ padding: '20px 16px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* User Profile Card */}
          {user ? (
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: '20px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      background: 'rgba(245, 158, 11, 0.15)',
                      border: '1.5px solid var(--amber)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.4rem',
                      color: 'var(--amber)',
                      fontWeight: 800,
                    }}
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                      />
                    ) : (
                      user.displayName ? user.displayName.charAt(0).toUpperCase() : '👤'
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                      {user.displayName || 'B2B Partner'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {user.email}
                    </div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  style={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Log Out
                </button>
              </div>

              {/* Owner Shortcut Pill if owner email */}
              {isOwner && (
                <div
                  style={{
                    marginTop: 16,
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(229,39,46,0.1) 100%)',
                    border: '1px solid rgba(245,158,11,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fff' }}>
                      👑 Owner Privileges Active
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      Full access to all party logs & dispatch controls
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('admin')}
                    style={{
                      background: 'var(--amber)',
                      color: '#000',
                      border: 'none',
                      borderRadius: 8,
                      padding: '7px 12px',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Open Console →
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Unauthenticated Prompt */
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: '24px 20px',
                textAlign: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔐</div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                Sign in to view your orders
              </h2>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
                Connect with your Google account to track your orders in real-time, view dispatch receipts, and save your shop profile.
              </p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                style={{
                  background: 'linear-gradient(135deg, var(--amber) 0%, #D97706 100%)',
                  color: '#000',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  padding: '12px 28px',
                  borderRadius: 12,
                  border: 'none',
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                }}
              >
                Sign In with Google →
              </button>
            </div>
          )}

          {/* Customer Order History Section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Order History
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {orders.length} order{orders.length === 1 ? '' : 's'}
              </span>
            </div>

            {isLoadingOrders ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  padding: '30px 20px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: 10, opacity: 0.5 }}>📦</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                  No orders placed yet
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
                  Browse our car mats collection and dispatch your first bulk order.
                </p>
                <button
                  onClick={() => setActiveTab('products')}
                  style={{
                    background: 'rgba(245,158,11,0.12)',
                    border: '1px solid rgba(245,158,11,0.3)',
                    color: 'var(--amber)',
                    borderRadius: 10,
                    padding: '8px 16px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Browse Car Mats
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {orders.map(order => {
                  const badge = getStatusBadge(order.status);
                  return (
                    <div
                      key={order.id}
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 14,
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                      }}
                    >
                      {/* Top Row: Order ID and Status */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-brand)' }}>
                            {order.id}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>

                        <span
                          style={{
                            background: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.color}40`,
                            borderRadius: 10,
                            padding: '3px 8px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                          }}
                        >
                          {badge.label}
                        </span>
                      </div>

                      {/* Items summary */}
                      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 10 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {order.items.map((it, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '0.78rem',
                              }}
                            >
                              <span style={{ color: '#eee', fontWeight: 600 }}>{it.modelName}</span>
                              <span style={{ color: 'var(--amber)', fontWeight: 800 }}>
                                {it.styleName} ({it.colorName}) × {it.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Total & Delivery Address */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        <div>📍 {order.customer.city} · {order.totalUnits} sets</div>
                        {order.transportName && (
                          <div style={{ color: '#60a5fa' }}>🚚 {order.transportName}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Sign In to TorqMax"
        subtitle="Sign in with your Google account to manage your profile and view your past orders."
      />
    </div>
  );
};
