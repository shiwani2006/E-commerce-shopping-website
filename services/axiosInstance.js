import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("shopsphereToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Agar token expire ho jaaye (401), yahan se handle kar sakte hain
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Auth failed:", error.response.data?.message);
      // Chahe to yahan auto-redirect kar sakti ho:
      // localStorage.removeItem("shopsphereToken");
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;