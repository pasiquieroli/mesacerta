export function modificador(valor) {
  return Math.floor((Number(valor) - 10) / 2);
}

export function formatarMod(n) {
  return n >= 0 ? `+${n}` : `${n}`;
}

export function rolarD20() {
  return Math.floor(Math.random() * 20) + 1;
}

const SEIS_ATRIBUTOS = [
  { chave: "forca", rotulo: "Força" },
  { chave: "destreza", rotulo: "Destreza" },
  { chave: "constituicao", rotulo: "Constituição" },
  { chave: "inteligencia", rotulo: "Inteligência" },
  { chave: "sabedoria", rotulo: "Sabedoria" },
  { chave: "carisma", rotulo: "Carisma" },
];

// tipoAtributo:
//   "dnd"    -> o valor gera um modificador (16 = +3)
//   "direto" -> o valor já é o bônus (Tormenta20)
//   "pool"   -> o valor é a quantidade de d20 (Ordem Paranormal)
const DND = {
  id: "dnd",
  nome: "D&D 5e",
  tipoAtributo: "dnd",
  limiteAtributo: { min: 1, max: 30 },
  padraoAtributo: 10,
  dica: "O valor do atributo gera o modificador (16 = +3). Rolagem: d20 + modificador.",
  atributos: SEIS_ATRIBUTOS,
  recursos: [{ chave: "pv", rotulo: "Pontos de vida (PV)", padrao: 10 }],
  estatisticas: [
    { chave: "ca", rotulo: "CA", padrao: 10 },
    { chave: "deslocamento", rotulo: "Deslocamento (m)", padrao: 9 },
  ],
  rotuloHabilidades: "Habilidades e magias",
};

const TORMENTA = {
  id: "tormenta20",
  nome: "Tormenta20",
  tipoAtributo: "direto",
  limiteAtributo: { min: -5, max: 15 },
  padraoAtributo: 0,
  dica: "Aqui o valor do atributo já é o bônus. Rolagem: d20 + atributo. Para valores negativos, use as setinhas do campo.",
  atributos: SEIS_ATRIBUTOS,
  recursos: [
    { chave: "pv", rotulo: "Pontos de vida (PV)", padrao: 12 },
    { chave: "pm", rotulo: "Pontos de mana (PM)", padrao: 3 },
  ],
  estatisticas: [
    { chave: "defesa", rotulo: "Defesa", padrao: 10 },
    { chave: "deslocamento", rotulo: "Deslocamento (m)", padrao: 9 },
  ],
  rotuloHabilidades: "Poderes e magias",
};

const ORDEM = {
  id: "ordem",
  nome: "Ordem Paranormal",
  tipoAtributo: "pool",
  limiteAtributo: { min: 0, max: 10 },
  padraoAtributo: 1,
  dica: "O valor é a quantidade de d20: rola-se todos e fica o maior. Com valor 0, rola 2d20 e fica o menor.",
  atributos: [
    { chave: "agilidade", rotulo: "Agilidade" },
    { chave: "intelecto", rotulo: "Intelecto" },
    { chave: "vigor", rotulo: "Vigor" },
    { chave: "presenca", rotulo: "Presença" },
    { chave: "forca", rotulo: "Força" },
  ],
  recursos: [
    { chave: "pv", rotulo: "Pontos de vida (PV)", padrao: 20 },
    { chave: "pe", rotulo: "Pontos de esforço (PE)", padrao: 4 },
    { chave: "san", rotulo: "Sanidade (SAN)", padrao: 12 },
  ],
  estatisticas: [
    { chave: "defesa", rotulo: "Defesa", padrao: 10 },
    { chave: "deslocamento", rotulo: "Deslocamento (m)", padrao: 9 },
  ],
  rotuloHabilidades: "Poderes e rituais",
};

// Usado para qualquer sistema sem modelo próprio
const GENERICO = { ...DND, id: "generico", nome: "Genérica" };

// Escolhe o modelo pelo nome do sistema da mesa (aceita variações de escrita)
export function modeloPara(sistema) {
  const s = String(sistema || "").toLowerCase();
  if (s.includes("d&d") || s.includes("dnd")) return DND;
  if (s.includes("tormenta")) return TORMENTA;
  if (s.includes("ordem")) return ORDEM;
  return GENERICO;
}

// Ficha inicial de um personagem novo
export function fichaVazia(modelo) {
  const atributos = {};
  modelo.atributos.forEach((a) => {
    atributos[a.chave] = modelo.padraoAtributo;
  });
  const recursos = {};
  modelo.recursos.forEach((r) => {
    recursos[r.chave] = { atual: r.padrao, max: r.padrao };
  });
  const estatisticas = {};
  modelo.estatisticas.forEach((e) => {
    estatisticas[e.chave] = e.padrao;
  });
  return { atributos, recursos, estatisticas, inventario: [], habilidades: "" };
}

// Completa uma ficha que veio do servidor (pode vir vazia: {})
export function normalizarFicha(modelo, f) {
  const base = fichaVazia(modelo);
  const x = f || {};
  const recursos = {};
  Object.keys(base.recursos).forEach((k) => {
    recursos[k] = { ...base.recursos[k], ...((x.recursos || {})[k] || {}) };
  });
  return {
    atributos: { ...base.atributos, ...(x.atributos || {}) },
    recursos,
    estatisticas: { ...base.estatisticas, ...(x.estatisticas || {}) },
    inventario: Array.isArray(x.inventario) ? x.inventario : [],
    habilidades: typeof x.habilidades === "string" ? x.habilidades : "",
  };
}

// O número grande exibido em cada atributo
export function resumoAtributo(modelo, valor) {
  const v = Number(valor);
  if (modelo.tipoAtributo === "dnd") return formatarMod(modificador(v));
  if (modelo.tipoAtributo === "direto") return formatarMod(v);
  return `${v <= 0 ? 2 : v}d20`;
}

// Faz a rolagem de um atributo conforme o sistema
export function rolarAtributo(modelo, valor) {
  const v = Number(valor);

  if (modelo.tipoAtributo === "pool") {
    const zero = v <= 0;
    const qtd = zero ? 2 : v;
    const dados = Array.from({ length: qtd }, rolarD20);
    const total = zero ? Math.min(...dados) : Math.max(...dados);
    return {
      texto: `${qtd}d20 [${dados.join(", ")}] (${zero ? "menor" : "maior"})`,
      total,
      critico: total === 20,
      falha: total === 1,
    };
  }

  const mod = modelo.tipoAtributo === "dnd" ? modificador(v) : v;
  const dado = rolarD20();
  return {
    texto: `d20 (${dado}) ${formatarMod(mod)}`,
    total: dado + mod,
    critico: dado === 20,
    falha: dado === 1,
  };
}