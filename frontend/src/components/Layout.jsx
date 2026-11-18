import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import api from "../api";
import { aplicarTema, salvarTema, temaInicial } from "../tema.js";

export default function Layout() {
  const [usuario, setUsuario] = useState(null);
  const [tema, setTema] = useState(temaInicial);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setUsuario(res.data))
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  function sair() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  function alternarTema() {
    const novo = tema === "escuro" ? "claro" : "escuro";
    setTema(novo);
    aplicarTema(novo);
    salvarTema(novo);
  }

  if (!usuario) return <p style={{ padding: 20 }}>Carregando...</p>;

  return (
    <div>
      <nav className="menu">
        <strong>MesaCerta</strong>
        <Link to="/">Mesas</Link>
        <Link to="/mesas/nova">Criar mesa</Link>
        <Link to="/agenda">Minha agenda</Link>
        <Link to="/personagens">Meus personagens</Link>
        <span className="espaco" />
        <span>Olá, {usuario.nome}</span>
        <button className="tema" onClick={alternarTema}>
          {tema === "escuro" ? "Tema claro" : "Tema escuro"}
        </button>
        <button onClick={sair}>Sair</button>
      </nav>
      <main className="conteudo">
        <Outlet context={{ usuario }} />
      </main>
    </div>
  );
}