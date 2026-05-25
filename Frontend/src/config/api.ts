import axios from "axios";

// 1. Globally configure Axios defaults for ngrok compatibility
axios.defaults.headers.common["ngrok-skip-browser-warning"] = "true";

// 2. Globally override native Fetch to automatically inject the ngrok bypass header (only for local backend or ngrok tunnels)
if (typeof window !== "undefined") {
  const originalFetch = window.fetch;
  window.fetch = function (input, init) {
    const url = typeof input === "string" ? input : (input && (input as any).url) || "";
    const isTarget = typeof url === "string" && (
      url.startsWith("/") ||
      url.includes("ngrok") ||
      url.includes("localhost") ||
      url.includes("127.0.0.1")
    ) && !url.includes("googleapis.com") && !url.includes("firebase");

    if (isTarget) {
      init = init || {};
      init.headers = init.headers || {};
      if (init.headers instanceof Headers) {
        init.headers.set("ngrok-skip-browser-warning", "true");
      } else if (Array.isArray(init.headers)) {
        init.headers.push(["ngrok-skip-browser-warning", "true"]);
      } else {
        (init.headers as any)["ngrok-skip-browser-warning"] = "true";
      }
    }
    return originalFetch(input, init);
  };
}

const rawUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
export const API_BASE = rawUrl.endsWith("/api") || rawUrl.endsWith("/api/")
  ? rawUrl
  : `${rawUrl.replace(/\/$/, "")}/api`;

