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
  };

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
    custo_material: num(form, "custo_material"),
    tempo_maquina_min: int(form, "tempo_maquina_min"),
    extras: num(form, "extras"),
    descricao_extras: txt(form, "descricao_extras"),
    arquivo_corte: txt(form, "arquivo_corte"),
    notas: txt(form, "notas"),
  };
  const { error: e2 } = await sb.from("produto_custos").upsert(custos);
  if (e2) throw new Error(e2.message);

  revalidatePath("/admin/produtos");
  revalidatePath("/");
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
  revalidatePath("/");
  redirect("/admin/produtos");
}

/** Chamado pelo componente de fotos depois de enviar/apagar/reordenar no navegador. */
export async function atualizarVitrine(produtoId: string) {
  await requireAdmin();
  revalidatePath(`/admin/produtos/${produtoId}`);
  revalidatePath("/admin/produtos");
  revalidatePath("/");
}
