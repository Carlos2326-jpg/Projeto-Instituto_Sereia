import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Award, Calendar } from "lucide-react";
import { AppLayout } from "../../Components/layout/AppLayout";
import { Button } from "../../Components/ui/Button";
import { Badge } from "../../Components/ui/Badge";
import { api } from "../../Services/api";
import {
  formatarCodigo,
  formatarCpf,
  formatarEndereco,
  formatarData,
} from "../../Utils/formatadores";
import "../../Assets/Styles/Pages/Voluntarios/DetalhesVoluntario.css";

export default function DetalhesVoluntario() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [voluntario, setVoluntario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarVoluntario();
  }, [id]);

  async function carregarVoluntario() {
    try {
      const resposta = await api.get(`/voluntarios/${id}`);
      setVoluntario(resposta.data);
    } catch (erro) {
      alert("Erro ao carregar os dados.");
      navigate("/voluntarios");
    } finally {
      setCarregando(false);
    }
  }

  async function alternarStatus() {
    const novoStatus = voluntario.status === "Ativo" ? "Inativo" : "Ativo";
    try {
      await api.patch(`/voluntarios/${id}/status`, { status: novoStatus });
      setVoluntario({ ...voluntario, status: novoStatus });
    } catch (erro) {
      alert("Erro ao alterar status.");
    }
  }

  if (carregando)
    return (
      <AppLayout>
        <p style={{ padding: "24px" }}>Carregando...</p>
      </AppLayout>
    );
  if (!voluntario)
    return (
      <AppLayout>
        <p style={{ padding: "24px" }}>Voluntário não encontrado.</p>
      </AppLayout>
    );

  return (
    <AppLayout>
      <div className="profile-container">
        <div
          className="back-link"
          onClick={() => navigate("/voluntarios")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--color-primary)",
            marginBottom: "24px",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={18} /> Voltar para voluntários
        </div>

        <h1 className="page-title">{voluntario.nome}</h1>
        <p className="page-subtitle" style={{ marginBottom: "24px" }}>
          Informações, vínculos e histórico em um só lugar.
        </p>

        <div className="info-card">
          <h3>Dados cadastrais</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Código</label>
              <p>{formatarCodigo(voluntario.id, "VOL")}</p>
            </div>
            <div className="info-item">
              <label>Status</label>
              <div style={{ marginTop: "4px" }}>
                <Badge status={voluntario.status}>{voluntario.status}</Badge>
              </div>
            </div>
            <div className="info-item">
              <label>Nome completo</label>
              <p>{voluntario.nome}</p>
            </div>
            <div className="info-item">
              <label>CPF</label>
              <p>{formatarCpf(voluntario.cpf)}</p>
            </div>
            <div className="info-item">
              <label>Data de nascimento</label>
              <p>
                {formatarData(voluntario.data_nascimento) || "Não informada"}
              </p>
            </div>
            <div className="info-item">
              <label>E-mail</label>
              <p>{voluntario.email || "Não informado"}</p>
            </div>
            <div className="info-item">
              <label>Telefone</label>
              <p>{voluntario.telefone || "Não informado"}</p>
            </div>
            <div className="info-item">
              <label>Endereço</label>
              <p>{formatarEndereco(voluntario)}</p>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <Button
            variant="primary"
            onClick={() => navigate(`/voluntarios/${voluntario.id}/editar`)}
          >
            Editar cadastro
          </Button>
          <Button variant="outline" onClick={alternarStatus}>
            {voluntario.status === "Ativo"
              ? "Inativar cadastro"
              : "Ativar cadastro"}
          </Button>
        </div>

        <div className="info-card">
          <h3>Participações em eventos</h3>
          {/* Bloco estático simulando histórico */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                background: "var(--color-bg-body)",
                padding: "8px",
                borderRadius: "50%",
              }}
            >
              <Calendar size={20} color="var(--color-primary)" />
            </div>
            <div>
              <p style={{ fontWeight: 500 }}>Ação comunitária</p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-text-muted)",
                }}
              >
                07/11/2026 • 4 horas • Presente
              </p>
            </div>
          </div>
        </div>

        <div className="info-card">
          <h3>Certificados</h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <Award size={20} color="var(--color-primary)" />
            <p style={{ fontSize: "0.875rem" }}>
              CER-2026-0186 • Ação comunitária • Válido
            </p>
          </div>
          <Button variant="outline" style={{ width: "auto" }}>
            Visualizar certificado
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
