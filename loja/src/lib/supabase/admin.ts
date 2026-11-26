import "server-only";
import { createClient } from "@supabase/supabase-js";

/** Cliente com a chave secreta: ignora o RLS. Só use no servidor (webhook e pagamento). */
export function createAdminClient() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
