import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  addToWishlistApi,
  getWishlistApi,
  removeFromWishlistApi,
} from "../api/wishlistApi";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("shopsphereToken");

      if (!token) {
        setWishlistItems([]);
        return;
      }

      const data = await getWishlistApi();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch wishlist");
      }

      const items = (data.wishlist || [])
        .filter((entry) => entry.product) // product deleted hone pe skip
        .map((entry) => ({
          wishlistId: entry._id,
          id: entry.product._id,
          name: entry.product.name,
          brand: entry.product.brand,
          category: entry.product.category,
          price: entry.product.sellingPrice,
          old: entry.product.mrp,
          rating: entry.product.rating || 0,
          img: entry.product.images?.[0]
            ? `http://localhost:5000${entry.product.images[0]}`
            : "https://via.placeholder.com/300",
        }));

      setWishlistItems(items);
    } catch (error) {
      console.error("Fetch wishlist error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // productId add karo, wishlist refresh karo
  const addToWishlist = async (productId) => {
    const data = await addToWishlistApi(productId);
    if (data.success) {
      await fetchWishlist();
    }
    return data;
  };

  // productId remove karo, local state se turant hata do (fast UI)
  const removeFromWishlist = async (productId) => {
    const data = await removeFromWishlistApi(productId);
    if (data.success) {
      setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
    }
    return data;
  };

  const isInWishlist = (productId) =>
    wishlistItems.some((item) => item.id === productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        loading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }

  return context;
}