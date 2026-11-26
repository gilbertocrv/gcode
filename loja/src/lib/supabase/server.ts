import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Cliente para Server Components, Server Actions e Route Handlers (lê a sessão dos cookies). */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Server Components não podem gravar cookies; o middleware renova a sessão.
          }
        },
      },
    },
  );
}

/** Usuário logado e se ele é administrador (consulta a função is_admin do banco). */
export async function getAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isAdmin: false };
  const { data } = await supabase.rpc("is_admin");
  return { supabase, user, isAdmin: data === true };
}
