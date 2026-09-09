import React, { useState, useEffect } from 'react';
import { SplashScreen } from './screens/SplashScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ProductScreen } from './screens/ProductScreen';
import { AboutScreen } from './screens/AboutScreen';
import { ContactScreen } from './screens/ContactScreen';
import { BottomNav } from './components/BottomNav';


export type Tab = 'home' | 'products' | 'about' | 'contact';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [splashFading, setSplashFading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('home');

  useEffect(() => {
    // Fast 1.2s smooth splash transition
    const fadeTimer = setTimeout(() => setSplashFading(true), 1200);
    const removeTimer = setTimeout(() => setShowSplash(false), 1600);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  const dismissSplash = () => {
    setSplashFading(true);
    setTimeout(() => setShowSplash(false), 300);
  };

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
      {showSplash && <SplashScreen fading={splashFading} onDismiss={dismissSplash} />}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {renderScreen()}
      </div>


      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </>
  );
}
