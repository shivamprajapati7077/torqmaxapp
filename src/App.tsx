import React, { useState, useEffect } from 'react';
import { SplashScreen } from './screens/SplashScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ProductScreen } from './screens/ProductScreen';
import { AboutScreen } from './screens/AboutScreen';
import { ContactScreen } from './screens/ContactScreen';
import { CartScreen } from './screens/CartScreen';
import { AdminScreen } from './screens/AdminScreen';
import { BottomNav } from './components/BottomNav';
import { CartProvider } from './context/CartContext';


export type Tab = 'home' | 'products' | 'about' | 'contact' | 'cart' | 'admin';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [splashFading, setSplashFading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('home');

  useEffect(() => {
    // Fast 1.2s smooth splash transition
    const fadeTimer = setTimeout(() => setSplashFading(true), 1200);
    const removeTimer = setTimeout(() => setShowSplash(false), 1600);
    
    // Dev/testing helper to switch to admin or other tabs
    (window as any).__setActiveTab = (t: Tab) => setActiveTab(t);
    (window as any).__openAdmin = () => setActiveTab('admin');

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
      case 'about':    return <AboutScreen setActiveTab={setActiveTab} />;
      case 'contact':  return <ContactScreen setActiveTab={setActiveTab} />;
      case 'cart':     return <CartScreen setActiveTab={setActiveTab} />;
      case 'admin':    return <AdminScreen setActiveTab={setActiveTab} />;
    }
  };

  return (
    <CartProvider>
      {showSplash && <SplashScreen fading={splashFading} onDismiss={dismissSplash} />}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {renderScreen()}
      </div>


      {activeTab !== 'admin' && (
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
    </CartProvider>
  );
}
