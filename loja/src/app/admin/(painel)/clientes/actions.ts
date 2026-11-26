"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, txt, soDigitos } from "@/lib/admin";

export async function salvarCliente(form: FormData) {
  const sb = await requireAdmin();
  const id = txt(form, "id");
  const nome = txt(form, "nome");
  if (!nome) throw new Error("Informe o nome.");
  const dados = {
    nome,
    whatsapp: soDigitos(txt(form, "whatsapp")) || null,
    email: txt(form, "email"),
    instagram: txt(form, "instagram")?.replace(/^@/, "") ?? null,
    cidade: txt(form, "cidade"),
    uf: txt(form, "uf")?.toUpperCase().slice(0, 2) ?? null,
    origem: txt(form, "origem") ?? "whatsapp",
    observacoes: txt(form, "observacoes"),
  };
  const r = id
    ? await sb.from("clientes").update(dados).eq("id", id).select("id").single()
    : await sb.from("clientes").insert(dados).select("id").single();
  if (r.error) throw new Error(r.error.code === "23505" ? "Já existe um cliente com esse WhatsApp." : r.error.message);
  revalidatePath("/admin/clientes");
  if (!id) redirect(`/admin/clientes/${r.data.id}`);
  revalidatePath(`/admin/clientes/${id}`);
}

export async function excluirCliente(form: FormData) {
  const sb = await requireAdmin();
  const { error } = await sb.from("clientes").delete().eq("id", txt(form, "id")!);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/clientes");
  redirect("/admin/clientes");
}
