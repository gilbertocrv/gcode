"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { formatBRL } from "@/lib/format";
import { btn, btn2, campo, cartao, rotulo } from "@/components/admin/ui";

type Prod = { id: string; titulo: string; preco: number; codigo: string; marca: string | null; compatibilidade: string | null; controla_estoque: boolean; estoque: number };

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const POR_FOLHA = 24;

export default function Folha({ produtos }: { produtos: Prod[] }) {
  const [q, setQ] = useState("");
  const [qtd, setQtd] = useState<Record<string, number>>({});
  const [pular, setPular] = useState(0);
  const [qr, setQr] = useState<Record<string, string>>({});

  const lista = useMemo(() => {
    const t = norm(q).split(/\s+/).filter(Boolean);
    return produtos.filter((p) => t.every((x) => norm(`${p.titulo} ${p.marca ?? ""} ${p.codigo}`).includes(x)));
  }, [q, produtos]);

  const etiquetas = useMemo(() => produtos.flatMap((p) => Array.from({ length: qtd[p.id] ?? 0 }, () => p)), [produtos, qtd]);
  const total = etiquetas.length;

  useEffect(() => {
    const falta = [...new Set(etiquetas.map((p) => p.codigo))].filter((c) => !qr[c]);
    if (!falta.length) return;
    Promise.all(falta.map(async (c) => [c, await QRCode.toDataURL(`https://gcodecaravelas.com.br/p/${c}`, { margin: 0, width: 240, errorCorrectionLevel: "M" })] as const)).then((r) =>
      setQr((m) => ({ ...m, ...Object.fromEntries(r) })),
    );
  }, [etiquetas, qr]);

  const muda = (id: string, n: number) => setQtd((m) => ({ ...m, [id]: Math.max(0, Math.min(200, n)) }));
  const celulas = [...Array.from({ length: pular }, () => null), ...etiquetas];
  const folhas: (Prod | null)[][] = [];
  for (let i = 0; i < celulas.length; i += POR_FOLHA) folhas.push(celulas.slice(i, i + POR_FOLHA));

  return (
    <>
      <style>{`
        @page { size: A4; margin: 10mm; }
        @media print {
          body * { visibility: hidden !important; }
          #folhas, #folhas * { visibility: visible !important; }
          #folhas { position: absolute; left: 0; top: 0; }
          .folha { break-after: page; box-shadow: none !important; margin: 0 !important; }
        }
        .folha { width: 190mm; height: 277mm; display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(8, 1fr); background: #fff; color: #0E3A4F; }
        .etq { border: 0.2mm dashed #bbb; padding: 2mm; display: grid; grid-template-columns: 22mm 1fr; gap: 2mm; overflow: hidden; font-family: var(--font-sans, sans-serif); }
        .etq img { width: 22mm; height: 22mm; image-rendering: pixelated; }
        .etq .cod { font-size: 2.6mm; text-align: center; letter-spacing: .2mm; margin-top: .6mm; }
        .etq .marca { font-size: 2.4mm; font-weight: 700; color: #167C81; }
        .etq .nome { font-size: 3.2mm; font-weight: 700; line-height: 1.15; max-height: 7.6mm; overflow: hidden; }
        .etq .sub { font-size: 2.4mm; color: #5B6B73; line-height: 1.2; max-height: 5.8mm; overflow: hidden; }
        .etq .preco { font-size: 6.4mm; font-weight: 800; color: #D9502F; text-align: right; margin-top: auto; white-space: nowrap; }
      `}</style>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] print:hidden">
        <div className={cartao}>
          <label className={rotulo}>
            Buscar produto
            <input value={q} onChange={(e) => setQ(e.target.value)} className={campo} placeholder="cabo, pilha, pisca…" />
          </label>
          <ul className="mt-3 flex flex-col divide-y divide-[var(--line)] max-h-[60vh] overflow-auto">
            {lista.map((p) => (
              <li key={p.id} className="py-2 flex items-center gap-2">
                <span className="flex-1 min-w-0">
                  {p.titulo}
                  <small className="block text-[var(--soft)]">
                    {p.codigo} · {formatBRL(p.preco)}
                    {p.controla_estoque && ` · ${p.estoque} em estoque`}
                  </small>
                </span>
                <button type="button" className={btn2} onClick={() => muda(p.id, (qtd[p.id] ?? 0) - 1)} aria-label="Menos uma">−</button>
                <input value={qtd[p.id] ?? 0} onChange={(e) => muda(p.id, Number(e.target.value) || 0)} inputMode="numeric" className={`${campo} w-14 text-center`} />
                <button type="button" className={btn2} onClick={() => muda(p.id, (qtd[p.id] ?? 0) + 1)} aria-label="Mais uma">+</button>
              </li>
            ))}
          </ul>
        </div>
        <aside className={`${cartao} flex flex-col gap-3 self-start`}>
          <p className="text-3xl font-bold">{total} {total === 1 ? "etiqueta" : "etiquetas"}</p>
          <p className="text-sm text-[var(--soft)]">
            {folhas.length} {folhas.length === 1 ? "folha" : "folhas"} A4 · 24 por folha (6,3 × 3,5 cm). Use papel adesivo A4 ou papel comum e recorte na linha pontilhada.
          </p>
          <button
            type="button"
            className={btn2}
            onClick={() => setQtd(Object.fromEntries(produtos.filter((p) => p.controla_estoque && p.estoque > 0).map((p) => [p.id, p.estoque])))}
          >
            Uma por peça em estoque
          </button>
          <label className={rotulo}>
            Pular etiquetas já usadas na folha
            <input value={pular} onChange={(e) => setPular(Math.max(0, Math.min(23, Number(e.target.value) || 0)))} inputMode="numeric" className={campo} />
          </label>
          <button type="button" className={btn} disabled={!total} onClick={() => window.print()}>
            Imprimir
          </button>
          {total > 0 && (
            <button type="button" className="text-sm text-[var(--coral)] underline self-start" onClick={() => setQtd({})}>
              Limpar
            </button>
          )}
        </aside>
      </div>

      <div id="folhas" className="mt-6 flex flex-col gap-6 items-center overflow-auto">
        {folhas.map((f, i) => (
          <div key={i} className="folha shadow-lg">
            {f.map((p, j) =>
              p ? (
                <div key={j} className="etq">
                  <div>
                    {qr[p.codigo] ? <img src={qr[p.codigo]} alt={p.codigo} /> : <div style={{ width: "22mm", height: "22mm" }} />}
                    <div className="cod">{p.codigo}</div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="marca">G-Code{p.marca ? ` · ${p.marca}` : ""}</span>
                    <span className="nome">{p.titulo}</span>
                    {p.compatibilidade && <span className="sub">{p.compatibilidade}</span>}
                    <span className="preco">{formatBRL(p.preco)}</span>
                  </div>
                </div>
              ) : (
                <div key={j} className="etq" style={{ borderColor: "transparent" }} />
              ),
            )}
          </div>
        ))}
      </div>
    </>
  );
}
