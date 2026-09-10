import React, { useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import type { Tab } from '../App';

type SubjectOption = 'Product Enquiry' | 'Fitment Query' | 'Order Status' | 'Partnership' | 'Other';

interface ContactScreenProps {
  setActiveTab: (tab: Tab) => void;
}

export const ContactScreen: React.FC<ContactScreenProps> = ({ setActiveTab }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState<SubjectOption>('Product Enquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const subjects: SubjectOption[] = ['Product Enquiry', 'Fitment Query', 'Order Status', 'Partnership', 'Other'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          access_key: 'dda630fd-c97b-48ab-8afb-b449fb5a3d49',
          from_name: 'TorqMax App Contact Form',
          subject: `[TorqMax App] ${subject} — from ${name}`,
          name,
          email: email || undefined,
          phone,
          topic: subject,
          message,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.message || 'Failed to send. Please reach us directly via WhatsApp or email.');
      }
    } catch {
      setError('Network error. Please check your connection or contact us via WhatsApp.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--surface-2)',
    border: '1.5px solid var(--border)',
    borderRadius: 12,
    padding: '13px 16px',
    color: '#fff',
    fontSize: '0.9rem',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    WebkitAppearance: 'none',
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <AppHeader setActiveTab={setActiveTab} />

      <div className="scroll-page page-enter">

        {/* ── PAGE HEADER ──────────────────────────────── */}
        <div style={{ padding: '24px 20px 20px' }}>
          <div className="section-eyebrow">Get in Touch</div>
          <div className="section-title">Contact TorqMax</div>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.6 }}>
            Have a car model query, bulk order, or custom fitment request? We reply within 24 hours.
          </p>
        </div>

        {/* ── QUICK CONTACT TILES ──────────────────────── */}
        <div style={{ padding: '0 20px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {/* WhatsApp */}
          <a
            href="https://wa.me/918401304787?text=Hi+TorqMax%2C+I+have+an+enquiry."
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '16px 12px',
              textDecoration: 'none',
            }}
          >
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'rgba(37,211,102,0.12)',
              border: '1px solid rgba(37,211,102,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.47 14.82c-.3-.16-1.77-.87-2.04-.97-.28-.1-.48-.15-.67.15-.2.3-.76.97-.93 1.17-.17.2-.34.22-.64.06-.3-.16-1.27-.47-2.41-1.49-.9-.8-1.5-1.78-1.67-2.08-.18-.3-.02-.46.13-.61.13-.13.3-.35.44-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.16-.66-1.59-.9-2.18-.24-.57-.49-.49-.66-.5-.17-.01-.38-.01-.58-.01-.2 0-.53.07-.81.37C7 8.34 6.16 9.17 6.16 11c0 1.83 1.33 3.6 1.52 3.85.18.24 2.6 3.98 6.3 5.58.88.38 1.57.61 2.1.78.88.28 1.68.24 2.32.14.71-.11 2.18-.89 2.49-1.75.31-.86.31-1.6.21-1.75-.09-.16-.3-.23-.6-.39z"/>
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.07-1.35A9.95 9.95 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.72 0-3.33-.47-4.72-1.29L4 20l1.29-3.27A7.95 7.95 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-brand)', fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>WhatsApp</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>Chat Now</div>
            </div>
          </a>

          {/* Call */}
          <a
            href="tel:+918401304787"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '16px 12px',
              textDecoration: 'none',
            }}
          >
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'var(--amber-muted)',
              border: '1px solid rgba(245,158,11,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-brand)', fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Call Us</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>+91 84013 04787</div>
            </div>
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/torqmaxautoaccessories/"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '16px 12px',
              textDecoration: 'none',
            }}
          >
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'rgba(225,48,108,0.12)',
              border: '1px solid rgba(225,48,108,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="url(#igGrad)">
                <defs>
                  <linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f09433"/>
                    <stop offset="25%" stopColor="#e6683c"/>
                    <stop offset="50%" stopColor="#dc2743"/>
                    <stop offset="75%" stopColor="#cc2366"/>
                    <stop offset="100%" stopColor="#bc1888"/>
                  </linearGradient>
                </defs>
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-brand)', fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Instagram</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>@torqmaxauto</div>
            </div>
          </a>

          {/* Email */}
          <a
            href="mailto:torqmaxautoaccessories@gmail.com"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '16px 12px',
              textDecoration: 'none',
            }}
          >
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'rgba(245,158,11,0.12)',
              border: '1px solid rgba(245,158,11,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div style={{ textAlign: 'center', maxWidth: '100%', overflow: 'hidden' }}>
              <div style={{ fontFamily: 'var(--font-brand)', fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Email Us</div>
              <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: 2, wordBreak: 'break-all', lineHeight: 1.2 }}>torqmaxautoaccessories@gmail.com</div>
            </div>
          </a>
        </div>

        {/* ── DIVIDER ──────────────────────────────────── */}
        <div style={{ padding: '0 20px', marginBottom: 24 }}>
          <div style={{ height: 1, background: 'var(--border)' }} />
        </div>

        {/* ── CONTACT FORM ─────────────────────────────── */}
        <div style={{ padding: '0 20px 20px' }}>
          <div className="section-eyebrow">Send a Message</div>
          <div className="section-title" style={{ marginBottom: 6 }}>We'll Reply Within 24h</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 18, lineHeight: 1.5 }}>
            Submissions go directly to <span style={{ color: 'var(--amber)', fontWeight: 600 }}>torqmaxautoaccessories@gmail.com</span>
          </p>

          {submitted ? (
            <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✅</div>
              <div style={{ fontFamily: 'var(--font-brand)', fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                Message Sent Successfully!
              </div>
              <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
                Thanks, <strong style={{ color: '#fff' }}>{name || 'there'}</strong>! Our team received your message at <strong style={{ color: 'var(--amber)' }}>torqmaxautoaccessories@gmail.com</strong> and will get back to you within 24 hours.
              </div>
              <button
                className="btn-primary"
                style={{ width: '100%', fontSize: '0.88rem' }}
                onClick={() => { setSubmitted(false); setName(''); setEmail(''); setPhone(''); setMessage(''); }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Name */}
              <div>
                <label style={{ fontSize: '0.73rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  style={inputStyle}
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ fontSize: '0.73rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Your Email <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>(Optional — for email reply)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. rahul@example.com"
                  style={inputStyle}
                />
              </div>

              {/* Phone */}
              <div>
                <label style={{ fontSize: '0.73rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Phone / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  style={inputStyle}
                />
              </div>

              {/* Subject Pills */}
              <div>
                <label style={{ fontSize: '0.73rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                  Subject
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {subjects.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSubject(s)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: 20,
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        border: `1.5px solid ${subject === s ? 'var(--amber)' : 'var(--border)'}`,
                        background: subject === s ? 'var(--amber-muted)' : 'transparent',
                        color: subject === s ? 'var(--amber)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label style={{ fontSize: '0.73rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Message *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Mention your car model and year if relevant..."
                  style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
                />
              </div>

              {error && (
                <div style={{
                  background: 'rgba(239,68,68,0.12)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontSize: '0.8rem',
                  color: '#EF4444',
                  textAlign: 'center',
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
                style={{
                  width: '100%',
                  marginTop: 4,
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? 'wait' : 'pointer',
                }}
              >
                {isLoading ? '⏳ Sending to TorqMax...' : 'Send Message →'}
              </button>
            </form>
          )}
        </div>

        {/* ── ADDRESS CARD ─────────────────────────────── */}
        <div style={{ padding: '0 20px 12px' }}>
          <div className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
              Workshop Address
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              📍 Road no.7, Plot 745/746<br />
              Sachin GIDC, Surat, Gujarat — 394230
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 8 }}>
              🕐 Mon – Sat: 9:00 AM – 6:00 PM IST
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>
              ✉️ torqmaxautoaccessories@gmail.com
            </div>
          </div>
        </div>

        <div style={{ height: 12 }} />
      </div>
    </div>
  );
};
