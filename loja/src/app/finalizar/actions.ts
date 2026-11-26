"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { createAdminClient } from "@/lib/supabase/admin";
import { cotar, meConfigurado } from "@/lib/melhorenvio";
import { itensDoPedido } from "@/lib/frete-itens";

export type FinalizarState = { erro?: string };

export async function finalizarPedido(_prev: FinalizarState, form: FormData): Promise<FinalizarState> {
  const g = (k: string) => String(form.get(k) ?? "").trim();
  let itens: { produto_id: string; quantidade: number; personalizacao?: Record<string, string> }[] = [];
  try { itens = JSON.parse(g("itens")); } catch {}
  if (!itens.length) return { erro: "Seu pedido está vazio." };
  if (form.get("lgpd") !== "on") return { erro: "Marque que concorda com o uso dos seus dados para o pedido." };

  const entrega = (["retirada", "envio", "combinar"].includes(g("entrega")) ? g("entrega") : "retirada") as "retirada" | "envio" | "combinar";
  const endereco = entrega === "retirada" ? null : {
    cep: g("cep").replace(/\D/g, ""), rua: g("rua"), numero: g("numero"), complemento: g("complemento") || null,
    bairro: g("bairro"), cidade: g("cidade_end"), uf: g("uf_end").toUpperCase().slice(0, 2), documento: g("documento").replace(/\D/g, "") || null,
  };
  if (endereco && (endereco.cep.length !== 8 || !endereco.rua || !endereco.numero || !endereco.cidade || !endereco.uf)) {
    return { erro: "Preencha o endereço de entrega completo (CEP, rua, número, cidade e UF)." };
  }
  if (entrega === "envio" && !g("frete_id")) return { erro: "Calcule o frete e escolha uma opção de envio." };

  // Confere o frete escolhido no servidor (o valor nunca vem do navegador)
  let frete: { id: number; nome: string; empresa: string; preco: number; prazo: number } | null = null;
  if (entrega === "envio") {
    if (!meConfigurado()) return { erro: "O cálculo de frete está indisponível. Escolha retirada ou combinar pelo WhatsApp." };
    try {
      const opcoes = await cotar(endereco!.cep, await itensDoPedido(createPublicClient(), itens));
      frete = opcoes.find((o) => String(o.id) === g("frete_id")) ?? null;
    } catch { /* cai no erro abaixo */ }
    if (!frete) return { erro: "Essa opção de frete não está mais disponível. Calcule de novo." };
  }

  const { data, error } = await createPublicClient().rpc("criar_pedido", {
    p_cliente: { nome: g("nome"), whatsapp: g("whatsapp"), email: g("email"), cidade: endereco?.cidade || g("cidade"), uf: endereco?.uf || g("uf") },
    p_itens: itens,
    p_observacoes: g("observacoes") || null,
    p_aceite_lgpd: true,
  });
  if (error) return { erro: error.message.replace(/^.*?:\s*/, "") || "Não foi possível registrar o pedido." };
  const r = data as { pedido_id: string; numero: number; token: string; status: string; total: number | null };

  let status = r.status;
  const admin = createAdminClient();
  if (admin) {
    const upd: Record<string, unknown> = { entrega, endereco };
    if (frete) Object.assign(upd, { frete: frete.preco, frete_servico: `${frete.empresa} ${frete.nome}`.trim(), frete_servico_id: frete.id, frete_prazo_dias: frete.prazo });
    if (entrega === "combinar" && status === "aguardando_pagamento") { upd.status = "orcamento"; status = "orcamento"; }
    await admin.from("pedidos").update(upd).eq("id", r.pedido_id);
  }

  revalidatePath("/admin");
  if (status === "aguardando_pagamento") redirect(`/pedido/${r.numero}/pagar?t=${r.token}`);
  redirect(`/pedido/${r.numero}?t=${r.token}&novo=1`);
}
