import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Download } from "lucide-react";
import { AppLayout } from "../../Components/layout/AppLayout";
import { Button } from "../../Components/ui/Button";
import { Badge } from "../../Components/ui/Badge";
import { api } from "../../Services/api";
import "../../Assets/Styles/Pages/Voluntarios/ListaVoluntarios.css";

export default function ListaAssistidos() {
  const navigate = useNavigate();
  const [assistidos, setAssistidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    api
      .get("/assistidos")
      .then((res) => setAssistidos(res.data))
      .catch(() => alert("Erro ao carregar pessoas assistidas."))
      .finally(() => setCarregando(false));
  }, []);

  function gerarCodigo(v) {
    return `PAS-${String(v.id).padStart(4, "0")}`;
  }

  async function excluir(v) {
    if (
      !window.confirm(
        `Excluir o cadastro de ${v.nome}? Essa ação não pode ser desfeita.`,
      )
    )
      return;
    try {
      await api.delete(`/assistidos/${v.id}`);
      setAssistidos(assistidos.filter((x) => x.id !== v.id));
    } catch (err) {
      alert(err.response?.data?.erro || "Erro ao excluir.");
    }
  }

  async function alternarStatus(v) {
    const novoStatus = v.status === "Ativo" ? "Inativo" : "Ativo";
    try {
      await api.patch(`/assistidos/${v.id}/status`, { status: novoStatus });
      setAssistidos(
        assistidos.map((x) =>
          x.id === v.id ? { ...x, status: novoStatus } : x,
        ),
      );
    } catch (err) {
      alert(err.response?.data?.erro || "Erro ao alterar status.");
    }
  }

  const filtrados = assistidos.filter((v) =>
    v.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pessoas Assistidas</h1>
          <p className="page-subtitle">
            Informações organizadas para um acolhimento melhor.
          </p>
        </div>
        <Button onClick={() => navigate("/assistidos/novo")}>
          Nova pessoa assistida
        </Button>
      </div>

      <div className="stats-bar">
        <strong>{assistidos.length} pessoas cadastradas</strong>
        <span style={{ color: "var(--color-text-muted)" }}>
          {assistidos.filter((v) => v.status === "Ativo").length} ativas ·{" "}
          {assistidos.filter((v) => v.status === "Inativo").length} inativas
        </span>
      </div>

      <div className="filters-bar">
        <div className="search-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            className="input-field"
            placeholder="Pesquisar por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <Button variant="outline" style={{ gap: "8px" }}>
          <Filter size={18} /> Todos os status
        </Button>
        <Button variant="outline" style={{ gap: "8px" }}>
          <Download size={18} /> Exportar
        </Button>
      </div>

      {carregando ? (
        <div className="table-container" style={{ padding: "24px" }}>
          <h3 style={{ marginBottom: "16px", color: "var(--color-primary)" }}>
            Carregando pessoas assistidas...
          </h3>
          <div className="skeleton skeleton-row"></div>
          <div className="skeleton skeleton-row"></div>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nome completo</th>
                  <th>CPF</th>
                  <th>E-mail</th>
                  <th>Telefone</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((v) => (
                  <tr key={v.id}>
                    <td>{gerarCodigo(v)}</td>
                    <td
                      style={{
                        fontWeight: 500,
                        color: "var(--color-text-main)",
                      }}
                    >
                      {v.nome}
                    </td>
                    <td>{v.cpf ? "***.***.***-**" : "Não informado"}</td>
                    <td>{v.email || "Não informado"}</td>
                    <td>{v.telefone}</td>
                    <td>
                      <Badge status={v.status}>{v.status}</Badge>
                    </td>
                    <td>
                      <span
                        className="action-link"
                        onClick={() => navigate(`/assistidos/${v.id}`)}
                      >
                        Ver
                      </span>
                      <span
                        className="action-link"
                        onClick={() => navigate(`/assistidos/${v.id}/editar`)}
                      >
                        Editar
                      </span>
                      <span
                        className="action-link danger"
                        onClick={() => alternarStatus(v)}
                      >
                        {v.status === "Ativo" ? "Inativar" : "Ativar"}
                      </span>
                      <span
                        className="action-link danger"
                        onClick={() => excluir(v)}
                      >
                        Excluir
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="cards-container">
            {filtrados.map((v) => (
              <div key={v.id} className="volunteer-card">
                <h3>{v.nome}</h3>
                <div className="card-info">
                  Código: <strong>{gerarCodigo(v)}</strong>
                </div>
                <div className="card-info">
                  CPF:{" "}
                  <strong>{v.cpf ? "***.***.***-**" : "Não informado"}</strong>
                </div>
                <div className="card-info">
                  E-mail: <strong>{v.email || "Não informado"}</strong>
                </div>
                <div className="card-info">
                  Telefone: <strong>{v.telefone}</strong>
                </div>
                <div style={{ marginTop: "12px" }}>
                  <Badge status={v.status}>{v.status}</Badge>
                </div>
                <div className="card-actions">
                  <span
                    className="action-link"
                    onClick={() => navigate(`/assistidos/${v.id}`)}
                  >
                    Visualizar
                  </span>
                  <span
                    className="action-link"
                    onClick={() => navigate(`/assistidos/${v.id}/editar`)}
                  >
                    Editar
                  </span>
                  <span
                    className="action-link danger"
                    onClick={() => alternarStatus(v)}
                  >
                    {v.status === "Ativo" ? "Inativar" : "Ativar"}
                  </span>
                  <span
                    className="action-link danger"
                    onClick={() => excluir(v)}
                  >
                    Excluir
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </AppLayout>
  );
}