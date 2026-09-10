import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { VehicleModel, MatStyleId } from '../data/vehicleModels';

export interface CartItem {
  /** Unique key: `${model.srNo}-${styleId}-${colorId}` */
  id: string;
  model: VehicleModel;
  styleId: MatStyleId;
  styleName: string;
  styleTagline: string;
  colorId: string;
  colorName: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  /** Number of distinct line items */
  totalItems: number;
  /** Sum of all quantities */
  totalUnits: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

const STORAGE_KEY = 'torqmax_b2b_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.warn('Failed to load cart from storage:', err);
    }
    return [];
  });

  // Persist whenever items change
  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn('Failed to persist cart:', err);
    }
  }, [items]);

  const addItem = useCallback((incoming: Omit<CartItem, 'id'>) => {
    const id = `${incoming.model.srNo}-${incoming.styleId}-${incoming.colorId}`;
    setItems(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing) {
        // Stack quantity onto existing item
        return prev.map(i =>
          i.id === id ? { ...i, quantity: i.quantity + incoming.quantity } : i,
        );
      }
      return [...prev, { ...incoming, id }];
    });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(prev => prev.map(i => (i.id === id ? { ...i, quantity } : i)));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const totalItems = items.length;
  const totalUnits = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clearCart, totalItems, totalUnits }}>
      {children}
    </CartContext.Provider>
  );
};

