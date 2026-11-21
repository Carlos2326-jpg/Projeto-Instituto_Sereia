import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Award } from "lucide-react";
import { AppLayout } from "../../Components/layout/AppLayout";
import { Button } from "../../Components/ui/Button";
import { Badge } from "../../Components/ui/Badge";
import { api } from "../../Services/api";
import "../../Assets/Styles/Pages/Voluntarios/DetalhesVoluntario.css";

export default function DetalhesVoluntario() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [voluntario, setVoluntario] = useState(null);
  const [naoEncontrado, setNaoEncontrado] = useState(false);

  useEffect(() => {
    api
      .get(`/voluntarios/${id}`)
      .then((res) => {
        if (res.data) setVoluntario(res.data);
        else setNaoEncontrado(true);
      })
      .catch(() => setNaoEncontrado(true));
  }, [id]);

  async function alternarStatus() {
    const novoStatus = voluntario.status === "Ativo" ? "Inativo" : "Ativo";
    try {
      await api.patch(`/voluntarios/${voluntario.id}/status`, {
        status: novoStatus,
      });
      setVoluntario({ ...voluntario, status: novoStatus });
    } catch (err) {
      alert(err.response?.data?.erro || "Erro ao alterar status.");
    }
  }

  async function excluir() {
    if (
      !window.confirm(
        `Excluir o cadastro de ${voluntario.nome}? Essa ação não pode ser desfeita.`,
      )
    )
      return;
    try {
      await api.delete(`/voluntarios/${voluntario.id}`);
      navigate("/voluntarios");
    } catch (err) {
      alert(err.response?.data?.erro || "Erro ao excluir.");
    }
  }

  function formatarCpf(cpf) {
    const n = String(cpf || "").replace(/\D/g, "");
    return n.length === 11
      ? n.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
      : cpf;
  }

  function formatarData(data) {
    return data ? data.split("-").reverse().join("/") : "Não informada";
  }

  function montarEndereco(v) {
    const partes = [
      v.logradouro && v.numero ? `${v.logradouro}, ${v.numero}` : v.logradouro,
      v.complemento,
      v.bairro,
      v.cidade,
      v.cep,
    ].filter(Boolean);
    return partes.length ? partes.join(" — ") : "Não informado";
  }

  if (naoEncontrado)
    return (
      <AppLayout>
        <p>Voluntário não encontrado.</p>
      </AppLayout>
    );

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
              <p>{`VOL-${String(voluntario.id).padStart(4, "0")}`}</p>
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
              <p>{formatarData(voluntario.data_nascimento)}</p>
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
              <label>Sexo</label>
              <p>{voluntario.sexo}</p>
            </div>
            <div className="info-item">
              <label>Idade</label>
              <p>{voluntario.idade ?? "Não informada"}</p>
            </div>
            <div className="info-item">
              <label>Estado civil</label>
              <p>{voluntario.estado_civil}</p>
            </div>
            <div className="info-item">
              <label>Endereço</label>
              <p>{montarEndereco(voluntario)}</p>
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
          <Button variant="outline" onClick={excluir}>
            Excluir cadastro
          </Button>
        </div>

        <div className="info-card">
          <h3>Participações em eventos e certificados</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Award size={20} color="var(--color-primary)" />
            <p style={{ fontSize: "0.875rem" }}>
              Eventos e certificados ainda serão implementados.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}