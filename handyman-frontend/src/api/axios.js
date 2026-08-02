// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://handyman-back-p7yf.onrender.com", // 🔥 Render-ის URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
