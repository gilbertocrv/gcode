import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { formatBRL } from "@/lib/format";
import { Status, Topo, btn, btnPerigo, cartao, dataBR } from "@/components/admin/ui";
import FormCliente from "@/components/admin/FormCliente";
import BotaoConfirmar from "@/components/admin/BotaoConfirmar";
import { excluirCliente, salvarCliente } from "../actions";

export default async function Cliente({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await requireAdmin();
  const [{ data: c }, { data: pedidos }] = await Promise.all([
    sb.from("clientes").select("*").eq("id", id).maybeSingle(),
    sb.from("pedidos").select("id, numero, status, total, created_at").eq("cliente_id", id).order("created_at", { ascending: false }),
  ]);
  if (!c) notFound();
  const gasto = (pedidos ?? []).filter((p) => p.status === "concluido").reduce((s, p) => s + Number(p.total ?? 0), 0);
  const wa = c.whatsapp ? `https://wa.me/${c.whatsapp.length <= 11 ? "55" + c.whatsapp : c.whatsapp}` : null;

  return (
    <>
      <Topo titulo={c.nome} voltar="/admin/clientes">
        {wa && <a href={wa} target="_blank" rel="noopener" className={btn}>WhatsApp</a>}
      </Topo>
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-5">
          <FormCliente acao={salvarCliente} c={c} />
          {c.aceite_lgpd_em && <p className="text-sm text-[var(--soft)]">Aceitou guardar os dados (LGPD) em {dataBR(c.aceite_lgpd_em)}.</p>}
          <section className={cartao}>
            <h2 className="text-lg mb-1">Excluir cliente</h2>
            <p className="text-sm text-[var(--soft)] mb-3">Os pedidos continuam no sistema, sem o nome do cliente. Use quando ele pedir a exclusão dos dados (LGPD).</p>
            <form action={excluirCliente}>
              <input type="hidden" name="id" value={c.id} />
              <BotaoConfirmar className={btnPerigo} msg="Excluir os dados deste cliente?">Excluir dados</BotaoConfirmar>
            </form>
          </section>
        </div>
        <aside className={cartao}>
          <h2 className="text-lg">Pedidos</h2>
          <p className="text-sm text-[var(--soft)] mb-3">Total concluído: <b>{formatBRL(gasto)}</b></p>
          <ul className="flex flex-col gap-2">
            {pedidos?.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/pedidos/${p.id}`} className="flex items-center gap-2 text-sm hover:underline">
                  <b>#{p.numero}</b> <Status s={p.status} />
                  <span className="ml-auto">{p.total != null ? formatBRL(Number(p.total)) : "a orçar"}</span>
                </Link>
                <span className="text-xs text-[var(--soft)]">{dataBR(p.created_at)}</span>
              </li>
            ))}
            {!pedidos?.length && <li className="text-sm text-[var(--soft)]">Nenhum pedido.</li>}
          </ul>
          <Link href={`/admin/pedidos/novo?cliente=${c.id}`} className="mt-3 inline-block text-sm underline">+ Nova encomenda para este cliente</Link>
        </aside>
      </div>
    </>
  );
}
