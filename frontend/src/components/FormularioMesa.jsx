import { useState } from "react";

const SISTEMAS = [
  "D&D 5e",
  "Tormenta20",
  "Ordem Paranormal",
  "Call of Cthulhu",
  "Pathfinder",
];

export default function FormularioMesa({ inicial, textoBotao, aoEnviar }) {
  const [form, setForm] = useState(inicial);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  function mudar(campo) {
    return (e) => setForm({ ...form, [campo]: e.target.value });
  }

  async function enviar(e) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await aoEnviar({
        ...form,
        // Envia em formato universal (ISO) para não depender do fuso do servidor
        dataHora: form.dataHora ? new Date(form.dataHora).toISOString() : "",
      });
    } catch (err) {
      setErro(err.response?.data?.erro || "Erro ao salvar a mesa");
      setEnviando(false);
    }
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      <label>
        Título
        <input value={form.titulo} onChange={mudar("titulo")} />
      </label>

      <label>
        Sistema
        <input
          list="lista-sistemas"
          value={form.sistema}
          onChange={mudar("sistema")}
          placeholder="Escolha ou digite"
        />
        <datalist id="lista-sistemas">
          {SISTEMAS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </label>

      <label>
        Descrição
        <textarea rows={4} value={form.descricao} onChange={mudar("descricao")} />
      </label>

      <label>
        Data e hora
        <input
          type="datetime-local"
          value={form.dataHora}
          onChange={mudar("dataHora")}
        />
      </label>

      <label>
        Número de vagas
        <input
          type="number"
          min="1"
          value={form.vagas}
          onChange={mudar("vagas")}
        />
      </label>

      {erro && <p className="erro">{erro}</p>}

      <button type="submit" disabled={enviando}>
        {enviando ? "Salvando..." : textoBotao}
      </button>
    </form>
  );
}