import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

// Só roda onde precisa de sessão: o painel. A vitrine fica rápida e cacheável.
export const config = { matcher: ["/admin/:path*"] };
