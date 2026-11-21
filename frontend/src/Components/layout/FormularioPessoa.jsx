import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { mascararTelefone, mascararCep } from "../../Utils/formatadores";
import "../../Assets/Styles/Pages/Voluntarios/FormularioVoluntario.css"

export function FormularioPessoa({
  titulo,
  rotaVoltar,
  dadosIniciais,
  onSalvar,
  camposOpcionais = [], // Ex: ['cpf', 'email']
}) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(dadosIniciais);
  const [salvando, setSalvando] = useState(false);

  const buscarCep = async (cepFormatado) => {
    const cepLimpo = cepFormatado.replace(/\D/g, "");
    if (cepLimpo.length === 8) {
      try {
        const resposta = await fetch(
          `https://viacep.com.br/ws/${cepLimpo}/json/`,
        );
        const dados = await resposta.json();
        if (dados.erro) return alert("CEP não encontrado.");

        setFormData((atual) => ({
          ...atual,
          logradouro: dados.logradouro || "",
          bairro: dados.bairro || "",
          cidade: `${dados.localidade} / ${dados.uf}` || "",
        }));
      } catch (e) {
        alert("Erro ao buscar CEP.");
      }
    }
  };

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "telefone") {
      setFormData({ ...formData, [name]: mascararTelefone(value) });
    } else if (name === "cep") {
      const cepFormatado = mascararCep(value);
      setFormData({ ...formData, [name]: cepFormatado });
      buscarCep(cepFormatado);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      await onSalvar(formData);
      navigate(rotaVoltar);
    } catch (erro) {
      alert(erro.response?.data?.erro || "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  const isOpcional = (campo) => camposOpcionais.includes(campo);

  return (
    <div className="form-container">
      <div className="back-link" onClick={() => navigate(rotaVoltar)}>
        <ArrowLeft size={18} /> Voltar
      </div>
      <h1 className="page-title">{titulo}</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Dados pessoais</h3>
          <div className="form-grid">
            <Input
              label={`Nome completo *`}
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />
            <Input
              label={`CPF ${isOpcional("cpf") ? "(opcional)" : "*"}`}
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              required={!isOpcional("cpf")}
            />
            <Input
              label="Data de nascimento"
              name="data_nascimento"
              type="date"
              value={formData.data_nascimento}
              onChange={handleChange}
            />
            <Input
              label={`E-mail ${isOpcional("email") ? "(opcional)" : "*"}`}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required={!isOpcional("email")}
            />
            <Input
              label="Telefone *"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Endereço</h3>
          <div className="form-grid">
            <Input
              label="CEP"
              name="cep"
              value={formData.cep}
              onChange={handleChange}
            />
            <Input
              label="Logradouro"
              name="logradouro"
              value={formData.logradouro}
              onChange={handleChange}
            />
            <Input
              label="Número"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
            />
            <Input
              label="Complemento"
              name="complemento"
              value={formData.complemento}
              onChange={handleChange}
            />
            <Input
              label="Bairro"
              name="bairro"
              value={formData.bairro}
              onChange={handleChange}
            />
            <Input
              label="Cidade / UF"
              name="cidade"
              value={formData.cidade}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-actions">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(rotaVoltar)}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
