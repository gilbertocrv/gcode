"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Categoria, Produto } from "@/lib/types";
import { fotoUrl, precoTexto, STATUS_LABEL } from "@/lib/format";

type Pedido = Record<string, number>; // id do produto -> quantidade
const CHAVE = "gcode-pedido-v2";

export default function Vitrine({
  categorias,
  produtos,
  whatsapp,
}: {
  categorias: Categoria[];
  produtos: Produto[];
  whatsapp: string;
}) {
  const [cat, setCat] = useState<string>("all");
  const [pedido, setPedido] = useState<Pedido>({});
  const barRef = useRef<HTMLDivElement>(null);
  const [setas, setSetas] = useState({ l: false, r: false });

  // pedido guardado no navegador
  useEffect(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE) ?? "{}");
      if (salvo && typeof salvo === "object") setPedido(salvo);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(pedido));
    } catch {}
  }, [pedido]);

  // setas da barra de categorias
  const atualizaSetas = () => {
    const el = barRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setSetas({ l: el.scrollLeft > 4, r: el.scrollLeft < max - 4 });
  };
  useEffect(() => {
    atualizaSetas();
    window.addEventListener("resize", atualizaSetas);
    return () => window.removeEventListener("resize", atualizaSetas);
  }, []);

  const usadas = useMemo(() => {
    const tem = new Set(produtos.map((p) => p.categoria));
    return categorias.filter((c) => tem.has(c.slug));
  }, [categorias, produtos]);

  const secoes = useMemo(() => {
    const lista = cat === "all" ? usadas : usadas.filter((c) => c.slug === cat);
    return lista.map((c) => ({ c, itens: produtos.filter((p) => p.categoria === c.slug) }));
  }, [cat, usadas, produtos]);

  const muda = (id: string, d: number) =>
    setPedido((p) => {
      const n = Math.max(0, (p[id] ?? 0) + d);
      const novo = { ...p };
      if (n) novo[id] = n;
      else delete novo[id];
      return novo;
    });

  const itens = Object.entries(pedido)
    .map(([id, q]) => ({ p: produtos.find((x) => x.id === id), q }))
    .filter((x): x is { p: Produto; q: number } => !!x.p);
  const totalPecas = itens.reduce((s, x) => s + x.q, 0);

  const msg =
    "Olá, G-Code! Quero um orçamento:\n" +
    itens.map(({ p, q }) => `• ${q}× ${p.titulo}${p.preco != null ? ` (${precoTexto(p)})` : ""}`).join("\n");
  const waHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`;

  return (
    <>
      <nav className="cats" aria-label="Categorias">
        <div className={`catbar wrap ${setas.l ? "fl" : ""} ${setas.r ? "fr" : ""}`}>
          <button
            className="arr l"
            type="button"
            aria-label="Ver categorias anteriores"
            hidden={!setas.l}
            onClick={() => barRef.current?.scrollBy({ left: -barRef.current.clientWidth * 0.7 })}
          >
            ‹
          </button>
          <div className="scroll" ref={barRef} onScroll={atualizaSetas}>
            {[{ slug: "all", nome: "Tudo" }, ...usadas].map((c) => (
              <button
                key={c.slug}
                className="cat"
                type="button"
                aria-pressed={cat === c.slug}
                onClick={() => setCat(c.slug)}
              >
                {c.nome}
              </button>
            ))}
          </div>
          <button
            className="arr r"
            type="button"
            aria-label="Ver mais categorias"
            hidden={!setas.r}
            onClick={() => barRef.current?.scrollBy({ left: barRef.current.clientWidth * 0.7 })}
          >
            ›
          </button>
        </div>
      </nav>

      <main className="band" style={{ paddingTop: 6 }}>
        <div className="wrap">
          {secoes.map(({ c, itens }) => (
            <section key={c.slug}>
              <div className="sec">
                <h2>{c.nome}</h2>
              </div>
              <div className="cards-grid">
                {itens.map((p) => {
                  const img = fotoUrl([...p.produto_imagens].sort((a, b) => a.ordem - b.ordem)[0]);
                  const q = pedido[p.id] ?? 0;
                  const vendido = p.status === "vendido";
                  return (
                    <article key={p.id} className={`card ${q ? "on" : ""}`}>
                      <div className="pic">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {img && <img src={img} alt={p.titulo} loading="lazy" />}
                        <span className={`tag ${p.foto_real ? "" : "p"}`}>{p.foto_real ? "foto real" : "prévia"}</span>
                      </div>
                      <div className="body">
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <span className={`st ${p.status}`}>{STATUS_LABEL[p.status]}</span>
                          {p.dimensoes && <span style={{ fontSize: 13, color: "var(--soft)" }}>{p.dimensoes}</span>}
                        </div>
                        <h3>{p.titulo}</h3>
                        {p.descricao && <p>{p.descricao}</p>}
                        {p.tecnica && <p style={{ fontSize: 13 }}>{p.tecnica}</p>}
                        {p.personalizacao_url && (
                          <a className="mk" href={p.personalizacao_url}>
                            Crie o seu agora →
                          </a>
                        )}
                        <div className="foot">
                          <span className="price">{precoTexto(p)}</span>
                          {vendido ? null : q ? (
                            <span className="step">
                              <button type="button" aria-label={`Tirar uma unidade de ${p.titulo}`} onClick={() => muda(p.id, -1)}>
                                −
                              </button>
                              <b>{q}</b>
                              <button type="button" aria-label={`Mais uma unidade de ${p.titulo}`} onClick={() => muda(p.id, 1)}>
                                +
                              </button>
                            </span>
                          ) : (
                            <button className="add" type="button" onClick={() => muda(p.id, 1)}>
                              Quero este
                            </button>
                          )}
                        </div>
                        {p.ml_url && (
                          <a className="ml" href={p.ml_url} target="_blank" rel="noopener">
                            Também no Mercado Livre ↗
                          </a>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}

          <div className="ask">
            <div>
              <h2>Não encontrou o que procura?</h2>
              <p>
                A gente faz sob medida: mande uma foto, um desenho ou só a ideia, com o tamanho e o tema, que respondemos
                com uma prévia e o orçamento.
              </p>
            </div>
            <div className="bt">
              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Olá, G-Code! Não encontrei no catálogo o que procuro. Queria fazer: ")}`}
                target="_blank"
                rel="noopener"
              >
                Fale com a gente no WhatsApp
              </a>
              <a className="ig" href="https://www.instagram.com/gcodecaravelas" target="_blank" rel="noopener">
                Ver no Instagram @gcodecaravelas
              </a>
            </div>
          </div>

          <div className="how">
            <div>
              <b>1. Escolha</b>
              <span>Marque as peças e a quantidade. Pode ser só uma ideia: a gente adapta tamanho, nome e cores.</span>
            </div>
            <div>
              <b>2. Mande o pedido</b>
              <span>O botão monta a mensagem com a sua lista. É só enviar.</span>
            </div>
            <div>
              <b>3. Orçamento e prazo</b>
              <span>Respondemos com o valor, uma prévia da arte e quando fica pronto.</span>
            </div>
          </div>

          <footer style={{ marginTop: 28 }}>
            G-Code · Laser · Gráfica · Assistência — WhatsApp (73) 98806-2663 · Instagram{" "}
            <a href="https://www.instagram.com/gcodecaravelas" target="_blank" rel="noopener" style={{ color: "inherit" }}>
              @gcodecaravelas
            </a>
            . As fotos marcadas como &quot;prévia&quot; são o projeto da peça; as &quot;foto real&quot; já foram feitas.
          </footer>
        </div>
      </main>

      <div className="bar" role="region" aria-label="Seu pedido">
        <div className="in">
          <div className="t">
            <small>Seu pedido</small>
            <strong>
              {totalPecas ? `${totalPecas} ${totalPecas === 1 ? "peça" : "peças"} · ${itens.length} ${itens.length === 1 ? "item" : "itens"}` : "Nenhuma peça ainda"}
            </strong>
          </div>
          <button className="btn cl" type="button" onClick={() => setPedido({})}>
            Limpar
          </button>
          <a className="btn wa" href={totalPecas ? waHref : "#"} target="_blank" rel="noopener" aria-disabled={!totalPecas}>
            Pedir orçamento no WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}
