const rawUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
export const API_BASE = rawUrl.endsWith("/api") || rawUrl.endsWith("/api/")
  ? rawUrl
  : `${rawUrl.replace(/\/$/, "")}/api`;

