"use client";

import { useActionState } from "react";
import { entrar, type LoginState } from "../actions";

const campo =
  "w-full min-h-11 rounded-xl border-[1.5px] px-3 text-base bg-transparent focus:outline-3 focus:outline-[var(--coral)] focus:outline-offset-2";

export default function LoginForm({ volta }: { volta: string }) {
  const [estado, acao, enviando] = useActionState<LoginState, FormData>(entrar, {});
  return (
    <form action={acao} className="flex flex-col gap-4">
      <input type="hidden" name="volta" value={volta} />
      <label className="flex flex-col gap-1 text-sm" style={{ color: "var(--soft)" }}>
        E-mail
        <input name="email" type="email" autoComplete="username" required className={campo} style={{ borderColor: "var(--line)", color: "var(--ink)" }} />
      </label>
      <label className="flex flex-col gap-1 text-sm" style={{ color: "var(--soft)" }}>
        Senha
        <input name="senha" type="password" autoComplete="current-password" required className={campo} style={{ borderColor: "var(--line)", color: "var(--ink)" }} />
      </label>
      {estado.erro && (
        <p role="alert" className="text-sm font-semibold" style={{ color: "var(--coral)" }}>
          {estado.erro}
        </p>
      )}
      <button
        type="submit"
        disabled={enviando}
        className="min-h-12 rounded-xl font-bold text-white disabled:opacity-60 cursor-pointer"
        style={{ background: "var(--coral)" }}
      >
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
