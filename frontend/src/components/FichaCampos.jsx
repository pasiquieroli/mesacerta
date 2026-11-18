import { useState } from "react";
import { resumoAtributo, rolarAtributo } from "../fichas/modelos";

function limitar(valor, min, max) {
  const n = Number(valor);
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export default function FichaCampos({ modelo, ficha, aoMudar, somenteLeitura }) {
  const [rolagem, setRolagem] = useState(null);
  const [novoItem, setNovoItem] = useState({ nome: "", qtd: 1 });
  const { min, max } = modelo.limiteAtributo;

  function mudar(campo, valor) {
    aoMudar({ ...ficha, [campo]: valor });
  }

  function mudarAtributo(chave, valor) {
    mudar("atributos", { ...ficha.atributos, [chave]: limitar(valor, min, max) });
  }

  function mudarRecurso(chave, campo, valor) {
    const atual = ficha.recursos[chave];
    mudar("recursos", {
      ...ficha.recursos,
      [chave]: { ...atual, [campo]: limitar(valor, campo === "max" ? 1 : 0, 999) },
    });
  }

  function mudarEstatistica(chave, valor) {
    mudar("estatisticas", { ...ficha.estatisticas, [chave]: limitar(valor, 0, 99) });
  }

  function rolar(rotulo, valor) {
    setRolagem({ rotulo, ...rolarAtributo(modelo, valor) });
  }

  function adicionarItem() {
    if (!novoItem.nome.trim()) return;
    mudar("inventario", [
      ...ficha.inventario,
      { nome: novoItem.nome.trim(), qtd: limitar(novoItem.qtd, 1, 999) },
    ]);
    setNovoItem({ nome: "", qtd: 1 });
  }

  function removerItem(indice) {
    mudar(
      "inventario",
      ficha.inventario.filter((_, i) => i !== indice)
    );
  }

  return (
    <div>
      <h2>Atributos</h2>
      <p className="info">{modelo.dica}</p>
      <div className="atributos">
        {modelo.atributos.map((a) => {
          const valor = ficha.atributos[a.chave];
          return (
            <div className="atributo" key={a.chave}>
              <div className="rotulo">{a.rotulo}</div>
              <div className="mod">{resumoAtributo(modelo, valor)}</div>
              <input
                type="number"
                min={min}
                max={max}
                value={valor}
                disabled={somenteLeitura}
                onChange={(e) => mudarAtributo(a.chave, e.target.value)}
              />
              <div>
                <button type="button" onClick={() => rolar(a.rotulo, valor)}>
                  Rolar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {rolagem && (
        <div className="rolagem">
          {rolagem.rotulo}: {rolagem.texto} = <strong>{rolagem.total}</strong>
          {rolagem.critico && " (20 no dado!)"}
          {rolagem.falha && " (1 no dado...)"}
        </div>
      )}

      <h2>Recursos e combate</h2>
      {modelo.recursos.map((r) => {
        const { atual, max: maximo } = ficha.recursos[r.chave];
        const pct = maximo > 0 ? Math.min(100, Math.max(0, (atual / maximo) * 100)) : 0;
        return (
          <div key={r.chave}>
            <p className="info">
              {r.rotulo}: {atual} / {maximo}
            </p>
            <div className="barra">
              <div style={{ width: `${pct}%` }} />
            </div>
            <div className="linha">
              <label>
                Atual{" "}
                <input
                  type="number"
                  min="0"
                  value={atual}
                  disabled={somenteLeitura}
                  onChange={(e) => mudarRecurso(r.chave, "atual", e.target.value)}
                />
              </label>
              <label>
                Máximo{" "}
                <input
                  type="number"
                  min="1"
                  value={maximo}
                  disabled={somenteLeitura}
                  onChange={(e) => mudarRecurso(r.chave, "max", e.target.value)}
                />
              </label>
            </div>
          </div>
        );
      })}

      <div className="linha">
        {modelo.estatisticas.map((e) => (
          <label key={e.chave}>
            {e.rotulo}{" "}
            <input
              type="number"
              min="0"
              value={ficha.estatisticas[e.chave]}
              disabled={somenteLeitura}
              onChange={(ev) => mudarEstatistica(e.chave, ev.target.value)}
            />
          </label>
        ))}
      </div>

      <h2>Inventário</h2>
      {ficha.inventario.length === 0 && <p className="info">Nenhum item.</p>}
      {ficha.inventario.map((item, i) => (
        <div className="item" key={i}>
          <span>
            {item.nome} (x{item.qtd})
          </span>
          {!somenteLeitura && (
            <button type="button" className="perigo" onClick={() => removerItem(i)}>
              Remover
            </button>
          )}
        </div>
      ))}
      {!somenteLeitura && (
        <div className="linha">
          <input
            placeholder="Nome do item"
            value={novoItem.nome}
            onChange={(e) => setNovoItem({ ...novoItem, nome: e.target.value })}
          />
          <input
            type="number"
            min="1"
            value={novoItem.qtd}
            onChange={(e) => setNovoItem({ ...novoItem, qtd: e.target.value })}
          />
          <button type="button" onClick={adicionarItem}>
            Adicionar item
          </button>
        </div>
      )}

      <h2>{modelo.rotuloHabilidades}</h2>
      <textarea
        rows={4}
        style={{ width: "100%" }}
        value={ficha.habilidades}
        disabled={somenteLeitura}
        onChange={(e) => mudar("habilidades", e.target.value)}
      />
    </div>
  );
}