import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import NovaMesa from "./pages/NovaMesa";
import MesaDetalhe from "./pages/MesaDetalhe";
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
          <Route path="/agenda" element={<Agenda />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}