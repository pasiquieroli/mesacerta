import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Home() {
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

  if (!usuario) return <p>Carregando...</p>;

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h1>Olá, {usuario.nome}!</h1>
      <p>Aqui vão aparecer as mesas disponíveis.</p>
      <button onClick={sair}>Sair</button>
    </div>
  );
}