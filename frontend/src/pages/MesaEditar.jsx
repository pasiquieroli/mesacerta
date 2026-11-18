import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api";
import FormularioMesa from "../components/FormularioMesa";

// Converte a data ISO para o formato do campo datetime-local (hora local)
function paraCampoLocal(iso) {
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(
    d.getHours()
  )}:${p(d.getMinutes())}`;
}

export default function MesaEditar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mesa, setMesa] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    api
      .get(`/mesas/${id}`)
      .then((res) => {
        if (!res.data.souMestre) {
          setErro("Só o mestre pode editar esta mesa");
          return;
        }
        setMesa(res.data);
      })
      .catch((err) =>
        setErro(err.response?.data?.erro || "Não foi possível carregar a mesa")
      );
  }, [id]);

  async function salvar(dados) {
    await api.put(`/mesas/${id}`, dados);
    navigate(`/mesas/${id}`);
  }

  if (erro) {
    return (
      <div>
        <Link to="/">&larr; Voltar</Link>
        <p className="erro">{erro}</p>
      </div>
    );
  }

  if (!mesa) return <p>Carregando...</p>;

  return (
    <div>
      <p>
        <Link to={`/mesas/${id}`}>&larr; Cancelar</Link>
      </p>
      <h1>Editar mesa</h1>
      <FormularioMesa
        inicial={{
          titulo: mesa.titulo,
          sistema: mesa.sistema,
          descricao: mesa.descricao,
          dataHora: paraCampoLocal(mesa.dataHora),
          vagas: mesa.vagas,
        }}
        textoBotao="Salvar alterações"
        aoEnviar={salvar}
      />
    </div>
  );
}