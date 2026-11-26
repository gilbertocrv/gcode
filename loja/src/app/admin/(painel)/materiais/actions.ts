"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, txt, num } from "@/lib/admin";

export async function salvarMaterial(form: FormData) {
  const sb = await requireAdmin();
  const id = txt(form, "id");
  const nome = txt(form, "nome");
  const material = txt(form, "material");
  if (!nome || !material) throw new Error("Informe nome e material.");
  const dados = {
    nome, material,
    espessura_mm: num(form, "espessura_mm"),
    largura_cm: num(form, "largura_cm"),
    altura_cm: num(form, "altura_cm"),
    quantidade: Math.max(0, num(form, "quantidade") ?? 0),
    custo_unitario: num(form, "custo_unitario"),
    minimo: num(form, "minimo"),
    obs: txt(form, "obs"),
  };
  const { error } = id ? await sb.from("materiais").update(dados).eq("id", id) : await sb.from("materiais").insert(dados);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/materiais");
  revalidatePath("/admin");
}

export async function ajustarQuantidade(form: FormData) {
  const sb = await requireAdmin();
  const id = txt(form, "id")!;
  const delta = num(form, "delta") ?? 0;
  const { data } = await sb.from("materiais").select("quantidade").eq("id", id).single();
  const { error } = await sb.from("materiais").update({ quantidade: Math.max(0, Number(data?.quantidade ?? 0) + delta) }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/materiais");
  revalidatePath("/admin");
}

export async function excluirMaterial(form: FormData) {
  const sb = await requireAdmin();
  const { error } = await sb.from("materiais").delete().eq("id", txt(form, "id")!);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/materiais");
}
