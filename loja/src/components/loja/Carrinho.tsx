"use client";

import { createContext, useContext, useEffect, useState } from "react";

// Mesma chave usada pela página /finalizar (id do produto -> quantidade)
const CHAVE = "gcode-pedido-v2";
const CHAVE_INFO = "gcode-pedido-info";

type Pedido = Record<string, number>;
type Info = Record<string, { titulo: string; preco: string }>;

interface Ctx {
  pedido: Pedido;
  info: Info;
  muda: (p: { id: string; titulo: string; preco: string }, d: number) => void;
  limpar: () => void;
}

const CarrinhoCtx = createContext<Ctx | null>(null);

export function CarrinhoProvider({ children }: { children: React.ReactNode }) {
  const [pedido, setPedido] = useState<Pedido>({});
  const [info, setInfo] = useState<Info>({});
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem(CHAVE) ?? "{}");
      const i = JSON.parse(localStorage.getItem(CHAVE_INFO) ?? "{}");
      if (p && typeof p === "object") setPedido(p);
      if (i && typeof i === "object") setInfo(i);
    } catch {}
    setPronto(true);
  }, []);
  useEffect(() => {
    if (!pronto) return;
    try {
      localStorage.setItem(CHAVE, JSON.stringify(pedido));
      localStorage.setItem(CHAVE_INFO, JSON.stringify(info));
    } catch {}
  }, [pedido, info, pronto]);

  const muda: Ctx["muda"] = (p, d) => {
    setInfo((i) => ({ ...i, [p.id]: { titulo: p.titulo, preco: p.preco } }));
    setPedido((atual) => {
      const n = Math.max(0, (atual[p.id] ?? 0) + d);
      const novo = { ...atual };
      if (n) novo[p.id] = n;
      else delete novo[p.id];
      return novo;
    });
  };

  return (
    <CarrinhoCtx.Provider value={{ pedido, info, muda, limpar: () => setPedido({}) }}>{children}</CarrinhoCtx.Provider>
  );
}

export function useCarrinho() {
  const c = useContext(CarrinhoCtx);
  if (!c) throw new Error("useCarrinho fora do CarrinhoProvider");
  return c;
}

export function BarraPedido({ whatsapp }: { whatsapp: string }) {
  const { pedido, info, limpar } = useCarrinho();
  const ids = Object.keys(pedido);
  const pecas = ids.reduce((s, id) => s + pedido[id], 0);
  const msg =
    "Olá, G-Code! Quero um orçamento:\n" +
    ids.map((id) => `• ${pedido[id]}× ${info[id]?.titulo ?? "produto"}${info[id]?.preco ? ` (${info[id].preco})` : ""}`).join("\n");

  return (
    <div className="bar" role="region" aria-label="Seu pedido">
      <div className="in">
        <div className="t">
          <small>Seu pedido</small>
          <strong>
            {pecas
              ? `${pecas} ${pecas === 1 ? "peça" : "peças"} · ${ids.length} ${ids.length === 1 ? "item" : "itens"}`
              : "Nenhuma peça ainda"}
          </strong>
        </div>
        <button className="btn cl" type="button" onClick={limpar}>
          Limpar
        </button>
        <a
          className="btn cl"
          href={pecas ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}` : "#"}
          target="_blank"
          rel="noopener"
          aria-disabled={!pecas}
        >
          WhatsApp
        </a>
        <a className="btn wa" href={pecas ? "/finalizar" : "#"} aria-disabled={!pecas}>
          Finalizar pedido
        </a>
      </div>
    </div>
  );
}
