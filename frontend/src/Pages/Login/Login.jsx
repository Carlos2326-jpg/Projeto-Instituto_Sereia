import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Controllers/AuthContext";
import { Input } from "../../Components/ui/Input";
import { Button } from "../../Components/ui/Button";

export default function Login() {
  const { entrar } = useAuth();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    try {
      await entrar(usuario, senha);
      navigate("/voluntarios");
    } catch (err) {
      setErro(err.response?.data?.erro || "Não foi possível conectar ao servidor.");
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: "80px auto", padding: 24 }}>
      <h1 className="page-title">Instituto Sereia</h1>
      <form onSubmit={handleSubmit}>
        <Input label="Usuário" value={usuario} onChange={(e) => setUsuario(e.target.value)} required />
        <Input label="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        {erro && <p style={{ color: "red", margin: "8px 0" }}>{erro}</p>}
        <Button type="submit" variant="primary">Entrar</Button>
      </form>
    </div>
  );
}