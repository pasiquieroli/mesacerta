import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Login() {
  const [modoCadastro, setModoCadastro] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  async function enviar(e) {
    e.preventDefault();
    setErro("");
    try {
      const rota = modoCadastro ? "/auth/register" : "/auth/login";
      const corpo = modoCadastro ? { nome, email, senha } : { email, senha };
      const { data } = await api.post(rota, corpo);
      localStorage.setItem("token", data.token);
      navigate("/");
    } catch (err) {
      setErro(err.response?.data?.erro || "Erro ao conectar com o servidor");
    }
  }

  return (
    <div style={{ maxWidth: 320, margin: "60px auto" }}>
      <h1>MesaCerta</h1>
      <h2>{modoCadastro ? "Criar conta" : "Entrar"}</h2>
      <form onSubmit={enviar} style={{ display: "grid", gap: 8 }}>
        {modoCadastro && (
          <input
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        )}
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <button type="submit">{modoCadastro ? "Cadastrar" : "Entrar"}</button>
      </form>
      {erro && <p className="erro">{erro}</p>}
      <p>
        <button type="button" onClick={() => setModoCadastro(!modoCadastro)}>
          {modoCadastro ? "Já tenho conta" : "Quero me cadastrar"}
        </button>
      </p>
    </div>
  );
}