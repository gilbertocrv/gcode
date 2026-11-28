import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/supabase/server";
import { sair } from "../actions";

export const metadata = { title: "Painel · G-Code", robots: { index: false } };
export const dynamic = "force-dynamic";

const MENU = [
  { href: "/admin", nome: "Resumo" },
  { href: "/admin/pedidos", nome: "Pedidos" },
  { href: "/admin/balcao", nome: "Balcão" },
  { href: "/admin/produtos", nome: "Produtos" },
  { href: "/admin/etiquetas", nome: "Etiquetas" },
  { href: "/admin/chaveiros", nome: "Chaveiros" },
  { href: "/admin/brindes", nome: "Brindes" },
  { href: "/admin/clientes", nome: "Clientes" },
  { href: "/admin/materiais", nome: "Materiais" },
  { href: "/admin/precificacao", nome: "Precificação" },
];

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = await getAdmin();
  if (!user) redirect("/admin/login");

  if (!isAdmin) {
    return (
      <main className="min-h-dvh grid place-items-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl mb-2">Sem acesso ao painel</h1>
          <p style={{ color: "var(--soft)" }}>
            O usuário <b>{user.email}</b> entrou, mas não está cadastrado como administrador.
          </p>
          <form action={sair} className="mt-6">
            <button className="btn wa" type="submit">Sair</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-dvh">
      <header style={{ background: "var(--navy)", color: "#fff" }}>
        <div className="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href="/admin" className="font-bold text-lg">G-Code · Painel</Link>
          <nav className="flex flex-wrap gap-1" aria-label="Painel">
            {MENU.map((m) => (
              <Link key={m.href} href={m.href} className="rounded-lg px-3 py-2 text-sm hover:bg-white/10">
                {m.nome}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <Link href="/" className="opacity-80 hover:opacity-100" target="_blank">Ver loja ↗</Link>
            <form action={sair}>
              <button type="submit" className="rounded-lg px-3 py-2 bg-white/15 hover:bg-white/25 cursor-pointer">Sair</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
