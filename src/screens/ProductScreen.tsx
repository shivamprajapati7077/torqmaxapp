import React, { useState, useMemo, useRef, useCallback } from 'react';
import { AppHeader } from '../components/AppHeader';
import type { Tab } from '../App';
import {
  VEHICLE_MODELS,
  MAT_STYLES,
  PRICING_BY_CATEGORY,
  type VehicleCategory,
  type MatStyleId,
  type VehicleModel,
} from '../data/vehicleModels';

interface ProductScreenProps {
  setActiveTab: (tab: Tab) => void;
}

export const ProductScreen: React.FC<ProductScreenProps> = ({ setActiveTab }) => {
  // Filters & Selected State
  const [selectedCategory, setSelectedCategory] = useState<'all' | VehicleCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  // Default to Maruti Swift (Small) or Creta (Medium)
  const [selectedModel, setSelectedModel] = useState<VehicleModel>(
    VEHICLE_MODELS.find(m => m.name.includes('SWIFT / DZIRE 2018')) || VEHICLE_MODELS[12]
  );
  const [selectedStyleId, setSelectedStyleId] = useState<MatStyleId>('checkmate');
  const [selectedColorId, setSelectedColorId] = useState<string>('cm-black');
  const [viewAngle, setViewAngle] = useState<'driver' | 'codriver' | 'rear'>('driver');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Interactive 3D mat rotation
  const [matRotX, setMatRotX] = useState(28);
  const [matRotZ, setMatRotZ] = useState(-2);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; rotX: number; rotZ: number } | null>(null);

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStart.current = { x: clientX, y: clientY, rotX: matRotX, rotZ: matRotZ };
  }, [matRotX, matRotZ]);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!dragStart.current) return;
    const dx = clientX - dragStart.current.x;
    const dy = clientY - dragStart.current.y;
    // Horizontal drag → rotateZ, Vertical drag → rotateX
    const newRotZ = Math.max(-25, Math.min(25, dragStart.current.rotZ + dx * 0.3));
    const newRotX = Math.max(5, Math.min(55, dragStart.current.rotX - dy * 0.3));
    setMatRotZ(newRotZ);
    setMatRotX(newRotX);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    dragStart.current = null;
  }, []);

  // Filtered vehicles
  const filteredModels = useMemo(() => {
    return VEHICLE_MODELS.filter(m => {
      const matchCat = selectedCategory === 'all' || m.category === selectedCategory;
      const matchQuery = !searchQuery.trim() || m.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  const currentStyle = MAT_STYLES[selectedStyleId];
  const currentColor = currentStyle.colors.find(c => c.id === selectedColorId) || currentStyle.colors[0];

  // Handle style switch
  const handleStyleSelect = (styleId: MatStyleId) => {
    setSelectedStyleId(styleId);
    // Auto-select first color of new style
    setSelectedColorId(MAT_STYLES[styleId].colors[0].id);
  };

  // Build WhatsApp prefilled message
  const whatsappUrl = useMemo(() => {
    const text = `Hello TorqMax! I want to order custom vehicle mats:

🚗 Car Model: ${selectedModel.name}
📦 Category: ${PRICING_BY_CATEGORY[selectedModel.category].label}
✨ Style: ${currentStyle.name} (${currentStyle.tagline})
🎨 Colour: ${currentColor.name}

Please share dispatch & availability details!`;
    return `https://wa.me/918401304787?text=${encodeURIComponent(text)}`;
  }, [selectedModel, currentStyle, currentColor]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
      <AppHeader />

      <div className="scroll-page page-enter" style={{ padding: '0 0 40px' }}>
        {/* ── TOP HERO HEADER ─────────────────────────────── */}
        <div
          style={{
            padding: '24px 20px 16px',
            background: 'linear-gradient(180deg, rgba(229,39,46,0.1) 0%, transparent 100%)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--red-muted)',
              border: '1px solid rgba(229,39,46,0.3)',
              borderRadius: 20,
              padding: '4px 12px',
              marginBottom: 10,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)' }} />
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--red)',
              }}
            >
              Custom Mat Studio · {VEHICLE_MODELS.length} Vehicle Models
            </span>
          </div>

          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: 6 }}>
            Bespoke Floor <span style={{ color: 'var(--red)' }}>Mats</span>
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Laser-measured, dual-style precision car mats tailored specifically for your car's floor contours.
          </p>
        </div>

        <div style={{ padding: '20px 16px 0', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* ══════════════════════════════════════════════════
              STEP 1: VEHICLE MODEL SELECTOR
              ══════════════════════════════════════════════════ */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: 'var(--red)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  1
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>
                  CHOOSE YOUR VEHICLE
                </span>
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                {VEHICLE_MODELS.length} Models
              </span>
            </div>

            {/* Category Segment Chips */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none' }}>
              <button
                onClick={() => setSelectedCategory('all')}
                style={{
                  padding: '7px 14px',
                  borderRadius: 20,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  border: selectedCategory === 'all' ? '1.5px solid var(--red)' : '1px solid var(--border)',
                  background: selectedCategory === 'all' ? 'var(--red-muted)' : 'var(--surface)',
                  color: selectedCategory === 'all' ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                All Models ({VEHICLE_MODELS.length})
              </button>

              {(['small', 'medium', 'big'] as VehicleCategory[]).map(cat => {
                const info = PRICING_BY_CATEGORY[cat];
                const isAct = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 20,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      border: isAct ? '1.5px solid var(--red)' : '1px solid var(--border)',
                      background: isAct ? 'var(--red-muted)' : 'var(--surface)',
                      color: isAct ? '#fff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {info.label.replace(' Vehicle', '')} ({info.count})
                  </button>
                );
              })}
            </div>

            {/* Search Input Box */}
            <div style={{ position: 'relative', marginTop: 10 }}>
              <input
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Search Swift, Creta, Thar, Nexon, Fortuner..."
                style={{
                  width: '100%',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: '12px 38px 12px 14px',
                  fontSize: '0.85rem',
                  color: '#fff',
                  outline: 'none',
                }}
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '1rem',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              ) : (
                <span
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none',
                  }}
                >
                  🔍
                </span>
              )}

              {/* Autocomplete Dropdown List */}
              {isDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    maxHeight: 220,
                    overflowY: 'auto',
                    background: '#1A1A1D',
                    border: '1px solid rgba(229,39,46,0.4)',
                    borderRadius: 12,
                    zIndex: 50,
                    boxShadow: '0 12px 32px rgba(0,0,0,0.85)',
                  }}
                >
                  <div
                    style={{
                      padding: '8px 14px',
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{filteredModels.length} models matching</span>
                    <span
                      style={{ color: 'var(--red)', cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Close ✕
                    </span>
                  </div>
                  {filteredModels.map(m => {
                    const isSelected = selectedModel.srNo === m.srNo;
                    return (
                      <div
                        key={m.srNo}
                        onClick={() => {
                          setSelectedModel(m);
                          setIsDropdownOpen(false);
                          setSearchQuery('');
                        }}
                        style={{
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          background: isSelected ? 'rgba(229,39,46,0.18)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isSelected ? '#fff' : 'var(--text-primary)' }}>
                            {m.name}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            #{m.srNo} · {PRICING_BY_CATEGORY[m.category].label}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.72rem', color: isSelected ? 'var(--red)' : 'var(--text-muted)', fontWeight: 600 }}>
                            {isSelected ? 'Selected ✓' : 'Select →'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Native Mobile Dropdown Selector */}
            <div style={{ marginTop: 10 }}>
              <select
                id="vehicle-select-dropdown"
                value={selectedModel.srNo}
                onChange={e => {
                  const model = VEHICLE_MODELS.find(m => m.srNo === Number(e.target.value));
                  if (model) setSelectedModel(model);
                }}
                style={{
                  width: '100%',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: '11px 14px',
                  fontSize: '0.84rem',
                  color: '#fff',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <optgroup label="Small Vehicles">
                  {VEHICLE_MODELS.filter(m => m.category === 'small').map(m => (
                    <option key={m.srNo} value={m.srNo}>
                      #{m.srNo} · {m.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Medium Vehicles">
                  {VEHICLE_MODELS.filter(m => m.category === 'medium').map(m => (
                    <option key={m.srNo} value={m.srNo}>
                      #{m.srNo} · {m.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Big Vehicles">
                  {VEHICLE_MODELS.filter(m => m.category === 'big').map(m => (
                    <option key={m.srNo} value={m.srNo}>
                      #{m.srNo} · {m.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Currently Active Vehicle Card */}
            <div
              style={{
                marginTop: 10,
                background: 'linear-gradient(135deg, #1C1D21 0%, #161719 100%)',
                border: '1.5px solid rgba(229,39,46,0.4)',
                borderRadius: 14,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span
                    style={{
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      background: 'var(--red)',
                      color: '#fff',
                      padding: '2px 8px',
                      borderRadius: 6,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {PRICING_BY_CATEGORY[selectedModel.category].label}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Model #{selectedModel.srNo}
                  </span>
                </div>
                <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#fff', letterSpacing: '0.02em' }}>
                  {selectedModel.name}
                </div>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#25D366',
                    background: 'rgba(37,211,102,0.12)',
                    border: '1px solid rgba(37,211,102,0.3)',
                    padding: '5px 12px',
                    borderRadius: 8,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  ✓ CUSTOM FIT
                </span>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════
              STEP 2: STYLE SELECTION (CHECKMATE vs EXOTIC)
              ══════════════════════════════════════════════════ */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'var(--red)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                }}
              >
                2
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>
                SELECT DESIGN STYLE
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* Checkmate Style Card */}
              <div
                id="style-card-checkmate"
                onClick={() => handleStyleSelect('checkmate')}
                style={{
                  background: selectedStyleId === 'checkmate' ? 'rgba(229,39,46,0.12)' : 'var(--surface)',
                  border: selectedStyleId === 'checkmate' ? '2px solid var(--red)' : '1px solid var(--border)',
                  borderRadius: 14,
                  padding: '14px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedStyleId === 'checkmate' ? '0 4px 20px rgba(229,39,46,0.25)' : 'none',
                }}
              >
                {selectedStyleId === 'checkmate' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: 'var(--red)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                    }}
                  >
                    ✓
                  </div>
                )}

                {/* Geometric Diamond Pattern Mini-Graphic */}
                <div
                  style={{
                    height: 52,
                    borderRadius: 8,
                    background: '#141416',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 10,
                    border: '1px solid rgba(255,255,255,0.06)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <svg width="100%" height="100%" style={{ opacity: 0.75 }}>
                    <defs>
                      <pattern id="grid-diamond" width="16" height="16" patternUnits="userSpaceOnUse">
                        <path d="M8 0 L16 8 L8 16 L0 8 Z" fill="none" stroke="#E5272E" strokeWidth="0.9" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-diamond)" />
                  </svg>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 4,
                      fontSize: '0.6rem',
                      background: 'rgba(0,0,0,0.7)',
                      padding: '1px 6px',
                      borderRadius: 4,
                      color: '#E5272E',
                      fontWeight: 700,
                    }}
                  >
                    DIAMOND GRID
                  </span>
                </div>

                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-brand)' }}>
                  CHECKMATE
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--red)', fontWeight: 600, marginTop: 2 }}>
                  Sport Precision
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.3 }}>
                  Geometric cross-stitch for sporty & rugged cockpits.
                </div>
              </div>

              {/* Exotic Style Card */}
              <div
                id="style-card-exotic"
                onClick={() => handleStyleSelect('exotic')}
                style={{
                  background: selectedStyleId === 'exotic' ? 'rgba(229,39,46,0.12)' : 'var(--surface)',
                  border: selectedStyleId === 'exotic' ? '2px solid var(--red)' : '1px solid var(--border)',
                  borderRadius: 14,
                  padding: '14px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedStyleId === 'exotic' ? '0 4px 20px rgba(229,39,46,0.25)' : 'none',
                }}
              >
                {selectedStyleId === 'exotic' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: 'var(--red)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                    }}
                  >
                    ✓
                  </div>
                )}

                {/* Horizontal Ribbed Pattern Mini-Graphic */}
                <div
                  style={{
                    height: 52,
                    borderRadius: 8,
                    background: '#141416',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 10,
                    border: '1px solid rgba(255,255,255,0.06)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <svg width="100%" height="100%" style={{ opacity: 0.75 }}>
                    <defs>
                      <pattern id="grid-ribbed" width="20" height="12" patternUnits="userSpaceOnUse">
                        <line x1="0" y1="6" x2="20" y2="6" stroke="#D4AF37" strokeWidth="1.2" />
                        <line x1="0" y1="12" x2="20" y2="12" stroke="#443322" strokeWidth="0.8" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-ribbed)" />
                  </svg>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 4,
                      fontSize: '0.6rem',
                      background: 'rgba(0,0,0,0.7)',
                      padding: '1px 6px',
                      borderRadius: 4,
                      color: '#D4AF37',
                      fontWeight: 700,
                    }}
                  >
                    FLUID RIBBED
                  </span>
                </div>

                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-brand)' }}>
                  EXOTIC
                </div>
                <div style={{ fontSize: '0.7rem', color: '#D4AF37', fontWeight: 600, marginTop: 2 }}>
                  Executive Luxury
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.3 }}>
                  Channeled quilted cushions for ultra-premium luxury.
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════
              STEP 3: COLOUR SELECTION (2 COLOURS PER STYLE)
              ══════════════════════════════════════════════════ */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: 'var(--red)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  3
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>
                  CHOOSE {currentStyle.name.toUpperCase()} COLOUR
                </span>
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--red)', fontWeight: 600 }}>
                2 Premium Shades
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {currentStyle.colors.map(col => {
                const isSelected = selectedColorId === col.id;
                return (
                  <div
                    key={col.id}
                    id={`color-card-${col.name.toLowerCase()}`}
                    onClick={() => setSelectedColorId(col.id)}
                    style={{
                      background: isSelected ? 'rgba(229,39,46,0.12)' : 'var(--surface)',
                      border: isSelected ? '1.8px solid var(--red)' : '1px solid var(--border)',
                      borderRadius: 14,
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {/* Dual-Tone Swatch Disc */}
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: col.primaryColor,
                        border: `2.5px solid ${col.accentColor}`,
                        boxShadow: isSelected ? `0 0 12px ${col.accentColor}` : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: col.accentColor,
                        }}
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fff' }}>
                        {col.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        {col.description}
                      </div>
                    </div>

                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        border: isSelected ? '5px solid var(--red)' : '2px solid var(--text-muted)',
                        background: isSelected ? '#fff' : 'transparent',
                        flexShrink: 0,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </section>

          {/* ══════════════════════════════════════════════════
              STEP 4: LIVE INTERACTIVE MAT VISUALIZER
              ══════════════════════════════════════════════════ */}
          <section>
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: '18px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Studio Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--red)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Live Mat Preview
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
                    {selectedModel.name.split(' ')[0]} · {currentStyle.name} Series
                  </div>
                </div>

                {/* View Angle Pill Selector */}
                <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 18, padding: 2 }}>
                  {(['driver', 'codriver', 'rear'] as const).map(v => (
                    <button
                      key={v}
                      onClick={() => setViewAngle(v)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        borderRadius: 14,
                        border: 'none',
                        background: viewAngle === v ? 'var(--red)' : 'transparent',
                        color: viewAngle === v ? '#fff' : 'var(--text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3D Premium Mat Rendering — Interactive */}
              <div
                style={{
                  height: 320,
                  borderRadius: 14,
                  background: 'radial-gradient(ellipse at 50% 40%, #1a1b20 0%, #0a0b0d 100%)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  touchAction: 'none',
                  userSelect: 'none',
                }}
                onMouseDown={e => handleDragStart(e.clientX, e.clientY)}
                onMouseMove={e => { if (isDragging) handleDragMove(e.clientX, e.clientY); }}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={e => { const t = e.touches[0]; handleDragStart(t.clientX, t.clientY); }}
                onTouchMove={e => { const t = e.touches[0]; handleDragMove(t.clientX, t.clientY); }}
                onTouchEnd={handleDragEnd}
              >
                {/* Ambient floor reflection */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '15%',
                  right: '15%',
                  height: 60,
                  background: `radial-gradient(ellipse at 50% 0%, ${currentColor.accentColor}15 0%, transparent 70%)`,
                  filter: 'blur(20px)',
                  pointerEvents: 'none',
                }} />

                {/* Spotlight cone from top */}
                <div style={{
                  position: 'absolute',
                  top: -20,
                  left: '25%',
                  right: '25%',
                  height: 120,
                  background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />

                {/* Drag hint */}
                {!isDragging && matRotX === 28 && matRotZ === -2 && (
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'rgba(229,39,46,0.2)',
                    border: '1px solid rgba(229,39,46,0.35)',
                    borderRadius: 8,
                    padding: '3px 8px',
                    fontSize: '0.55rem',
                    color: 'rgba(255,255,255,0.6)',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    pointerEvents: 'none',
                    animation: 'matFloat 3s ease-in-out infinite',
                  }}>
                    ☝ Drag to rotate
                  </div>
                )}

                {/* 3D Perspective Mat Container */}
                <div style={{
                  perspective: '600px',
                  perspectiveOrigin: '50% 35%',
                }}>
                  <div style={{
                    transform: `rotateX(${matRotX}deg) rotateZ(${matRotZ}deg)`,
                    transformStyle: 'preserve-3d',
                    transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                    animation: isDragging ? 'none' : (matRotX === 28 && matRotZ === -2 ? 'matFloat 4s ease-in-out infinite' : 'none'),
                  }}>
                    {/* Drop Shadow underneath */}
                    <div style={{
                      position: 'absolute',
                      top: 20,
                      left: 10,
                      right: 10,
                      bottom: -15,
                      background: 'rgba(0,0,0,0.6)',
                      borderRadius: '50%',
                      filter: 'blur(18px)',
                      transform: 'translateZ(-20px) scaleY(0.3)',
                      pointerEvents: 'none',
                    }} />

                    <svg width="240" height="230" viewBox="0 0 240 230" style={{ display: 'block' }}>
                      <defs>
                        {/* Diamond Pattern for Checkmate */}
                        <pattern id="live-pattern-checkmate-3d" width="14" height="14" patternUnits="userSpaceOnUse">
                          <path
                            d="M7 0 L14 7 L7 14 L0 7 Z"
                            fill="none"
                            stroke={currentColor.stitchColor}
                            strokeWidth="0.7"
                            opacity="0.85"
                          />
                        </pattern>

                        {/* Ribbed Pattern for Exotic */}
                        <pattern id="live-pattern-exotic-3d" width="20" height="12" patternUnits="userSpaceOnUse">
                          <line x1="0" y1="4" x2="20" y2="4" stroke={currentColor.accentColor} strokeWidth="1.3" opacity="0.7" />
                          <line x1="0" y1="10" x2="20" y2="10" stroke="rgba(0,0,0,0.35)" strokeWidth="0.7" />
                        </pattern>

                        {/* Realistic edge shadow / depth */}
                        <filter id="mat-depth-shadow">
                          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.45" />
                          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={currentColor.accentColor} floodOpacity="0.15" />
                        </filter>

                        {/* Specular highlight gradient */}
                        <linearGradient id="mat-specular" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
                          <stop offset="40%" stopColor="rgba(255,255,255,0.02)" />
                          <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
                        </linearGradient>

                        {/* Inner shadow for recessed pattern area */}
                        <filter id="inner-recess">
                          <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
                          <feOffset dx="0" dy="2" result="offsetBlur" />
                          <feComposite in="SourceGraphic" in2="offsetBlur" operator="over" />
                        </filter>
                      </defs>

                      {/* ── Outer Raised Lip (18mm) ── */}
                      <path
                        d="M 48 18 C 85 12, 155 12, 192 18 C 215 45, 225 150, 200 200 C 165 212, 75 212, 40 200 C 15 150, 25 45, 48 18 Z"
                        fill={currentColor.primaryColor}
                        stroke={currentColor.accentColor}
                        strokeWidth="2.5"
                        filter="url(#mat-depth-shadow)"
                      />

                      {/* ── Lip inner edge highlight ── */}
                      <path
                        d="M 55 26 C 88 21, 152 21, 185 26 C 206 50, 214 145, 192 192 C 158 202, 82 202, 48 192 C 26 145, 34 50, 55 26 Z"
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="1"
                      />

                      {/* ── Recessed inner pattern area ── */}
                      <path
                        d="M 60 32 C 90 27, 150 27, 180 32 C 200 55, 208 142, 186 188 C 154 197, 86 197, 54 188 C 32 142, 40 55, 60 32 Z"
                        fill={selectedStyleId === 'checkmate' ? 'url(#live-pattern-checkmate-3d)' : 'url(#live-pattern-exotic-3d)'}
                        opacity="0.92"
                      />

                      {/* ── Specular highlight overlay ── */}
                      <path
                        d="M 60 32 C 90 27, 150 27, 180 32 C 200 55, 208 142, 186 188 C 154 197, 86 197, 54 188 C 32 142, 40 55, 60 32 Z"
                        fill="url(#mat-specular)"
                        opacity="0.6"
                      />

                      {/* ── HEELPAD (Driver View) ── */}
                      {viewAngle === 'driver' && (
                        <g transform="translate(72, 72)">
                          {/* Metal base with gradient */}
                          <defs>
                            <linearGradient id="heelpad-metal" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#3a3d44" />
                              <stop offset="50%" stopColor="#2a2c30" />
                              <stop offset="100%" stopColor="#1e2024" />
                            </linearGradient>
                          </defs>
                          <rect width="96" height="72" rx="10" fill="url(#heelpad-metal)" stroke="#555" strokeWidth="1" />
                          {/* Rubber grip ribs */}
                          {[16, 28, 40, 52, 64].map(y => (
                            <line key={y} x1="10" y1={y} x2="86" y2={y} stroke="#111" strokeWidth="3.5" strokeLinecap="round" opacity="0.8" />
                          ))}
                          {/* TorqMax logo image (transparent) */}
                          <image href="./torqmax-logo.png" x="14" y="10" width="68" height="52" opacity="0.9" style={{ mixBlendMode: 'screen' }} />
                          {/* Subtle shine on metal */}
                          <rect width="96" height="72" rx="10" fill="rgba(255,255,255,0.03)" />
                        </g>
                      )}

                      {/* ── Anti-Slip Anchor Clips ── */}
                      <g>
                        <circle cx="70" cy="192" r="6" fill="#111" stroke="#555" strokeWidth="1.5" />
                        <circle cx="70" cy="192" r="2" fill="#333" />
                        <circle cx="170" cy="192" r="6" fill="#111" stroke="#555" strokeWidth="1.5" />
                        <circle cx="170" cy="192" r="2" fill="#333" />
                      </g>

                      {/* ── Edge lighting effect ── */}
                      <path
                        d="M 48 18 C 85 12, 155 12, 192 18"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Overlay Specification Badges */}
                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(229,39,46,0.3)',
                    padding: '4px 10px',
                    borderRadius: 8,
                    fontSize: '0.62rem',
                    color: '#E5272E',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                  }}
                >
                  ● 18MM RAISED LIP
                </div>

                <div
                  style={{
                    position: 'absolute',
                    bottom: 10,
                    right: 10,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '4px 10px',
                    borderRadius: 8,
                    fontSize: '0.62rem',
                    color: '#D4D4D4',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                  }}
                >
                  OEM ANCHOR CLIPS
                </div>

                {/* View angle label */}
                <div style={{
                  position: 'absolute',
                  bottom: 10,
                  left: 10,
                  background: 'rgba(229,39,46,0.15)',
                  border: '1px solid rgba(229,39,46,0.3)',
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontSize: '0.58rem',
                  fontWeight: 700,
                  color: '#E5272E',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}>
                  {viewAngle} view
                </div>
              </div>

              {/* Mat Features Bar */}
              <div
                style={{
                  marginTop: 12,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 8,
                  textAlign: 'center',
                }}
              >
                <div style={{ background: 'var(--surface-2)', borderRadius: 8, padding: '8px 4px' }}>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>MATERIAL</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff', marginTop: 2 }}>
                    Military TPE
                  </div>
                </div>
                <div style={{ background: 'var(--surface-2)', borderRadius: 8, padding: '8px 4px' }}>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>FITMENT</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff', marginTop: 2 }}>
                    3D Laser Scan
                  </div>
                </div>
                <div style={{ background: 'var(--surface-2)', borderRadius: 8, padding: '8px 4px' }}>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>WARRANTY</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--red)', marginTop: 2 }}>
                    1 Year Direct
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════
              STEP 5: ORDER SUMMARY & WHATSAPP ACTION
              ══════════════════════════════════════════════════ */}
          <section
            style={{
              background: 'linear-gradient(135deg, #1C1213 0%, #15161A 100%)',
              border: '1.5px solid rgba(229,39,46,0.45)',
              borderRadius: 16,
              padding: '18px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  YOUR CONFIGURATION
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: 2 }}>
                  {selectedModel.name}
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(37,211,102,0.15)',
                  border: '1px solid rgba(37,211,102,0.4)',
                  borderRadius: 8,
                  padding: '4px 10px',
                  color: '#25D366',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                }}
              >
                ✓ DIRECT DISPATCH
              </div>
            </div>

            {/* Config Highlights */}
            <div
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                borderTop: '1px solid var(--border)',
                paddingTop: 12,
                marginBottom: 16,
              }}
            >
              <div>• <strong>Vehicle:</strong> {selectedModel.name} ({PRICING_BY_CATEGORY[selectedModel.category].label})</div>
              <div>• <strong>Style:</strong> {currentStyle.name} Series ({currentStyle.tagline})</div>
              <div>• <strong>Colour:</strong> {currentColor.name}</div>
              <div>• <strong>Origin:</strong> Crafted in Sachin GIDC, Surat</div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* WhatsApp Direct Order Button */}
              <button
                id="whatsapp-order-button"
                onClick={() => {
                  // '_system' tells Capacitor/Android WebView to open via the OS
                  // handler (i.e. directly open WhatsApp), not inside the webview.
                  // Fallback to window.location for plain web browsers.
                  try {
                    const opened = window.open(whatsappUrl, '_system');
                    if (!opened) window.location.href = whatsappUrl;
                  } catch {
                    window.location.href = whatsappUrl;
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  background: '#25D366',
                  color: '#000',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  letterSpacing: '0.04em',
                  padding: '14px',
                  borderRadius: 12,
                  border: 'none',
                  width: '100%',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(37,211,102,0.3)',
                  transition: 'transform 0.1s ease',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 012.41 5.83c.02 4.54-3.68 8.23-8.22 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.65 4.2 3.71.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.17-.47-.29z" />
                </svg>
                <span>SEND ORDER ON WHATSAPP</span>
              </button>

              {/* Inquiry / Doorstep Fitting Button */}
              <button
                onClick={() => setActiveTab('contact')}
                className="btn-outline"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '0.85rem',
                  borderRadius: 12,
                }}
              >
                REQUEST CUSTOM DOORSTEP FITTING →
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
