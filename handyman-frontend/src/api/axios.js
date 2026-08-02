// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://handyman-back-ulm6.onrender.com/api", // 🔥 Render-ის URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
