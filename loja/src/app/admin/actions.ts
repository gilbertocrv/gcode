"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { erro?: string };

export async function entrar(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim();
  const senha = String(form.get("senha") ?? "");
  const volta = String(form.get("volta") ?? "/admin");
  if (!email || !senha) return { erro: "Preencha e-mail e senha." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) return { erro: "E-mail ou senha incorretos." };

  redirect(volta.startsWith("/admin") ? volta : "/admin");
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export type SimplesState = { erro?: string; ok?: string };

export async function pedirNovaSenha(_prev: SimplesState, form: FormData): Promise<SimplesState> {
  const email = String(form.get("email") ?? "").trim();
  if (!email) return { erro: "Informe o e-mail." };
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gcodecaravelas.com.br";
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${site}/auth/callback?next=/admin/nova-senha`,
  });
  if (error && error.status === 429) return { erro: "Muitas tentativas. Espere alguns minutos e tente de novo." };
  // Mesma resposta exista ou não a conta (não revela quais e-mails estão cadastrados).
  return { ok: "Se esse e-mail for de um administrador, chega em instantes um link para criar a senha nova. Confira também o spam." };
}

export async function definirSenha(_prev: SimplesState, form: FormData): Promise<SimplesState> {
  const senha = String(form.get("senha") ?? "");
  const conf = String(form.get("confirmar") ?? "");
  if (senha.length < 8) return { erro: "Use pelo menos 8 caracteres." };
  if (senha !== conf) return { erro: "As duas senhas não são iguais." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: senha });
  if (error) return { erro: error.message.includes("different") ? "A senha nova precisa ser diferente da antiga." : "Não deu para trocar a senha: " + error.message };
  redirect("/admin?senha=ok");
}
