import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { formatBRL } from "@/lib/format";
import { STATUS_PEDIDO, nomeOrigem } from "@/lib/pedidos";
import { Status, Topo, Vazio, btn, dataBR } from "@/components/admin/ui";

export default async function Pedidos({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status, q } = await searchParams;
  const sb = await requireAdmin();

  let consulta = sb
    .from("pedidos")
    .select("id, numero, status, total, origem, created_at, prazo_entrega, clientes(nome, whatsapp)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status === "abertos") consulta = consulta.in("status", ["orcamento", "aguardando_pagamento", "em_producao", "enviado"]);
  else if (status) consulta = consulta.eq("status", status);
  if (q && /^\d+$/.test(q)) consulta = consulta.eq("numero", Number(q));
  const { data: pedidos, error } = await consulta;

  const filtro = status ?? "";
  const abas = [{ v: "abertos", nome: "Em aberto" }, ...STATUS_PEDIDO, { v: "", nome: "Todos" }];

  return (
    <>
      <Topo titulo="Pedidos">
        <Link href="/admin/pedidos/novo" className={btn}>+ Encomenda manual</Link>
      </Topo>

      <div className="mb-4 flex flex-wrap gap-2">
        {abas.map((a) => (
          <Link
            key={a.v || "todos"}
            href={a.v ? `/admin/pedidos?status=${a.v}` : "/admin/pedidos"}
            className="rounded-full border-[1.5px] px-3 py-1.5 text-sm"
            style={filtro === a.v ? { background: "var(--teal)", color: "#fff", borderColor: "var(--teal)" } : { borderColor: "var(--line)", background: "var(--card)" }}
          >
            {a.nome}
          </Link>
        ))}
        <form className="ml-auto">
          {status && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={q} placeholder="Nº do pedido" inputMode="numeric"
            className="min-h-10 w-36 rounded-xl border-[1.5px] border-[var(--line)] bg-[var(--card)] px-3" />
        </form>
      </div>

      {error && <Vazio>Erro ao carregar: {error.message}</Vazio>}
      {!pedidos?.length ? (
        <Vazio>Nenhum pedido aqui ainda.</Vazio>
      ) : (
        <ul className="flex flex-col gap-2">
          {pedidos.map((p) => {
            const c = (Array.isArray(p.clientes) ? p.clientes[0] : p.clientes) as { nome?: string } | null;
            return (
              <li key={p.id}>
                <Link href={`/admin/pedidos/${p.id}`}
                  className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[70px_1fr_160px_110px_120px] items-center gap-x-4 gap-y-1 rounded-xl border border-[var(--line)] bg-[var(--card)] px-4 py-3 hover:border-[var(--teal)]">
                  <b>#{p.numero}</b>
                  <span className="truncate">{c?.nome ?? "—"}<span className="ml-2 text-xs text-[var(--soft)]">{nomeOrigem(p.origem)}</span></span>
                  <span className="justify-self-end md:justify-self-start"><Status s={p.status} /></span>
                  <span className="text-sm text-[var(--soft)]">{dataBR(p.created_at)}</span>
                  <span className="tabular-nums md:text-right font-semibold">{p.total != null ? formatBRL(Number(p.total)) : "a orçar"}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
