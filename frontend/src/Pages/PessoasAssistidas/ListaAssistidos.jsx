import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../Components/layout/AppLayout';
import { Button } from '../../Components/ui/Button';
import { TabelaPessoas } from '../../Components/layout/TabelaPessoas';
import { assistidoService } from '../../Services/assistidosService'; // <-- Usando o Service

export default function ListaAssistidos() {
  const navigate = useNavigate();
  const [assistidos, setAssistidos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarAssistidos();
  }, []);

  async function carregarAssistidos() {
    try {
      setCarregando(true);
      const dados = await assistidoService.listar();
      setAssistidos(dados);
    } catch (erro) {
      alert('Erro ao carregar pessoas assistidas.');
    } finally {
      setCarregando(false);
    }
  }

  async function alternarStatus(id, statusAtual) {
    const novoStatus = statusAtual === 'Ativo' ? 'Inativo' : 'Ativo';
    try {
      await assistidoService.alterarStatus(id, novoStatus);
      setAssistidos(assistidos.map(v => v.id === id ? { ...v, status: novoStatus } : v));
    } catch (erro) {
      alert('Erro ao alterar status.');
    }
  }

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pessoas Assistidas</h1>
          <p className="page-subtitle">Informações organizadas para um acolhimento melhor.</p>
        </div>
        <Button onClick={() => navigate('/assistidos/novo')}>Nova pessoa assistida</Button>
      </div>

      <div className="stats-bar">
        <strong>{assistidos.length} pessoas cadastradas</strong>
        <span style={{ color: 'var(--color-text-muted)' }}>
          {assistidos.filter(v => v.status === 'Ativo').length} ativas · {assistidos.filter(v => v.status === 'Inativo').length} inativas
        </span>
      </div>

      {/* Reutilizando o componente, só mudando o prefixo e a rota base */}
      <TabelaPessoas 
        dados={assistidos}
        carregando={carregando}
        prefixoCodigo="PAS"
        rotaBase="/assistidos"
        onAlternarStatus={alternarStatus}
      />
    </AppLayout>
  );
}