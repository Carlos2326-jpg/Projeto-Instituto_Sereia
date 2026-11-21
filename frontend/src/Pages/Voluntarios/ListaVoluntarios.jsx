import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../Components/layout/AppLayout';
import { Button } from '../../Components/ui/Button';
import { TabelaPessoas } from '../../Components/layout/TabelaPessoas'; 
import { voluntarioService } from '../../Services/voluntariosService';

export default function ListaVoluntarios() {
  const navigate = useNavigate();
  const [voluntarios, setVoluntarios] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarVoluntarios();
  }, []);

  async function carregarVoluntarios() {
    try {
      setCarregando(true);
      const dados = await voluntarioService.listar();
      setVoluntarios(dados);
    } catch (erro) {
      alert('Erro ao carregar voluntários.');
    } finally {
      setCarregando(false);
    }
  }

  async function alternarStatus(id, statusAtual) {
    const novoStatus = statusAtual === 'Ativo' ? 'Inativo' : 'Ativo';
    try {
      await voluntarioService.alterarStatus(id, novoStatus);
      setVoluntarios(voluntarios.map(v => v.id === id ? { ...v, status: novoStatus } : v));
    } catch (erro) {
      alert('Erro ao alterar status.');
    }
  }

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gerenciamento de Voluntários</h1>
          <p className="page-subtitle">Quem transforma cuidado em ação, todos os dias.</p>
        </div>
        <Button onClick={() => navigate('/voluntarios/novo')}>Novo Voluntário</Button>
      </div>

      <div className="stats-bar">
        <strong>{voluntarios.length} cadastrados</strong>
        <span style={{ color: 'var(--color-text-muted)' }}>
          {voluntarios.filter(v => v.status === 'Ativo').length} ativos · {voluntarios.filter(v => v.status === 'Inativo').length} inativos
        </span>
      </div>

      {/* Passamos tudo pro componente genérico */}
      <TabelaPessoas 
        dados={voluntarios}
        carregando={carregando}
        prefixoCodigo="VOL"
        rotaBase="/voluntarios"
        onAlternarStatus={alternarStatus}
      />
    </AppLayout>
  );
}