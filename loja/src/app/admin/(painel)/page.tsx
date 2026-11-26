import Link from "next/link";
import { getAdmin } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/format";
import type { Dashboard } from "@/lib/types";

const STATUS_PEDIDO: Record<string, string> = {
  orcamento: "Orçamento",
  aguardando_pagamento: "Aguardando pagamento",
  em_producao: "Em produção",
  enviado: "Enviado",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

function Kpi({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <div className="rounded-2xl border p-4" style={{ background: "var(--card)", borderColor: "var(--line)" }}>
      <div className="text-sm" style={{ color: "var(--soft)" }}>{rotulo}</div>
      <div className="text-2xl font-bold tabular-nums" style={{ color: destaque ? "var(--coral)" : "var(--ink)" }}>{valor}</div>
    </div>
  );
}

export default async function Resumo() {
  const { supabase } = await getAdmin();
  const [{ data: dash }, { data: pedidos }, { data: baixo }] = await Promise.all([
    supabase.from("vw_dashboard").select("*").single<Dashboard>(),
    supabase
      .from("pedidos")
      .select("id, numero, status, total, created_at, clientes(nome)")
      .in("status", ["orcamento", "aguardando_pagamento", "em_producao", "enviado"])
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("vw_estoque_baixo").select("*"),
  ]);

  const d = dash ?? ({} as Partial<Dashboard>);
  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-3xl mb-4">Resumo</h1>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <Kpi rotulo="Vendas no mês" valor={formatBRL(Number(d.vendas_mes ?? 0))} />
          <Kpi rotulo="Pedidos pagos no mês" valor={String(d.pedidos_pagos_mes ?? 0)} />
          <Kpi rotulo="Orçamentos para responder" valor={String(d.orcamentos ?? 0)} destaque={!!d.orcamentos} />
          <Kpi rotulo="Em produção" valor={String(d.em_producao ?? 0)} />
        </div>
      </section>

      <section>
        <h2 className="text-xl mb-3">Pedidos em aberto</h2>
        {pedidos?.length ? (
          <ul className="flex flex-col gap-2">
            {pedidos.map((p) => {
              const cliente = Array.isArray(p.clientes) ? p.clientes[0] : p.clientes;
              return (
                <li key={p.id} className="rounded-xl border px-4 py-3 flex flex-wrap gap-x-4 gap-y-1 items-center"
                  style={{ background: "var(--card)", borderColor: "var(--line)" }}>
                  <b>#{p.numero}</b>
                  <span>{(cliente as { nome?: string } | null)?.nome ?? "—"}</span>
                  <span className="st">{STATUS_PEDIDO[p.status] ?? p.status}</span>
                  <span className="ml-auto tabular-nums">{p.total != null ? formatBRL(Number(p.total)) : "a orçar"}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="empty">Nenhum pedido em aberto. Os pedidos feitos na loja aparecem aqui.</p>
        )}
        <Link href="/admin/pedidos" className="mk">Ver todos os pedidos →</Link>
      </section>

      <section>
        <h2 className="text-xl mb-3">Estoque baixo</h2>
        {baixo?.length ? (
          <ul className="flex flex-col gap-2">
            {baixo.map((b: { id: string; tipo: string; nome: string; quantidade: number; minimo: number }) => (
              <li key={b.id} className="rounded-xl border px-4 py-3 flex gap-4" style={{ background: "var(--card)", borderColor: "var(--coral)" }}>
                <span className="st">{b.tipo}</span>
                <span>{b.nome}</span>
                <span className="ml-auto tabular-nums">{b.quantidade} (mínimo {b.minimo})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty">Nada para repor. Defina o estoque mínimo em produtos e materiais para ser avisado aqui.</p>
        )}
      </section>
    </div>
  );
}
