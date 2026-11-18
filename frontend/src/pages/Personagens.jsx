import { useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import api from "../api";

export default function Personagens() {
  const { id } = useParams();
  const { usuario } = useOutletContext();
  const [mesa, setMesa] = useState(null);
  const [lista, setLista] = useState([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([api.get(`/mesas/${id}`), api.get(`/mesas/${id}/personagens`)])
      .then(([m, p]) => {
        setMesa(m.data);
        setLista(p.data);
      })
      .catch((err) =>
        setErro(err.response?.data?.erro || "Não foi possível carregar os personagens")
      )
      .finally(() => setCarregando(false));
  }, [id]);

  if (carregando) return <p>Carregando...</p>;

  if (erro) {
    return (
      <div>
        <Link to={`/mesas/${id}`}>&larr; Voltar para a mesa</Link>
        <p className="erro">{erro}</p>
      </div>
    );
  }

  const meu = lista.find((p) => p.usuario.id === usuario.id);

  return (
    <div>
      <p>
        <Link to={`/mesas/${id}`}>&larr; Voltar para {mesa.titulo}</Link>
      </p>
      <h1>Personagens</h1>

      {mesa.inscrito && !meu && (
        <p>
          <Link to={`/mesas/${id}/personagens/novo`}>
            <button>Criar meu personagem</button>
          </Link>
        </p>
      )}

      {lista.length === 0 && <p>Nenhum personagem criado ainda.</p>}

      {lista.map((p) => (
        <div className="cartao" key={p.id}>
          <h3>
            <Link to={`/mesas/${id}/personagens/${p.id}`}>{p.nome}</Link>
          </h3>
          <p className="info">
            <span className="etiqueta">{p.classe}</span>
            <span className="etiqueta">Nível {p.nivel}</span>
            {p.usuario.id === usuario.id && <span className="etiqueta">Seu personagem</span>}
          </p>
          <p className="info">Jogador: {p.usuario.nome}</p>
        </div>
      ))}
    </div>
  );
}