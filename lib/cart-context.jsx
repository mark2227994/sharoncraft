import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const CART_STORAGE_KEY = "sharoncraft-cart-v2";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (error) {
      console.warn("Unable to restore cart from storage.", error);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn("Unable to persist cart to storage.", error);
    }
  }, [items]);

  const value = useMemo(() => {
    const count = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

    return {
      items,
      count,
      subtotal,
      addItem(product) {
        setItems((current) => {
          const existing = current.find((item) => item.id === product.id);
          if (existing) {
            return current.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
            );
          }
          return current.concat({
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            image: product.image,
            artisan: product.artisan,
            quantity: 1,
          });
        });
      },
      updateQuantity(id, quantity) {
        setItems((current) =>
          current.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item)),
        );
      },
      removeItem(id) {
        setItems((current) => current.filter((item) => item.id !== id));
      },
      clear() {
        setItems([]);
      },
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider.");
  }
  return context;
}
