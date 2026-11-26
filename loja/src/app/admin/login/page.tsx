import LoginForm from "./LoginForm";

export const metadata = { title: "Entrar · Painel G-Code", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ volta?: string }> }) {
  const { volta } = await searchParams;
  return (
    <main className="min-h-dvh grid place-items-center p-6" style={{ background: "var(--navy)" }}>
      <div className="w-full max-w-sm rounded-2xl p-7" style={{ background: "var(--card)", color: "var(--ink)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="G-Code" className="h-11 w-auto rounded-md mb-5" />
        <h1 className="text-2xl mb-1">Painel da loja</h1>
        <p className="text-sm mb-6" style={{ color: "var(--soft)" }}>
          Acesso restrito. Entre com o e-mail e a senha de administrador.
        </p>
        <LoginForm volta={volta ?? "/admin"} />
      </div>
    </main>
  );
}
