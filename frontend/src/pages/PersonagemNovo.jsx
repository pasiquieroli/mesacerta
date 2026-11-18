import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api";
import FichaCampos from "../components/FichaCampos";
import { fichaVazia, modeloPara } from "../fichas/modelos";

export default function PersonagemNovo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mesa, setMesa] = useState(null);
  const [dados, setDados] = useState({ nome: "", classe: "", nivel: 1, notas: "" });
  const [ficha, setFicha] = useState(null);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    api
      .get(`/mesas/${id}`)
      .then((res) => {
        setMesa(res.data);
        setFicha(fichaVazia(modeloPara(res.data.sistema)));
      })
      .catch((err) =>
        setErro(err.response?.data?.erro || "Não foi possível carregar a mesa")
      );
  }, [id]);

  function mudar(campo) {
    return (e) => setDados({ ...dados, [campo]: e.target.value });
  }

  async function enviar(e) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await api.post(`/mesas/${id}/personagens`, {
        ...dados,
        nivel: Number(dados.nivel),
        ficha,
      });
      navigate(`/mesas/${id}/personagens`);
    } catch (err) {
      setErro(err.response?.data?.erro || "Erro ao criar o personagem");
      setEnviando(false);
    }
  }

  if (!mesa || !ficha) {
    return (
      <div>
        <Link to={`/mesas/${id}`}>&larr; Voltar</Link>
        {erro ? <p className="erro">{erro}</p> : <p>Carregando...</p>}
      </div>
    );
  }

  const modelo = modeloPara(mesa.sistema);

  return (
    <div>
      <p>
        <Link to={`/mesas/${id}/personagens`}>&larr; Cancelar</Link>
      </p>
      <h1>Novo personagem</h1>
      <p className="info">
        Mesa: {mesa.titulo} (ficha de {modelo.nome})
      </p>

      <form onSubmit={enviar}>
        <div className="formulario">
          <label>
            Nome
            <input value={dados.nome} onChange={mudar("nome")} />
          </label>
          <label>
            Classe
            <input value={dados.classe} onChange={mudar("classe")} placeholder="Ex.: Guerreiro" />
          </label>
          <label>
            Nível (1 a 20)
            <input type="number" min="1" max="20" value={dados.nivel} onChange={mudar("nivel")} />
          </label>
          <label>
            Anotações
            <textarea rows={3} value={dados.notas} onChange={mudar("notas")} />
          </label>
        </div>

        <FichaCampos modelo={modelo} ficha={ficha} aoMudar={setFicha} />

        {erro && <p className="erro">{erro}</p>}
        <p>
          <button type="submit" disabled={enviando}>
            {enviando ? "Salvando..." : "Criar personagem"}
          </button>
        </p>
      </form>
    </div>
  );
}