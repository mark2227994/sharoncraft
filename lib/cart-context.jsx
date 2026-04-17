import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const CART_STORAGE_KEY = "sharoncraft-cart-v2";
const WISHLIST_STORAGE_KEY = "sharoncraft-wishlist-v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

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
      const stored = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        setWishlistItems(JSON.parse(stored));
      }
    } catch (error) {
      console.warn("Unable to restore wishlist from storage.", error);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn("Unable to persist cart to storage.", error);
    }
  }, [items]);

  useEffect(() => {
    try {
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
    } catch (error) {
      console.warn("Unable to persist wishlist to storage.", error);
    }
  }, [wishlistItems]);

  const value = useMemo(() => {
    const count = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const wishlistCount = wishlistItems.length;

    function toWishlistItem(product) {
      return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
        artisan: product.artisan,
      };
    }

    return {
      items,
      wishlistItems,
      isCartOpen,
      count,
      subtotal,
      wishlistCount,
      openCart() {
        setIsCartOpen(true);
      },
      closeCart() {
        setIsCartOpen(false);
      },
      toggleCart() {
        setIsCartOpen((current) => !current);
      },
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
      isWishlisted(productId) {
        return wishlistItems.some((item) => item.id === productId);
      },
      addToWishlist(product) {
        setWishlistItems((current) => {
          if (current.some((item) => item.id === product.id)) return current;
          return current.concat(toWishlistItem(product));
        });
      },
      removeFromWishlist(productId) {
        setWishlistItems((current) => current.filter((item) => item.id !== productId));
      },
      toggleWishlist(product) {
        setWishlistItems((current) => {
          if (current.some((item) => item.id === product.id)) {
            return current.filter((item) => item.id !== product.id);
          }
          return current.concat(toWishlistItem(product));
        });
      },
    };
  }, [isCartOpen, items, wishlistItems]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider.");
  }
  return context;
}
