import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { buscarPagamento, mpConfigurado } from "@/lib/mercadopago";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Aviso do Mercado Pago. Não confiamos no corpo: buscamos o pagamento na API do MP
 * pelo id e só então atualizamos o pedido (external_reference = id do pedido).
 */
export async function POST(req: NextRequest) {
  if (!mpConfigurado()) return NextResponse.json({ ok: false }, { status: 503 });
  const url = req.nextUrl;
  let corpo: { type?: string; action?: string; data?: { id?: string | number } } = {};
  try { corpo = await req.json(); } catch {}
  const tipo = corpo.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const id = String(corpo.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "");
  if (tipo !== "payment" || !/^\d+$/.test(id)) return NextResponse.json({ ignorado: true });

  const pg = await buscarPagamento(id);
  if (!pg.external_reference) return NextResponse.json({ ignorado: true });

  const sb = createAdminClient()!;
  const { data: ped } = await sb.from("pedidos").select("id, status, total").eq("id", pg.external_reference).maybeSingle();
  if (!ped) return NextResponse.json({ ignorado: true });

  const forma = pg.payment_type_id === "bank_transfer" ? "pix"
    : pg.payment_type_id === "credit_card" || pg.payment_type_id === "debit_card" ? "cartao" : "mercado_pago";
  const mudanca: Record<string, unknown> = { mp_payment_id: String(pg.id), mp_status: pg.status };

  const pagoCerto = pg.status === "approved" && Number(pg.transaction_amount) + 0.01 >= Number(ped.total ?? 0);
  if (pagoCerto && (ped.status === "aguardando_pagamento" || ped.status === "orcamento")) {
    Object.assign(mudanca, { status: "em_producao", pago_em: pg.date_approved ?? new Date().toISOString(), forma_pagamento: forma });
  }
  const { error } = await sb.from("pedidos").update(mudanca).eq("id", ped.id);
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 }); // MP tenta de novo

  revalidatePath("/admin");
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}

export const GET = () => NextResponse.json({ ok: true });
