import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import api from "../api";

export default function Layout() {
  const [usuario, setUsuario] = useState(null);
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

  if (!usuario) return <p style={{ padding: 20 }}>Carregando...</p>;

  return (
    <div>
      <nav className="menu">
        <strong>MesaCerta</strong>
        <Link to="/">Mesas</Link>
        <Link to="/mesas/nova">Criar mesa</Link>
        <Link to="/agenda">Minha agenda</Link>
        <span className="espaco" />
        <span>Olá, {usuario.nome}</span>
        <button onClick={sair}>Sair</button>
      </nav>
      <main className="conteudo">
        <Outlet context={{ usuario }} />
      </main>
    </div>
  );
}