import React, { useState, useEffect } from 'react';
import { SplashScreen } from './screens/SplashScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ProductScreen } from './screens/ProductScreen';
import { AboutScreen } from './screens/AboutScreen';
import { ContactScreen } from './screens/ContactScreen';
import { BottomNav } from './components/BottomNav';
import { InstallAppBanner } from './components/InstallAppBanner';

export type Tab = 'home' | 'products' | 'about' | 'contact';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [splashFading, setSplashFading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('home');

  useEffect(() => {
    // Fade out splash after 2.2s
    const fadeTimer = setTimeout(() => setSplashFading(true), 2200);
    // Remove splash from DOM after fade
    const removeTimer = setTimeout(() => setShowSplash(false), 2850);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':     return <HomeScreen setActiveTab={setActiveTab} />;
      case 'products': return <ProductScreen setActiveTab={setActiveTab} />;
      case 'about':    return <AboutScreen />;
      case 'contact':  return <ContactScreen />;
    }
  };

  return (
    <>
      {showSplash && <SplashScreen fading={splashFading} />}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {renderScreen()}
      </div>

      {!showSplash && (
        <>
          <InstallAppBanner />
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </>
      )}
    </>
  );
}
