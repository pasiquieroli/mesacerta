// Backend de mentira, só para testar as telas. Imita as rotas do guia do Nicolas.
// Os dados ficam na memória do navegador: o F5 reinicia tudo.

let proximoId = 7;
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
    vagasOcupadas: 4,
    vagasRestantes: 1,
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
  {
    id: 4,
    titulo: "Tormenta20: O Chamado de Valkaria",
    sistema: "Tormenta20",
    descricao: "Aventura clássica de Arton para grupos novos.",
    dataHora: "2026-12-08T20:00:00",
    vagas: 4,
    mestreId: 2,
    mestre: { id: 2, nome: "Nicolas" },
    vagasOcupadas: 1,
    vagasRestantes: 3,
    inscrito: false,
    souMestre: false,
  },
  {
    id: 5,
    titulo: "Call of Cthulhu: Sombras em Innsmouth",
    sistema: "Call of Cthulhu",
    descricao: "Mistério e horror cósmico (usa a ficha genérica).",
    dataHora: "2026-12-09T19:00:00",
    vagas: 5,
    mestreId: 3,
    mestre: { id: 3, nome: "Maria" },
    vagasOcupadas: 2,
    vagasRestantes: 3,
    inscrito: false,
    souMestre: false,
  },
  {
    id: 6,
    titulo: "Pathfinder: Idade das Cinzas",
    sistema: "Pathfinder",
    descricao: "Mesa de exemplo lotada, para testar o erro de vagas.",
    dataHora: "2026-12-10T18:00:00",
    vagas: 4,
    mestreId: 3,
    mestre: { id: 3, nome: "Maria" },
    vagasOcupadas: 4,
    vagasRestantes: 0,
    inscrito: false,
    souMestre: false,
  },
];

// Descobre o id do usuário logado lendo o token (o mesmo id que o backend real usaria)
function idDoToken() {
  try {
    const token = localStorage.getItem("token");
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)).id;
  } catch {
    return 1;
  }
}

let proximoIdPersonagem = 2;
let personagens = [
  {
    id: 1,
    mesaId: 1,
    usuarioId: 99,
    usuario: { id: 99, nome: "Lia" },
    nome: "Elara Ventosul",
    classe: "Maga",
    nivel: 3,
    notas: "Elfa curiosa que estuda magia antiga.",
    ficha: {
      atributos: {
        forca: 8,
        destreza: 14,
        constituicao: 12,
        inteligencia: 17,
        sabedoria: 13,
        carisma: 10,
      },
      recursos: { pv: { atual: 14, max: 18 } },
      estatisticas: { ca: 12, deslocamento: 9 },
      inventario: [
        { nome: "Grimório", qtd: 1 },
        { nome: "Poção de cura", qtd: 2 },
      ],
      habilidades: "Mísseis Mágicos, Escudo Arcano, Detectar Magia",
    },
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
  return (
    url.startsWith("/mesas") ||
    url.startsWith("/me/agenda") ||
    url.startsWith("/me/personagens") ||
    url.startsWith("/personagens")
  );
}

export function adaptadorMock(config) {
  const metodo = config.method.toLowerCase();
  const url = config.url;
  const corpo = config.data ? JSON.parse(config.data) : {};

  // /mesas/:id/personagens  (listar e criar)
  const pm = url.match(/^\/mesas\/(\d+)\/personagens$/);
  if (pm) {
    const mesaId = Number(pm[1]);
    const mesa = mesas.find((m) => m.id === mesaId);
    if (!mesa) return responder(config, 404, { erro: "Mesa não encontrada" });

    if (metodo === "get") {
      if (!mesa.souMestre && !mesa.inscrito) {
        return responder(config, 403, {
          erro: "Só participantes da mesa veem os personagens",
        });
      }
      return responder(
        config,
        200,
        personagens.filter((p) => p.mesaId === mesaId)
      );
    }

    if (metodo === "post") {
      if (!mesa.inscrito) {
        return responder(config, 403, {
          erro: "Inscreva-se na mesa para criar um personagem",
        });
      }
      if (!corpo.nome || !corpo.classe) {
        return responder(config, 400, { erro: "Informe nome e classe" });
      }
      const nivel = corpo.nivel === undefined ? 1 : Number(corpo.nivel);
      if (!Number.isInteger(nivel) || nivel < 1 || nivel > 20) {
        return responder(config, 400, { erro: "Nível deve ser um inteiro de 1 a 20" });
      }
      const meuId = idDoToken();
      if (personagens.some((p) => p.mesaId === mesaId && p.usuarioId === meuId)) {
        return responder(config, 409, {
          erro: "Você já tem um personagem nesta mesa",
        });
      }
      const novo = {
        id: proximoIdPersonagem++,
        mesaId,
        usuarioId: meuId,
        usuario: { id: meuId, nome: "Você" },
        nome: corpo.nome,
        classe: corpo.classe,
        nivel,
        notas: corpo.notas || "",
        ficha: corpo.ficha || {},
      };
      personagens = [...personagens, novo];
      return responder(config, 201, novo);
    }
  }

  // /personagens/:id  (editar e excluir, só o dono)
  const pp = url.match(/^\/personagens\/(\d+)$/);
  if (pp) {
    const id = Number(pp[1]);
    const p = personagens.find((x) => x.id === id);
    if (!p) return responder(config, 404, { erro: "Personagem não encontrado" });
    if (p.usuarioId !== idDoToken()) {
      return responder(config, 403, { erro: "Esse personagem não é seu" });
    }

    if (metodo === "put") {
      const mud = {};
      if (corpo.nome) mud.nome = corpo.nome;
      if (corpo.classe) mud.classe = corpo.classe;
      if (corpo.notas !== undefined) mud.notas = corpo.notas;
      if (corpo.ficha !== undefined) mud.ficha = corpo.ficha;
      if (corpo.nivel !== undefined) {
        const n = Number(corpo.nivel);
        if (!Number.isInteger(n) || n < 1 || n > 20) {
          return responder(config, 400, { erro: "Nível deve ser um inteiro de 1 a 20" });
        }
        mud.nivel = n;
      }
      personagens = personagens.map((x) => (x.id === id ? { ...x, ...mud } : x));
      return responder(config, 200, personagens.find((x) => x.id === id));
    }

    if (metodo === "delete") {
      personagens = personagens.filter((x) => x.id !== id);
      return responder(config, 204, null);
    }
  }

  // GET /me/personagens (todas as fichas do usuário, com a mesa de cada uma)
  if (url === "/me/personagens" && metodo === "get") {
    const meuId = idDoToken();
    const meus = personagens
      .filter((p) => p.usuarioId === meuId && mesas.some((m) => m.id === p.mesaId))
      .map((p) => {
        const m = mesas.find((x) => x.id === p.mesaId);
        return { ...p, mesa: { id: m.id, titulo: m.titulo, sistema: m.sistema } };
      });
    return responder(config, 200, meus);
  }

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