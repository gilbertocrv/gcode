"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, txt, num, int, soDigitos } from "@/lib/admin";
import { STATUS_PEDIDO } from "@/lib/pedidos";

const caminho = (id: string) => `/admin/pedidos/${id}`;

export async function criarEncomenda(form: FormData) {
  const sb = await requireAdmin();
  let clienteId = txt(form, "cliente_id");

  if (!clienteId) {
    const nome = txt(form, "nome");
    if (!nome) throw new Error("Informe o cliente.");
    const whatsapp = soDigitos(txt(form, "whatsapp"));
    if (whatsapp) {
      const { data: existe } = await sb.from("clientes").select("id").eq("whatsapp", whatsapp).maybeSingle();
      clienteId = existe?.id ?? null;
    }
    if (!clienteId) {
      const { data, error } = await sb
        .from("clientes")
        .insert({ nome, whatsapp, origem: txt(form, "origem") ?? "whatsapp", cidade: txt(form, "cidade") })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      clienteId = data.id;
    }
  }

  const { data, error } = await sb
    .from("pedidos")
    .insert({
      cliente_id: clienteId,
      origem: txt(form, "origem") ?? "whatsapp",
      encomenda_manual: true,
      status: "orcamento",
      ml_order_id: txt(form, "ml_order_id"),
      observacoes: txt(form, "observacoes"),
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/pedidos");
  redirect(caminho(data.id));
}

export async function adicionarItem(form: FormData) {
  const sb = await requireAdmin();
  const pedidoId = txt(form, "pedido_id")!;
  const produtoId = txt(form, "produto_id");
  const quantidade = Math.max(1, int(form, "quantidade") ?? 1);
  let descricao = txt(form, "descricao");
  let preco = num(form, "preco_unitario");

  if (produtoId) {
    const { data: p } = await sb.from("produtos").select("titulo, preco, preco_a_partir_de").eq("id", produtoId).single();
    descricao = descricao ?? p?.titulo ?? "Item";
    if (preco == null && p && !p.preco_a_partir_de) preco = p.preco;
  }
  if (!descricao) throw new Error("Descreva o item.");

  const personal = txt(form, "personalizacao");
  const { error } = await sb.from("itens_pedido").insert({
    pedido_id: pedidoId,
    produto_id: produtoId,
    descricao,
    quantidade,
    preco_unitario: preco,
    personalizacao: personal ? { nota: personal } : {},
  });
  if (error) throw new Error(error.message);
  revalidatePath(caminho(pedidoId));
}

export async function atualizarItem(form: FormData) {
  const sb = await requireAdmin();
  const pedidoId = txt(form, "pedido_id")!;
  const { error } = await sb
    .from("itens_pedido")
    .update({ quantidade: Math.max(1, int(form, "quantidade") ?? 1), preco_unitario: num(form, "preco_unitario") })
    .eq("id", txt(form, "item_id")!);
  if (error) throw new Error(error.message);
  revalidatePath(caminho(pedidoId));
}

export async function removerItem(form: FormData) {
  const sb = await requireAdmin();
  const pedidoId = txt(form, "pedido_id")!;
  const { error } = await sb.from("itens_pedido").delete().eq("id", txt(form, "item_id")!);
  if (error) throw new Error(error.message);
  revalidatePath(caminho(pedidoId));
}

export async function salvarPedido(form: FormData) {
  const sb = await requireAdmin();
  const id = txt(form, "pedido_id")!;
  const { error } = await sb
    .from("pedidos")
    .update({
      frete: num(form, "frete") ?? 0,
      desconto: num(form, "desconto") ?? 0,
      forma_pagamento: txt(form, "forma_pagamento"),
      prazo_entrega: txt(form, "prazo_entrega"),
      codigo_rastreio: txt(form, "codigo_rastreio"),
      ml_order_id: txt(form, "ml_order_id"),
      notas_internas: txt(form, "notas_internas"),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(caminho(id));
}

export async function mudarStatus(form: FormData) {
  const sb = await requireAdmin();
  const id = txt(form, "pedido_id")!;
  const status = txt(form, "status")!;
  if (!STATUS_PEDIDO.some((s) => s.v === status)) throw new Error("Status inválido.");

  const extra: Record<string, unknown> = {};
  if (status === "em_producao") {
    const { data } = await sb.from("pedidos").select("pago_em").eq("id", id).single();
    if (!data?.pago_em) extra.pago_em = new Date().toISOString();
  }
  const { error } = await sb.from("pedidos").update({ status, ...extra }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(caminho(id));
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
  revalidatePath("/"); // estoque pode ter mudado
}
