import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "../../Components/layout/AppLayout";
import { FormularioPessoa } from "../../Components/layout/FormularioPessoa";
import { assistidoService } from "../../Services/assistidosService";

export default function FormularioAssistido() {
  const { id } = useParams();
  const [dadosIniciais, setDadosIniciais] = useState(null);

  useEffect(() => {
    if (id) {
      assistidoService.buscarPorId(id).then((dados) => {
        // troca valores vazios (null) por texto vazio
        const limpos = Object.fromEntries(
          Object.entries(dados || {}).map(([k, v]) => [k, v ?? ""]),
        );
        setDadosIniciais(limpos);
      });
    } else {
      setDadosIniciais({
        nome: "",
        cpf: "",
        data_nascimento: "",
        email: "",
        telefone: "",
        cep: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
      });
    }
  }, [id]);

  if (!dadosIniciais) return <AppLayout>Carregando...</AppLayout>;

  const onSalvar = (dados) => {
    return id
      ? assistidoService.atualizar(id, dados)
      : assistidoService.criar(dados);
  };

  return (
    <AppLayout>
      <FormularioPessoa
        titulo={
          id ? "Editar pessoa assistida" : "Novo cadastro • pessoas assistidas"
        }
        rotaVoltar="/assistidos"
        dadosIniciais={dadosIniciais}
        onSalvar={onSalvar}
        camposOpcionais={["cpf", "email"]}
      />
    </AppLayout>
  );
}