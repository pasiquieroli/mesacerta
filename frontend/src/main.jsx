import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { aplicarTema, temaInicial } from "./tema.js";

// Aplica o tema antes de desenhar a página (vale também para a tela de login)
aplicarTema(temaInicial());

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);