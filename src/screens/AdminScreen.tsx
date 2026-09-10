import React, { useState, useEffect, useMemo } from 'react';
import { Capacitor } from '@capacitor/core';
import {
  OWNER_EMAIL,
  fetchDispatchOrders,
  fetchRegisteredCustomers,
  updateOrderStatus,
  type RegisteredCustomer,
} from '../firebase';
import { useAuth } from '../context/AuthContext';
import type { DispatchOrder, OrderStatus } from '../types/order';
import type { Tab } from '../App';

interface AdminScreenProps {
  setActiveTab: (tab: Tab) => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({ setActiveTab }) => {
  const isNative = Capacitor.isNativePlatform();
  const { user, isOwner: authIsOwner, loginWithGoogle, loginDirectly, logout } = useAuth();
  const currentUser = user;

  const [orders, setOrders] = useState<DispatchOrder[]>([]);
  const [customers, setCustomers] = useState<RegisteredCustomer[]>([]);
  const [adminTab, setAdminTab] = useState<'orders' | 'customers'>('orders');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<DispatchOrder | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [adminError, setAdminError] = useState('');

  const isOwner =
    authIsOwner ||
    (currentUser?.email || '').toLowerCase() === OWNER_EMAIL.toLowerCase();

  // Load orders and registered customers on mount or when user changes
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const [orderData, customerData] = await Promise.all([
        fetchDispatchOrders(),
        fetchRegisteredCustomers(),
      ]);
      if (isMounted) {
        setOrders(orderData);
        setCustomers(customerData);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const handleLogin = async () => {
    if (isNative) {
      setAdminError('In the Android App, please unlock directly using Owner PIN 7077 above.');
      return;
    }
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Login error:', err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        alert(err?.message || 'Authentication failed. Please try again.');
      }
    }
  };

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    if (adminPin.trim() !== '7077' && adminPin.trim().toLowerCase() !== 'torqmax') {
      setAdminError('Invalid Owner PIN. Enter 7077 to unlock.');
      return;
    }
    try {
      await loginDirectly(OWNER_EMAIL, 'TorqMax Owner');
    } catch (err: any) {
      setAdminError(err?.message || 'Login failed.');
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdating(true);
    const updated = await updateOrderStatus(orderId, newStatus);
    setOrders(updated);
    setIsUpdating(false);
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchStatus = statusFilter === 'all' || order.status === statusFilter;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchStatus;

      const matchText =
        order.id.toLowerCase().includes(query) ||
        order.customer.name.toLowerCase().includes(query) ||
        order.customer.phone.toLowerCase().includes(query) ||
        order.customer.city.toLowerCase().includes(query) ||
        (order.customer.businessName && order.customer.businessName.toLowerCase().includes(query)) ||
        order.items.some(
          i =>
            i.modelName.toLowerCase().includes(query) ||
            i.styleName.toLowerCase().includes(query) ||
            i.colorName.toLowerCase().includes(query),
        );

      return matchStatus && matchText;
    });
  }, [orders, statusFilter, searchQuery]);

  // Filtered customer parties
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(
      c =>
        (c.displayName && c.displayName.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.role && c.role.toLowerCase().includes(q))
    );
  }, [customers, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalUnits = orders.reduce((sum, o) => sum + o.totalUnits, 0);
    const pendingDispatch = orders.filter(
      o => o.status === 'new' || o.status === 'confirmed',
    ).length;

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter(o => o.createdAt.slice(0, 10) === todayStr).length;

    return { totalOrders, totalUnits, pendingDispatch, todayOrders };
  }, [orders]);

  // Export CSV
  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert('No orders to export.');
      return;
    }

    const headers = [
      'Order ID',
      'Date',
      'Status',
      'Customer Name',
      'Shop/Firm',
      'Phone',
      'City',
      'Address',
      'Pincode',
      'Transport Pref',
      'Total Items',
      'Total Units',
      'Items Breakdown',
    ];

    const rows = orders.map(o => {
      const itemsBreakdown = o.items
        .map(i => `${i.modelName} [${i.styleName} - ${i.colorName}] x ${i.quantity}`)
        .join(' | ');

      return [
        `"${o.id}"`,
        `"${new Date(o.createdAt).toLocaleString('en-IN')}"`,
        `"${o.status.toUpperCase()}"`,
        `"${o.customer.name.replace(/"/g, '""')}"`,
        `"${(o.customer.businessName || '').replace(/"/g, '""')}"`,
        `"${o.customer.phone}"`,
        `"${o.customer.city.replace(/"/g, '""')}"`,
        `"${o.customer.address.replace(/"/g, '""')}"`,
        `"${o.customer.pincode}"`,
        `"${(o.transportName || '').replace(/"/g, '""')}"`,
        o.totalItems,
        o.totalUnits,
        `"${itemsBreakdown.replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TorqMax_Dispatch_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return { label: '🟡 New Order', bg: 'rgba(234, 179, 8, 0.15)', color: '#facc15' };
      case 'confirmed':
        return { label: '🟢 Confirmed', bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' };
      case 'dispatched':
        return { label: '🔵 Dispatched', bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' };
      case 'delivered':
        return { label: '✅ Delivered', bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' };
    }
  };

  // If not logged in, show Auth Gate
  if (!currentUser) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: 'var(--bg)',
        }}
      >
        <div
          style={{
            maxWidth: 380,
            width: '100%',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: 30,
            textAlign: 'center',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(245,158,11,0.12)',
              border: '1px solid rgba(245,158,11,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '1.8rem',
            }}
          >
            🔐
          </div>
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--amber)',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              marginBottom: 6,
            }}
          >
            Owner Portal
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>
            Admin Dispatch Log
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 20 }}>
            Sign in with the TorqMax Google account or enter Owner PIN to view orders, dispatch logs, and party profiles.
          </p>

          {adminError && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: 10,
                padding: '8px 12px',
                color: '#fca5a5',
                fontSize: '0.78rem',
                marginBottom: 14,
                textAlign: 'left',
              }}
            >
              ⚠️ {adminError}
            </div>
          )}

          {/* Direct Owner PIN Login (immune to WebView popup issues) */}
          <form onSubmit={handlePinLogin} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--amber)', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                👑 Quick Owner PIN (7077)
              </label>
              <input
                type="password"
                required
                placeholder="Enter 7077"
                value={adminPin}
                onChange={e => setAdminPin(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(245,158,11,0.08)',
                  border: '1.5px solid var(--amber)',
                  borderRadius: 10,
                  padding: '10px 12px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  letterSpacing: '0.2em',
                  textAlign: 'center',
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, var(--amber) 0%, #D97706 100%)',
                border: 'none',
                color: '#000',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Unlock Owner Console →
            </button>
          </form>

          {!isNative && (
            <>
              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 12px', color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                <span>Or via Browser</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              </div>

              <button
                onClick={handleLogin}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
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
                <span>Sign in with Google (Web)</span>
              </button>
            </>
          )}

          <div style={{ marginTop: 20 }}>
            <button
              onClick={() => setActiveTab('home')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              ← Return to Main Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Unauthorized screen
  if (!isOwner) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: 'var(--bg)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>⛔</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171', marginBottom: 8 }}>
          Access Denied
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: 360, marginBottom: 20 }}>
          You are signed in as <strong>{currentUser.email}</strong>, which does not have administrator privileges.
        </p>
        <button
          onClick={handleLogout}
          style={{
            background: 'var(--surface-hover)',
            border: '1px solid var(--border)',
            padding: '10px 20px',
            borderRadius: 10,
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Sign out & switch account
        </button>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* Top Admin Navigation Header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(13,13,13,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: 'calc(env(safe-area-inset-top, 0px) + 8px) 16px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setActiveTab('home')}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              padding: '6px 10px',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            ← Store
          </button>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.1em' }}>
              ADMIN CONSOLE
            </div>
            <h1 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Dispatch & Orders
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={handleExportCSV}
            style={{
              background: 'rgba(245,158,11,0.15)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 8,
              padding: '6px 10px',
              color: 'var(--amber)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            📥 CSV
          </button>
          <button
            onClick={handleLogout}
            title="Sign Out"
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 8,
              padding: '6px 10px',
              color: '#f87171',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Scrollable Admin Area */}
      <div className="scroll-page" style={{ padding: '16px 16px 120px' }}>
        {/* KPI Metrics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Orders</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: 2 }}>{stats.totalOrders}</div>
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Sets</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--amber)', marginTop: 2 }}>{stats.totalUnits}</div>
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pending</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#facc15', marginTop: 2 }}>{stats.pendingDispatch}</div>
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Today</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4ade80', marginTop: 2 }}>{stats.todayOrders}</div>
          </div>
        </div>

        {/* View Toggle: Orders vs Parties */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          <button
            onClick={() => setAdminTab('orders')}
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: adminTab === 'orders' ? '1.5px solid var(--amber)' : '1px solid var(--border)',
              background: adminTab === 'orders' ? 'rgba(245,158,11,0.15)' : 'var(--surface)',
              color: adminTab === 'orders' ? 'var(--amber)' : 'var(--text-secondary)',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            📦 Dispatch Orders ({orders.length})
          </button>
          <button
            onClick={() => setAdminTab('customers')}
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: adminTab === 'customers' ? '1.5px solid var(--amber)' : '1px solid var(--border)',
              background: adminTab === 'customers' ? 'rgba(245,158,11,0.15)' : 'var(--surface)',
              color: adminTab === 'customers' ? 'var(--amber)' : 'var(--text-secondary)',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            👥 Parties & Users ({customers.length})
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            placeholder={
              adminTab === 'orders'
                ? 'Search by customer, phone, city, order ID, model...'
                : 'Search parties by name or email...'
            }
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '10px 14px',
              color: '#fff',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
        </div>

        {adminTab === 'orders' ? (
          <>
            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10, marginBottom: 12 }}>
              {(['all', 'new', 'confirmed', 'dispatched', 'delivered'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 20,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    whiteSpace: 'nowrap',
                    border: statusFilter === st ? '1px solid var(--amber)' : '1px solid var(--border)',
                    background: statusFilter === st ? 'var(--amber)' : 'var(--surface)',
                    color: statusFilter === st ? '#000' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {st === 'all' ? `All (${orders.length})` : st}
                </button>
              ))}
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  background: 'var(--surface)',
                  borderRadius: 14,
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: 8, opacity: 0.5 }}>📦</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No orders found matching your filter.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {filteredOrders.map(order => {
                  const badge = getStatusBadge(order.status);
                  return (
                    <div
                      key={order.id}
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 16,
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                      }}
                    >
                      {/* Top Bar: Order ID, Date & Status */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 10 }}>
                        <div>
                          <span
                            style={{
                              fontSize: '0.84rem',
                              fontWeight: 800,
                              color: '#fff',
                              fontFamily: 'var(--font-brand)',
                              letterSpacing: '0.05em',
                            }}
                          >
                            {order.id}
                          </span>
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

                        {/* Interactive Status Pill */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span
                            style={{
                              background: badge.bg,
                              color: badge.color,
                              border: `1px solid ${badge.color}40`,
                              borderRadius: 12,
                              padding: '4px 10px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                            }}
                          >
                            {badge.label}
                          </span>
                        </div>
                      </div>

                      {/* Customer Info Card */}
                      <div
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: 10,
                          padding: '10px 12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff' }}>
                            {order.customer.name}
                          </span>
                          {order.customer.businessName && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--amber)', fontWeight: 600 }}>
                              🏢 {order.customer.businessName}
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                          <a
                            href={`tel:${order.customer.phone}`}
                            style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            📞 {order.customer.phone}
                          </a>
                          <span>📍 {order.customer.city}</span>
                          {order.customerEmail && (
                            <span style={{ color: 'var(--text-muted)' }}>✉️ {order.customerEmail}</span>
                          )}
                        </div>

                        {order.customer.address && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.3, marginTop: 2 }}>
                            {order.customer.address}
                          </div>
                        )}
                      </div>

                      {/* Items Overview */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          <span>ITEMS ({order.totalItems})</span>
                          <span style={{ fontWeight: 700, color: 'var(--amber)' }}>TOTAL: {order.totalUnits} SETS</span>
                        </div>

                        {order.items.map((it, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '0.8rem',
                              borderBottom: '1px dashed rgba(255,255,255,0.05)',
                              paddingBottom: 4,
                            }}
                          >
                            <div>
                              <span style={{ color: '#fff', fontWeight: 600 }}>{it.modelName}</span>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                {it.styleName} · {it.colorName}
                              </div>
                            </div>
                            <span style={{ fontWeight: 800, color: 'var(--amber)' }}>
                              × {it.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                  {/* Action Footer: Print Dispatch Slip */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 6 }}>
                    <button
                      onClick={() => setSelectedOrderForPrint(order)}
                      style={{
                        background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
                        border: '1px solid rgba(245,158,11,0.3)',
                        borderRadius: 10,
                        padding: '8px 14px',
                        color: 'var(--amber)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      🖨️ Print Dispatch Slip
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
          </>
        ) : (
          /* Customer Parties List */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 2 }}>
              Registered dealer and customer accounts logged in via Google Authentication
            </div>
            {filteredCustomers.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  background: 'var(--surface)',
                  borderRadius: 14,
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: 8, opacity: 0.5 }}>👥</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No customer parties found.</p>
              </div>
            ) : (
              filteredCustomers.map(customer => {
                const customerOrders = orders.filter(
                  o =>
                    (o.customerEmail && o.customerEmail.toLowerCase() === (customer.email || '').toLowerCase()) ||
                    (o.customerUid && o.customerUid === customer.uid)
                );
                const totalCustomerUnits = customerOrders.reduce((s, o) => s + o.totalUnits, 0);

                return (
                  <div
                    key={customer.uid}
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 16,
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            background: 'rgba(245,158,11,0.15)',
                            border: '1px solid var(--amber)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            color: 'var(--amber)',
                            fontWeight: 800,
                            overflow: 'hidden',
                          }}
                        >
                          {customer.photoURL ? (
                            <img
                              src={customer.photoURL}
                              alt="Avatar"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            customer.displayName?.charAt(0).toUpperCase() || '👤'
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>
                            {customer.displayName || 'B2B Partner'}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                            {customer.email || 'No email'}
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 8,
                          background:
                            customer.role === 'owner'
                              ? 'rgba(245,158,11,0.18)'
                              : 'rgba(59,130,246,0.15)',
                          color: customer.role === 'owner' ? 'var(--amber)' : '#60a5fa',
                          border:
                            customer.role === 'owner'
                              ? '1px solid rgba(245,158,11,0.4)'
                              : '1px solid rgba(59,130,246,0.3)',
                        }}
                      >
                        {customer.role === 'owner' ? '👑 Owner' : '🏢 Dealer'}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 8,
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: 10,
                        padding: '8px 10px',
                        textAlign: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>Orders</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>
                          {customerOrders.length}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>Sets</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--amber)' }}>
                          {totalCustomerUnits}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>Last Active</div>
                        <div
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: 'var(--text-secondary)',
                            marginTop: 2,
                          }}
                        >
                          {customer.lastLoginAt
                            ? new Date(customer.lastLoginAt).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'Active'}
                        </div>
                      </div>
                    </div>

                    {customerOrders.length > 0 && (
                      <button
                        onClick={() => {
                          setSearchQuery(customer.email || customer.displayName || '');
                          setAdminTab('orders');
                        }}
                        style={{
                          background: 'rgba(245,158,11,0.1)',
                          border: '1px solid rgba(245,158,11,0.3)',
                          borderRadius: 8,
                          padding: '7px 12px',
                          color: 'var(--amber)',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                        }}
                      >
                        Filter Orders by This Party ({customerOrders.length}) →
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ─── PRINT DISPATCH SLIP MODAL & PRINT VIEW ─── */}
      {selectedOrderForPrint && (
        <div
          className="print-modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 620,
              maxHeight: '92vh',
              background: '#fff',
              color: '#000',
              borderRadius: 16,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
            }}
          >
            {/* Modal Actions Bar (hidden in print) */}
            <div
              className="no-print"
              style={{
                background: '#18181f',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>
                Print Preview — {selectedOrderForPrint.id}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    background: 'var(--amber)',
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 14px',
                    color: '#000',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  🖨️ Print Now
                </button>
                <button
                  onClick={() => setSelectedOrderForPrint(null)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 12px',
                    color: '#fff',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>

            {/* Print Slip Content Document (styled for standard A4/A5 printer) */}
            <div
              id="printable-dispatch-slip"
              style={{
                padding: '24px 28px',
                overflowY: 'auto',
                fontFamily: "'Inter', sans-serif",
                color: '#111',
              }}
            >
              {/* Slip Header */}
              <div
                style={{
                  borderBottom: '2px solid #000',
                  paddingBottom: 12,
                  marginBottom: 16,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <h1
                    style={{
                      fontSize: '1.4rem',
                      fontWeight: 900,
                      letterSpacing: '0.04em',
                      margin: 0,
                      color: '#000',
                      textTransform: 'uppercase',
                    }}
                  >
                    TORQMAX AUTO ACCESSORIES
                  </h1>
                  <div style={{ fontSize: '0.78rem', color: '#555', marginTop: 2 }}>
                    Premium Custom-Fit 3D Car Floor Mats · Bulk Dispatch Memo
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#666', marginTop: 1 }}>
                    Contact / WhatsApp: +91 84013 04787 · torqmaxautoaccessories@gmail.com
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      background: '#000',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: 4,
                      display: 'inline-block',
                    }}
                  >
                    DISPATCH SLIP
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, marginTop: 6 }}>
                    {selectedOrderForPrint.id}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#555' }}>
                    Date: {new Date(selectedOrderForPrint.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Consignee Shipping Box */}
              <div
                style={{
                  border: '1px solid #ccc',
                  borderRadius: 6,
                  padding: '12px 14px',
                  marginBottom: 16,
                  background: '#fcfcfc',
                }}
              >
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  CONSIGNEE / SHIP TO:
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#000', marginTop: 2 }}>
                  {selectedOrderForPrint.customer.name}
                  {selectedOrderForPrint.customer.businessName && (
                    <span style={{ fontWeight: 600, color: '#333' }}>
                      {' '}· {selectedOrderForPrint.customer.businessName}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#222', marginTop: 3, lineHeight: 1.4 }}>
                  {selectedOrderForPrint.customer.address}
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#000', marginTop: 2 }}>
                  {selectedOrderForPrint.customer.city} — Pincode: {selectedOrderForPrint.customer.pincode}
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111', marginTop: 3 }}>
                  Phone: {selectedOrderForPrint.customer.phone}
                </div>
                {selectedOrderForPrint.transportName && (
                  <div style={{ fontSize: '0.78rem', color: '#0044cc', marginTop: 4, fontWeight: 700 }}>
                    Preferred Transport: {selectedOrderForPrint.transportName}
                  </div>
                )}
              </div>

              {/* Items Table */}
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  marginBottom: 16,
                  fontSize: '0.8rem',
                }}
              >
                <thead>
                  <tr style={{ background: '#f0f0f0', borderBottom: '2px solid #000' }}>
                    <th style={{ padding: '8px 6px', textAlign: 'center', width: 30 }}>#</th>
                    <th style={{ padding: '8px 6px', textAlign: 'left' }}>Vehicle Model</th>
                    <th style={{ padding: '8px 6px', textAlign: 'left' }}>Style Series</th>
                    <th style={{ padding: '8px 6px', textAlign: 'left' }}>Color</th>
                    <th style={{ padding: '8px 6px', textAlign: 'right', width: 60 }}>Qty (Sets)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrderForPrint.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '8px 6px', textAlign: 'center', color: '#555' }}>{idx + 1}</td>
                      <td style={{ padding: '8px 6px', fontWeight: 700 }}>{item.modelName}</td>
                      <td style={{ padding: '8px 6px' }}>{item.styleName}</td>
                      <td style={{ padding: '8px 6px' }}>{item.colorName}</td>
                      <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 800 }}>{item.quantity}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '2px solid #000', background: '#fafafa' }}>
                    <td colSpan={4} style={{ padding: '10px 6px', fontWeight: 800, textAlign: 'right' }}>
                      TOTAL DISPATCH UNITS:
                    </td>
                    <td style={{ padding: '10px 6px', fontWeight: 900, textAlign: 'right', fontSize: '1rem' }}>
                      {selectedOrderForPrint.totalUnits} Sets
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Packaging & Quality Check Box */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1fr',
                  gap: 14,
                  borderTop: '1px solid #ccc',
                  paddingTop: 12,
                  marginTop: 10,
                }}
              >
                <div style={{ fontSize: '0.72rem', color: '#444' }}>
                  <div style={{ fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>
                    Packaging Checklist:
                  </div>
                  <div>[ ] 3D Laser Cut / Scan Fitment Verified</div>
                  <div>[ ] Driver Heel Pad & Anti-skid Clips Inspected</div>
                  <div>[ ] TorqMax Waterproof Packing Sealed</div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <div style={{ borderBottom: '1px solid #000', width: 160, marginLeft: 'auto', marginBottom: 4 }} />
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    Authorized Signatory
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#666' }}>TorqMax Logistics Desk</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
