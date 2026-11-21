import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AppLayout } from "../../Components/layout/AppLayout";
import { Button } from "../../Components/ui/Button";
import { Input } from "../../Components/ui/Input";
import { api } from "../../Services/api";
import "../../Assets/Styles/Pages/Voluntarios/FormularioVoluntario.css";

export default function FormularioAssistido() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdicao = !!id;

  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    data_nascimento: "",
    email: "",
    telefone: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
  });

  useEffect(() => {
    if (isEdicao) {
      api.get(`/assistidos/${id}`).then((res) => {
        if (res.data) {
          // troca valores vazios (null) por texto vazio
          const dados = Object.fromEntries(
            Object.entries(res.data).map(([k, v]) => [k, v ?? ""]),
          );
          setFormData((atual) => ({ ...atual, ...dados }));
        }
      });
    }
  }, [id, isEdicao]);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (isEdicao) {
        await api.put(`/assistidos/${id}`, formData);
      } else {
        await api.post("/assistidos", formData);
      }
      navigate("/assistidos");
    } catch (err) {
      alert(
        err.response?.data?.erro || "Erro ao salvar. O servidor está ligado?",
      );
    }
  }

  return (
    <AppLayout>
      <div className="form-container">
        <div className="back-link" onClick={() => navigate("/assistidos")}>
          <ArrowLeft size={18} /> Voltar para pessoas assistidas
        </div>

        <h1 className="page-title">
          {isEdicao
            ? "Editar pessoa assistida"
            : "Novo cadastro • pessoas assistidas"}
        </h1>
        <p className="page-subtitle" style={{ marginBottom: "24px" }}>
          Preencha os campos abaixo. Os campos com * são obrigatórios.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Dados pessoais</h3>
            <div className="form-grid">
              <Input
                label="Nome completo *"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                placeholder="Digite o nome completo"
              />
              <Input
                label="CPF (opcional)"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
              />
              <Input
                label="Data de nascimento"
                name="data_nascimento"
                type="date"
                value={formData.data_nascimento}
                onChange={handleChange}
              />
              <Input
                label="E-mail (opcional)"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nome@example.com"
              />
              <Input
                label="Telefone *"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                required
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Endereço</h3>
            <div className="form-grid">
              <Input
                label="CEP"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                placeholder="00000-000"
              />
              <Input
                label="Logradouro"
                name="logradouro"
                value={formData.logradouro}
                onChange={handleChange}
                placeholder="Rua, avenida ou praça"
              />
              <Input
                label="Número"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                placeholder="Número"
              />
              <Input
                label="Complemento"
                name="complemento"
                value={formData.complemento}
                onChange={handleChange}
                placeholder="Opcional"
              />
              <Input
                label="Bairro"
                name="bairro"
                value={formData.bairro}
                onChange={handleChange}
                placeholder="Bairro"
              />
              <Input
                label="Cidade / UF"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
                placeholder="Cidade / UF"
              />
            </div>
          </div>

          <div className="form-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/assistidos")}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Salvar alterações
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}