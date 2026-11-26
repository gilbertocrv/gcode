"use client";

import { useActionState } from "react";
import type { SimplesState } from "@/app/admin/actions";

const campo =
  "w-full min-h-11 rounded-xl border-[1.5px] border-[var(--line)] px-3 text-base bg-transparent text-[var(--ink)] focus:outline-3 focus:outline-[var(--coral)] focus:outline-offset-2";

type Campo = { name: string; label: string; type: string; autoComplete?: string };

export default function FormSimples({
  acao, campos, botao, enviando: txtEnviando,
}: { acao: (s: SimplesState, f: FormData) => Promise<SimplesState>; campos: Campo[]; botao: string; enviando: string }) {
  const [estado, act, enviando] = useActionState<SimplesState, FormData>(acao, {});
  if (estado.ok) return <p role="status" className="rounded-xl bg-[var(--sel)] p-3 text-sm">{estado.ok}</p>;
  return (
    <form action={act} className="flex flex-col gap-4">
      {campos.map((c) => (
        <label key={c.name} className="flex flex-col gap-1 text-sm text-[var(--soft)]">
          {c.label}
          <input name={c.name} type={c.type} autoComplete={c.autoComplete} required className={campo} />
        </label>
      ))}
      {estado.erro && <p role="alert" className="text-sm font-semibold text-[var(--coral)]">{estado.erro}</p>}
      <button type="submit" disabled={enviando} className="min-h-12 rounded-xl font-bold text-white bg-[var(--coral)] disabled:opacity-60 cursor-pointer">
        {enviando ? txtEnviando : botao}
      </button>
    </form>
  );
}
