import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatarCodigo, formatarCpf } from '../../Utils/formatadores';
import { exportarParaPdf } from '../../Utils/exportarPDF';  
import '../../Assets/Styles/Pages/Voluntarios/ListaVoluntarios.css';

export function TabelaPessoas({ 
  dados, 
  carregando, 
  prefixoCodigo, // 'VOL' ou 'PAS'
  rotaBase, // '/voluntarios' ou '/assistidos'
  onAlternarStatus 
}) {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');

  // Lógica de filtragem combinada (Busca + Status)
  const dadosFiltrados = dados.filter(item => {
    const matchBusca = item.nome.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === 'Todos' || item.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  // Função de Exportação para PDF
  function handleExportar() {
    const colunas = [
      { chave: 'codigo', titulo: 'Código' },
      { chave: 'nome', titulo: 'Nome Completo' },
      { chave: 'cpf', titulo: 'CPF' },
      { chave: 'email', titulo: 'E-mail' },
      { chave: 'telefone', titulo: 'Telefone' },
      { chave: 'status', titulo: 'Status' }
    ];

    const dadosParaExportar = dadosFiltrados.map(v => ({
      codigo: formatarCodigo(v.id, prefixoCodigo),
      nome: v.nome,
      cpf: v.cpf ? formatarCpf(v.cpf) : 'Não informado',
      email: v.email || 'Não informado',
      telefone: v.telefone || 'Não informado',
      status: v.status
    }));

    const titulo = prefixoCodigo === 'VOL' 
      ? 'Relatório de Voluntários' 
      : 'Relatório de Pessoas Assistidas';

    exportarParaPdf(dadosParaExportar, titulo, colunas);
  }

  return (
    <>
      {/* Barra de Filtros e Busca */}
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
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <select 
              className="input-field" 
              style={{ 
                paddingLeft: '40px', 
                height: '100%', 
                appearance: 'none', 
                cursor: 'pointer', 
                minWidth: '160px' 
              }}
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="Todos">Todos os status</option>
              <option value="Ativo">Apenas Ativos</option>
              <option value="Inativo">Apenas Inativos</option>
            </select>
            <Filter 
              size={18} 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--color-text-muted)', 
                pointerEvents: 'none' 
              }} 
            />
          </div>

          <Button variant="outline" onClick={handleExportar} style={{ gap: '8px' }}>
            <Download size={18} /> Exportar
          </Button>
        </div>
      </div>

      {/* Visualização Desktop (Tabela) */}
      {carregando ? (
        <div className="table-container" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--color-primary)' }}>Carregando...</h3>
          <div className="skeleton skeleton-row"></div>
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
                {dadosFiltrados.map(v => (
                  <tr key={v.id}>
                    <td>{formatarCodigo(v.id, prefixoCodigo)}</td>
                    <td style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>{v.nome}</td>
                    <td>{formatarCpf(v.cpf)}</td>
                    <td>{v.email || 'Não informado'}</td>
                    <td>{v.telefone || 'Não informado'}</td>
                    <td><Badge status={v.status}>{v.status}</Badge></td>
                    <td>
                      <span className="action-link" onClick={() => navigate(`${rotaBase}/${v.id}`)}>Ver</span>
                      <span className="action-link" onClick={() => navigate(`${rotaBase}/${v.id}/editar`)}>Editar</span>
                      <span className="action-link danger" onClick={() => onAlternarStatus(v.id, v.status)}>
                        {v.status === 'Ativo' ? 'Inativar' : 'Ativar'}
                      </span>
                    </td>
                  </tr>
                ))}
                
                {/* Feedback visual se não houver registros */}
                {dadosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                      Nenhum registro encontrado com os filtros atuais.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Visualização Mobile (Cards) */}
          <div className="cards-container">
            {dadosFiltrados.map(v => (
              <div key={v.id} className="volunteer-card">
                <h3>{v.nome}</h3>
                <div className="card-info">Código: <strong>{formatarCodigo(v.id, prefixoCodigo)}</strong></div>
                <div className="card-info">CPF: <strong>{formatarCpf(v.cpf)}</strong></div>
                <div className="card-info">E-mail: <strong>{v.email || 'Não informado'}</strong></div>
                <div className="card-info">Telefone: <strong>{v.telefone || 'Não informado'}</strong></div>
                <div style={{ marginTop: '12px' }}>
                  <Badge status={v.status}>{v.status}</Badge>
                </div>
                <div className="card-actions">
                  <span className="action-link" onClick={() => navigate(`${rotaBase}/${v.id}`)}>Visualizar</span>
                  <span className="action-link" onClick={() => navigate(`${rotaBase}/${v.id}/editar`)}>Editar</span>
                  <span className="action-link danger" onClick={() => onAlternarStatus(v.id, v.status)}>
                    {v.status === 'Ativo' ? 'Inativar' : 'Ativar'}
                  </span>
                </div>
              </div>
            ))}

            {dadosFiltrados.length === 0 && (
               <p style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                 Nenhum registro encontrado.
               </p>
            )}
          </div>
        </>
      )}
    </>
  );
}