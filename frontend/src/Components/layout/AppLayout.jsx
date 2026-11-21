import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Heart, Calendar, 
  CheckSquare, Award, BarChart, Settings, LogOut, Menu, Bell, Search
} from 'lucide-react';
import '../../Assets/Styles/layout/AppLayout.css';
import { useAuth } from '../../Controllers/AuthContext';

export function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [menuAberto, setMenuAberto] = useState(false);

  // Descobre a página atual para o breadcrumb
  let paginaAtual = 'Dashboard';
  if (location.pathname.includes('voluntarios')) paginaAtual = 'Voluntários';
  if (location.pathname.includes('assistidos')) paginaAtual = 'Pessoas Assistidas';

 const { sair } = useAuth();
function handleSair() {
  sair();
  navigate('/login');
}

  return (
    <div className="app-container">
      <aside className={`sidebar ${menuAberto ? 'open' : ''}`}>
        <div className="sidebar-header">
          <p style={{ fontSize: '0.65rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Instituto</p>
          <h1>sereia</h1>
          <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>Gestão Institucional</p>
        </div>

        <nav className="sidebar-menu">
          <NavLink to="/voluntarios" className="menu-item"><Users size={18} /> Voluntários</NavLink>
          <NavLink to="/assistidos" className="menu-item"><Heart size={18} /> Pessoas Assistidas</NavLink>
        </nav>

        <div className="sidebar-footer">
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
            <p style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Juntos, fazemos mais.</p>
            <p style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>Cada registro conta uma história.</p>
          </div>
          <button onClick={handleSair} className="menu-logout">
            <LogOut size={18} /> Sair do sistema
          </button>
        </div>
      </aside>

      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="menu-toggle" onClick={() => setMenuAberto(!menuAberto)}>
            <Menu size={24} />
          </button>
          <div className="topbar-breadcrumb">
            Instituto Sereia / <strong>{paginaAtual}</strong>
          </div>
        </div>

        <div className="topbar-actions">
          <Search size={20} color="var(--color-text-muted)" style={{ cursor: 'pointer' }} />
          <Bell size={20} color="var(--color-text-muted)" style={{ cursor: 'pointer' }} />
          <div className="user-profile">
            <img src="https://i.pravatar.cc/150?img=47" alt="User" className="avatar" />
            <span>Marina Costa</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}