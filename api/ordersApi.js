const API_BASE_URL = "http://localhost:5000/api";

export const getMyOrders = async () => {
  const token = localStorage.getItem("shopsphereToken");

  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};

export const getOrderById = async (orderId) => {
  const token = localStorage.getItem("shopsphereToken");

  const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};