import axios from "axios";
import { API_BASE } from "@/config/api";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // 60 seconds (handy for long AI screenings)
  headers: {
    "Content-Type": "application/json",
  },
});

// Outbound request interceptor
api.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (e) {
        console.error("Error parsing user token for api request:", e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Inbound response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized API request detected. Clearing invalid session...");
      localStorage.removeItem("user");
      // Optionally trigger reload or redirect
      if (window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
        window.location.href = "/login?expired=true";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
