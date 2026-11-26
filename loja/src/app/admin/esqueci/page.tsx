import Link from "next/link";
import FormSimples from "@/components/FormSimples";
import { pedirNovaSenha } from "../actions";

export const metadata = { title: "Esqueci a senha · Painel G-Code", robots: { index: false } };

export default function Esqueci() {
  return (
    <main className="min-h-dvh grid place-items-center p-6" style={{ background: "var(--navy)" }}>
      <div className="w-full max-w-sm rounded-2xl p-7" style={{ background: "var(--card)", color: "var(--ink)" }}>
        <h1 className="text-2xl mb-1">Esqueci a senha</h1>
        <p className="text-sm mb-6 text-[var(--soft)]">Enviamos um link para o seu e-mail. Ao abrir, você cria uma senha nova.</p>
        <FormSimples acao={pedirNovaSenha} botao="Enviar link" enviando="Enviando…"
          campos={[{ name: "email", label: "E-mail", type: "email", autoComplete: "username" }]} />
        <Link href="/admin/login" className="mt-5 inline-block text-sm underline">← Voltar para o login</Link>
      </div>
    </main>
  );
}
