const BASE_URL = "http://localhost:5000/api/vendor/rewards";

const getToken = () => localStorage.getItem("shopsphereToken");

export const getVendorRewards = async () => {
  const res = await fetch(BASE_URL, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch rewards");
  return data;
};

export const createVendorReward = async (reward) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(reward),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create reward");
  return data;
};

export const updateVendorReward = async (id, updates) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update reward");
  return data;
};

export const deleteVendorReward = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete reward");
  return data;
};