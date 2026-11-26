import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/supabase/server";

/** Usado em Server Actions e páginas do painel: garante que é um administrador. */
export async function requireAdmin() {
  const { supabase, user, isAdmin } = await getAdmin();
  if (!user) redirect("/admin/login");
  if (!isAdmin) throw new Error("Sem permissão.");
  return supabase;
}

export const txt = (f: FormData, k: string) => {
  const v = String(f.get(k) ?? "").trim();
  return v === "" ? null : v;
};
export const num = (f: FormData, k: string) => {
  const v = txt(f, k);
  if (v == null) return null;
  const n = Number(v.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
};
export const int = (f: FormData, k: string) => {
  const n = num(f, k);
  return n == null ? null : Math.round(n);
};
export const bool = (f: FormData, k: string) => f.get(k) === "on" || f.get(k) === "true";
export const soDigitos = (s: string | null) => (s ? s.replace(/\D/g, "") : null);
