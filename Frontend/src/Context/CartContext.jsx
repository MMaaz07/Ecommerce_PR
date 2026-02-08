import { createContext, useContext, useState, useCallback } from "react";
import { authFetch, getAccessToken } from "../utils/auth";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL;

  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [cartLoaded, setCartLoaded] = useState(false);

  /* ---------------- FETCH FULL CART (ONLY WHEN NEEDED) ---------------- */
  const fetchCart = useCallback(async () => {
    if (!getAccessToken()) return;

    try {
      const res = await authFetch(`${BASEURL}/api/cart/`);
      if (!res.ok) throw new Error("Failed to fetch cart");

      const data = await res.json();
      setCartItems(data.items || []);
      setTotal(data.total || 0);
      setCartCount(data.items?.length || 0);
      setCartLoaded(true);
    } catch (err) {
      console.log("Error fetching cart", err);
    }
  }, [BASEURL]);

  /* ---------------- FETCH CART COUNT (FOR HOME / NAVBAR) ---------------- */
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

  /* ---------------- ADD TO CART (OPTIMISTIC) ---------------- */
  const addToCart = async (productId) => {
    try {
      await authFetch(`${BASEURL}/api/cart/add/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });

      // instant UI update
      setCartCount((prev) => prev + 1);

      // sync later only if cart page is open
      if (cartLoaded) fetchCart();
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

      setCartItems((prev) => prev.filter((i) => i.id !== itemId));
      setCartCount((prev) => Math.max(prev - 1, 0));

      if (cartLoaded) fetchCart();
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

      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );

      if (cartLoaded) fetchCart();
    } catch (err) {
      console.log("Failed to update quantity", err);
    }
  };

  /* ---------------- CLEAR CART (LOGOUT) ---------------- */
  const clearCart = () => {
    setCartItems([]);
    setTotal(0);
    setCartCount(0);
    setCartLoaded(false);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        total,
        cartCount,
        fetchCart,       // call ONLY on cart page
        fetchCartCount,  // call on home/navbar
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