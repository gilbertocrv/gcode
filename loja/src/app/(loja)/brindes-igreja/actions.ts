"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export type Estado = { ok?: string; erro?: string };

export async function escolherBrinde(_: Estado, form: FormData): Promise<Estado> {
  const dia = Number(form.get("dia"));
  const brinde = String(form.get("brinde") ?? "");
  const nome = String(form.get("nome") ?? "").trim().slice(0, 80);
  const whatsapp = String(form.get("whatsapp") ?? "").replace(/\D/g, "").slice(0, 13);
  const grupo = String(form.get("grupo") ?? "").trim().slice(0, 80) || null;
  const extra = Math.max(0, Math.min(5000, Math.floor(Number(form.get("extra") ?? 0)) || 0));
  const obs = String(form.get("obs") ?? "").trim().slice(0, 300) || null;
  if (!dia || !brinde) return { erro: "Escolha o dia e o brinde." };
  if (nome.length < 2) return { erro: "Escreva seu nome." };
  if (whatsapp.length < 10) return { erro: "Escreva seu WhatsApp com DDD." };
  const sb = createAdminClient();
  if (!sb) return { erro: "Não foi possível salvar agora. Tente pelo WhatsApp." };
  const { error } = await sb.from("brinde_escolhas").insert({ dia, brinde_id: brinde, nome, whatsapp, grupo, extra, obs });
  if (error) {
    if (error.code === "23505") return { erro: "Esse dia acabou de ser escolhido por outra pessoa. Escolha outro dia." };
    return { erro: "Não foi possível salvar agora. Tente de novo." };
  }
  revalidatePath("/brindes-igreja");
  revalidatePath("/admin/brindes");
  return { ok: `Pronto, ${nome.split(" ")[0]}! Seu brinde do ${dia}º dia está reservado. Vamos confirmar pelo WhatsApp.` };
}
