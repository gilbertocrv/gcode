"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, txt, num, int, bool } from "@/lib/admin";

const slugify = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

export async function salvarProduto(form: FormData) {
  const sb = await requireAdmin();
  const id = txt(form, "id");
  const titulo = txt(form, "titulo");
  if (!titulo) throw new Error("Informe o título.");

  const tipo = txt(form, "tipo") ?? "sob_medida";
  const dados = {
    titulo,
    slug: txt(form, "slug") ? slugify(txt(form, "slug")!) : slugify(titulo),
    categoria: txt(form, "categoria"),
    descricao: txt(form, "descricao"),
    tecnica: txt(form, "tecnica"),
    dimensoes: txt(form, "dimensoes"),
    preco: num(form, "preco"),
    preco_a_partir_de: bool(form, "preco_a_partir_de"),
    status: txt(form, "status") ?? "sob_encomenda",
    tipo,
    controla_estoque: bool(form, "controla_estoque"),
    estoque: Math.max(0, int(form, "estoque") ?? 0),
    estoque_minimo: Math.max(0, int(form, "estoque_minimo") ?? 0),
    prazo_producao_dias: int(form, "prazo_producao_dias"),
    personalizavel: bool(form, "personalizavel"),
    personalizacao_url: txt(form, "personalizacao_url"),
    destaque: bool(form, "destaque"),
    foto_real: bool(form, "foto_real"),
    ml_item_id: txt(form, "ml_item_id"),
    ml_url: txt(form, "ml_url"),
    ordem: int(form, "ordem") ?? 0,
    peso_g: int(form, "peso_g"),
    caixa_comp_cm: num(form, "caixa_comp_cm"),
    caixa_larg_cm: num(form, "caixa_larg_cm"),
    caixa_alt_cm: num(form, "caixa_alt_cm"),
    marca: txt(form, "marca"),
    ean: (txt(form, "ean") ?? "").replace(/\D/g, "") || null,
    compatibilidade: txt(form, "compatibilidade"),
    tags: (txt(form, "tags") ?? "").split(",").map((t) => slugify(t)).filter(Boolean),
  };

  const embalagem = txt(form, "embalagem") === "embrulho" ? "embrulho" : "caixa";
  Object.assign(dados, { embalagem });
  const caixaId = embalagem === "caixa" ? txt(form, "caixa_id") : null;
  Object.assign(dados, { caixa_id: caixaId });
  if (caixaId) {
    const { data: cx } = await sb.from("materiais").select("largura_cm, altura_cm, profundidade_cm").eq("id", caixaId).single();
    if (cx) Object.assign(dados, { caixa_comp_cm: Number(cx.largura_cm) + 1, caixa_larg_cm: Number(cx.altura_cm) + 1, caixa_alt_cm: Number(cx.profundidade_cm ?? 5) + 1 });
  }

  let produtoId = id;
  if (id) {
    const { error } = await sb.from("produtos").update(dados).eq("id", id);
    if (error) throw new Error(error.code === "23505" ? "Já existe um produto com esse endereço (slug)." : error.message);
  } else {
    const { data, error } = await sb.from("produtos").insert(dados).select("id").single();
    if (error) throw new Error(error.code === "23505" ? "Já existe um produto com esse endereço (slug)." : error.message);
    produtoId = data.id;
  }

  const custos = {
    produto_id: produtoId,
    material_id: txt(form, "material_id"),
    largura_cm: num(form, "largura_cm"),
    altura_cm: num(form, "altura_cm"),
    camadas: Math.max(1, int(form, "camadas") ?? 1),
    tempo_maquina_min: int(form, "tempo_maquina_min"),
    tempo_mao_obra_min: int(form, "tempo_mao_obra_min"),
    preco_mercado: num(form, "preco_mercado"),
    preco_mercado_vendas: int(form, "preco_mercado_vendas"),
    preco_mercado_link: txt(form, "preco_mercado_link"),
    extras: num(form, "extras"),
    descricao_extras: txt(form, "descricao_extras"),
    arquivo_corte: txt(form, "arquivo_corte"),
    notas: txt(form, "notas"),
  };
  const { error: e2 } = await sb.from("produto_custos").upsert(custos);
  if (e2) throw new Error(e2.message);

  revalidatePath("/admin/produtos");
  revalidatePath("/admin/precificacao");
  revalidatePath("/", "layout");
  if (!id) redirect(`/admin/produtos/${produtoId}?novo=1`);
  revalidatePath(`/admin/produtos/${produtoId}`);
}

export async function excluirProduto(form: FormData) {
  const sb = await requireAdmin();
  const id = txt(form, "id")!;
  const { data: fotos } = await sb.from("produto_imagens").select("storage_path").eq("produto_id", id);
  const paths = (fotos ?? []).map((f) => f.storage_path).filter(Boolean) as string[];
  const { error } = await sb.from("produtos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  if (paths.length) await sb.storage.from("produtos").remove(paths);
  revalidatePath("/admin/produtos");
  revalidatePath("/", "layout");
  redirect("/admin/produtos");
}

/** Chamado pelo componente de fotos depois de enviar/apagar/reordenar no navegador. */
export async function atualizarVitrine(produtoId: string) {
  await requireAdmin();
  revalidatePath(`/admin/produtos/${produtoId}`);
  revalidatePath("/admin/produtos");
  revalidatePath("/", "layout");
}
