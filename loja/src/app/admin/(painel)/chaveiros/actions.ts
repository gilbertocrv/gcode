"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

const num = (f: FormData, k: string) => {
  const v = String(f.get(k) ?? "").replace(",", ".").trim();
  return v === "" ? 0 : Number(v);
};

export async function salvarFormato(form: FormData) {
  const sb = await requireAdmin();
  const id = String(form.get("id") ?? "");
  const dados = {
    nome: String(form.get("nome") ?? "").trim() || "Formato",
    descricao: String(form.get("descricao") ?? "").trim() || null,
    largura_cm: num(form, "largura_cm"), altura_cm: num(form, "altura_cm"),
    pecas_folha: Math.max(1, Math.round(num(form, "pecas_folha"))),
    custo_folha: num(form, "custo_folha"), impressao_folha: num(form, "impressao_folha"),
    maquina_min: num(form, "maquina_min"), mao_obra_min: num(form, "mao_obra_min"),
    ativo: form.get("ativo") === "on",
  };
  const { error } = id ? await sb.from("chaveiro_formatos").update(dados).eq("id", id) : await sb.from("chaveiro_formatos").insert({ ...dados, ordem: 99 });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/chaveiros");
  revalidatePath("/", "layout");
}

export async function salvarExtras(form: FormData) {
  const sb = await requireAdmin();
  const { error } = await sb.from("config_precificacao").update({
    chav_argola: num(form, "chav_argola"), chav_saco: num(form, "chav_saco"),
    chav_montagem_min: num(form, "chav_montagem_min"), chav_arte_nova: num(form, "chav_arte_nova"),
  }).eq("id", 1);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/chaveiros");
  revalidatePath("/", "layout");
}
