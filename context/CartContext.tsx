'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { CartLine } from '@/lib/types';

const STORAGE_KEY = 'hawa_cart_v1';

interface CartContextValue {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  isHydrated: boolean;
  addLine: (line: CartLine) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  removeLine: (productId: string, size: string, color: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function sameLine(a: CartLine, b: { productId: string; size: string; color: string }) {
  return a.productId === b.productId && a.size === b.size && a.color === b.color;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // ignore corrupt local storage
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, isHydrated]);

  const addLine = useCallback((line: CartLine) => {
    setLines((prev) => {
      const existing = prev.find((l) => sameLine(l, line));
      if (existing) {
        const nextQty = Math.min(existing.quantity + line.quantity, existing.maxStock || 99);
        return prev.map((l) => (sameLine(l, line) ? { ...l, quantity: nextQty } : l));
      }
      return [...prev, line];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, size: string, color: string, quantity: number) => {
    setLines((prev) =>
      prev
        .map((l) => (sameLine(l, { productId, size, color }) ? { ...l, quantity: Math.max(1, Math.min(quantity, l.maxStock || 99)) } : l))
        .filter((l) => l.quantity > 0)
    );
  }, []);

  const removeLine = useCallback((productId: string, size: string, color: string) => {
    setLines((prev) => prev.filter((l) => !sameLine(l, { productId, size, color })));
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);
  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + l.price * l.quantity, 0), [lines]);

  const value: CartContextValue = {
    lines,
    itemCount,
    subtotal,
    isHydrated,
    addLine,
    updateQuantity,
    removeLine,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
