import { requireAdmin } from "@/lib/admin";
import { ORIGENS } from "@/lib/pedidos";
import { Topo, btn, campo, cartao, rotulo } from "@/components/admin/ui";
import { criarEncomenda } from "../actions";

export default async function NovaEncomenda({ searchParams }: { searchParams: Promise<{ cliente?: string }> }) {
  const { cliente } = await searchParams;
  const sb = await requireAdmin();
  const { data: clientes } = await sb.from("clientes").select("id, nome, whatsapp").order("nome").limit(500);

  return (
    <>
      <Topo titulo="Nova encomenda" voltar="/admin/pedidos" />
      <form action={criarEncomenda} className={`${cartao} flex flex-col gap-4 max-w-2xl`}>
        <label className={rotulo}>
          Cliente já cadastrado
          <select name="cliente_id" className={campo} defaultValue={cliente ?? ""}>
            <option value="">— Cliente novo (preencha abaixo) —</option>
            {clientes?.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}{c.whatsapp ? ` · ${c.whatsapp}` : ""}</option>
            ))}
          </select>
        </label>
        <div className="grid gap-3 md:grid-cols-3">
          <label className={rotulo}>Nome do cliente novo<input name="nome" className={campo} /></label>
          <label className={rotulo}>WhatsApp (com DDD)<input name="whatsapp" className={campo} inputMode="tel" /></label>
          <label className={rotulo}>Cidade<input name="cidade" className={campo} /></label>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className={rotulo}>
            Onde o pedido chegou
            <select name="origem" className={campo} defaultValue="whatsapp">
              {ORIGENS.map((o) => <option key={o.v} value={o.v}>{o.nome}</option>)}
            </select>
          </label>
          <label className={rotulo}>Nº da venda no Mercado Livre (se for de lá)<input name="ml_order_id" className={campo} /></label>
        </div>
        <label className={rotulo}>O que o cliente pediu<textarea name="observacoes" rows={3} className={`${campo} py-2`} /></label>
        <div><button className={btn} type="submit">Criar e adicionar itens →</button></div>
      </form>
    </>
  );
}
