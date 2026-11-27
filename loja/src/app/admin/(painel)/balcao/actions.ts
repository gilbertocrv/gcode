"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, txt, num } from "@/lib/admin";

type Linha = { produto_id: string | null; descricao: string; quantidade: number; preco: number };

/** Venda de balcão: cria o pedido já pago e concluído (o banco dá baixa no estoque). */
export async function registrarVenda(form: FormData) {
  const sb = await requireAdmin();
  let linhas: Linha[] = [];
  try {
    linhas = JSON.parse(String(form.get("itens") ?? "[]"));
  } catch {}
  linhas = linhas.filter((l) => l.quantidade > 0 && l.descricao && Number.isFinite(l.preco) && l.preco >= 0);
  if (!linhas.length) throw new Error("Adicione pelo menos um item.");

  // confere estoque dos produtos controlados
  const ids = linhas.map((l) => l.produto_id).filter(Boolean) as string[];
  if (ids.length) {
    const { data: prods } = await sb.from("produtos").select("id, titulo, controla_estoque, estoque").in("id", ids);
    for (const p of prods ?? []) {
      const qtd = linhas.filter((l) => l.produto_id === p.id).reduce((s, l) => s + l.quantidade, 0);
      if (p.controla_estoque && p.estoque < qtd) throw new Error(`Estoque insuficiente de “${p.titulo}” (tem ${p.estoque}).`);
    }
  }

  const pagamento = txt(form, "pagamento") ?? "dinheiro";
  const { data: ped, error } = await sb
    .from("pedidos")
    .insert({
      origem: "balcao",
      encomenda_manual: true,
      status: "orcamento",
      entrega: "retirada",
      forma_pagamento: pagamento,
      observacoes: txt(form, "obs"),
    })
    .select("id, numero")
    .single();
  if (error) throw new Error(error.message);

  const { error: e2 } = await sb.from("itens_pedido").insert(
    linhas.map((l) => ({
      pedido_id: ped.id,
      produto_id: l.produto_id,
      descricao: l.descricao,
      quantidade: l.quantidade,
      preco_unitario: l.preco,
      subtotal: Math.round(l.quantidade * l.preco * 100) / 100,
    })),
  );
  if (e2) throw new Error(e2.message);

  const desconto = num(form, "desconto") ?? 0;
  const { error: e3 } = await sb
    .from("pedidos")
    .update({ desconto, status: "concluido", pago_em: new Date().toISOString() })
    .eq("id", ped.id);
  if (e3) throw new Error(e3.message);

  revalidatePath("/admin/balcao");
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/produtos");
  revalidatePath("/", "layout");
  redirect(`/admin/balcao?ok=${ped.numero}`);
}
