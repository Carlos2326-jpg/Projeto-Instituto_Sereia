import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./Controllers/AuthContext";
import Login from "./Pages/Login/Login";
import ListaVoluntarios from "./Pages/Voluntarios/ListaVoluntarios";
import FormularioVoluntario from "./Pages/Voluntarios/FormularioVoluntario";
import DetalhesVoluntario from "./Pages/Voluntarios/DetalhesVoluntario";
import ListaAssistidos from "./Pages/PessoasAssistidas/ListaAssistidos";
import FormularioAssistido from "./Pages/PessoasAssistidas/FormularioAssistido";
import DetalhesAssistido from "./Pages/PessoasAssistidas/DetalhesAssistido";

function Protegida({ children }) {
  const { autenticado } = useAuth();
  return autenticado ? children : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/voluntarios" />} />

      <Route path="/voluntarios" element={<Protegida><ListaVoluntarios /></Protegida>} />
      <Route path="/voluntarios/novo" element={<Protegida><FormularioVoluntario /></Protegida>} />
      <Route path="/voluntarios/:id" element={<Protegida><DetalhesVoluntario /></Protegida>} />
      <Route path="/voluntarios/:id/editar" element={<Protegida><FormularioVoluntario /></Protegida>} />

      <Route path="/assistidos" element={<Protegida><ListaAssistidos /></Protegida>} />
      <Route path="/assistidos/novo" element={<Protegida><FormularioAssistido /></Protegida>} />
      <Route path="/assistidos/:id" element={<Protegida><DetalhesAssistido /></Protegida>} />
      <Route path="/assistidos/:id/editar" element={<Protegida><FormularioAssistido /></Protegida>} />

      <Route path="*" element={<Navigate to="/voluntarios" />} />
    </Routes>
  );
}