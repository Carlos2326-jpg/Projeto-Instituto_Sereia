import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AppLayout } from "../../Components/layout/AppLayout";
import { Button } from "../../Components/ui/Button";
import { Input } from "../../Components/ui/Input";
import { mockVoluntarios } from "../../Services/mockData";
import "../../Assets/Styles/Pages/Voluntarios/FormularioVoluntario.css";

export default function FormularioVoluntario() {
  const navigate = useNavigate();
  const { id } = useParams(); // Se tiver ID, é edição. Se não, é cadastro novo.
  const isEdicao = !!id;

  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    dataNascimento: "",
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
      // Simulando a busca de um voluntário específico
      const voluntario = mockVoluntarios.find((v) => v.id === Number(id));
      if (voluntario) {
        setFormData({ ...formData, ...voluntario });
      }
    }
  }, [id]);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    alert(
      isEdicao
        ? "Dados atualizados (Simulação)"
        : "Voluntário cadastrado (Simulação)",
    );
    navigate("/voluntarios");
  }

  return (
    <AppLayout>
      <div className="form-container">
        <div className="back-link" onClick={() => navigate("/voluntarios")}>
          <ArrowLeft size={18} /> Voltar para voluntários
        </div>

        <h1 className="page-title">
          {isEdicao ? "Editar voluntário" : "Novo cadastro • voluntários"}
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
                label="CPF *"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                required
                placeholder="000.000.000-00"
              />
              <Input
                label="Data de nascimento"
                name="dataNascimento"
                type="date"
                value={formData.dataNascimento}
                onChange={handleChange}
              />
              <Input
                label="E-mail *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
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
              onClick={() => navigate("/voluntarios")}
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
