import { Routes, Route, Navigate } from "react-router-dom";
import ListaVoluntarios from "./Pages/Voluntarios/ListaVoluntarios";
import FormularioVoluntario from "./Pages/Voluntarios/FormularioVoluntario";
import DetalhesVoluntario from "./Pages/Voluntarios/DetalhesVoluntario";
import ListaAssistidos from "./Pages/PessoasAssistidas/ListaAssistidos";
import FormularioAssistido from "./Pages/PessoasAssistidas/FormularioAssistido";
import DetalhesAssistido from "./Pages/PessoasAssistidas/DetalhesAssistido";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/voluntarios" />} />
      
      {/* Fluxo de Voluntários */}
      <Route path="/voluntarios" element={<ListaVoluntarios />} />
      <Route path="/voluntarios/novo" element={<FormularioVoluntario />} />
      <Route path="/voluntarios/:id" element={<DetalhesVoluntario />} />
      <Route path="/voluntarios/:id/editar" element={<FormularioVoluntario />} />

      {/* Fluxo de Pessoas Assistidas */}
      <Route path="/assistidos" element={<ListaAssistidos />} />
      <Route path="/assistidos/novo" element={<FormularioAssistido />} />
      <Route path="/assistidos/:id" element={<DetalhesAssistido />} />
      <Route path="/assistidos/:id/editar" element={<FormularioAssistido />} />

      <Route path="*" element={<Navigate to="/voluntarios" />} />
    </Routes>
  );
}