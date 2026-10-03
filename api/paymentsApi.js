const BASE_URL = "http://localhost:5000/api/payments";

const getToken = () => localStorage.getItem("shopsphereToken");

export const getPaymentOverview = async () => {
  const res = await fetch(`${BASE_URL}/overview`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch payment overview");
  return res.json();
};

export const getCards = async () => {
  const res = await fetch(`${BASE_URL}/cards`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch cards");
  return res.json();
};

export const addCardApi = async (cardData) => {
  const res = await fetch(`${BASE_URL}/cards`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(cardData),
  });
  if (!res.ok) throw new Error("Failed to add card");
  return res.json();
};

export const deleteCardApi = async (id) => {
  const res = await fetch(`${BASE_URL}/cards/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to delete card");
  return res.json();
};

export const getTransactions = async () => {
  const res = await fetch(`${BASE_URL}/transactions`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
};

export const addMoneyApi = async (amount) => {
  const res = await fetch(`${BASE_URL}/wallet/add-money`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ amount }),
  });
  if (!res.ok) throw new Error("Failed to add money");
  return res.json(); // expected: { walletBalance }
};

export const updateUpiApi = async (upiId) => {
  const res = await fetch(`${BASE_URL}/upi`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ upiId }),
  });
  if (!res.ok) throw new Error("Failed to link UPI");
  return res.json(); // expected: { upiId }
};