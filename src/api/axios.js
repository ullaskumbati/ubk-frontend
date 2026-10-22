import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000/api/v1", // Adjust if your backend port differs
  withCredentials: true, // Crucial for cookies / JWT tokens
});