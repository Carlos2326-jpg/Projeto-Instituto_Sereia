import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
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

export default function DetalhesAssistido() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [assistido, setAssistido] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarAssistido();
  }, [id]);

  async function carregarAssistido() {
    try {
      const resposta = await api.get(`/assistidos/${id}`);
      setAssistido(resposta.data);
    } catch (erro) {
      alert("Erro ao carregar os dados.");
      navigate("/assistidos");
    } finally {
      setCarregando(false);
    }
  }

  async function alternarStatus() {
    const novoStatus = assistido.status === "Ativo" ? "Inativo" : "Ativo";
    try {
      await api.patch(`/assistidos/${id}/status`, { status: novoStatus });
      setAssistido({ ...assistido, status: novoStatus });
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
  if (!assistido)
    return (
      <AppLayout>
        <p style={{ padding: "24px" }}>Pessoa não encontrada.</p>
      </AppLayout>
    );

  return (
    <AppLayout>
      <div className="profile-container">
        <div
          className="back-link"
          onClick={() => navigate("/assistidos")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--color-primary)",
            marginBottom: "24px",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={18} /> Voltar para pessoas assistidas
        </div>

        <h1 className="page-title">{assistido.nome}</h1>
        <p className="page-subtitle" style={{ marginBottom: "24px" }}>
          Informações, vínculos e histórico em um só lugar.
        </p>

        <div className="info-card">
          <h3>Dados cadastrais</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Código</label>
              <p>{formatarCodigo(assistido.id, "PAS")}</p>
            </div>
            <div className="info-item">
              <label>Status</label>
              <div style={{ marginTop: "4px" }}>
                <Badge status={assistido.status}>{assistido.status}</Badge>
              </div>
            </div>
            <div className="info-item">
              <label>Nome completo</label>
              <p>{assistido.nome}</p>
            </div>
            <div className="info-item">
              <label>CPF</label>
              <p>{formatarCpf(assistido.cpf)}</p>
            </div>
            <div className="info-item">
              <label>Data de nascimento</label>
              <p>
                {formatarData(assistido.data_nascimento) || "Não informada"}
              </p>
            </div>
            <div className="info-item">
              <label>E-mail</label>
              <p>{assistido.email || "Não informado"}</p>
            </div>
            <div className="info-item">
              <label>Telefone</label>
              <p>{assistido.telefone || "Não informado"}</p>
            </div>
            <div className="info-item">
              <label>Endereço</label>
              <p>{formatarEndereco(assistido)}</p>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <Button
            variant="primary"
            onClick={() => navigate(`/assistidos/${assistido.id}/editar`)}
          >
            Editar cadastro
          </Button>
          <Button variant="outline" onClick={alternarStatus}>
            {assistido.status === "Ativo"
              ? "Inativar cadastro"
              : "Ativar cadastro"}
          </Button>
        </div>

        <div className="info-card">
          <h3>Histórico de acolhimento</h3>
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
      </div>
    </AppLayout>
  );
}
