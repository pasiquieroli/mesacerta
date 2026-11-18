import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

function formatarData(iso) {
  return new Date(iso).toLocaleString("pt-BR", {
    dateStyle: "full",
    timeStyle: "short",
  });
}

function CartaoAgenda({ mesa }) {
  return (
    <div className="cartao">
      <h3>
        <Link to={`/mesas/${mesa.id}`}>{mesa.titulo}</Link>
      </h3>
      <p className="info">
        <span className="etiqueta">{mesa.sistema}</span>
        <span className="etiqueta">
          {mesa.papel === "mestre" ? "Você é o mestre" : "Você é jogador"}
        </span>
      </p>
      <p className="info">Mestre: {mesa.mestre.nome}</p>
      <p className="info">Quando: {formatarData(mesa.dataHora)}</p>
    </div>
  );
}

export default function Agenda() {
  const [mesas, setMesas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    api
      .get("/me/agenda")
      .then((res) => setMesas(res.data))
      .catch((err) =>
        setErro(err.response?.data?.erro || "Não foi possível carregar a agenda")
      )
      .finally(() => setCarregando(false));
  }, []);

  const agora = new Date();
  const proximas = mesas.filter((m) => new Date(m.dataHora) >= agora);
  const passadas = mesas.filter((m) => new Date(m.dataHora) < agora);

  return (
    <div>
      <h1>Minha agenda</h1>

      {carregando && <p>Carregando...</p>}
      {erro && <p className="erro">{erro}</p>}

      {!carregando && !erro && mesas.length === 0 && (
        <p>
          Você ainda não está em nenhuma mesa. <Link to="/">Veja as mesas disponíveis</Link>.
        </p>
      )}

      {proximas.length > 0 && (
        <section>
          <h2>Próximas sessões</h2>
          {proximas.map((m) => (
            <CartaoAgenda key={m.id} mesa={m} />
          ))}
        </section>
      )}

      {passadas.length > 0 && (
        <section>
          <h2>Mesas passadas</h2>
          {passadas.map((m) => (
            <CartaoAgenda key={m.id} mesa={m} />
          ))}
        </section>
      )}
    </div>
  );
}