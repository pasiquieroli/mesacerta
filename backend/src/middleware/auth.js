import jwt from "jsonwebtoken";

export function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization || "";
  const token = cabecalho.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ erro: "Token não informado" });
  }

  try {
    const dados = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = dados.id;
    next();
  } catch {
    return res.status(401).json({ erro: "Token inválido ou expirado" });
  }
}