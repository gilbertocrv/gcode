"use client";

import { useMemo, useState } from "react";
import { orcar, faixas, type ConfigChav, type Formato, type Opcoes } from "@/lib/chaveiros";
import { formatBRL } from "@/lib/format";
import { btn, btn2, campo, cartao, rotulo } from "@/components/admin/ui";

type Modelo = { id: string; codigo: string; titulo: string; preco: number; foto: string | null };
const pct = (v: number) => `${Math.round(v * 100)}%`;

export default function Orcamento({ cfg, formatos, modelos }: { cfg: ConfigChav; formatos: Formato[]; modelos: Modelo[] }) {
  const [fid, setFid] = useState(formatos[0]?.id ?? "");
  const [qtd, setQtd] = useState<Record<string, number>>({});
  const [livre, setLivre] = useState({ nome: "Personalizado (arte do cliente)", n: 0 });
  const [op, setOp] = useState<Opcoes>({ saco: true, arteNova: false, pagamento: "pix" });
  const [cliente, setCliente] = useState({ nome: "", whats: "" });
  const [copiado, setCopiado] = useState(false);

  const f = formatos.find((x) => x.id === fid) ?? formatos[0];
  const linhas = [
    ...modelos.filter((m) => (qtd[m.id] ?? 0) > 0).map((m) => ({ nome: m.titulo, n: qtd[m.id] })),
    ...(livre.n > 0 ? [{ nome: livre.nome || "Personalizado", n: livre.n }] : []),
  ];
  const total = linhas.reduce((s, l) => s + l.n, 0);
  const r = useMemo(() => (f ? orcar(cfg, f, total, op) : null), [cfg, f, total, op]);
  const cheio = useMemo(() => (f && r && r.sobra > 0 ? orcar(cfg, f, r.vagas, op) : null), [cfg, f, r, op]);
  const tabela = useMemo(() => (f ? faixas(cfg, f, op) : []), [cfg, f, op]);
  const muda = (id: string, n: number) => setQtd((m) => ({ ...m, [id]: Math.max(0, Math.min(5000, n)) }));

  const texto = r && total > 0 ? [
    `Olá${cliente.nome ? `, ${cliente.nome}` : ""}! Segue o orçamento dos chaveiros G-Code:`,
    "",
    ...linhas.map((l) => `• ${l.n}× ${l.nome}`),
    "",
    `Material: ${f!.nome}${op.saco ? " · com saquinho individual" : ""}`,
    `Total: ${total} chaveiros por ${formatBRL(r.total)} (${formatBRL(r.unit)} cada)${op.pagamento === "pix" ? " no Pix" : " no cartão"}`,
    r.arte ? `Inclui criação da arte: ${formatBRL(r.arte)}` : null,
    cheio ? `💡 Completando a folha: ${cheio.qtd} chaveiros por ${formatBRL(cheio.total)} (${formatBRL(cheio.unit)} cada)` : null,
    "",
    "Pedido confirmado com 50% de sinal. Retirada em Caravelas ou envio para todo o Brasil.",
  ].filter((x) => x !== null).join("\n") : "";

  if (!f) return <p className={cartao}>Cadastre um formato de folha abaixo para começar.</p>;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="flex flex-col gap-5">
        <section className={cartao}>
          <h2 className="text-lg mb-2">1. Material</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {formatos.map((x) => (
              <label key={x.id} className={`rounded-xl border p-3 cursor-pointer ${x.id === f.id ? "border-[var(--coral)] bg-[var(--coral)]/5" : "border-[var(--line)]"}`}>
                <input type="radio" name="fmt" className="sr-only" checked={x.id === f.id} onChange={() => setFid(x.id)} />
                <b>{x.nome}</b>
                <small className="block text-[var(--soft)]">{x.pecas_folha} por folha · {x.descricao}</small>
              </label>
            ))}
          </div>
        </section>

        <section className={cartao}>
          <h2 className="text-lg mb-2">2. Modelos e quantidades</h2>
          <p className="text-sm text-[var(--soft)] mb-3">Pode misturar modelos: eles dividem a mesma folha.</p>
          <ul className="flex flex-col divide-y divide-[var(--line)]">
            {modelos.map((m) => (
              <li key={m.id} className="py-2 flex items-center gap-3">
                {m.foto ? <img src={m.foto} alt="" className="w-11 h-11 rounded-lg object-cover" /> : <span className="w-11 h-11 rounded-lg bg-[var(--line)]" />}
                <span className="flex-1 min-w-0">
                  {m.titulo}
                  <small className="block text-[var(--soft)]">{m.codigo} · avulso {formatBRL(m.preco)}</small>
                </span>
                <button type="button" className={btn2} onClick={() => muda(m.id, (qtd[m.id] ?? 0) - 1)} aria-label="Menos um">−</button>
                <input value={qtd[m.id] ?? 0} onChange={(e) => muda(m.id, Number(e.target.value) || 0)} inputMode="numeric" className={`${campo} w-16 text-center`} aria-label={`Quantidade de ${m.titulo}`} />
                <button type="button" className={btn2} onClick={() => muda(m.id, (qtd[m.id] ?? 0) + 1)} aria-label="Mais um">+</button>
              </li>
            ))}
            <li className="py-2 flex items-center gap-3">
              <span className="w-11 h-11 rounded-lg bg-[var(--line)] grid place-items-center text-xl">✎</span>
              <input value={livre.nome} onChange={(e) => setLivre((l) => ({ ...l, nome: e.target.value }))} className={`${campo} flex-1`} aria-label="Nome do modelo personalizado" />
              <input value={livre.n} onChange={(e) => setLivre((l) => ({ ...l, n: Math.max(0, Number(e.target.value) || 0) }))} inputMode="numeric" className={`${campo} w-16 text-center`} aria-label="Quantidade personalizada" />
            </li>
          </ul>
        </section>

        <section className={cartao}>
          <h2 className="text-lg mb-2">3. Opções e cliente</h2>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={op.saco} onChange={(e) => setOp({ ...op, saco: e.target.checked })} /> Saquinho individual</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={op.arteNova} onChange={(e) => setOp({ ...op, arteNova: e.target.checked })} /> Criar arte nova (+{formatBRL(cfg.chav_arte_nova)})</label>
            <label className="flex items-center gap-2"><input type="radio" checked={op.pagamento === "pix"} onChange={() => setOp({ ...op, pagamento: "pix" })} /> Pix</label>
            <label className="flex items-center gap-2"><input type="radio" checked={op.pagamento === "cartao"} onChange={() => setOp({ ...op, pagamento: "cartao" })} /> Cartão</label>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 mt-3">
            <label className={rotulo}>Nome do cliente<input value={cliente.nome} onChange={(e) => setCliente({ ...cliente, nome: e.target.value })} className={campo} /></label>
            <label className={rotulo}>WhatsApp (com DDD)<input value={cliente.whats} onChange={(e) => setCliente({ ...cliente, whats: e.target.value })} inputMode="tel" placeholder="73 99999-9999" className={campo} /></label>
          </div>
        </section>
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-4 self-start">
        <section className={cartao}>
          <p className="text-sm text-[var(--soft)]">{total} chaveiros · {r!.folhas} {r!.folhas === 1 ? "folha" : "folhas"} · aproveitamento {pct(r!.aproveitamento)}</p>
          <p className="text-4xl font-bold mt-1">{formatBRL(r!.total)}</p>
          <p className="text-lg">{total ? `${formatBRL(r!.unit)} por chaveiro` : "Escolha as quantidades"}</p>
          {r!.arte > 0 && <p className="text-sm text-[var(--soft)]">inclui arte nova {formatBRL(r!.arte)}</p>}
          {cheio && (
            <div className="mt-3 rounded-xl bg-[#FFF4D6] p-3 text-sm">
              Sobram <b>{r!.sobra}</b> lugares na última folha. Com <b>{cheio.qtd}</b> chaveiros sai <b>{formatBRL(cheio.total)}</b> ({formatBRL(cheio.unit)} cada).
              <button type="button" className="block mt-1 underline font-semibold" onClick={() => setLivre((l) => ({ ...l, n: l.n + r!.sobra }))}>
                Completar a folha
              </button>
            </div>
          )}
          <small className="block mt-3 text-[var(--soft)]">
            Custo {formatBRL(r!.custo)} · folha {formatBRL(r!.porFolha)} · por peça {formatBRL(r!.porPeca)}
          </small>
          <div className="flex flex-wrap gap-2 mt-4">
            <button type="button" className={btn} disabled={!texto} onClick={async () => { await navigator.clipboard.writeText(texto); setCopiado(true); setTimeout(() => setCopiado(false), 2500); }}>
              {copiado ? "Copiado!" : "Copiar orçamento"}
            </button>
            <a
              className={`${btn2} ${!texto ? "pointer-events-none opacity-50" : ""}`}
              target="_blank"
              rel="noopener"
              href={`https://wa.me/${cliente.whats.replace(/\D/g, "") ? `55${cliente.whats.replace(/\D/g, "").replace(/^55/, "")}` : ""}?text=${encodeURIComponent(texto)}`}
            >
              Enviar no WhatsApp
            </a>
          </div>
        </section>

        <section className={cartao}>
          <h3 className="font-semibold mb-2">Preço por folha cheia · {f.nome}</h3>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[var(--soft)]"><th>Qtd</th><th>Total</th><th>Cada</th></tr></thead>
            <tbody>
              {tabela.map((t) => (
                <tr key={t.qtd} className="border-t border-[var(--line)]"><td className="py-1">{t.qtd}</td><td>{formatBRL(t.total)}</td><td>{formatBRL(t.unit)}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      </aside>
    </div>
  );
}
