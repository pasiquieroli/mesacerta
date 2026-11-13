import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/saude", (req, res) => res.json({ ok: true }));
app.use("/auth", authRoutes);

const PORTA = 3000;
app.listen(PORTA, () => {
  console.log(`API rodando em http://localhost:${PORTA}`);
});