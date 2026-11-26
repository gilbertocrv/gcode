"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import type { Produto } from "@/lib/types";
import { formatBRL, precoTexto } from "@/lib/format";
import { finalizarPedido, type FinalizarState } from "./actions";

type P = Pick<Produto, "id" | "titulo" | "preco" | "preco_a_partir_de" | "personalizacao_url">;
const CHAVE = "gcode-pedido-v2";
const campo = "w-full min-h-11 rounded-xl border-[1.5px] border-[var(--line)] bg-[var(--card)] px-3 text-base focus:outline-3 focus:outline-[var(--coral)] focus:outline-offset-1";
const rotulo = "flex flex-col gap-1 text-sm text-[var(--soft)]";

export default function Finalizar({ produtos }: { produtos: P[] }) {
  const [pedido, setPedido] = useState<Record<string, number> | null>(null);
  const [notas, setNotas] = useState<Record<string, string>>({});
  const [estado, acao, enviando] = useActionState<FinalizarState, FormData>(finalizarPedido, {});

  useEffect(() => {
    try { setPedido(JSON.parse(localStorage.getItem(CHAVE) ?? "{}")); } catch { setPedido({}); }
  }, []);

  if (pedido === null) return <p className="text-[var(--soft)]">Carregando…</p>;
  const itens = Object.entries(pedido)
    .map(([id, q]) => ({ p: produtos.find((x) => x.id === id), q }))
    .filter((x): x is { p: P; q: number } => !!x.p);

  if (!itens.length) return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6">
      <p>Seu pedido está vazio.</p>
      <Link href="/" className="btn wa mt-4 inline-flex">Escolher peças</Link>
    </div>
  );

  const fechado = itens.every(({ p }) => p.preco != null && !p.preco_a_partir_de);
  const total = itens.reduce((s, { p, q }) => s + (p.preco ?? 0) * q, 0);
  const payload = JSON.stringify(itens.map(({ p, q }) => ({
    produto_id: p.id, quantidade: q, ...(notas[p.id] ? { personalizacao: { nota: notas[p.id] } } : {}),
  })));

  return (
    <form action={(f) => { acao(f); }} className="flex flex-col gap-5">
      <input type="hidden" name="itens" value={payload} />
      <section className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4">
        <h2 className="text-xl mb-3">Suas peças</h2>
        <ul className="flex flex-col gap-4">
          {itens.map(({ p, q }) => (
            <li key={p.id}>
              <div className="flex justify-between gap-3"><b>{q}× {p.titulo}</b><span className="whitespace-nowrap">{precoTexto(p)}</span></div>
              <input
                className={`${campo} mt-2 min-h-10 text-sm`}
                placeholder={p.personalizacao_url ? "Cole aqui o código gerado na personalização" : "Nome, frase, cores… (opcional)"}
                value={notas[p.id] ?? ""}
                onChange={(e) => setNotas((n) => ({ ...n, [p.id]: e.target.value }))}
                maxLength={800}
              />
              {p.personalizacao_url && <a href={p.personalizacao_url} target="_blank" className="text-sm underline">Personalizar esta peça ↗</a>}
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-[var(--line)] pt-3 text-lg">
          {fechado ? <>Total: <b>{formatBRL(total)}</b> <span className="text-sm text-[var(--soft)]">+ frete, se houver entrega</span></>
            : <>Algumas peças dependem de orçamento. Mandamos o valor final pelo WhatsApp e você paga pelo link do pedido.</>}
        </p>
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 grid gap-3 sm:grid-cols-2">
        <h2 className="text-xl sm:col-span-2">Seus dados</h2>
        <label className={`${rotulo} sm:col-span-2`}>Nome *<input name="nome" required minLength={2} maxLength={80} autoComplete="name" className={campo} /></label>
        <label className={rotulo}>WhatsApp com DDD *<input name="whatsapp" required inputMode="tel" autoComplete="tel" placeholder="73 99999-9999" className={campo} /></label>
        <label className={rotulo}>E-mail<input name="email" type="email" autoComplete="email" className={campo} /></label>
        <label className={rotulo}>Cidade<input name="cidade" autoComplete="address-level2" className={campo} /></label>
        <label className={rotulo}>UF<input name="uf" maxLength={2} autoComplete="address-level1" className={campo} /></label>
        <label className={`${rotulo} sm:col-span-2`}>Observações<textarea name="observacoes" rows={3} maxLength={2000} placeholder="Retirada na loja ou entrega? Prazo desejado?" className={`${campo} py-2`} /></label>
        <label className="sm:col-span-2 flex items-start gap-2 text-sm">
          <input type="checkbox" name="lgpd" required className="mt-0.5 size-5 accent-[var(--teal)]" />
          <span>Concordo que a G-Code guarde meu nome e contato para produzir e entregar este pedido. Posso pedir a exclusão a qualquer momento pelo WhatsApp.</span>
        </label>
      </section>

      {estado.erro && <p role="alert" className="font-semibold text-[var(--coral)]">{estado.erro}</p>}
      <button type="submit" disabled={enviando} className="btn wa min-h-12 justify-center text-lg disabled:opacity-60">
        {enviando ? "Registrando…" : fechado ? "Ir para o pagamento (Pix ou cartão)" : "Enviar pedido para orçamento"}
      </button>
      <p className="text-xs text-[var(--soft)]">O pagamento é feito no ambiente seguro do Mercado Pago. Não guardamos dados de cartão.</p>
    </form>
  );
}
