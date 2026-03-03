'use client';

import { useState, useEffect, useCallback } from 'react';

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  isVeg: boolean;
}

const CART_KEY = 'qr-dine-cart';

function getStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setStoredCart(cart: CartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    setItems(getStoredCart());
    setIsLoaded(true);

    // Listen for changes from other tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === CART_KEY) {
        setItems(e.newValue ? JSON.parse(e.newValue) : []);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isLoaded) {
      setStoredCart(items);
    }
  }, [items, isLoaded]);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.menuItemId === item.menuItemId);
      if (existing) {
        return prev.map(i =>
          i.menuItemId === item.menuItemId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((menuItemId: string) => {
    setItems(prev => prev.filter(i => i.menuItemId !== menuItemId));
  }, []);

  const updateQuantity = useCallback((menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.menuItemId !== menuItemId));
      return;
    }
    setItems(prev =>
      prev.map(i =>
        i.menuItemId === menuItemId ? { ...i, quantity } : i
      )
    );
  }, []);

  const updateNotes = useCallback((menuItemId: string, notes: string) => {
    setItems(prev =>
      prev.map(i =>
        i.menuItemId === menuItemId ? { ...i, notes } : i
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    updateNotes,
    clearCart,
    totalItems,
    subtotal,
    isLoaded,
  };
}
