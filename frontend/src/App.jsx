import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import NovaMesa from "./pages/NovaMesa";
import MesaDetalhe from "./pages/MesaDetalhe";
import MesaEditar from "./pages/MesaEditar";
import Personagens from "./pages/Personagens";
import PersonagemNovo from "./pages/PersonagemNovo";
import PersonagemFicha from "./pages/PersonagemFicha";
import MeusPersonagens from "./pages/MeusPersonagens";
import Agenda from "./pages/Agenda";
import Layout from "./components/Layout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/mesas/nova" element={<NovaMesa />} />
          <Route path="/mesas/:id" element={<MesaDetalhe />} />
          <Route path="/mesas/:id/editar" element={<MesaEditar />} />
          <Route path="/mesas/:id/personagens" element={<Personagens />} />
          <Route path="/mesas/:id/personagens/novo" element={<PersonagemNovo />} />
          <Route path="/mesas/:id/personagens/:pid" element={<PersonagemFicha />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/personagens" element={<MeusPersonagens />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}