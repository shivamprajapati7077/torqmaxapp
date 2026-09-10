import React, { useState, useMemo } from 'react';
import { AppHeader } from '../components/AppHeader';
import { useCart } from '../context/CartContext';
import { PRICING_BY_CATEGORY } from '../data/vehicleModels';
import { DispatchOrderModal } from '../components/DispatchOrderModal';
import type { Tab } from '../App';

interface CartScreenProps {
  setActiveTab: (tab: Tab) => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({ setActiveTab }) => {
  const { items, updateQuantity, removeItem, clearCart, totalItems, totalUnits } = useCart();
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);

  // Calculate total order value (MRP)
  const totalEstimatedMrp = useMemo(() => {
    return items.reduce((sum, item) => {
      const p = PRICING_BY_CATEGORY[item.model.category];
      return sum + (p ? p.mrp * item.quantity : 0);
    }, 0);
  }, [items]);

  const handleOpenDispatch = () => {
    if (items.length === 0) return;
    setIsDispatchModalOpen(true);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
      <AppHeader setActiveTab={setActiveTab} />

      <div className="scroll-page page-enter" style={{ padding: '0 0 200px' }}>
        {/* Header */}
        <div
          style={{
            padding: '22px 20px 16px',
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
              B2B Bulk Orders
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', lineHeight: 1.15, margin: 0 }}>
                Your <span style={{ color: 'var(--amber)' }}>Cart</span>
              </h1>
              {totalItems > 0 && (
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 4, marginBottom: 0 }}>
                  {totalItems} model{totalItems > 1 ? 's' : ''} · {totalUnits} total unit{totalUnits > 1 ? 's' : ''}
                </p>
              )}
            </div>

            {totalItems > 0 && (
              <button
                onClick={() => setActiveTab('products')}
                style={{
                  background: 'rgba(245,158,11,0.12)',
                  border: '1px solid rgba(245,158,11,0.35)',
                  borderRadius: 10,
                  padding: '6px 12px',
                  color: 'var(--amber)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all 0.15s ease',
                }}
              >
                <span>+</span> Add Models
              </button>
            )}
          </div>
        </div>

        <div style={{ padding: '20px 16px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* ── EMPTY STATE ─── */}
          {items.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: 'var(--surface)',
                borderRadius: 20,
                border: '1px solid var(--border)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ fontSize: '3.2rem', marginBottom: 16, opacity: 0.6 }}>🛒</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>
                Your cart is empty
              </h2>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.5, maxWidth: 320, margin: '0 auto 24px' }}>
                Browse our car mat collection, choose your car model, style, colour and set quantity, then return here to dispatch via WhatsApp.
              </p>
              <button
                onClick={() => setActiveTab('products')}
                style={{
                  background: 'linear-gradient(135deg, var(--amber) 0%, #D97706 100%)',
                  color: '#000',
                  fontWeight: 900,
                  fontSize: '0.92rem',
                  padding: '13px 32px',
                  borderRadius: 14,
                  border: 'none',
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                  boxShadow: '0 6px 20px rgba(245,158,11,0.3)',
                }}
              >
                Browse Car Mats →
              </button>
            </div>
          )}

