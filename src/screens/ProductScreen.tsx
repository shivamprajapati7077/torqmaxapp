import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useCart } from '../context/CartContext';
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
  const [quantity, setQuantity] = useState(1);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const { addItem } = useCart();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const handleAddToCart = () => {
    addItem({
      model: selectedModel,
      styleId: selectedStyleId,
      styleName: currentStyle.name,
      styleTagline: currentStyle.tagline,
      colorId: selectedColorId,
      colorName: currentColor.name,
      quantity,
    });
    setQuantity(1);
    setShowAddedToast(true);
    setTimeout(() => setShowAddedToast(false), 2200);
    // Scroll back to top so they can keep browsing
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
      <AppHeader setActiveTab={setActiveTab} />

      <div ref={scrollContainerRef} className="scroll-page page-enter" style={{ padding: '0 0 40px' }}>
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
              Custom Mat Studio · {VEHICLE_MODELS.length} Vehicle Models
            </span>
          </div>

          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: 6 }}>
            Bespoke Floor <span style={{ color: 'var(--amber)' }}>Mats</span>
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
                    background: 'var(--amber)',
                    color: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.72rem',
                    fontWeight: 800,
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
                  border: selectedCategory === 'all' ? '1.5px solid var(--amber)' : '1px solid var(--border)',
                  background: selectedCategory === 'all' ? 'var(--amber-muted)' : 'var(--surface)',
                  color: selectedCategory === 'all' ? 'var(--amber)' : 'var(--text-secondary)',
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
                      border: isAct ? '1.5px solid var(--amber)' : '1px solid var(--border)',
                      background: isAct ? 'var(--amber-muted)' : 'var(--surface)',
                      color: isAct ? 'var(--amber)' : 'var(--text-secondary)',
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
                      style={{ color: 'var(--amber)', cursor: 'pointer', fontWeight: 600 }}
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
                          background: isSelected ? 'rgba(245,158,11,0.15)' : 'transparent',
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
                          <span style={{ fontSize: '0.72rem', color: isSelected ? 'var(--amber)' : 'var(--text-muted)', fontWeight: 600 }}>
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
                      background: 'var(--amber)',
                      color: '#000',
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
                  background: 'var(--amber)',
                  color: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 800,
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
                  background: selectedStyleId === 'checkmate' ? 'rgba(245,158,11,0.12)' : 'var(--surface)',
                  border: selectedStyleId === 'checkmate' ? '2px solid var(--amber)' : '1px solid var(--border)',
                  borderRadius: 14,
                  padding: '14px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedStyleId === 'checkmate' ? '0 4px 20px rgba(245,158,11,0.2)' : 'none',
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
                      background: 'var(--amber)',
                      color: '#000',
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
                        <path d="M8 0 L16 8 L8 16 L0 8 Z" fill="none" stroke="#F59E0B" strokeWidth="0.9" />
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
                      color: '#F59E0B',
                      fontWeight: 700,
                    }}
                  >
                    DIAMOND GRID
                  </span>
                </div>

                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-brand)' }}>
                  CHECKMATE
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--amber)', fontWeight: 600, marginTop: 2 }}>
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
                  background: selectedStyleId === 'exotic' ? 'rgba(245,158,11,0.12)' : 'var(--surface)',
                  border: selectedStyleId === 'exotic' ? '2px solid var(--amber)' : '1px solid var(--border)',
                  borderRadius: 14,
                  padding: '14px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedStyleId === 'exotic' ? '0 4px 20px rgba(245,158,11,0.2)' : 'none',
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
                      background: 'var(--amber)',
                      color: '#000',
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
                    background: 'var(--amber)',
                    color: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                  }}
                >
                  3
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>
                  CHOOSE {currentStyle.name.toUpperCase()} COLOUR
                </span>
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--amber)', fontWeight: 600 }}>
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
                      background: isSelected ? 'rgba(245,158,11,0.12)' : 'var(--surface)',
                      border: isSelected ? '1.8px solid var(--amber)' : '1px solid var(--border)',
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
                        border: isSelected ? '5px solid var(--amber)' : '2px solid var(--text-muted)',
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
                  <div style={{ fontSize: '0.7rem', color: 'var(--amber)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
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
                        background: viewAngle === v ? 'var(--amber)' : 'transparent',
                        color: viewAngle === v ? '#000' : 'var(--text-muted)',
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
                    border: '1px solid rgba(245,158,11,0.3)',
                    padding: '4px 10px',
                    borderRadius: 8,
                    fontSize: '0.62rem',
                    color: 'var(--amber)',
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
                  background: 'rgba(245,158,11,0.15)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontSize: '0.58rem',
                  fontWeight: 700,
                  color: 'var(--amber)',
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
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--amber)', marginTop: 2 }}>
                    1 Year Direct
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════
              STEP 5: CONFIRM & DISPATCH
              ══════════════════════════════════════════════════ */}
          <section
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(20,20,28,0.98) 100%)',
              border: '1.5px solid rgba(245,158,11,0.35)',
              borderRadius: 20,
              padding: '20px',
              boxShadow: '0 10px 32px rgba(0,0,0,0.5)',
            }}
          >
            {/* Step Header with direct dispatch tag */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'var(--amber)',
                    color: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 900,
                  }}
                >
                  5
                </span>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff', letterSpacing: '0.04em' }}>
                  CONFIRM & ADD TO CART
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: 'var(--amber)',
                  background: 'rgba(245,158,11,0.12)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  padding: '3px 8px',
                  borderRadius: 6,
                  textTransform: 'uppercase',
                }}
              >
                ● Custom Fitment
              </span>
            </div>

            {/* Vehicle & Configuration Summary Box */}
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14,
                padding: '14px',
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>
                    {PRICING_BY_CATEGORY[selectedModel.category].label} · #{selectedModel.srNo}
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.25 }}>
                    {selectedModel.name}
                  </h3>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>MRP / Set</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--amber)' }}>
                    ₹{PRICING_BY_CATEGORY[selectedModel.category].mrp.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                  marginTop: 12,
                  paddingTop: 10,
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  fontSize: '0.78rem',
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>STYLE SERIES</span>
                  <span style={{ color: '#fff', fontWeight: 700 }}>{currentStyle.name} Series</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>COLOUR SHADE</span>
                  <span style={{ color: '#fff', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: currentColor.primaryColor, border: `1px solid ${currentColor.accentColor}` }} />
                    {currentColor.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity Selector with Quick Presets */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Select Quantity (Sets)
                </label>
                {quantity > 1 && (
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--amber)' }}>
                    Total: ₹{(PRICING_BY_CATEGORY[selectedModel.category].mrp * quantity).toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: '#fff',
                    fontSize: '1.2rem',
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
                  value={quantity}
                  onChange={e => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1) setQuantity(val);
                  }}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    background: 'var(--surface)',
                    border: '2px solid var(--amber)',
                    borderRadius: 12,
                    height: 44,
                    fontSize: '1.15rem',
                    fontWeight: 900,
                    color: '#fff',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: '#fff',
                    fontSize: '1.2rem',
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

              {/* Quick Quantity Presets */}
              <div style={{ display: 'flex', gap: 6 }}>
                {[1, 5, 10, 25].map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuantity(q)}
                    style={{
                      flex: 1,
                      padding: '5px 0',
                      borderRadius: 8,
                      border: quantity === q ? '1.5px solid var(--amber)' : '1px solid rgba(255,255,255,0.08)',
                      background: quantity === q ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.04)',
                      color: quantity === q ? 'var(--amber)' : 'var(--text-muted)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {q === 1 ? '1 Set' : `${q} Sets`}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Action: Add to Cart (Orders dispatched via Cart only) */}
            <button
              id="add-to-cart-button"
              onClick={handleAddToCart}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                background: 'linear-gradient(135deg, var(--amber) 0%, #D97706 100%)',
                color: '#000',
                fontWeight: 900,
                fontSize: '1rem',
                letterSpacing: '0.04em',
                padding: '16px',
                borderRadius: 14,
                border: 'none',
                width: '100%',
                cursor: 'pointer',
                boxShadow: '0 6px 24px rgba(245,158,11,0.35)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                marginBottom: 10,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
              </svg>
              <span>ADD TO CART ({quantity} SET{quantity > 1 ? 'S' : ''})</span>
            </button>

            {/* Doorstep Fitting Inquiry */}
            <button
              onClick={() => setActiveTab('contact')}
              className="btn-outline"
              style={{
                width: '100%',
                padding: '11px',
                fontSize: '0.82rem',
                borderRadius: 12,
              }}
            >
              REQUEST CUSTOM DOORSTEP FITTING →
            </button>
          </section>

          {/* ── ADDED TO CART TOAST ─── */}
          {showAddedToast && (
            <div
              style={{
                position: 'fixed',
                top: 76,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(18, 20, 26, 0.98)',
                border: '1.5px solid var(--amber)',
                backdropFilter: 'blur(16px)',
                color: '#fff',
                padding: '10px 16px',
                borderRadius: 14,
                fontSize: '0.86rem',
                fontWeight: 700,
                zIndex: 999,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                boxShadow: '0 12px 36px rgba(0,0,0,0.8), 0 0 20px rgba(245,158,11,0.3)',
                animation: 'fadeSlideIn 0.3s ease-out',
                maxWidth: '90%',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#25D366', fontSize: '1.1rem' }}>✓</span>
                <span>Added to cart!</span>
              </div>
              <button
                onClick={() => setActiveTab('cart')}
                style={{
                  background: 'var(--amber)',
                  color: '#000',
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                }}
              >
                VIEW CART →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
