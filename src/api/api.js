import axios from "axios";

const api = axios.create({
  baseURL: "https://waydown-backend-0w9y.onrender.com", // Adjust if your backend runs on a different port
  timeout: 10000,
});

// Request interceptor to add token
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;