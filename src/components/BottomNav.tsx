import React from 'react';
import type { Tab } from '../App';

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

const AboutIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill={active ? AMBER : 'none'} stroke={active ? AMBER : MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M6 20v-1a6 6 0 0112 0v1" />
  </svg>
);

const ContactIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill={active ? AMBER : 'none'} stroke={active ? AMBER : MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs: { id: Tab; label: string; Icon: React.FC<{ active: boolean }> }[] = [
    { id: 'home',     label: 'Home',     Icon: HomeIcon },
    { id: 'products', label: 'Mats',     Icon: ProductsIcon },
    { id: 'about',    label: 'About',    Icon: AboutIcon },
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
          <Icon active={activeTab === id} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
};
