import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";

function formatarData(iso) {
  return new Date(iso).toLocaleString("pt-BR", {
    dateStyle: "full",
    timeStyle: "short",
  });
}

export default function MesaDetalhe() {
  const { id } = useParams();
  const [mesa, setMesa] = useState(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [ocupado, setOcupado] = useState(false);

  const carregar = useCallback(() => {
    return api
      .get(`/mesas/${id}`)
      .then((res) => setMesa(res.data))
      .catch((err) =>
        setErro(err.response?.data?.erro || "Não foi possível carregar a mesa")
      );
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function inscrever() {
    setErro("");
    setMensagem("");
    setOcupado(true);
    try {
      await api.post(`/mesas/${id}/inscricao`);
      setMensagem("Inscrição confirmada!");
    } catch (err) {
      setErro(err.response?.data?.erro || "Erro ao se inscrever");
    }
    await carregar();
    setOcupado(false);
  }

  async function cancelar() {
    setErro("");
    setMensagem("");
    setOcupado(true);
    try {
      await api.delete(`/mesas/${id}/inscricao`);
      setMensagem("Inscrição cancelada.");
    } catch (err) {
      setErro(err.response?.data?.erro || "Erro ao cancelar");
    }
    await carregar();
    setOcupado(false);
  }

  if (!mesa) {
    return (
      <div>
        <Link to="/">Voltar</Link>
        {erro ? <p className="erro">{erro}</p> : <p>Carregando...</p>}
      </div>
    );
  }

  return (
    <div>
      <p>
        <Link to="/">&larr; Voltar para as mesas</Link>
      </p>

      <div className="cartao">
        <h1>{mesa.titulo}</h1>
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
          {mesa.inscrito && <span className="etiqueta">Você está inscrito</span>}
        </p>
        <p className="info">Mestre: {mesa.mestre.nome}</p>
        <p className="info">Quando: {formatarData(mesa.dataHora)}</p>
        <p>{mesa.descricao}</p>

        {!mesa.souMestre &&
          (mesa.inscrito ? (
            <button className="perigo" onClick={cancelar} disabled={ocupado}>
              Cancelar inscrição
            </button>
          ) : (
            <button onClick={inscrever} disabled={ocupado}>
              Inscrever-se
            </button>
          ))}

        {mensagem && <p className="ok">{mensagem}</p>}
        {erro && <p className="erro">{erro}</p>}
      </div>
    </div>
  );
}