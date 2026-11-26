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
  const [entrega, setEntrega] = useState<"retirada" | "envio" | "combinar">("retirada");
  const [cep, setCep] = useState("");
  const [end, setEnd] = useState({ rua: "", bairro: "", cidade: "", uf: "" });
  const [opcoes, setOpcoes] = useState<{ id: number; nome: string; empresa: string; preco: number; prazo: number }[] | null>(null);
  const [freteId, setFreteId] = useState<string>("");
  const [freteMsg, setFreteMsg] = useState<string | null>(null);
  const [calculando, setCalculando] = useState(false);
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
  const escolhido = opcoes?.find((o) => String(o.id) === freteId) ?? null;

  async function calcular() {
    const c = cep.replace(/\D/g, "");
    if (c.length !== 8) { setFreteMsg("Digite o CEP com 8 números."); return; }
    setCalculando(true); setFreteMsg(null); setOpcoes(null); setFreteId("");
    try {
      fetch(`https://viacep.com.br/ws/${c}/json/`).then((r) => r.json()).then((v) => {
        if (!v.erro) setEnd({ rua: v.logradouro ?? "", bairro: v.bairro ?? "", cidade: v.localidade ?? "", uf: v.uf ?? "" });
      }).catch(() => {});
      const r = await fetch("/api/frete", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cep: c, itens: itens.map(({ p, q }) => ({ produto_id: p.id, quantidade: q })) }) });
      const j = await r.json();
      if (!j.disponivel) { setFreteMsg("O cálculo automático ainda não está ativo. Escolha “combinar pelo WhatsApp”."); return; }
      if (j.erro) { setFreteMsg(j.erro); return; }
      if (!j.opcoes.length) { setFreteMsg("Nenhuma transportadora atende esse CEP. Escolha retirada ou combinar pelo WhatsApp."); return; }
      setOpcoes(j.opcoes); setFreteId(String(j.opcoes[0].id));
    } catch { setFreteMsg("Não foi possível calcular agora. Tente de novo."); }
    finally { setCalculando(false); }
  }
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
          {fechado ? <>Total: <b>{formatBRL(total + (entrega === "envio" && escolhido ? escolhido.preco : 0))}</b>
            <span className="text-sm text-[var(--soft)]"> {entrega === "envio" ? (escolhido ? `com frete de ${formatBRL(escolhido.preco)}` : "+ frete") : entrega === "retirada" ? "· retirada na loja" : "+ frete a combinar"}</span></>
            : <>Algumas peças dependem de orçamento. Mandamos o valor final pelo WhatsApp e você paga pelo link do pedido.</>}
        </p>
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 flex flex-col gap-3">
        <h2 className="text-xl">Entrega</h2>
        <input type="hidden" name="entrega" value={entrega} />
        <input type="hidden" name="frete_id" value={entrega === "envio" ? freteId : ""} />
        {([["retirada", "Retirar na loja (Caravelas)", "Grátis. Avisamos pelo WhatsApp quando estiver pronto."],
           ["envio", "Enviar para o meu endereço", "Calcule o frete pelo CEP: Correios e transportadoras."],
           ["combinar", "Combinar a entrega pelo WhatsApp", "Para entrega local ou se o seu CEP não aparecer."]] as const).map(([v, t, d]) => (
          <label key={v} className="flex items-start gap-3 rounded-xl border-[1.5px] p-3 cursor-pointer" style={{ borderColor: entrega === v ? "var(--teal)" : "var(--line)" }}>
            <input type="radio" checked={entrega === v} onChange={() => setEntrega(v)} className="mt-1 size-5 accent-[var(--teal)]" />
            <span><b>{t}</b><br /><span className="text-sm text-[var(--soft)]">{d}</span></span>
          </label>
        ))}
        {entrega !== "retirada" && (
          <div className="grid gap-3 sm:grid-cols-6 mt-2">
            <label className={`${rotulo} sm:col-span-2`}>CEP *
              <input name="cep" value={cep} onChange={(e) => setCep(e.target.value)} inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" className={campo} />
            </label>
            {entrega === "envio" && (
              <div className="sm:col-span-4 flex items-end">
                <button type="button" onClick={calcular} disabled={calculando} className="min-h-11 rounded-xl bg-[var(--sel)] px-4 font-semibold cursor-pointer disabled:opacity-60">
                  {calculando ? "Calculando…" : "Calcular frete"}
                </button>
              </div>
            )}
            {freteMsg && <p className="sm:col-span-6 text-sm text-[var(--coral)]">{freteMsg}</p>}
            {entrega === "envio" && opcoes && (
              <div className="sm:col-span-6 flex flex-col gap-2">
                {opcoes.map((o) => (
                  <label key={o.id} className="flex items-center gap-3 rounded-xl border p-3 cursor-pointer" style={{ borderColor: freteId === String(o.id) ? "var(--teal)" : "var(--line)" }}>
                    <input type="radio" checked={freteId === String(o.id)} onChange={() => setFreteId(String(o.id))} className="size-5 accent-[var(--teal)]" />
                    <span className="flex-1"><b>{o.empresa} {o.nome}</b> <span className="text-sm text-[var(--soft)]">· até {o.prazo} dias úteis após a postagem</span></span>
                    <b className="tabular-nums">{formatBRL(o.preco)}</b>
                  </label>
                ))}
              </div>
            )}
            <label className={`${rotulo} sm:col-span-4`}>Rua *<input name="rua" value={end.rua} onChange={(e) => setEnd({ ...end, rua: e.target.value })} autoComplete="address-line1" className={campo} /></label>
            <label className={`${rotulo} sm:col-span-2`}>Número *<input name="numero" autoComplete="address-line2" className={campo} /></label>
            <label className={`${rotulo} sm:col-span-3`}>Complemento<input name="complemento" className={campo} /></label>
            <label className={`${rotulo} sm:col-span-3`}>Bairro<input name="bairro" value={end.bairro} onChange={(e) => setEnd({ ...end, bairro: e.target.value })} className={campo} /></label>
            <label className={`${rotulo} sm:col-span-4`}>Cidade *<input name="cidade_end" value={end.cidade} onChange={(e) => setEnd({ ...end, cidade: e.target.value })} autoComplete="address-level2" className={campo} /></label>
            <label className={`${rotulo} sm:col-span-2`}>UF *<input name="uf_end" value={end.uf} onChange={(e) => setEnd({ ...end, uf: e.target.value })} maxLength={2} className={campo} /></label>
            {entrega === "envio" && (
              <label className={`${rotulo} sm:col-span-6`}>CPF (exigido pelas transportadoras na etiqueta)
                <input name="documento" inputMode="numeric" autoComplete="off" className={campo} />
              </label>
            )}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 grid gap-3 sm:grid-cols-2">
        <h2 className="text-xl sm:col-span-2">Seus dados</h2>
        <label className={`${rotulo} sm:col-span-2`}>Nome *<input name="nome" required minLength={2} maxLength={80} autoComplete="name" className={campo} /></label>
        <label className={rotulo}>WhatsApp com DDD *<input name="whatsapp" required inputMode="tel" autoComplete="tel" placeholder="73 99999-9999" className={campo} /></label>
        <label className={rotulo}>E-mail<input name="email" type="email" autoComplete="email" className={campo} /></label>
        {entrega === "retirada" && <>
          <label className={rotulo}>Cidade<input name="cidade" className={campo} /></label>
          <label className={rotulo}>UF<input name="uf" maxLength={2} className={campo} /></label>
        </>}
        <label className={`${rotulo} sm:col-span-2`}>Observações<textarea name="observacoes" rows={3} maxLength={2000} placeholder="Prazo desejado, ponto de referência…" className={`${campo} py-2`} /></label>
        <label className="sm:col-span-2 flex items-start gap-2 text-sm">
          <input type="checkbox" name="lgpd" required className="mt-0.5 size-5 accent-[var(--teal)]" />
          <span>Concordo que a G-Code guarde meu nome e contato para produzir e entregar este pedido. Posso pedir a exclusão a qualquer momento pelo WhatsApp.</span>
        </label>
      </section>

      {estado.erro && <p role="alert" className="font-semibold text-[var(--coral)]">{estado.erro}</p>}
      <button type="submit" disabled={enviando} className="btn wa min-h-12 justify-center text-lg disabled:opacity-60">
        {enviando ? "Registrando…" : fechado && entrega !== "combinar" ? "Ir para o pagamento (Pix ou cartão)" : "Enviar pedido para orçamento"}
      </button>
      <p className="text-xs text-[var(--soft)]">O pagamento é feito no ambiente seguro do Mercado Pago. Não guardamos dados de cartão.</p>
    </form>
  );
}
