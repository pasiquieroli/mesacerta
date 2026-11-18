import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import api from "../api";
import FichaCampos from "../components/FichaCampos";
import { modeloPara, normalizarFicha } from "../fichas/modelos";

export default function PersonagemFicha() {
  const { id, pid } = useParams();
  const { usuario } = useOutletContext();
  const navigate = useNavigate();
  const [mesa, setMesa] = useState(null);
  const [personagem, setPersonagem] = useState(null);
  const [dados, setDados] = useState(null);
  const [ficha, setFicha] = useState(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    Promise.all([api.get(`/mesas/${id}`), api.get(`/mesas/${id}/personagens`)])
      .then(([m, p]) => {
        const achado = p.data.find((x) => String(x.id) === pid);
        if (!achado) {
          setErro("Personagem não encontrado");
          return;
        }
        setMesa(m.data);
        setPersonagem(achado);
        setDados({
          nome: achado.nome,
          classe: achado.classe,
          nivel: achado.nivel,
          notas: achado.notas,
        });
        setFicha(normalizarFicha(modeloPara(m.data.sistema), achado.ficha));
      })
      .catch((err) =>
        setErro(err.response?.data?.erro || "Não foi possível carregar o personagem")
      );
  }, [id, pid]);

  function mudar(campo) {
    return (e) => {
      setMensagem("");
      setDados({ ...dados, [campo]: e.target.value });
    };
  }

  function mudarFicha(nova) {
    setMensagem("");
    setFicha(nova);
  }

  async function salvar() {
    setErro("");
    setMensagem("");
    setOcupado(true);
    try {
      await api.put(`/personagens/${pid}`, {
        ...dados,
        nivel: Number(dados.nivel),
        ficha,
      });
      setMensagem("Ficha salva!");
    } catch (err) {
      setErro(err.response?.data?.erro || "Erro ao salvar a ficha");
    }
    setOcupado(false);
  }

  async function excluir() {
    if (!window.confirm("Excluir este personagem?")) return;
    setErro("");
    setOcupado(true);
    try {
      await api.delete(`/personagens/${pid}`);
      navigate(`/mesas/${id}/personagens`);
    } catch (err) {
      setErro(err.response?.data?.erro || "Erro ao excluir");
      setOcupado(false);
    }
  }

  if (!personagem) {
    return (
      <div>
        <Link to={`/mesas/${id}/personagens`}>&larr; Voltar</Link>
        {erro ? <p className="erro">{erro}</p> : <p>Carregando...</p>}
      </div>
    );
  }

  const ehDono = personagem.usuario.id === usuario.id;
  const modelo = modeloPara(mesa.sistema);

  return (
    <div>
      <p>
        <Link to={`/mesas/${id}/personagens`}>&larr; Voltar para os personagens</Link>
      </p>
      <h1>{personagem.nome}</h1>
      <p className="info">
        Jogador: {personagem.usuario.nome} | Mesa: {mesa.titulo} | Ficha de {modelo.nome}
      </p>
      {!ehDono && <p className="info">Você só pode ver esta ficha. Apenas o dono edita.</p>}

      <div className="formulario">
        <label>
          Nome
          <input value={dados.nome} disabled={!ehDono} onChange={mudar("nome")} />
        </label>
        <label>
          Classe
          <input value={dados.classe} disabled={!ehDono} onChange={mudar("classe")} />
        </label>
        <label>
          Nível (1 a 20)
          <input
            type="number"
            min="1"
            max="20"
            value={dados.nivel}
            disabled={!ehDono}
            onChange={mudar("nivel")}
          />
        </label>
        <label>
          Anotações
          <textarea rows={3} value={dados.notas} disabled={!ehDono} onChange={mudar("notas")} />
        </label>
      </div>

      <FichaCampos
        modelo={modelo}
        ficha={ficha}
        aoMudar={mudarFicha}
        somenteLeitura={!ehDono}
      />

      {ehDono && (
        <div className="linha">
          <button onClick={salvar} disabled={ocupado}>
            Salvar ficha
          </button>
          <button className="perigo" onClick={excluir} disabled={ocupado}>
            Excluir personagem
          </button>
        </div>
      )}

      {mensagem && <p className="ok">{mensagem}</p>}
      {erro && <p className="erro">{erro}</p>}
    </div>
  );
}