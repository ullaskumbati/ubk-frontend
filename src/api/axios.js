import axios from "axios";

export const api = axios.create({
  baseURL: "https://ubk-backend.onrender.com/api/v1", // Adjust if your backend port differs
  withCredentials: true, // Crucial for cookies / JWT tokens
});