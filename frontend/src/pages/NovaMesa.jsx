import { useNavigate } from "react-router-dom";
import api from "../api";
import FormularioMesa from "../components/FormularioMesa";

export default function NovaMesa() {
  const navigate = useNavigate();

  async function criar(dados) {
    await api.post("/mesas", dados);
    navigate("/");
  }

  return (
    <div>
      <h1>Criar mesa</h1>
      <FormularioMesa
        inicial={{ titulo: "", sistema: "", descricao: "", dataHora: "", vagas: 4 }}
        textoBotao="Criar mesa"
        aoEnviar={criar}
      />
    </div>
  );
}