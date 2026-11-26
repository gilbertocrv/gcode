import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { Topo, btnPerigo, cartao } from "@/components/admin/ui";
import BotaoConfirmar from "@/components/admin/BotaoConfirmar";
import FormProduto from "@/components/admin/FormProduto";
import FotosProduto from "@/components/admin/FotosProduto";
import { excluirProduto, salvarProduto } from "../actions";

export default async function EditarProduto({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ novo?: string }> }) {
  const { id } = await params;
  const { novo } = await searchParams;
  const sb = await requireAdmin();
  const [{ data: p }, { data: custos }, { data: fotos }, { data: categorias }, { count: vendas }] = await Promise.all([
    sb.from("produtos").select("*").eq("id", id).maybeSingle(),
    sb.from("produto_custos").select("*").eq("produto_id", id).maybeSingle(),
    sb.from("produto_imagens").select("id, url, storage_path, ordem").eq("produto_id", id).order("ordem"),
    sb.from("categorias").select("slug, nome").order("ordem"),
    sb.from("itens_pedido").select("id", { count: "exact", head: true }).eq("produto_id", id),
  ]);
  if (!p) notFound();

  return (
    <>
      <Topo titulo={p.titulo} voltar="/admin/produtos">
        <Link href="/" target="_blank" className="text-sm underline">Ver na loja ↗</Link>
      </Topo>
      {novo && <p className="mb-4 rounded-xl bg-[var(--sel)] p-3 text-sm">Produto criado. Agora adicione as fotos.</p>}

      <section className={`${cartao} mb-5`}>
        <h2 className="text-xl mb-3">Fotos</h2>
        <FotosProduto produtoId={p.id} slug={p.slug} fotos={fotos ?? []} />
      </section>

      <FormProduto acao={salvarProduto} p={p} custos={custos ?? {}} categorias={categorias ?? []} />

      <section className={`${cartao} mt-8`}>
        <h2 className="text-lg mb-1">Excluir produto</h2>
        <p className="text-sm text-[var(--soft)] mb-3">
          {vendas ? `Este produto aparece em ${vendas} pedido(s); os pedidos continuam com a descrição. ` : ""}
          Para só esconder da loja, mude a situação para “Inativo”.
        </p>
        <form action={excluirProduto}>
          <input type="hidden" name="id" value={p.id} />
          <BotaoConfirmar className={btnPerigo} msg="Excluir este produto e as fotos dele? Não dá para desfazer.">Excluir de vez</BotaoConfirmar>
        </form>
      </section>
    </>
  );
}
