import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { Topo, btnPerigo, cartao } from "@/components/admin/ui";
import BotaoConfirmar from "@/components/admin/BotaoConfirmar";
import FormProduto from "@/components/admin/FormProduto";
import FotosProduto from "@/components/admin/FotosProduto";
import { excluirProduto, salvarProduto } from "../actions";
import Compartilhar from "@/components/Compartilhar";
import { fotoUrl, formatBRL } from "@/lib/format";
import { btn2 } from "@/components/admin/ui";

export default async function EditarProduto({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ novo?: string }> }) {
  const { id } = await params;
  const { novo } = await searchParams;
  const sb = await requireAdmin();
  const [{ data: p }, { data: custos }, { data: fotos }, { data: categorias }, { count: vendas }, { data: materiais }, { data: caixas }] = await Promise.all([
    sb.from("produtos").select("*").eq("id", id).maybeSingle(),
    sb.from("produto_custos").select("*").eq("produto_id", id).maybeSingle(),
    sb.from("produto_imagens").select("id, url, storage_path, ordem").eq("produto_id", id).order("ordem"),
    sb.from("categorias").select("slug, nome").order("ordem"),
    sb.from("itens_pedido").select("id", { count: "exact", head: true }).eq("produto_id", id),
    sb.from("materiais").select("id, nome").not("largura_cm", "is", null).neq("material", "Caixas de envio").order("nome"),
    sb.from("materiais").select("id, nome").eq("material", "Caixas de envio").order("nome"),
  ]);
  if (!p) notFound();

  return (
    <>
      <Topo titulo={p.titulo} voltar="/admin/produtos">
        <Link href="/" target="_blank" className="text-sm underline">Ver na loja ↗</Link>
      </Topo>
      {novo && <p className="mb-4 rounded-xl bg-[var(--sel)] p-3 text-sm">Produto criado. Agora adicione as fotos.</p>}

      <section className={`${cartao} mb-5 flex flex-wrap items-center gap-3`}>
        <div className="flex-1 min-w-[220px]">
          <h2 className="text-lg">Divulgar</h2>
          <p className="text-sm text-[var(--soft)]">No celular, abre o Instagram (story ou feed) com a foto; a legenda com preço e link fica copiada para colar.</p>
        </div>
        <Compartilhar
          className={btn2}
          rotulo="Compartilhar no Instagram"
          url={`https://gcodecaravelas.com.br/p/${p.codigo}`}
          titulo={p.titulo}
          imagem={fotoUrl((fotos ?? [])[0] as never)}
          texto={[
            `✨ ${p.titulo}`,
            p.preco != null ? `💰 ${p.preco_a_partir_de ? "a partir de " : ""}${formatBRL(Number(p.preco))}` : null,
            p.compatibilidade ? `📌 ${p.compatibilidade}` : null,
            "🛒 Compre no site (link na bio) ou chame no WhatsApp (73) 98806-2663",
            "📍 Caravelas - BA · enviamos para todo o Brasil",
            "#gcodecaravelas #caravelas",
          ].filter(Boolean).join("\n")}
        />
      </section>

      <section className={`${cartao} mb-5`}>
        <h2 className="text-xl mb-3">Fotos</h2>
        <FotosProduto produtoId={p.id} slug={p.slug} fotos={fotos ?? []} />
      </section>

      <FormProduto acao={salvarProduto} p={p} custos={custos ?? {}} categorias={categorias ?? []} materiais={materiais ?? []} caixas={caixas ?? []} />

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
