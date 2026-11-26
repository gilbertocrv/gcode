import FormSimples from "@/components/FormSimples";
import { Topo, cartao } from "@/components/admin/ui";
import { definirSenha } from "../../actions";

export default function NovaSenha() {
  return (
    <>
      <Topo titulo="Criar senha nova" />
      <div className={`${cartao} max-w-sm`}>
        <FormSimples acao={definirSenha} botao="Salvar senha" enviando="Salvando…"
          campos={[
            { name: "senha", label: "Senha nova (mín. 8 caracteres)", type: "password", autoComplete: "new-password" },
            { name: "confirmar", label: "Repita a senha", type: "password", autoComplete: "new-password" },
          ]} />
      </div>
    </>
  );
}
