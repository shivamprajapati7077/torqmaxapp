import React, { useState, useEffect } from 'react';
import { AppHeader } from '../components/AppHeader';
import type { Tab } from '../App';

interface HomeScreenProps {
  setActiveTab: (tab: Tab) => void;
}

const slides = [
  {
    // Maruti Swift / hatchback style — India's best-selling compact car
    image: 'https://images.unsplash.com/photo-1609676671207-d021525a635d?w=800&auto=format&fit=crop&q=90',
    headline: 'Perfect Fit for\nYour Swift.',
    sub: 'Every Curve. Every Corner.',
    label: 'Hatchbacks',
  },
  {
    // Honda City / Skoda Slavia style sedan
    image: 'https://images.unsplash.com/photo-1541845597-4b8d7bf81ebf?w=800&auto=format&fit=crop&q=90',
    headline: 'Built for\nIndian Roads.',
    sub: 'Monsoon Proof.',
    label: 'Sedans',
  },
  {
    // Compact red car — Tata Tiago / Maruti Ignis style
    image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop&q=90',
    headline: 'Fits Your Tata,\nYour Terms.',
    sub: 'Nexon · Punch · Tiago.',
    label: 'Compact Cars',
  },
  {
    // Compact SUV / Creta style
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=90',
    headline: 'SUV Ready.\nPremium Inside.',
    sub: 'Creta · Venue · Brezza.',
    label: 'Compact SUVs',
  },
];


const features = [
  {
    emoji: '🛡️',
    title: 'Military-Grade TPE',
    desc: 'Survives monsoons, heat & 10 years of daily use.'
  },
  {
    emoji: '📐',
    title: 'Precision 3D Fit',
    desc: '3D-scanned templates for 60+ car models — zero gaps.'
  },
  {
    emoji: '💧',
    title: '100% Waterproof',
    desc: '18mm raised lip traps every spill, every time.'
  },
  {
    emoji: '⚓',
    title: 'Anti-Slip Locked',
    desc: 'Hexagonal grip base with OEM anchor clips.'
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ setActiveTab }) => {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, []);

  const current = slides[slide];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <AppHeader setActiveTab={setActiveTab} />

      <div className="scroll-page page-enter">

        {/* ── HERO CAROUSEL ──────────────────────────── */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: 320,
          overflow: 'hidden',
        }}>
          {/* BG image with transition */}
          {slides.map((s, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${s.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'opacity 0.7s ease',
                opacity: i === slide ? 1 : 0,
              }}
            />
          ))}

          {/* Gradient overlays */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(13,13,13,0.45) 0%, rgba(13,13,13,0.1) 30%, rgba(13,13,13,0.9) 100%)',
          }} />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(13,13,13,0.7) 0%, transparent 60%)',
          }} />

          {/* Amber accent line left */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            background: 'linear-gradient(to bottom, var(--amber), transparent)',
          }} />

          {/* Content */}
          <div style={{
            position: 'absolute',
            bottom: 24,
            left: 20,
            right: 20,
          }}>
            {/* Car category label chip */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(245,158,11,0.9)',
              borderRadius: 20,
              padding: '3px 10px',
              marginBottom: 8,
            }}>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#fff',
              }}>{current.label}</span>
            </div>

            <div style={{
              fontFamily: 'var(--font-brand)',
              fontSize: '2rem',
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.1,
              whiteSpace: 'pre-line',
              letterSpacing: '0.02em',
              textShadow: '0 2px 12px rgba(0,0,0,0.5)',
            }}>
              {current.headline}
            </div>
            <div style={{
              fontSize: '0.85rem',
              color: 'var(--amber)',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginTop: 4,
            }}>
              {current.sub}
            </div>

            {/* Slide dots */}
            <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  style={{
                    width: i === slide ? 20 : 6,
                    height: 6,
                    borderRadius: 3,
                    background: i === slide ? 'var(--amber)' : 'rgba(255,255,255,0.35)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'width 0.3s ease, background 0.3s ease',
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── TAGLINE CHIP ─────────────────────────────── */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--amber-muted)',
            border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: 20,
            padding: '6px 14px',
            marginBottom: 20,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--amber)' }} />
            <span style={{
              fontSize: '0.73rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--amber)',
            }}>OEM-Level Fit · 102 Car Models</span>
          </div>

          {/* Main CTA Heading */}
          <h1 style={{
            fontFamily: 'var(--font-brand)',
            fontSize: '1.6rem',
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.2,
            marginBottom: 10,
          }}>
            India's Precision<br />
            <span style={{ color: 'var(--amber)' }}>Custom Car Mats</span>
          </h1>
          <p style={{
            fontSize: '0.87rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: 22,
          }}>
            Laser-cut, 3D-scanned floor mats engineered for Indian roads. Choose from 102 car models in Checkmate & Exotic styles.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
            <button className="btn-red" style={{ flex: 1, fontSize: '0.9rem', padding: '13px 0' }}
              onClick={() => setActiveTab('products')}>
              Customize Mats →
            </button>
            <button className="btn-outline" style={{ flex: 1, fontSize: '0.9rem', padding: '13px 0' }}
              onClick={() => setActiveTab('about')}>
              Our Story
            </button>
          </div>
        </div>

        {/* ── STATS ROW ─────────────────────────────────── */}
        <div style={{ padding: '0 20px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <div className="stat-badge">
            <div className="stat-number">1.2K+</div>
            <div className="stat-label">Cars Protected</div>
          </div>
          <div className="stat-badge">
            <div className="stat-number">60+</div>
            <div className="stat-label">Car Models</div>
          </div>
          <div className="stat-badge">
            <div className="stat-number">4.9★</div>
            <div className="stat-label">Rating</div>
          </div>
        </div>

        {/* ── DIVIDER ──────────────────────────────────── */}
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ height: 1, background: 'var(--border)' }} />
        </div>

        {/* ── WHY TORQMAX ──────────────────────────────── */}
        <div style={{ padding: '0 20px 16px' }}>
          <div className="section-eyebrow">Why Choose Us</div>
          <div className="section-title" style={{ marginBottom: 18 }}>Four Reasons to Trust TorqMax</div>

          <div className="card" style={{ padding: '4px 16px' }}>
            {features.map((f, i) => (
              <div key={i} className="feature-row">
                <div className="feature-icon-box">
                  <span style={{ fontSize: '1.15rem' }}>{f.emoji}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'var(--font-brand)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#fff',
                    letterSpacing: '0.03em',
                  }}>{f.title}</div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    marginTop: 2,
                    lineHeight: 1.4,
                  }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── BRAND STRIP ──────────────────────────────── */}
        <div style={{
          margin: '20px 20px 0',
          borderRadius: 16,
          overflow: 'hidden',
          position: 'relative',
          height: 120,
        }}>
          <img
            src="https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=800&auto=format&fit=crop&q=80"
            alt="TorqMax Workshop"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(245,158,11,0.85) 0%, rgba(10,10,15,0.7) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 20px',
          }}>
            <div style={{ fontFamily: 'var(--font-brand)', fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
              Made in Surat, India 🇮🇳
            </div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
              12-Step precision QC · Sachin GIDC Workshop
            </div>
          </div>
        </div>

        {/* Bottom spacer */}
        <div style={{ height: 20 }} />

      </div>
    </div>
  );
};
