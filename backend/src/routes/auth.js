import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../db.js";
import { autenticar } from "../middleware/auth.js";

const router = Router();

function gerarToken(usuario) {
  return jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

router.post("/register", async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: "Preencha nome, email e senha" });
  }

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    return res.status(409).json({ erro: "Email já cadastrado" });
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  const usuario = await prisma.usuario.create({
    data: { nome, email, senhaHash },
  });

  res.status(201).json({
    token: gerarToken(usuario),
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
  });
});

router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  const senhaOk = usuario && (await bcrypt.compare(senha, usuario.senhaHash));

  if (!senhaOk) {
    return res.status(401).json({ erro: "Email ou senha incorretos" });
  }

  res.json({
    token: gerarToken(usuario),
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
  });
});

router.get("/me", autenticar, async (req, res) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id: req.usuarioId },
    select: { id: true, nome: true, email: true },
  });
  res.json(usuario);
});

export default router;