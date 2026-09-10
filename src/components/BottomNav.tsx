import React from 'react';
import type { Tab } from '../App';
import { useCart } from '../context/CartContext';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const AMBER = '#F59E0B';
const MUTED = '#5B5E6B';

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill={active ? AMBER : 'none'} stroke={active ? AMBER : MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
    <path d="M9 21V12h6v9" />
  </svg>
);

const ProductsIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={active ? AMBER : MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="4" fill={active ? 'rgba(245,158,11,0.15)' : 'none'} />
    <path d="M3 10h18" />
    <path d="M10 3v18" />
    <circle cx="16" cy="16" r="2" fill={active ? AMBER : MUTED} />
  </svg>
);

const CartIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={active ? AMBER : MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const AccountIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill={active ? AMBER : 'none'} stroke={active ? AMBER : MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="4" />
    <path d="M5.5 21a8.38 8.38 0 0113 0" />
  </svg>
);

const ContactIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill={active ? AMBER : 'none'} stroke={active ? AMBER : MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { totalItems } = useCart();

  const tabs: { id: Tab; label: string; Icon: React.FC<{ active: boolean }> }[] = [
    { id: 'home',     label: 'Home',     Icon: HomeIcon },
    { id: 'products', label: 'Mats',     Icon: ProductsIcon },
    { id: 'cart',     label: 'Cart',     Icon: CartIcon },
    { id: 'account',  label: 'Account',  Icon: AccountIcon },
    { id: 'contact',  label: 'Contact',  Icon: ContactIcon },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map(({ id, label, Icon }) => (
        <button
          key={id}
          id={`nav-${id}`}
          className={`nav-btn${activeTab === id ? ' active' : ''}`}
          onClick={() => setActiveTab(id)}
          aria-label={label}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon active={activeTab === id} />
            {id === 'cart' && totalItems > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -5,
                  right: -9,
                  minWidth: 16,
                  height: 16,
                  padding: '0 4px',
                  borderRadius: 8,
                  background: 'var(--amber)',
                  color: '#000',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(245,158,11,0.5)',
                  lineHeight: 1,
                  animation: 'cartBadgePop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                }}
              >
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </div>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
};