          {/* ── CART ITEMS ─── */}
          {items.map((item, idx) => {
            const pricing = PRICING_BY_CATEGORY[item.model.category];
            const itemTotal = pricing ? pricing.mrp * item.quantity : 0;
            const isBeige = item.colorId.toLowerCase().includes('beige');

            return (
              <div
                key={item.id}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  padding: '16px',
                  position: 'relative',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                  animation: 'fadeSlideIn 0.3s ease-out',
                }}
              >
                {/* Header row: Item badge & Category + Remove button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        background: 'var(--amber)',
                        color: '#000',
                        fontSize: '0.62rem',
                        fontWeight: 900,
                        padding: '2px 8px',
                        borderRadius: 6,
                        letterSpacing: '0.06em',
                      }}
                    >
                      ITEM {idx + 1}
                    </span>
                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        background: 'rgba(255,255,255,0.06)',
                        color: 'var(--text-secondary)',
                        padding: '2px 8px',
                        borderRadius: 6,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {pricing ? pricing.label : item.model.category} · #{item.model.srNo}
                    </span>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.25)',
                      borderRadius: 8,
                      width: 30,
                      height: 30,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#EF4444',
                      fontSize: '0.85rem',
                      transition: 'all 0.15s ease',
                    }}
                    title="Remove item"
                    aria-label="Remove item"
                  >
                    🗑
                  </button>
                </div>

                {/* Car Model Title & Price */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
                  <div style={{ fontSize: '1.02rem', fontWeight: 800, color: '#fff', lineHeight: 1.25 }}>
                    {item.model.name}
                  </div>
                  {pricing && (
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>MRP</span>
                      <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--amber)' }}>
                        ₹{pricing.mrp.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Style & Colour Info Cards */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 8,
                    marginBottom: 14,
                    paddingBottom: 14,
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {/* Style card */}
                  <div
                    style={{
                      background: 'var(--surface-2)',
                      borderRadius: 10,
                      padding: '8px 10px',
                      border: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
                      STYLE
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>
                      {item.styleName}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.styleTagline}
                    </div>
                  </div>

                  {/* Colour card */}
                  <div
                    style={{
                      background: 'var(--surface-2)',
                      borderRadius: 10,
                      padding: '8px 10px',
                      border: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
                      COLOUR
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                      <div
                        style={{
                          width: 13,
                          height: 13,
                          borderRadius: '50%',
                          background: isBeige ? '#C4A482' : '#141416',
                          border: isBeige ? '1.5px solid #8C6D46' : '1.5px solid #E5272E',
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>
                        {item.colorName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quantity Editor & Line Subtotal */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Qty:
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: 'var(--surface-2)',
                          border: '1px solid var(--border)',
                          color: '#fff',
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={e => {
                          const raw = e.target.value;
                          if (raw === '') return;
                          const val = parseInt(raw, 10);
                          if (!isNaN(val) && val >= 1) updateQuantity(item.id, val);
                        }}
                        onBlur={e => {
                          const val = parseInt(e.target.value, 10);
                          if (isNaN(val) || val < 1) updateQuantity(item.id, 1);
                        }}
                        style={{
                          width: 58,
                          textAlign: 'center',
                          background: 'var(--surface-2)',
                          border: '1.5px solid var(--amber)',
                          borderRadius: 8,
                          height: 32,
                          fontSize: '0.92rem',
                          fontWeight: 800,
                          color: '#fff',
                          outline: 'none',
                        }}
                      />
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: 'var(--surface-2)',
                          border: '1px solid var(--border)',
                          color: '#fff',
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Item Subtotal
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
                      ₹{itemTotal.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--amber)', fontWeight: 600 }}>
                      ({item.quantity} set{item.quantity > 1 ? 's' : ''})
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Bottom Actions: Add more models & Clear cart */}
          {items.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
              <button
                onClick={() => setActiveTab('products')}
                style={{
                  background: 'rgba(245,158,11,0.08)',
                  border: '1.5px dashed rgba(245,158,11,0.4)',
                  borderRadius: 14,
                  padding: '12px',
                  color: 'var(--amber)',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.15s ease',
                }}
              >
                <span>+ ADD MORE VEHICLE MODELS</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all items from your cart?')) {
                    clearCart();
                  }
                }}
                style={{
                  background: 'none',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: 12,
                  padding: '10px',
                  color: '#EF4444',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                🗑 Clear Entire Cart
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── STICKY BOTTOM BAR: CLAMPED TO 480PX MOBILE FRAME ─── */}
      {items.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: 'var(--nav-h, 64px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: 480,
            boxSizing: 'border-box',
            background: 'rgba(14, 15, 20, 0.98)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderTop: '1px solid rgba(255,255,255,0.09)',
            padding: '12px 16px',
            paddingBottom: 'calc(12px + var(--sab, 0px))',
            zIndex: 80,
            boxShadow: '0 -8px 30px rgba(0,0,0,0.6)',
          }}
        >
          {/* Order Totals Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
              padding: '0 2px',
            }}
          >
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {totalItems} model{totalItems > 1 ? 's' : ''} ·{' '}
                <strong style={{ color: '#fff' }}>{totalUnits} set{totalUnits > 1 ? 's' : ''}</strong>
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 6 }}>
                Est. Total:
              </span>
              <span style={{ fontSize: '1.12rem', fontWeight: 900, color: 'var(--amber)' }}>
                ₹{totalEstimatedMrp.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* The Single WhatsApp Order Button */}
          <button
            id="cart-send-whatsapp-btn"
            onClick={handleOpenDispatch}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: '0.98rem',
              letterSpacing: '0.04em',
              padding: '15px 16px',
              borderRadius: 14,
              border: 'none',
              width: '100%',
              cursor: 'pointer',
              boxShadow: '0 6px 24px rgba(37,211,102,0.4)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 012.41 5.83c.02 4.54-3.68 8.23-8.22 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.65 4.2 3.71.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.17-.47-.29z" />
            </svg>
            <span>SEND ORDER ON WHATSAPP ({totalUnits} SET{totalUnits > 1 ? 'S' : ''})</span>
          </button>
        </div>
      )}

      {/* Dispatch Order Modal */}
      <DispatchOrderModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        items={items.map(i => ({
          modelName: i.model.name,
          category: i.model.category,
          styleName: i.styleName,
          styleTagline: i.styleTagline,
          colorName: i.colorName,
          quantity: i.quantity,
        }))}
        totalItems={totalItems}
        totalUnits={totalUnits}
        onOrderCompleted={() => clearCart()}
      />
    </div>
  );
};
