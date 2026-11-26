import { NextResponse, type NextRequest } from "next/server";
import { criarPreferencia, mpConfigurado } from "@/lib/mercadopago";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID = /^[0-9a-f-]{36}$/i;

/** Gera o link de pagamento do Mercado Pago na hora e manda o cliente para lá. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params;
  const t = req.nextUrl.searchParams.get("t") ?? "";
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin;
  const voltar = `${site}/pedido/${numero}?t=${t}`;
  const wa = process.env.NEXT_PUBLIC_WHATSAPP ?? "5573988062663";

  if (!/^\d+$/.test(numero) || !UUID.test(t)) return NextResponse.redirect(`${site}/`);
  if (!mpConfigurado()) {
    return NextResponse.redirect(`https://wa.me/${wa}?text=${encodeURIComponent(`Olá! Quero pagar o pedido #${numero}.`)}`);
  }

  const sb = createAdminClient()!;
  const { data: p } = await sb
    .from("pedidos")
    .select("id, numero, status, total, clientes(nome, email)")
    .eq("numero", Number(numero)).eq("token_acompanhamento", t).maybeSingle();
  if (!p || p.status !== "aguardando_pagamento" || !p.total || Number(p.total) <= 0) return NextResponse.redirect(voltar);

  const c = (Array.isArray(p.clientes) ? p.clientes[0] : p.clientes) as { nome?: string; email?: string } | null;
  try {
    const pref = await criarPreferencia({ pedidoId: p.id, numero: p.numero, total: Number(p.total), voltar, site, nome: c?.nome, email: c?.email });
    await sb.from("pedidos").update({ mp_preference_id: pref.id }).eq("id", p.id);
    return NextResponse.redirect(pref.init_point, 303);
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(`${voltar}&erro=pagamento`);
  }
}
