import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import { formatBRL } from "@/lib/format";
import { STATUS_PEDIDO, COR_STATUS } from "@/lib/pedidos";

export const dynamic = "force-dynamic";
export const metadata = { title: "Seu pedido · G-Code", robots: { index: false } };

type Consulta = {
  numero: number; status: string; total: number | null; prazo_entrega: string | null;
  subtotal?: number | null; frete?: number | null; entrega?: string; frete_servico?: string | null; frete_prazo_dias?: number | null;
  codigo_rastreio: string | null; criado_em: string; itens: { descricao: string; quantidade: number }[] | null;
};

const ETAPAS = ["orcamento", "aguardando_pagamento", "em_producao", "enviado", "concluido"];
const UUID = /^[0-9a-f-]{36}$/i;

export default async function AcompanharPedido({ params, searchParams }: { params: Promise<{ numero: string }>; searchParams: Promise<{ t?: string; novo?: string; erro?: string; collection_status?: string; status?: string }> }) {
  const { numero } = await params;
  const { t, novo, erro, collection_status, status: mpStatus } = await searchParams;
  const retorno = collection_status ?? mpStatus;
  let p: Consulta | null = null;
  if (/^\d+$/.test(numero) && t && UUID.test(t)) {
    const { data } = await createPublicClient().rpc("consultar_pedido", { p_numero: Number(numero), p_token: t });
    p = data as Consulta | null;
  }
  const wa = process.env.NEXT_PUBLIC_WHATSAPP ?? "5573988062663";

  return (
    <main className="min-h-dvh p-5" style={{ background: "var(--bg)" }}>
      <div className="mx-auto max-w-lg">
        <Link href="/">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/logo.svg" alt="G-Code" className="h-10 w-auto rounded-md mb-6" /></Link>
        {!p ? (
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6">
            <h1 className="text-2xl mb-2">Pedido não encontrado</h1>
            <p className="text-[var(--soft)]">Confira se abriu o link completo que enviamos. Se precisar, fale com a gente.</p>
            <a href={`https://wa.me/${wa}`} className="btn wa mt-4 inline-flex">Falar no WhatsApp</a>
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6">
            <h1 className="text-2xl">Pedido #{p.numero}</h1>
            {novo && <p className="mb-4 rounded-xl bg-[var(--sel)] p-3 text-sm"><b>Pedido recebido!</b> Guarde este link. Vamos conferir os detalhes e mandar o valor final pelo WhatsApp.</p>}
            {retorno === "approved" && p.status === "aguardando_pagamento" && <p className="mb-4 rounded-xl bg-[var(--sel)] p-3 text-sm"><b>Pagamento aprovado!</b> Em instantes o pedido aparece como “Em produção”.</p>}
            {(retorno === "pending" || retorno === "in_process") && <p className="mb-4 rounded-xl bg-[var(--sel)] p-3 text-sm">Pagamento em análise. Avisamos quando for confirmado.</p>}
            {(retorno === "rejected" || erro === "pagamento") && <p className="mb-4 rounded-xl p-3 text-sm font-semibold text-white" style={{ background: "var(--coral)" }}>O pagamento não foi concluído. Tente de novo ou fale com a gente.</p>}
            <p className="text-sm text-[var(--soft)] mb-5">Feito em {new Date(p.criado_em).toLocaleDateString("pt-BR", { timeZone: "America/Bahia" })}</p>

            {p.status === "cancelado" ? (
              <p className="mb-5 rounded-xl p-3 font-semibold text-white" style={{ background: COR_STATUS.cancelado }}>Este pedido foi cancelado.</p>
            ) : (
              <ol className="mb-6 flex flex-col gap-0">
                {ETAPAS.map((e, i) => {
                  const atual = ETAPAS.indexOf(p!.status);
                  const feito = i <= atual;
                  return (
                    <li key={e} className="flex items-center gap-3 py-1.5">
                      <span className="grid size-7 place-items-center rounded-full text-xs font-bold"
                        style={feito ? { background: "var(--teal)", color: "#fff" } : { border: "2px solid var(--line)", color: "var(--soft)" }}>
                        {feito ? "✓" : i + 1}
                      </span>
                      <span style={i === atual ? { fontWeight: 700 } : { color: feito ? "var(--ink)" : "var(--soft)" }}>
                        {STATUS_PEDIDO.find((s) => s.v === e)?.nome}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}

            <h2 className="text-lg mb-2">Itens</h2>
            <ul className="mb-4 flex flex-col gap-1">
              {p.itens?.map((i, k) => <li key={k}>{i.quantidade}× {i.descricao}</li>)}
            </ul>
            {p.entrega === "envio" && <p className="text-sm">Frete ({p.frete_servico}{p.frete_prazo_dias ? `, até ${p.frete_prazo_dias} dias úteis após a postagem` : ""}): {formatBRL(Number(p.frete ?? 0))}</p>}
            {p.entrega === "retirada" && <p className="text-sm">Retirada na loja.</p>}
            {p.entrega === "combinar" && <p className="text-sm">Entrega a combinar pelo WhatsApp.</p>}
            {p.total != null && <p className="text-xl font-bold mb-3 mt-1">Total {formatBRL(Number(p.total))}</p>}
            {p.status === "aguardando_pagamento" && Number(p.total) > 0 && (
              <a href={`/pedido/${p.numero}/pagar?t=${t}`} className="btn wa mb-4 inline-flex">Pagar com Pix ou cartão</a>
            )}
            {p.prazo_entrega && <p>Previsão de entrega: <b>{new Date(p.prazo_entrega + "T12:00:00").toLocaleDateString("pt-BR")}</b></p>}
            {p.codigo_rastreio && (
              <p className="mt-1">Rastreio: <a className="underline font-semibold" href={`https://www.melhorrastreio.com.br/rastreio/${encodeURIComponent(p.codigo_rastreio)}`} target="_blank" rel="noopener">{p.codigo_rastreio}</a></p>
            )}
            <a href={`https://wa.me/${wa}?text=${encodeURIComponent(`Olá! Sobre o meu pedido #${p.numero}…`)}`} className="btn wa mt-6 inline-flex">Dúvidas? Fale no WhatsApp</a>
          </div>
        )}
      </div>
    </main>
  );
}
