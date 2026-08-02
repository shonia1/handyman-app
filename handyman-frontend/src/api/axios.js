// src/api/axios.js
import axios from "axios";

const api = axios.create({
  // import.meta.env-ით ვიღებთ მონაცემებს .env-დან
  baseURL: import.meta.env.VITE_API_BASE_URL, 
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;