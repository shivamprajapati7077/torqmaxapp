import React from 'react';
import { AppHeader } from '../components/AppHeader';
import type { Tab } from '../App';

const values = [
  { icon: '🎯', title: 'Precision First', desc: 'Every template is 3D-scanned directly from the actual vehicle floor. Zero gaps, zero pedal clearance issues, zero trimming required.' },
  { icon: '🌿', title: 'Built to Last', desc: 'OEM-grade vulcanized TPE rubber and military-spec double stitching. Outlasts cheap dealership mats by years.' },
  { icon: '🤝', title: 'Driver First', desc: '30-day fit guarantee, no-questions returns, and genuine Indian customer support. Your satisfaction is our reputation.' },
];

const qcSteps = [
  'Geometry Laser Verification',
  'Water Containment Pressure Test',
  'Tear & Tensile Strength Check',
  'Thermal Resistance Test',
  'OEM Clip Alignment Check',
  'Odourless Compound Cert.',
  'Diamond Stitch Tension Audit',
  'Pedal Clearance Validation',
  'Anti-Slip Friction Index',
  'Emblem Engraving Check',
  'Microfibre Cleaning & Pack',
  'Barcode & Tracking Label',
];

interface AboutScreenProps {
  setActiveTab: (tab: Tab) => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ setActiveTab }) => {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <AppHeader setActiveTab={setActiveTab} />

      <div className="scroll-page page-enter">

        {/* ── ABOUT HERO ───────────────────────────────── */}
        <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
          <img
            src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80"
            alt="TorqMax Workshop"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(10,10,15,0.3) 0%, rgba(10,10,15,0.95) 100%)',
          }} />
          <div style={{ position: 'absolute', left: 3, top: 0, bottom: 0, width: 3, background: 'linear-gradient(to bottom, var(--amber), transparent)' }} />
          <div style={{ position: 'absolute', bottom: 20, left: 20 }}>
            <div style={{
              fontSize: '0.7rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--amber)',
              fontWeight: 600,
              marginBottom: 6,
            }}>Our Story</div>
            <h1 style={{
              fontFamily: 'var(--font-brand)',
              fontSize: '1.65rem',
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.1,
            }}>
              Born in Surat.<br />
              Built for India.
            </h1>
          </div>
        </div>

        {/* ── STORY TEXT ───────────────────────────────── */}
        <div style={{ padding: '24px 20px 0' }}>
          <div className="section-eyebrow">Who We Are</div>
          <div className="section-title" style={{ marginBottom: 12 }}>From a Small Workshop to 1,200+ Cars</div>
          <p style={{ fontSize: '0.87rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 14 }}>
            TorqMax was founded with one conviction: Indian car owners deserve floor mats that <em style={{ color: 'var(--text-primary)', fontStyle: 'normal' }}>actually fit their cars</em>, survive our roads, and look great doing it.
          </p>
          <p style={{ fontSize: '0.87rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
            What started as a small precision-manufacturing unit in Sachin GIDC, Surat has grown into one of India's fastest-emerging automotive accessories brands — trusted by 1,200+ drivers across the country.
          </p>

          {/* Mini stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
            <div className="stat-badge">
              <div className="stat-number">2025</div>
              <div className="stat-label">Founded</div>
            </div>
            <div className="stat-badge">
              <div className="stat-number">0%</div>
              <div className="stat-label">Fit Complaints</div>
            </div>
          </div>
        </div>

        {/* ── DIVIDER ──────────────────────────────────── */}
        <div style={{ padding: '0 20px', marginBottom: 24 }}>
          <div style={{ height: 1, background: 'var(--border)' }} />
        </div>

        {/* ── CORE VALUES ──────────────────────────────── */}
        <div style={{ padding: '0 20px 24px' }}>
          <div className="section-eyebrow">Our Values</div>
          <div className="section-title" style={{ marginBottom: 18 }}>What Drives Us</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {values.map((v, i) => (
              <div key={i} className="card" style={{ display: 'flex', gap: 14, padding: 16 }}>
                <div style={{
                  width: 46,
                  height: 46,
                  borderRadius: 13,
                  background: 'var(--amber-muted)',
                  border: '1px solid rgba(245,158,11,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  flexShrink: 0,
                }}>
                  {v.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-brand)', fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                    {v.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {v.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 12-STEP QC ────────────────────────────────── */}
        <div style={{ padding: '0 20px 24px' }}>
          <div className="section-eyebrow">Manufacturing Excellence</div>
          <div className="section-title" style={{ marginBottom: 16 }}>The 12-Step QC Check</div>

          <div className="card" style={{ padding: '16px 18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
              {qcSteps.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 22,
                    height: 22,
                    borderRadius: 7,
                    background: 'var(--amber)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    color: '#000',
                    flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── WORKSHOP BANNER ──────────────────────────── */}
        <div style={{ margin: '0 20px 20px', borderRadius: 16, overflow: 'hidden', position: 'relative', height: 110 }}>
          <img
            src="https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=800&auto=format&fit=crop&q=80"
            alt="Surat Workshop"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(13,13,13,0.72)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 4,
          }}>
            <div style={{ fontFamily: 'var(--font-brand)', fontSize: '1rem', fontWeight: 700, color: '#fff', letterSpacing: '0.06em' }}>
              📍 Sachin GIDC, Surat, Gujarat
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
              Road no.7, Plot 745/746 · India 🇮🇳
            </div>
          </div>
        </div>

        <div style={{ height: 8 }} />
      </div>
    </div>
  );
};
