import { createContext, useContext, useState, useEffect } from "react";
import { authFetch, getAccessToken } from "../utils/auth";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL;
  const [total, setTotal] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initial cart fetch (only once)
  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${BASEURL}/api/cart/`);
      if (!res.ok) throw new Error("Failed to fetch cart");

      const data = await res.json();
      setCartItems(data.items || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.log("Error Fetching Cart", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!getAccessToken()) return;
    fetchCart();
  }, []);

  // ✅ Add To Cart (no refetch)
  const addToCart = async (productId) => {
    try {
      const res = await authFetch(`${BASEURL}/api/cart/add/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });

      if (!res.ok) throw new Error("Failed to add");

      const data = await res.json();

      // Backend returns full updated cart
      setCartItems(data.items);
      setTotal(data.total);
    } catch (error) {
      console.log("Failed to add Product", error);
    }
  };

  // ✅ Remove Item (no refetch)
  const removeFromCart = async (itemId) => {
    try {
      const res = await authFetch(`${BASEURL}/api/cart/remove/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: itemId }),
      });

      if (!res.ok) throw new Error("Failed to remove");

      const data = await res.json();

      setCartItems(data.items);
      setTotal(data.total);
    } catch (error) {
      console.log("Failed to remove item", error);
    }
  };

  // ✅ Update Quantity (no refetch)
  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) {
      return removeFromCart(itemId);
    }

    try {
      const res = await authFetch(`${BASEURL}/api/cart/update/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: itemId, quantity }),
      });

      if (!res.ok) throw new Error("Failed to update");

      const data = await res.json();

      setCartItems(data.items);
      setTotal(data.total);
    } catch (error) {
      console.log("Failed to update product", error);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setTotal(0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        total,
        loading,
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