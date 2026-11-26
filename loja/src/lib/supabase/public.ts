import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/** Cliente sem sessão, só para ler a vitrine. Permite cache (ISR) das páginas públicas. */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
