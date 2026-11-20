import { createContext, useState, useContext, useEffect } from "react";
import { api } from "../Services/api";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(() => {
    const guardada = sessionStorage.getItem("sessao");
    return guardada ? JSON.parse(guardada) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aqui futuramente você pode validar o token com o backend ao iniciar
    setLoading(false);
  }, []);

  async function entrar(usuario, senha) {
    const resposta = await api.post("/login", { usuario, senha });
    const novaSessao = { token: resposta.data.token, nome: resposta.data.nome };

    sessionStorage.setItem("sessao", JSON.stringify(novaSessao));
    setSessao(novaSessao);
    return resposta.data;
  }

  function sair() {
    sessionStorage.removeItem("sessao");
    setSessao(null);
  }

  if (loading) return null; // Ou um spinner de tela cheia

  return (
    <AuthContext.Provider
      value={{ sessao, entrar, sair, autenticado: !!sessao }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
