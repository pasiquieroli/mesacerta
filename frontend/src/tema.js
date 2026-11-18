const CHAVE = "tema";

// Tema salvo; se não houver, segue o tema do sistema operacional
export function temaInicial() {
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo === "claro" || salvo === "escuro") return salvo;
  } catch {
    // localStorage indisponível: segue o sistema
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "escuro"
    : "claro";
}

// Aplica o tema na página (atributo data-tema no <html>)
export function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;
}

// Guarda a escolha do usuário para as próximas visitas
export function salvarTema(tema) {
  try {
    localStorage.setItem(CHAVE, tema);
  } catch {
    // ignora
  }
}