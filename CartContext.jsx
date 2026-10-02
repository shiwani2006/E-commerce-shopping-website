import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";

const CartContext = createContext(null);

const API_BASE = "http://localhost:5000/api";

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("shopsphereToken");

      if (!token) {
        setCartItems([]);
        return;
      }

      const res = await fetch(`${API_BASE}/cart`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch cart");
      }

      const items = (data.cart?.items || []).map((item) => ({
        id: item.product._id,
        name: item.product.name,
        brand: item.product.brand,
        price: item.product.sellingPrice,
        old: item.product.mrp,
        size: item.product.sizes?.[0] || "Standard",
        color: item.product.colors?.[0] || "-",
        qty: item.quantity,
        img: item.product.images?.[0]
          ? `http://localhost:5000${item.product.images[0]}`
          : "https://via.placeholder.com/300",
      }));

      setCartItems(items);
    } catch (error) {
      console.error("Fetch cart error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.qty, 0),
    [cartItems]
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        cartCount,
        loading,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}