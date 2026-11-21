import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import { AppLayout } from "../../Components/layout/AppLayout";
import { Button } from "../../Components/ui/Button";
import { Badge } from "../../Components/ui/Badge";
import { api } from "../../Services/api";
import "../../Assets/Styles/Pages/Voluntarios/DetalhesVoluntario.css";

export default function DetalhesAssistido() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [assistido, setAssistido] = useState(null);
  const [naoEncontrado, setNaoEncontrado] = useState(false);

  useEffect(() => {
    api
      .get(`/assistidos/${id}`)
      .then((res) => {
        if (res.data) setAssistido(res.data);
        else setNaoEncontrado(true);
      })
      .catch(() => setNaoEncontrado(true));
  }, [id]);

  async function alternarStatus() {
    const novoStatus = assistido.status === "Ativo" ? "Inativo" : "Ativo";
    try {
      await api.patch(`/assistidos/${assistido.id}/status`, {
        status: novoStatus,
      });
      setAssistido({ ...assistido, status: novoStatus });
    } catch (err) {
      alert(err.response?.data?.erro || "Erro ao alterar status.");
    }
  }

  async function excluir() {
    if (
      !window.confirm(
        `Excluir o cadastro de ${assistido.nome}? Essa ação não pode ser desfeita.`,
      )
    )
      return;
    try {
      await api.delete(`/assistidos/${assistido.id}`);
      navigate("/assistidos");
    } catch (err) {
      alert(err.response?.data?.erro || "Erro ao excluir.");
    }
  }

  function formatarCpf(cpf) {
    const n = String(cpf || "").replace(/\D/g, "");
    return n.length === 11
      ? n.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
      : "Não informado";
  }

  function formatarData(data) {
    return data ? data.split("-").reverse().join("/") : "Não informada";
  }

  function montarEndereco(a) {
    const partes = [
      a.logradouro && a.numero ? `${a.logradouro}, ${a.numero}` : a.logradouro,
      a.complemento,
      a.bairro,
      a.cidade,
      a.cep,
    ].filter(Boolean);
    return partes.length ? partes.join(" — ") : "Não informado";
  }

  if (naoEncontrado)
    return (
      <AppLayout>
        <p>Pessoa assistida não encontrada.</p>
      </AppLayout>
    );

  if (!assistido)
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
              <p>{`PAS-${String(assistido.id).padStart(4, "0")}`}</p>
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
              <p>{formatarData(assistido.data_nascimento)}</p>
            </div>
            <div className="info-item">
              <label>E-mail</label>
              <p>{assistido.email || "Não informado"}</p>
            </div>
            <div className="info-item">
              <label>Telefone</label>
              <p>{assistido.telefone}</p>
            </div>
            <div className="info-item">
              <label>Endereço</label>
              <p>{montarEndereco(assistido)}</p>
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
          <Button variant="outline" onClick={excluir}>
            Excluir cadastro
          </Button>
        </div>

        <div className="info-card">
          <h3>Histórico de acolhimento</h3>
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
            <p style={{ fontSize: "0.875rem" }}>
              O histórico de acolhimento ainda será implementado.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}