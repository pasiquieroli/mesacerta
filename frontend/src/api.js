import axios from "axios";

// Mude para false quando o backend de mesas do Nicolas estiver pronto
const USAR_MOCK = true;

const api = axios.create({ baseURL: "http://localhost:3000" });

// ---------- Mock em memória (só para testar as telas) ----------
let proximoId = 3;
let mesasMock = [
  {
    id: 1,
    titulo: "A Maldição de Strahd",
    sistema: "D&D 5e",
    descricao: "Horror gótico em Barovia.",
    dataHora: "2026-12-05T19:00:00",
    vagas: 4,
    mestreId: 2,
    mestre: { id: 2, nome: "Nicolas" },
    vagasOcupadas: 2,
    vagasRestantes: 2,
    inscrito: false,
    souMestre: false,
  },
  {
    id: 2,
    titulo: "Ordem Paranormal: Calamidade",
    sistema: "Ordem Paranormal",
    descricao: "Investigação sobrenatural para iniciantes.",
    dataHora: "2026-12-06T15:00:00",
    vagas: 5,
    mestreId: 3,
    mestre: { id: 3, nome: "Maria" },
    vagasOcupadas: 5,
    vagasRestantes: 0,
    inscrito: false,
    souMestre: false,
  },
];

function responder(config, status, data) {
  const resposta = { data, status, statusText: "", headers: {}, config };
  if (status >= 400) {
    const erro = new Error("Erro simulado");
    erro.response = resposta;
    return Promise.reject(erro);
  }
  return Promise.resolve(resposta);
}

function atualizarMesa(id, mudancas) {
  mesasMock = mesasMock.map((m) => (m.id === id ? { ...m, ...mudancas } : m));
}

function adaptadorMock(config) {
  const metodo = config.method.toLowerCase();
  const url = config.url;

    // /me/agenda
  if (url === "/me/agenda" && metodo === "get") {
    const minhas = mesasMock
      .filter((m) => m.inscrito || m.souMestre)
      .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora))
      .map((m) => ({ ...m, papel: m.souMestre ? "mestre" : "jogador" }));
    return responder(config, 200, minhas);
  }
  // /mesas/:id/inscricao
  const insc = url.match(/^\/mesas\/(\d+)\/inscricao$/);
  if (insc) {
    const id = Number(insc[1]);
    const mesa = mesasMock.find((m) => m.id === id);
    if (!mesa) return responder(config, 404, { erro: "Mesa não encontrada" });

    if (metodo === "post") {
      if (mesa.souMestre) {
        return responder(config, 400, {
          erro: "O mestre não pode se inscrever na própria mesa",
        });
      }
      if (mesa.inscrito) {
        return responder(config, 409, { erro: "Você já está inscrito nesta mesa" });
      }
      if (mesa.vagasRestantes <= 0) {
        return responder(config, 409, { erro: "Mesa lotada" });
      }
      atualizarMesa(id, {
        inscrito: true,
        vagasOcupadas: mesa.vagasOcupadas + 1,
        vagasRestantes: mesa.vagasRestantes - 1,
      });
      return responder(config, 201, { mesaId: id, status: "confirmada" });
    }

    if (metodo === "delete") {
      if (!mesa.inscrito) {
        return responder(config, 404, { erro: "Você não está inscrito nesta mesa" });
      }
      atualizarMesa(id, {
        inscrito: false,
        vagasOcupadas: mesa.vagasOcupadas - 1,
        vagasRestantes: mesa.vagasRestantes + 1,
      });
      return responder(config, 204, null);
    }
  }

  // /mesas/:id
  const uma = url.match(/^\/mesas\/(\d+)$/);
  if (uma && metodo === "get") {
    const mesa = mesasMock.find((m) => m.id === Number(uma[1]));
    if (!mesa) return responder(config, 404, { erro: "Mesa não encontrada" });
    return responder(config, 200, mesa);
  }

  // /mesas
  if (url === "/mesas" && metodo === "get") {
    const { sistema, data } = config.params || {};
    let lista = mesasMock;
    if (sistema) {
      lista = lista.filter((m) =>
        m.sistema.toLowerCase().includes(sistema.toLowerCase())
      );
    }
    if (data) {
      lista = lista.filter(
        (m) => new Date(m.dataHora).toLocaleDateString("sv-SE") === data
      );
    }
    return responder(config, 200, lista);
  }

  if (url === "/mesas" && metodo === "post") {
    const corpo = JSON.parse(config.data);
    if (!corpo.titulo || !corpo.sistema || !corpo.descricao || !corpo.dataHora) {
      return responder(config, 400, {
        erro: "Preencha título, sistema, descrição e data/hora",
      });
    }
    const vagas = Number(corpo.vagas);
    if (!Number.isInteger(vagas) || vagas < 1) {
      return responder(config, 400, {
        erro: "Vagas deve ser um número inteiro maior que 0",
      });
    }
    const nova = {
      id: proximoId++,
      ...corpo,
      vagas,
      mestreId: 1,
      mestre: { id: 1, nome: "Você" },
      vagasOcupadas: 0,
      vagasRestantes: vagas,
      inscrito: false,
      souMestre: true,
    };
    mesasMock = [...mesasMock, nova];
    return responder(config, 201, nova);
  }

  return responder(config, 404, { erro: "Rota não simulada" });
}
// ----------------------------------------------------------------

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Só as rotas /mesas são simuladas; login e /auth/me usam o backend real
    if (
    USAR_MOCK &&
    (config.url.startsWith("/mesas") || config.url.startsWith("/me/agenda"))
  ) {
    config.adapter = adaptadorMock;
  }
  return config;
});

export default api;