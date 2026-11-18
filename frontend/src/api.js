import axios from "axios";
import { adaptadorMock, rotaSimulada } from "./mock.js";

// Mude para false quando o backend do Nicolas estiver pronto
const USAR_MOCK = true;

const api = axios.create({ baseURL: "http://localhost:3000" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Login e /auth/me continuam usando o backend real
  if (USAR_MOCK && rotaSimulada(config.url)) {
    config.adapter = adaptadorMock;
  }
  return config;
});

export default api;