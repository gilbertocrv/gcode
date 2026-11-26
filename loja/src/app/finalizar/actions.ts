"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

export type FinalizarState = { erro?: string };

export async function finalizarPedido(_prev: FinalizarState, form: FormData): Promise<FinalizarState> {
  const g = (k: string) => String(form.get(k) ?? "").trim();
  let itens: { produto_id: string; quantidade: number; personalizacao?: Record<string, string> }[] = [];
  try { itens = JSON.parse(g("itens")); } catch {}
  if (!itens.length) return { erro: "Seu pedido está vazio." };
  if (form.get("lgpd") !== "on") return { erro: "Marque que concorda com o uso dos seus dados para o pedido." };

  const { data, error } = await createPublicClient().rpc("criar_pedido", {
    p_cliente: { nome: g("nome"), whatsapp: g("whatsapp"), email: g("email"), cidade: g("cidade"), uf: g("uf") },
    p_itens: itens,
    p_observacoes: g("observacoes") || null,
    p_aceite_lgpd: true,
  });
  if (error) return { erro: error.message.replace(/^.*?:\s*/, "") || "Não foi possível registrar o pedido." };

  const r = data as { numero: number; token: string; status: string; total: number | null };
  revalidatePath("/admin");
  if (r.status === "aguardando_pagamento") redirect(`/pedido/${r.numero}/pagar?t=${r.token}`);
  redirect(`/pedido/${r.numero}?t=${r.token}&novo=1`);
}
