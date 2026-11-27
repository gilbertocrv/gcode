import { requireAdmin } from "@/lib/admin";
import { formatBRL } from "@/lib/format";
import { PAGAMENTOS } from "@/lib/pedidos";
import { Topo, cartao } from "@/components/admin/ui";
import Caixa from "./Caixa";
import { registrarVenda } from "./actions";

export const dynamic = "force-dynamic";

export default async function Balcao({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const sb = await requireAdmin();
  const { ok } = await searchParams;
  // início do dia no horário da Bahia (UTC-3)
  const br = new Date(Date.now() - 3 * 3600_000);
  const inicio = new Date(Date.UTC(br.getUTCFullYear(), br.getUTCMonth(), br.getUTCDate(), 3)).toISOString();

  const [{ data: prods }, { data: vendas }] = await Promise.all([
    sb
      .from("produtos")
      .select("id, titulo, preco, controla_estoque, estoque, marca, compatibilidade, categoria, codigo, ean")
      .neq("status", "inativo")
      .not("preco", "is", null)
      .order("titulo"),
    sb.from("pedidos").select("id, numero, total, forma_pagamento, created_at").eq("origem", "balcao").eq("status", "concluido").gte("created_at", inicio).order("created_at", { ascending: false }),
  ]);

  const porPag = new Map<string, number>();
  for (const v of vendas ?? []) porPag.set(v.forma_pagamento ?? "outro", (porPag.get(v.forma_pagamento ?? "outro") ?? 0) + Number(v.total ?? 0));
  const totalDia = [...porPag.values()].reduce((s, n) => s + n, 0);

  return (
    <>
      <Topo titulo="Venda no balcão" />
      {ok && (
        <p className="mb-4 rounded-xl bg-[#E7F6EC] text-[#1E7A46] px-4 py-3 font-semibold">
          Venda #{ok} registrada. O estoque já foi atualizado.
        </p>
      )}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Caixa
          acao={registrarVenda}
          produtos={(prods ?? []).map((p) => ({ ...p, preco: Number(p.preco) }))}
          pagamentos={PAGAMENTOS.filter((p) => ["dinheiro", "pix", "cartao"].includes(p.v)).map((p) => ({ v: p.v, nome: p.nome }))}
        />
        <aside className={cartao}>
          <h2 className="text-lg mb-2">Hoje no balcão</h2>
          <p className="text-3xl font-bold">{formatBRL(totalDia)}</p>
          <p className="text-sm text-[var(--soft)] mb-3">
            {vendas?.length ?? 0} {vendas?.length === 1 ? "venda" : "vendas"}
          </p>
          <ul className="text-sm flex flex-col gap-1 mb-4">
            {[...porPag].map(([k, v]) => (
              <li key={k} className="flex justify-between">
                <span>{PAGAMENTOS.find((p) => p.v === k)?.nome ?? k}</span>
                <b>{formatBRL(v)}</b>
              </li>
            ))}
          </ul>
          <ul className="text-sm flex flex-col gap-1 text-[var(--soft)]">
            {(vendas ?? []).slice(0, 10).map((v) => (
              <li key={v.numero} className="flex justify-between">
                <a className="hover:underline" href={`/admin/pedidos/${v.id}`}>#{v.numero}</a>
                <span>{new Date(v.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Bahia" })}</span>
                <span>{formatBRL(Number(v.total ?? 0))}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}
