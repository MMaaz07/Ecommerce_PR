import { createContext, useContext, useState, useEffect } from "react";
import { authFetch, getAccessToken } from "../utils/auth";

const CartContext = createContext();

export const CartProvider = ({ children }) => {

  const BASEURL=import.meta.env.VITE_DJANGO_BASE_URL;
  const [total, setTotal]=useState(0);
  const [cartItems, setCartItems] = useState([]);

  const fetchCart=async()=>{
    try{
      const res=await authFetch(`${BASEURL}/api/cart/`)
      if(!res.ok){
        throw new Error("Failed to fetch cart")
      }
      const data=await res.json();
      setCartItems(data.items || []);
      setTotal(data.total || 0);
    }
    catch(error){
      console.log("Error Fetching Cart", error);
    }
  }

  useEffect(() => {
  if (!getAccessToken()) return;
  fetchCart();
}, []);



  const addToCart= async (productId) =>{
    try{
      await authFetch(`${BASEURL}/api/cart/add/`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
        },
        body: JSON.stringify({product_id: productId}),
      })
      fetchCart();
    }
    catch(error){
      console.log("Failed to add Product", error);
    }
  }

  const removeFromCart = async(itemId)=>{
    try{
      await authFetch(`${BASEURL}/api/cart/remove/`,{
        method:'POST',
        headers:{
          'Content-Type':'application/json'
        },
        body: JSON.stringify({item_id:itemId})
      })
      fetchCart();
    }
    catch(error){
      console.log("Failed to remove item", error);
    }
  }


  const updateQuantity=async(itemId, quantity)=>{
    if(quantity<1){
      await removeFromCart(itemId);
      return;
    }
    try{
      await authFetch(`${BASEURL}/api/cart/update/`,{
        method:'POST',
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({item_id : itemId, quantity})
      })
      fetchCart();
    }
    catch(error){
      console.log("Failed to update product details", error);
    }
  }


  const clearCart=()=>{
    setCartItems([]);
    setTotal(0);
  }


  return (
    <CartContext.Provider
      value={{ cartItems, total , addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
