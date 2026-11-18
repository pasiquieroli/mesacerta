import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { modeloPara, normalizarFicha } from "../fichas/modelos";

export default function MeusPersonagens() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    api
      .get("/me/personagens")
      .then((res) => setLista(res.data))
      .catch((err) =>
        setErro(err.response?.data?.erro || "Não foi possível carregar os personagens")
      )
      .finally(() => setCarregando(false));
  }, []);

  // Agrupa por sistema de RPG
  const porSistema = {};
  lista.forEach((p) => {
    if (!porSistema[p.mesa.sistema]) porSistema[p.mesa.sistema] = [];
    porSistema[p.mesa.sistema].push(p);
  });

  return (
    <div>
      <h1>Meus personagens</h1>

      {carregando && <p>Carregando...</p>}
      {erro && <p className="erro">{erro}</p>}

      {!carregando && !erro && lista.length === 0 && (
        <p>
          Você ainda não tem personagens. Inscreva-se em uma mesa e crie sua ficha:{" "}
          <Link to="/">ver mesas</Link>.
        </p>
      )}

      {Object.entries(porSistema).map(([sistema, personagens]) => (
        <section key={sistema}>
          <h2>
            {sistema} ({personagens.length})
          </h2>
          {personagens.map((p) => {
            const modelo = modeloPara(p.mesa.sistema);
            const vida = normalizarFicha(modelo, p.ficha).recursos.pv;
            return (
              <div className="cartao" key={p.id}>
                <h3>
                  <Link to={`/mesas/${p.mesa.id}/personagens/${p.id}`}>{p.nome}</Link>
                </h3>
                <p className="info">
                  <span className="etiqueta">{p.classe}</span>
                  <span className="etiqueta">Nível {p.nivel}</span>
                  <span className="etiqueta">Ficha: {modelo.nome}</span>
                </p>
                <p className="info">
                  Mesa: <Link to={`/mesas/${p.mesa.id}`}>{p.mesa.titulo}</Link>
                </p>
                <p className="info">
                  PV: {vida.atual} / {vida.max}
                </p>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}