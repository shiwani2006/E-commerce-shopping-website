const API_BASE_URL = "http://localhost:5000/api";

export const getProfileApi = async () => {
  const token = localStorage.getItem("shopsphereToken");

  const res = await fetch(`${API_BASE_URL}/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};

export const updateProfileApi = async (profile) => {
  const token = localStorage.getItem("shopsphereToken");

  const res = await fetch(`${API_BASE_URL}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profile),
  });

  return res.json();
};

export const updateAddressApi = async (address) => {
  const token = localStorage.getItem("shopsphereToken");

  const res = await fetch(`${API_BASE_URL}/profile/address`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ address }),
  });

  return res.json();
};