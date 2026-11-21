import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Download } from "lucide-react";
import { AppLayout } from "../../Components/layout/AppLayout";
import { Button } from "../../Components/ui/Button";
import { Badge } from "../../Components/ui/Badge";
import { api } from "../../Services/api";
import "../../Assets/Styles/Pages/Voluntarios/ListaVoluntarios.css";

export default function ListaVoluntarios() {
  const navigate = useNavigate();
  const [voluntarios, setVoluntarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    api
      .get("/voluntarios")
      .then((res) => setVoluntarios(res.data))
      .catch(() => alert("Erro ao carregar voluntários."))
      .finally(() => setCarregando(false));
  }, []);

  function gerarCodigo(v) {
    return `VOL-${String(v.id).padStart(4, "0")}`;
  }

  async function excluir(v) {
    if (
      !window.confirm(
        `Excluir o cadastro de ${v.nome}? Essa ação não pode ser desfeita.`,
      )
    )
      return;
    try {
      await api.delete(`/voluntarios/${v.id}`);
      setVoluntarios(voluntarios.filter((x) => x.id !== v.id));
    } catch (err) {
      alert(err.response?.data?.erro || "Erro ao excluir.");
    }
  }

  async function alternarStatus(v) {
    const novoStatus = v.status === "Ativo" ? "Inativo" : "Ativo";
    try {
      await api.patch(`/voluntarios/${v.id}/status`, { status: novoStatus });
      setVoluntarios(
        voluntarios.map((x) =>
          x.id === v.id ? { ...x, status: novoStatus } : x,
        ),
      );
    } catch (err) {
      alert(err.response?.data?.erro || "Erro ao alterar status.");
    }
  }

  const voluntariosFiltrados = voluntarios.filter((v) =>
    v.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gerenciamento de Voluntários</h1>
          <p className="page-subtitle">
            Quem transforma cuidado em ação, todos os dias.
          </p>
        </div>
        <Button onClick={() => navigate("/voluntarios/novo")}>
          Novo Voluntário
        </Button>
      </div>

      {/* BARRA DE ESTATÍSTICAS: contagem de ativos e inativos */}
      <div className="stats-bar">
        <strong>{voluntarios.length} cadastrados</strong>
        <span style={{ color: "var(--color-text-muted)" }}>
          {voluntarios.filter((v) => v.status === "Ativo").length} ativos ·{" "}
          {voluntarios.filter((v) => v.status === "Inativo").length} inativos
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
            Carregando voluntários...
          </h3>
          <div className="skeleton skeleton-row"></div>
          <div className="skeleton skeleton-row"></div>
        </div>
      ) : (
        <>
          {/* TABELA (computador) */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nome completo</th>
                  <th>CPF</th>
                  <th>E-mail</th>
                  <th>Telefone</th>
                  <th>Status</th> {/* <- cabeçalho do status */}
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {voluntariosFiltrados.map((v) => (
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
                    <td>***.***.***-**</td>
                    <td>{v.email}</td>
                    <td>{v.telefone}</td>
                    <td>
                      {/* <- selo do status em cada linha */}
                      <Badge status={v.status}>{v.status}</Badge>
                    </td>
                    <td>
                      <span
                        className="action-link"
                        onClick={() => navigate(`/voluntarios/${v.id}`)}
                      >
                        Ver
                      </span>
                      <span
                        className="action-link"
                        onClick={() => navigate(`/voluntarios/${v.id}/editar`)}
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

          {/* CARDS (celular) */}
          <div className="cards-container">
            {voluntariosFiltrados.map((v) => (
              <div key={v.id} className="volunteer-card">
                <h3>{v.nome}</h3>
                <div className="card-info">
                  Código: <strong>{gerarCodigo(v)}</strong>
                </div>
                <div className="card-info">
                  CPF: <strong>***.***.***-**</strong>
                </div>
                <div className="card-info">
                  E-mail: <strong>{v.email}</strong>
                </div>
                <div className="card-info">
                  Telefone: <strong>{v.telefone}</strong>
                </div>
                <div style={{ marginTop: "12px" }}>
                  {/* <- selo do status no card */}
                  <Badge status={v.status}>{v.status}</Badge>
                </div>
                <div className="card-actions">
                  <span
                    className="action-link"
                    onClick={() => navigate(`/voluntarios/${v.id}`)}
                  >
                    Visualizar
                  </span>
                  <span
                    className="action-link"
                    onClick={() => navigate(`/voluntarios/${v.id}/editar`)}
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