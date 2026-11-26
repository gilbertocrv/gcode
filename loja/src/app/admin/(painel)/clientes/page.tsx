import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { nomeOrigem } from "@/lib/pedidos";
import { Topo, Vazio } from "@/components/admin/ui";
import FormCliente from "@/components/admin/FormCliente";
import { salvarCliente } from "./actions";

export default async function Clientes({ searchParams }: { searchParams: Promise<{ q?: string; novo?: string }> }) {
  const { q, novo } = await searchParams;
  const sb = await requireAdmin();
  let consulta = sb.from("clientes").select("id, nome, whatsapp, cidade, origem, pedidos(count)").order("nome").limit(300);
  if (q) {
    const d = q.replace(/\D/g, "");
    consulta = d.length >= 4 ? consulta.ilike("whatsapp", `%${d}%`) : consulta.ilike("nome", `%${q}%`);
  }
  const { data: clientes } = await consulta;

  return (
    <>
      <Topo titulo="Clientes">
        <Link href={novo ? "/admin/clientes" : "/admin/clientes?novo=1"} className="text-sm underline">{novo ? "Fechar" : "+ Novo cliente"}</Link>
      </Topo>
      {novo && <div className="mb-5"><FormCliente acao={salvarCliente} /></div>}
      <form className="mb-4">
        <input name="q" defaultValue={q} placeholder="Buscar por nome ou WhatsApp" className="min-h-11 w-full max-w-md rounded-xl border-[1.5px] border-[var(--line)] bg-[var(--card)] px-3" />
      </form>
      {!clientes?.length ? <Vazio>Nenhum cliente {q ? "encontrado" : "cadastrado ainda"}.</Vazio> : (
        <ul className="flex flex-col gap-2">
          {clientes.map((c) => {
            const n = (c.pedidos as unknown as { count: number }[])?.[0]?.count ?? 0;
            return (
              <li key={c.id}>
                <Link href={`/admin/clientes/${c.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-[var(--line)] bg-[var(--card)] px-4 py-3 hover:border-[var(--teal)]">
                  <b className="flex-1 min-w-40">{c.nome}</b>
                  <span className="text-sm text-[var(--soft)]">{c.whatsapp ?? "—"}</span>
                  <span className="text-sm text-[var(--soft)]">{c.cidade ?? ""}</span>
                  <span className="text-xs text-[var(--soft)]">{nomeOrigem(c.origem)}</span>
                  <span className="text-sm font-semibold">{n} pedido{n === 1 ? "" : "s"}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
