"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

const r = () => { revalidatePath("/admin/brindes"); revalidatePath("/brindes-igreja"); };
const num = (f: FormData, k: string) => Number(String(f.get(k) ?? "0").replace(",", ".")) || 0;

export async function salvarDias(form: FormData) {
  const sb = await requireAdmin();
  for (let d = 1; d <= 8; d++) {
    const data = String(form.get(`data${d}`) ?? "") || null;
    await sb.from("brinde_dias").update({ data }).eq("dia", d);
  }
  r();
}

export async function salvarBrinde(form: FormData) {
  const sb = await requireAdmin();
  const { error } = await sb.from("brindes").update({
    nome: String(form.get("nome") ?? "").trim(),
    descricao: String(form.get("descricao") ?? "").trim() || null,
    preco_1: num(form, "preco_1"), preco_20: num(form, "preco_20"), preco_50: num(form, "preco_50"), preco_100: num(form, "preco_100"),
    ativo: form.get("ativo") === "on",
  }).eq("id", String(form.get("id")));
  if (error) throw new Error(error.message);
  r();
}

export async function liberarDia(form: FormData) {
  const sb = await requireAdmin();
  await sb.from("brinde_escolhas").delete().eq("id", String(form.get("id")));
  r();
}
