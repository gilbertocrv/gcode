import Link from "next/link";
import { COR_STATUS, nomeStatus } from "@/lib/pedidos";

export const campo =
  "w-full min-h-11 rounded-xl border-[1.5px] border-[var(--line)] bg-[var(--card)] px-3 text-base text-[var(--ink)] focus:outline-3 focus:outline-[var(--coral)] focus:outline-offset-1";
export const rotulo = "flex flex-col gap-1 text-sm text-[var(--soft)]";
export const btn =
  "inline-flex items-center justify-center min-h-11 px-4 rounded-xl font-bold text-white bg-[var(--coral)] hover:brightness-95 cursor-pointer disabled:opacity-50";
export const btn2 =
  "inline-flex items-center justify-center min-h-11 px-4 rounded-xl font-semibold bg-[var(--sel)] text-[var(--ink)] hover:brightness-95 cursor-pointer";
export const btnPerigo =
  "inline-flex items-center justify-center min-h-11 px-4 rounded-xl font-semibold border-[1.5px] border-[var(--coral)] text-[var(--coral)] hover:bg-[var(--coral)] hover:text-white cursor-pointer";
export const cartao = "rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4";

export function Status({ s }: { s: string }) {
  return (
    <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold text-white whitespace-nowrap" style={{ background: COR_STATUS[s] ?? "#718096" }}>
      {nomeStatus(s)}
    </span>
  );
}

export function Topo({ titulo, voltar, children }: { titulo: string; voltar?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-0">
        {voltar && (
          <Link href={voltar} className="text-sm text-[var(--soft)] hover:underline">
            ← Voltar
          </Link>
        )}
        <h1 className="text-3xl">{titulo}</h1>
      </div>
      {children}
    </div>
  );
}

export function Vazio({ children }: { children: React.ReactNode }) {
  return <p className="empty">{children}</p>;
}

export const dataBR = (s?: string | null) =>
  s ? new Date(s).toLocaleDateString("pt-BR", { timeZone: "America/Bahia" }) : "—";
export const dataHoraBR = (s?: string | null) =>
  s ? new Date(s).toLocaleString("pt-BR", { timeZone: "America/Bahia", dateStyle: "short", timeStyle: "short" }) : "—";
