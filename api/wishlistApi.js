const API_BASE_URL = "http://localhost:5000/api";

// Add product to wishlist
// Backend route: POST /api/wishlist (protected)
export const addToWishlistApi = async (productId) => {
  const token = localStorage.getItem("shopsphereToken");

  const res = await fetch(`${API_BASE_URL}/wishlist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId }),
  });

  return res.json();
};

// Get logged-in user's wishlist
// Backend route: GET /api/wishlist (protected)
export const getWishlistApi = async () => {
  const token = localStorage.getItem("shopsphereToken");

  const res = await fetch(`${API_BASE_URL}/wishlist`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};

// Remove product from wishlist
// Backend route: DELETE /api/wishlist/:productId (protected)
export const removeFromWishlistApi = async (productId) => {
  const token = localStorage.getItem("shopsphereToken");

  const res = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};