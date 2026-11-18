// Backend de mentira, só para testar as telas. Imita as rotas do guia do Nicolas.
// Os dados ficam na memória do navegador: o F5 reinicia tudo.

let proximoId = 4;
let mesas = [
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
  {
    id: 3,
    titulo: "Tormenta20: Ameaça de Arton",
    sistema: "Tormenta20",
    descricao: "Mesa de exemplo que é sua, para testar editar e excluir.",
    dataHora: "2026-12-12T20:00:00",
    vagas: 4,
    mestreId: 1,
    mestre: { id: 1, nome: "Você" },
    vagasOcupadas: 0,
    vagasRestantes: 4,
    inscrito: false,
    souMestre: true,
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

function atualizar(id, mudancas) {
  mesas = mesas.map((m) => (m.id === id ? { ...m, ...mudancas } : m));
}

// Quais rotas o mock responde (as outras vão para o backend real)
export function rotaSimulada(url) {
  return url.startsWith("/mesas") || url.startsWith("/me/agenda");
}

export function adaptadorMock(config) {
  const metodo = config.method.toLowerCase();
  const url = config.url;
  const corpo = config.data ? JSON.parse(config.data) : {};

  // GET /me/agenda
  if (url === "/me/agenda" && metodo === "get") {
    const minhas = mesas
      .filter((m) => m.inscrito || m.souMestre)
      .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora))
      .map((m) => ({ ...m, papel: m.souMestre ? "mestre" : "jogador" }));
    return responder(config, 200, minhas);
  }

  // /mesas/:id/inscricao
  const insc = url.match(/^\/mesas\/(\d+)\/inscricao$/);
  if (insc) {
    const id = Number(insc[1]);
    const mesa = mesas.find((m) => m.id === id);
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
      atualizar(id, {
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
      atualizar(id, {
        inscrito: false,
        vagasOcupadas: mesa.vagasOcupadas - 1,
        vagasRestantes: mesa.vagasRestantes + 1,
      });
      return responder(config, 204, null);
    }
  }

  // /mesas/:id  (ver, editar, excluir)
  const uma = url.match(/^\/mesas\/(\d+)$/);
  if (uma) {
    const id = Number(uma[1]);
    const mesa = mesas.find((m) => m.id === id);
    if (!mesa) return responder(config, 404, { erro: "Mesa não encontrada" });

    if (metodo === "get") return responder(config, 200, mesa);

    if (!mesa.souMestre) {
      return responder(config, 403, {
        erro:
          metodo === "put"
            ? "Só o mestre pode editar esta mesa"
            : "Só o mestre pode excluir esta mesa",
      });
    }

    if (metodo === "put") {
      const mud = {};
      if (corpo.titulo) mud.titulo = corpo.titulo;
      if (corpo.sistema) mud.sistema = corpo.sistema;
      if (corpo.descricao) mud.descricao = corpo.descricao;
      if (corpo.dataHora) {
        if (isNaN(new Date(corpo.dataHora))) {
          return responder(config, 400, { erro: "Data/hora inválida" });
        }
        mud.dataHora = corpo.dataHora;
      }
      if (corpo.vagas !== undefined) {
        const qtd = Number(corpo.vagas);
        if (!Number.isInteger(qtd) || qtd < 1) {
          return responder(config, 400, { erro: "Vagas inválidas" });
        }
        if (qtd < mesa.vagasOcupadas) {
          return responder(config, 400, {
            erro: `Já existem ${mesa.vagasOcupadas} jogadores inscritos; vagas não pode ser menor`,
          });
        }
        mud.vagas = qtd;
        mud.vagasRestantes = qtd - mesa.vagasOcupadas;
      }
      atualizar(id, mud);
      return responder(config, 200, mesas.find((m) => m.id === id));
    }

    if (metodo === "delete") {
      mesas = mesas.filter((m) => m.id !== id);
      return responder(config, 204, null);
    }
  }

  // GET /mesas (lista com filtros)
  if (url === "/mesas" && metodo === "get") {
    const { sistema, data } = config.params || {};
    let lista = mesas;
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

  // POST /mesas (criar)
  if (url === "/mesas" && metodo === "post") {
    if (!corpo.titulo || !corpo.sistema || !corpo.descricao || !corpo.dataHora) {
      return responder(config, 400, {
        erro: "Preencha título, sistema, descrição e data/hora",
      });
    }
    if (isNaN(new Date(corpo.dataHora))) {
      return responder(config, 400, { erro: "Data/hora inválida" });
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
    mesas = [...mesas, nova];
    return responder(config, 201, nova);
  }

  return responder(config, 404, { erro: "Rota não simulada" });
}