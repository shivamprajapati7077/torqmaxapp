import React, { useState, useEffect } from 'react';
import { generateOrderId } from '../services/orderStorage';
import { recordDispatchOrder } from '../firebase';
import { useAuth } from '../context/AuthContext';
import type { DispatchOrder, OrderCustomer, OrderItem } from '../types/order';

interface DispatchOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  totalItems: number;
  totalUnits: number;
  onOrderCompleted?: () => void;
}

const SAVED_CUSTOMER_KEY = 'torqmax_saved_customer_v1';

export const DispatchOrderModal: React.FC<DispatchOrderModalProps> = ({
  isOpen,
  onClose,
  items,
  totalItems,
  totalUnits,
  onOrderCompleted,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<OrderCustomer>(() => {
    try {
      const saved = localStorage.getItem(SAVED_CUSTOMER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          name: parsed.name || '',
          phone: parsed.phone || '',
          city: parsed.city || '',
          state: parsed.state || 'Gujarat',
          address: parsed.address || '',
          pincode: parsed.pincode || '',
          businessName: parsed.businessName || '',
          gstin: parsed.gstin || '',
          transportName: parsed.transportName || '',
          notes: '',
        };
      }
    } catch {
      // ignore
    }
    return {
      name: '',
      phone: '',
      city: '',
      state: 'Gujarat',
      address: '',
      pincode: '',
      businessName: '',
      gstin: '',
      transportName: '',
      notes: '',
    };
  });

  // If user is logged in and form name is empty, auto-populate from auth
  useEffect(() => {
    if (user?.displayName && !formData.name) {
      setFormData(prev => ({ ...prev, name: user.displayName || prev.name }));
    }
  }, [user]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setErrorMsg('Please enter your name or shop name');
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg('Please enter your delivery / dispatch address');
      return;
    }
    if (!formData.city.trim()) {
      setErrorMsg('Please enter your city');
      return;
    }
    if (!formData.pincode.trim() || formData.pincode.trim().length < 6) {
      setErrorMsg('Please enter a valid 6-digit pincode');
      return;
    }

    setIsSubmitting(true);
    const orderId = generateOrderId();

    const formattedPhone = formData.phone.startsWith('+91')
      ? formData.phone
      : `+91 ${formData.phone.trim()}`;

    const newOrder: DispatchOrder = {
      id: orderId,
      createdAt: new Date().toISOString(),
      customer: {
        ...formData,
        phone: formattedPhone,
      },
      customerEmail: user?.email || undefined,
      customerUid: user?.uid || undefined,
      items,
      totalItems,
      totalUnits,
      status: 'new',
      transportName: formData.transportName?.trim() || undefined,
    };

    // Save customer details for subsequent orders
    try {
      localStorage.setItem(SAVED_CUSTOMER_KEY, JSON.stringify({
        ...formData,
        notes: '',
      }));
    } catch {
      // ignore
    }

    // Build comprehensive WhatsApp dispatch message
    const itemLines = items.map(
      (item, idx) =>
        `${idx + 1}. *${item.modelName}*\n   ▸ Category: ${item.category ? item.category.toUpperCase() : 'VEHICLE'}\n   ▸ Style: ${item.styleName} (${item.colorName})\n   ▸ Qty: *${item.quantity} set${item.quantity > 1 ? 's' : ''}*`,
    );

    const waText = `*TORQMAX CAR MATS ORDER*
📋 Order ID: *${orderId}*
📅 Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}

*CUSTOMER & DELIVERY DETAILS:*
👤 Name: ${formData.name.trim()}
${formData.businessName?.trim() ? `🏢 Shop/Firm: ${formData.businessName.trim()}\n` : ''}📱 Mobile: ${formattedPhone}
📍 City: ${formData.city.trim()}${formData.state ? `, ${formData.state}` : ''}
🏠 Address: ${formData.address.trim()}
📮 Pincode: ${formData.pincode.trim()}
${formData.transportName?.trim() ? `🚚 Transport Pref: ${formData.transportName.trim()}\n` : ''}${formData.notes?.trim() ? `💬 Notes: ${formData.notes.trim()}\n` : ''}
*ORDER ITEMS (${totalItems} model${totalItems > 1 ? 's' : ''}, ${totalUnits} total sets):*
${itemLines.join('\n\n')}

📦 *Total Units: ${totalUnits} Sets*
Please confirm availability and dispatch schedule!`;

    const waUrl = `https://wa.me/918401304787?text=${encodeURIComponent(waText)}`;

    // Save order in database & localStorage (non-blocking)
    recordDispatchOrder(newOrder).catch(err => console.warn('Order save notice:', err));

    // Open WhatsApp immediately within direct user interaction gesture
    try {
      const isCapacitor = !!(window as any).Capacitor;
      const target = isCapacitor ? '_system' : '_blank';
      const opened = window.open(waUrl, target);
      if (!opened) {
        window.location.href = waUrl;
      }
    } catch {
      window.location.href = waUrl;
    }

    setIsSubmitting(false);
    onOrderCompleted?.();
    onClose();
  };


  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 0,
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: '#121217',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          border: '1px solid rgba(255,255,255,0.12)',
          borderBottom: 'none',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.7)',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Modal Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10, paddingBottom: 4 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)' }} />
        </div>

        {/* Modal Header */}
        <div
          style={{
            padding: '12px 20px 14px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'var(--amber)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: 2,
              }}
            >
              Dispatch Information
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
              Confirm Delivery Address
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '16px 20px 24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {errorMsg && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: 10,
                padding: '10px 14px',
                color: '#fca5a5',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Cart Quick Summary pill */}
          <div
            style={{
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 12,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Bulk Order Payload:
            </span>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--amber)' }}>
              {totalItems} models · {totalUnits} total sets
            </span>
          </div>

          {/* Name & Phone */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#ccc', marginBottom: 6, fontWeight: 600 }}>
              Full Name / Contact Person <span style={{ color: 'var(--amber)' }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Rajesh Patel"
              className="text-input"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 10,
                padding: '10px 14px',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#ccc', marginBottom: 6, fontWeight: 600 }}>
              Mobile Number (WhatsApp) <span style={{ color: 'var(--amber)' }}>*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. 98250 12345"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 10,
                padding: '10px 14px',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Shop / Business Name (Optional) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#aaa', marginBottom: 6, fontWeight: 500 }}>
              Shop / Firm Name (Optional)
            </label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              placeholder="e.g. Apex Car Accessories"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 10,
                padding: '10px 14px',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Delivery Address */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#ccc', marginBottom: 6, fontWeight: 600 }}>
              Delivery / Shop Address <span style={{ color: 'var(--amber)' }}>*</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={2}
              placeholder="Shop No, Building, Street, Landmark"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 10,
                padding: '10px 14px',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>

          {/* City, State & Pincode Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#ccc', marginBottom: 6, fontWeight: 600 }}>
                City / District <span style={{ color: 'var(--amber)' }}>*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Ahmedabad"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#ccc', marginBottom: 6, fontWeight: 600 }}>
                Pincode <span style={{ color: 'var(--amber)' }}>*</span>
              </label>
              <input
                type="text"
                name="pincode"
                maxLength={6}
                value={formData.pincode}
                onChange={handleChange}
                placeholder="e.g. 380015"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Transport / Courier preference */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#aaa', marginBottom: 6, fontWeight: 500 }}>
              Preferred Transport / Courier (Optional)
            </label>
            <input
              type="text"
              name="transportName"
              value={formData.transportName}
              onChange={handleChange}
              placeholder="e.g. V-Trans / Tirupati / Trackon"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 10,
                padding: '10px 14px',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              marginTop: 10,
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              border: 'none',
              borderRadius: 14,
              padding: '14px 20px',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 18px rgba(37, 211, 102, 0.35)',
              transition: 'transform 0.15s ease',
            }}
          >
            <span>📱</span>
            <span>{isSubmitting ? 'Logging Order...' : 'Confirm & Dispatch on WhatsApp'}</span>
          </button>

          <p style={{ fontSize: '0.72rem', color: '#777', textAlign: 'center', margin: 0 }}>
            Generates official TQM Order ID & formats complete dispatch slip
          </p>
        </form>
      </div>
    </div>
  );
};
