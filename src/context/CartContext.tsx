import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, ShippingInfo, PaymentInfo, Order } from '../types/Cart';
import { Product } from '../types/Product';

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  itemCount: number;
  subtotal: number;
  total: number;
  shipping: number;
  tax: number;
  addToCart: (product: Product, selectedColor: string, selectedSize: string, selectedColorValue: string, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
  openCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

const CART_STORAGE_KEY = 'ecommerce_cart';
const SHIPPING_RATE = 10; // Fixed shipping rate
const TAX_RATE = 0.1; // 10% tax rate

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, selectedColor: string, selectedSize: string, selectedColorValue: string, quantity: number = 1) => {
    const itemId = `${product.id}-${selectedColor}-${selectedSize}`;
    
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === itemId);
      
      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        const newItem: CartItem = {
          id: itemId,
          product,
          quantity,
          selectedColor,
          selectedSize,
          selectedColorValue,
        };
        return [...prevItems, newItem];
      }
    });

    // Auto-open cart drawer when item is added
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const toggleCart = () => {
    setIsCartOpen(prev => !prev);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const openCart = () => {
    setIsCartOpen(true);
  };

  // Calculate totals
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const shipping = itemCount > 0 ? SHIPPING_RATE : 0;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;

  const value: CartContextType = {
    items,
    isCartOpen,
    itemCount,
    subtotal,
    total,
    shipping,
    tax,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    closeCart,
    openCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
