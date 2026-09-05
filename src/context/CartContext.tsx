import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  categoryId: number;
  stock: number;
  active: boolean;
  category?: Category;
}

export interface Category {
  id: number;
  name: string;
  imageUrl: string;
}

interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  product: Product;
}

interface CartContextType {
  items: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  fetchCart: () => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  const fetchCart = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error("Cart fetch error:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId: number, quantity = 1) => {
    if (!token) return;
    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ productId, quantity })
      });
      if (res.ok) {
        await fetchCart();
      } else {
        const error = await res.json();
        alert(error.error || "Savatga qo'shishda xatolik");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ quantity })
      });
      if (res.ok) {
        await fetchCart();
      } else {
         const error = await res.json();
         alert(error.error || "Xatolik");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const clearCart = () => setItems([]);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = items.reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0);

  return (
    <CartContext.Provider value={{ items, cartCount, cartTotal, addToCart, updateQuantity, fetchCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
