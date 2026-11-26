import { requireAdmin } from "@/lib/admin";
import { Topo } from "@/components/admin/ui";
import FormProduto from "@/components/admin/FormProduto";
import { salvarProduto } from "../actions";

export default async function NovoProduto() {
  const sb = await requireAdmin();
  const { data: categorias } = await sb.from("categorias").select("slug, nome").order("ordem");
  const { data: materiais } = await sb.from("materiais").select("id, nome").not("largura_cm", "is", null).neq("material", "Caixas de envio").order("nome");
  const { data: caixas } = await sb.from("materiais").select("id, nome").eq("material", "Caixas de envio").order("nome");
  return (
    <>
      <Topo titulo="Novo produto" voltar="/admin/produtos" />
      <p className="mb-4 text-sm text-[var(--soft)]">As fotos entram depois de criar o produto.</p>
      <FormProduto acao={salvarProduto} categorias={categorias ?? []} materiais={materiais ?? []} caixas={caixas ?? []} />
    </>
  );
}
