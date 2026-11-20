import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Award, Calendar } from "lucide-react";
import { AppLayout } from "../../Components/layout/AppLayout";
import { Button } from "../../Components/ui/Button";
import { Badge } from "../../Components/ui/Badge";
import { mockVoluntarios } from "../../Services/mockData";
import "../../Assets/Styles/Pages/Voluntarios/DetalhesVoluntario.css";

export default function DetalhesVoluntario() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [voluntario, setVoluntario] = useState(null);

  useEffect(() => {
    // Simula busca por ID
    const encontrado = mockVoluntarios.find((v) => v.id === Number(id));
    setVoluntario(encontrado);
  }, [id]);

  if (!voluntario)
    return (
      <AppLayout>
        <p>Carregando...</p>
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
              <p>{voluntario.codigo}</p>
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
              <p>***.***.***-**</p>
            </div>
            <div className="info-item">
              <label>Data de nascimento</label>
              <p>{voluntario.dataNascimento}</p>
            </div>
            <div className="info-item">
              <label>E-mail</label>
              <p>{voluntario.email}</p>
            </div>
            <div className="info-item">
              <label>Telefone</label>
              <p>{voluntario.telefone}</p>
            </div>
            <div className="info-item">
              <label>Endereço</label>
              <p>{voluntario.endereco}</p>
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
          <Button variant="outline">
            {voluntario.status === "Ativo"
              ? "Inativar cadastro"
              : "Ativar cadastro"}
          </Button>
        </div>

        <div className="info-card">
          <h3>Participações em eventos</h3>
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
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
              <p style={{ fontWeight: 500 }}>Mutirão do bem</p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-text-muted)",
                }}
              >
                31/10/2026 • 6 horas • Presente
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
