import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { fotoUrl, precoTexto, STATUS_LABEL } from "@/lib/format";
import type { ProdutoImagem } from "@/lib/types";
import { Topo, Vazio, btn } from "@/components/admin/ui";

export default async function Produtos({ searchParams }: { searchParams: Promise<{ cat?: string; q?: string }> }) {
  const { cat, q } = await searchParams;
  const sb = await requireAdmin();
  const { data: categorias } = await sb.from("categorias").select("slug, nome").order("ordem");
  let consulta = sb
    .from("produtos")
    .select("id, titulo, preco, preco_a_partir_de, status, controla_estoque, estoque, estoque_minimo, categoria, ml_url, produto_imagens(url, storage_path, alt, ordem)")
    .order("categoria").order("ordem");
  if (cat) consulta = consulta.eq("categoria", cat);
  if (q) consulta = consulta.ilike("titulo", `%${q}%`);
  const { data: produtos } = await consulta;

  return (
    <>
      <Topo titulo={`Produtos (${produtos?.length ?? 0})`}>
        <Link href="/admin/produtos/novo" className={btn}>+ Novo produto</Link>
      </Topo>
      <form className="mb-4 flex flex-wrap gap-2">
        <select name="cat" defaultValue={cat ?? ""} className="min-h-10 rounded-xl border-[1.5px] border-[var(--line)] bg-[var(--card)] px-3">
          <option value="">Todas as categorias</option>
          {categorias?.map((c) => <option key={c.slug} value={c.slug}>{c.nome}</option>)}
        </select>
        <input name="q" defaultValue={q} placeholder="Buscar pelo nome" className="min-h-10 flex-1 min-w-40 rounded-xl border-[1.5px] border-[var(--line)] bg-[var(--card)] px-3" />
        <button className="min-h-10 rounded-xl bg-[var(--sel)] px-4 font-semibold cursor-pointer">Filtrar</button>
      </form>
      {!produtos?.length ? <Vazio>Nenhum produto encontrado.</Vazio> : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {produtos.map((p) => {
            const capa = fotoUrl([...(p.produto_imagens as ProdutoImagem[])].sort((a, b) => a.ordem - b.ordem)[0]);
            const baixo = p.controla_estoque && p.estoque <= p.estoque_minimo && p.status !== "inativo";
            return (
              <li key={p.id}>
                <Link href={`/admin/produtos/${p.id}`} className="flex gap-3 rounded-xl border border-[var(--line)] bg-[var(--card)] p-2.5 hover:border-[var(--teal)]" style={p.status === "inativo" ? { opacity: 0.55 } : undefined}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {capa ? <img src={capa} alt="" className="size-20 shrink-0 rounded-lg object-cover" /> : <div className="size-20 shrink-0 rounded-lg bg-[var(--sel)]" />}
                  <div className="min-w-0 flex flex-col gap-0.5">
                    <b className="leading-tight line-clamp-2">{p.titulo}</b>
                    <span className="text-sm">{precoTexto(p)}</span>
                    <span className="text-xs text-[var(--soft)]">
                      {STATUS_LABEL[p.status as keyof typeof STATUS_LABEL]}
                      {p.controla_estoque && <> · estoque <b style={baixo ? { color: "var(--coral)" } : undefined}>{p.estoque}</b></>}
                      {p.ml_url && " · ML"}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
