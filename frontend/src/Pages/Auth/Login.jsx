import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Controllers/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import "../../Assets/Styles/Pages/Auth/LoginPage.css";

export default function Login() {
  const navigate = useNavigate();
  const { entrar } = useAuth(); // Puxa a função de login do nosso Contexto

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [entrando, setEntrando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    if (usuario.trim() === "" || senha === "") {
      setMensagem("Informe o e-mail e a senha.");
      return;
    }
    
    setEntrando(true);
    setMensagem("");

    try {
      // Chama o backend real via AuthContext
      await entrar(usuario.trim(), senha);
      // Se der certo, redireciona para a área de voluntários
      navigate("/voluntarios");
    } catch (erro) {
      // Trata a mensagem de erro que vem do backend
      const msgErro = erro.response?.data?.erro || "Não foi possível conectar ao servidor.";
      setMensagem(msgErro);
      setSenha(""); // Limpa a senha por segurança
    } finally {
      setEntrando(false);
    }
  }

  return (
    <div className="login-container">
      {/* Lado Esquerdo - Branding (Visível no Desktop) */}
      <div className="login-branding">
        <div>
          <p className="branding-instituto">Instituto</p>
          <h1 className="branding-logo">sereia</h1>
        </div>
        
        <div className="branding-frase">
          <h2>O cuidado aproxima.<br/>A gestão fortalece.</h2>
          <p>Pessoas, encontros e histórias conectados em um só lugar.</p>
        </div>

        <div className="branding-footer">
          Juntos, fazemos a diferença.
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="login-form-wrapper">
        <div>
          <h2 className="login-title">Bem-vindo de volta</h2>
          <p className="login-subtitle">Acesse sua conta para continuar cuidando do que importa.</p>
        </div>

        <form onSubmit={enviar}>
          <div className="input-group">
            <label className="input-label">E-mail institucional</label>
            <input 
              type="text" 
              className="input-field" 
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="seu.email@example.com"
              autoFocus 
            />
          </div>
          
          <div className="input-group">
            <label className="input-label">Senha</label>
            <div className="input-icon-wrapper">
              <input 
                type={mostrarSenha ? "text" : "password"} 
                className="input-field" 
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
              />
              <button 
                type="button" 
                className="icon-eye"
                onClick={() => setMostrarSenha(!mostrarSenha)}
              >
                {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <a href="#" className="forgot-password">Esqueceu sua senha?</a>

          {mensagem && (
            <p style={{ color: "var(--color-danger-text)", fontSize: "14px", marginBottom: "16px", fontWeight: 500 }}>
              {mensagem}
            </p>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={entrando}>
            {entrando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="login-footer-text">
          <p>Acesso exclusivo à equipe do Instituto Sereia.</p>
          <p>Seus dados são tratados com segurança e responsabilidade.</p>
        </div>
        
        <div className="copyright-text">
          © {new Date().getFullYear()} Instituto Sereia · Gestão Institucional
        </div>
      </div>
    </div>
  );
}