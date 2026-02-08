import { createContext, useContext, useState, useCallback } from "react";
import { authFetch, getAccessToken } from "../utils/auth";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL;

  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  /* ---------------- FETCH FULL CART ---------------- */
  const fetchCart = useCallback(async () => {
    if (!getAccessToken()) return;

    try {
      const res = await authFetch(`${BASEURL}/api/cart/`);
      if (!res.ok) throw new Error("Failed to fetch cart");

      const data = await res.json();
      setCartItems(data.items || []);
      setTotal(data.total || 0);
      setCartCount(data.items?.length || 0);
    } catch (err) {
      console.log("Error fetching cart", err);
    }
  }, [BASEURL]);

  /* ---------------- FETCH CART COUNT ---------------- */
  const fetchCartCount = useCallback(async () => {
    if (!getAccessToken()) return;

    try {
      const res = await authFetch(`${BASEURL}/api/cart/count/`);
      if (!res.ok) return;

      const data = await res.json();
      setCartCount(data.count || 0);
    } catch (err) {
      console.log("Error fetching cart count", err);
    }
  }, [BASEURL]);

  /* ---------------- ADD TO CART ---------------- */
  const addToCart = async (productId) => {
    try {
      await authFetch(`${BASEURL}/api/cart/add/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });

      await fetchCart();        // ✅ ALWAYS sync
    } catch (err) {
      console.log("Failed to add product", err);
    }
  };

  /* ---------------- REMOVE FROM CART ---------------- */
  const removeFromCart = async (itemId) => {
    try {
      await authFetch(`${BASEURL}/api/cart/remove/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: itemId }),
      });

      await fetchCart();        // ✅ ALWAYS sync
    } catch (err) {
      console.log("Failed to remove item", err);
    }
  };

  /* ---------------- UPDATE QUANTITY ---------------- */
  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) {
      await removeFromCart(itemId);
      return;
    }

    try {
      await authFetch(`${BASEURL}/api/cart/update/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: itemId, quantity }),
      });

      await fetchCart();        // ✅ ALWAYS sync
    } catch (err) {
      console.log("Failed to update quantity", err);
    }
  };

  /* ---------------- CLEAR CART ---------------- */
  const clearCart = () => {
    setCartItems([]);
    setTotal(0);
    setCartCount(0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        total,
        cartCount,
        fetchCart,        // call on cart page
        fetchCartCount,   // call on home/navbar
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);