"use client";

import { useMemo, useState } from "react";
import { formatBRL } from "@/lib/format";
import { btn, btn2, campo, cartao, rotulo } from "@/components/admin/ui";
import LeitorCodigo from "@/components/admin/LeitorCodigo";

type Prod = { id: string; titulo: string; preco: number; controla_estoque: boolean; estoque: number; marca: string | null; compatibilidade: string | null; codigo?: string | null; ean?: string | null };
type Linha = { produto_id: string | null; descricao: string; quantidade: number; preco: number };

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function Caixa({ acao, produtos, pagamentos }: { acao: (f: FormData) => Promise<void>; produtos: Prod[]; pagamentos: { v: string; nome: string }[] }) {
  const [q, setQ] = useState("");
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [desconto, setDesconto] = useState("");
  const [pag, setPag] = useState(pagamentos[0]?.v ?? "dinheiro");
  const [recebido, setRecebido] = useState("");
  const [avulso, setAvulso] = useState({ d: "", p: "" });
  const [enviando, setEnviando] = useState(false);
  const [camera, setCamera] = useState(false);
  const [aviso, setAviso] = useState<{ ok: boolean; t: string } | null>(null);

  const achados = useMemo(() => {
    const t = norm(q).split(/\s+/).filter(Boolean);
    if (!t.length) return [];
    return produtos.filter((p) => t.every((x) => norm(`${p.titulo} ${p.marca ?? ""} ${p.compatibilidade ?? ""} ${p.codigo ?? ""} ${p.ean ?? ""}`).includes(x))).slice(0, 8);
  }, [q, produtos]);

  const add = (p: Prod) => {
    setLinhas((ls) => {
      const i = ls.findIndex((l) => l.produto_id === p.id);
      if (i >= 0) return ls.map((l, j) => (j === i ? { ...l, quantidade: l.quantidade + 1 } : l));
      return [...ls, { produto_id: p.id, descricao: p.titulo, quantidade: 1, preco: p.preco }];
    });
    setQ("");
  };
  const porCodigo = (c: string) => {
    const k = c.trim().toUpperCase();
    return produtos.find((p) => p.codigo?.toUpperCase() === k || (!!p.ean && p.ean === k.replace(/\D/g, "")));
  };
  const lido = (c: string) => {
    const p = porCodigo(c);
    if (p) {
      add(p);
      setAviso({ ok: true, t: `+1 ${p.titulo}` });
    } else setAviso({ ok: false, t: `Código ${c} não está cadastrado` });
  };
  const toNum = (s: string) => Number(s.replace(/\./g, "").replace(",", ".")) || 0;
  const subtotal = linhas.reduce((s, l) => s + l.quantidade * l.preco, 0);
  const total = Math.max(0, subtotal - toNum(desconto));
  const troco = pag === "dinheiro" && recebido ? toNum(recebido) - total : null;
  const estoqueDe = (id: string | null) => produtos.find((p) => p.id === id);

  return (
    <form
      action={async (f) => {
        setEnviando(true);
        try {
          await acao(f);
        } finally {
          setEnviando(false);
        }
      }}
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="itens" value={JSON.stringify(linhas)} />
      <div className={cartao}>
        <label className={rotulo}>
          Buscar produto (nome, marca ou tipo: “tipo c”, “pilha aa”…)
          <span className="flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                // leitor de código USB/bluetooth digita o código e aperta Enter
                if (e.key === "Enter" && q.trim()) {
                  e.preventDefault();
                  if (porCodigo(q)) lido(q);
                  else if (achados.length === 1) add(achados[0]);
                }
              }}
              className={`${campo} flex-1`}
              autoFocus
              placeholder="Digite para buscar"
            />
            <button type="button" className={btn2} onClick={() => setCamera((v) => !v)}>
              {camera ? "Fechar" : "📷 Ler código"}
            </button>
          </span>
        </label>
        {camera && (
          <div className="mt-3">
            <LeitorCodigo onCodigo={lido} onFechar={() => setCamera(false)} />
          </div>
        )}
        {aviso && <p className={`mt-2 text-sm font-semibold ${aviso.ok ? "text-[#1E7A46]" : "text-[var(--coral)]"}`}>{aviso.t}</p>}
        {achados.length > 0 && (
          <ul className="mt-2 flex flex-col divide-y divide-[var(--line)]">
            {achados.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => add(p)} className="w-full text-left py-2 px-1 flex justify-between gap-3 hover:bg-[var(--sel)] rounded-lg">
                  <span>
                    {p.titulo}
                    {p.controla_estoque && <small className="text-[var(--soft)]"> · {p.estoque} em estoque</small>}
                  </span>
                  <b>{formatBRL(p.preco)}</b>
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_120px_auto] gap-2 items-end">
          <label className={rotulo}>
            Item avulso (xerox, serviço…)
            <input value={avulso.d} onChange={(e) => setAvulso({ ...avulso, d: e.target.value })} className={campo} placeholder="Ex.: 10 cópias P&B" />
          </label>
          <label className={rotulo}>
            Valor
            <input value={avulso.p} onChange={(e) => setAvulso({ ...avulso, p: e.target.value })} inputMode="decimal" className={campo} placeholder="0,00" />
          </label>
          <button
            type="button"
            className={btn2}
            onClick={() => {
              if (!avulso.d || !toNum(avulso.p)) return;
              setLinhas((ls) => [...ls, { produto_id: null, descricao: avulso.d, quantidade: 1, preco: toNum(avulso.p) }]);
              setAvulso({ d: "", p: "" });
            }}
          >
            Adicionar
          </button>
        </div>
      </div>

      <div className={cartao}>
        {linhas.length === 0 ? (
          <p className="text-[var(--soft)]">Nenhum item ainda.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-[var(--line)]">
            {linhas.map((l, i) => {
              const p = estoqueDe(l.produto_id);
              const falta = p?.controla_estoque && p.estoque < l.quantidade;
              return (
                <li key={i} className="py-2 flex items-center gap-2 flex-wrap">
                  <span className="flex-1 min-w-40">
                    {l.descricao}
                    {falta && <small className="block text-[var(--coral)]">Só {p!.estoque} em estoque</small>}
                  </span>
                  <span className="flex items-center gap-1">
                    <button type="button" className={btn2} aria-label="Menos um" onClick={() => setLinhas((ls) => ls.map((x, j) => (j === i ? { ...x, quantidade: Math.max(1, x.quantidade - 1) } : x)))}>−</button>
                    <b className="w-8 text-center">{l.quantidade}</b>
                    <button type="button" className={btn2} aria-label="Mais um" onClick={() => setLinhas((ls) => ls.map((x, j) => (j === i ? { ...x, quantidade: x.quantidade + 1 } : x)))}>+</button>
                  </span>
                  <b className="w-24 text-right">{formatBRL(l.quantidade * l.preco)}</b>
                  <button type="button" className="text-sm text-[var(--coral)] underline" onClick={() => setLinhas((ls) => ls.filter((_, j) => j !== i))}>tirar</button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className={`${cartao} grid gap-3 sm:grid-cols-3`}>
        <label className={rotulo}>
          Pagamento
          <select name="pagamento" value={pag} onChange={(e) => setPag(e.target.value)} className={campo}>
            {pagamentos.map((p) => <option key={p.v} value={p.v}>{p.nome}</option>)}
          </select>
        </label>
        <label className={rotulo}>
          Desconto (R$)
          <input name="desconto" value={desconto} onChange={(e) => setDesconto(e.target.value)} inputMode="decimal" className={campo} placeholder="0,00" />
        </label>
        {pag === "dinheiro" ? (
          <label className={rotulo}>
            Recebido (R$)
            <input value={recebido} onChange={(e) => setRecebido(e.target.value)} inputMode="decimal" className={campo} placeholder="para calcular o troco" />
          </label>
        ) : <div />}
        <label className={`${rotulo} sm:col-span-3`}>
          Observação (opcional)
          <input name="obs" className={campo} placeholder="Nome do cliente, detalhe da venda…" />
        </label>
        <div className="sm:col-span-3 flex flex-wrap items-center gap-4 justify-between">
          <div>
            <p className="text-3xl font-bold">{formatBRL(total)}</p>
            {troco != null && <p className={troco < 0 ? "text-[var(--coral)]" : "text-[var(--soft)]"}>{troco < 0 ? `Faltam ${formatBRL(-troco)}` : `Troco: ${formatBRL(troco)}`}</p>}
          </div>
          <button type="submit" className={btn} disabled={!linhas.length || enviando}>
            {enviando ? "Registrando…" : "Registrar venda"}
          </button>
        </div>
      </div>
    </form>
  );
}
