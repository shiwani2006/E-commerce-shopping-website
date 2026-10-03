const BASE_URL = "http://localhost:5000/api/security";

const getToken = () => localStorage.getItem("shopsphereToken");

export const getSecuritySettings = async () => {
  const res = await fetch(`${BASE_URL}/settings`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch security settings");
  return res.json();
};

export const changePasswordApi = async (currentPassword, newPassword) => {
  const res = await fetch(`${BASE_URL}/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to change password");
  return data;
};

export const toggle2FAApi = async () => {
  const res = await fetch(`${BASE_URL}/toggle-2fa`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to toggle 2FA");
  return res.json();
};