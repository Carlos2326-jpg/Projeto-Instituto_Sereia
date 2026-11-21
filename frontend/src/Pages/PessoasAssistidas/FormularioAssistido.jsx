import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "../../Components/layout/AppLayout";
import { FormularioPessoa } from "../../Components/layout/FormularioPessoa";
import { voluntarioService } from "../../Services/voluntariosService";

export default function FormularioVoluntario() {
  const { id } = useParams();
  const [dadosIniciais, setDadosIniciais] = useState(null);

  useEffect(() => {
    if (id) {
      voluntarioService.buscarPorId(id).then(setDadosIniciais);
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
      ? voluntarioService.atualizar(id, dados)
      : voluntarioService.criar(dados);
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
        camposOpcionais={["cpf", "email"]} // A grande diferença!
      />
    </AppLayout>
  );
}
