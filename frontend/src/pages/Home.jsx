import { useEffect, useState } from "react";
import api from "../api";

function formatarData(iso) {
  return new Date(iso).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function Home() {
  const [mesas, setMesas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // O que o usuário está digitando
  const [sistema, setSistema] = useState("");
  const [data, setData] = useState("");
  // O que foi aplicado de fato na busca
  const [filtros, setFiltros] = useState({ sistema: "", data: "" });

  useEffect(() => {
    setCarregando(true);
    setErro("");
    api
      .get("/mesas", { params: filtros })
      .then((res) => setMesas(res.data))
      .catch((err) =>
        setErro(err.response?.data?.erro || "Não foi possível carregar as mesas")
      )
      .finally(() => setCarregando(false));
  }, [filtros]);

  function filtrar(e) {
    e.preventDefault();
    setFiltros({ sistema, data });
  }

  function limpar() {
    setSistema("");
    setData("");
    setFiltros({ sistema: "", data: "" });
  }

  return (
    <div>
      <h1>Mesas</h1>

      <form className="filtros" onSubmit={filtrar}>
        <input
          placeholder="Sistema (ex.: D&D)"
          value={sistema}
          onChange={(e) => setSistema(e.target.value)}
        />
        <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
        <button type="submit">Filtrar</button>
        <button type="button" className="secundario" onClick={limpar}>
          Limpar
        </button>
      </form>

      {carregando && <p>Carregando...</p>}
      {erro && <p className="erro">{erro}</p>}
      {!carregando && !erro && mesas.length === 0 && (
        <p>Nenhuma mesa encontrada.</p>
      )}

      {mesas.map((mesa) => (
        <div className="cartao" key={mesa.id}>
          <h3>{mesa.titulo}</h3>
          <p className="info">
            <span className="etiqueta">{mesa.sistema}</span>
            {mesa.vagasRestantes === 0 ? (
              <span className="etiqueta lotada">Lotada</span>
            ) : (
              <span className="etiqueta">
                {mesa.vagasRestantes} de {mesa.vagas} vagas
              </span>
            )}
            {mesa.souMestre && <span className="etiqueta">Sua mesa</span>}
          </p>
          <p className="info">Mestre: {mesa.mestre.nome}</p>
          <p className="info">Quando: {formatarData(mesa.dataHora)}</p>
          <p>{mesa.descricao}</p>
        </div>
      ))}
    </div>
  );
}