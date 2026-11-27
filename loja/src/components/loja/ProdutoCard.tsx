"use client";

import type { Produto } from "@/lib/types";
import { fotoUrl, precoTexto, STATUS_LABEL } from "@/lib/format";
import { useCarrinho } from "./Carrinho";
import Compartilhar from "@/components/Compartilhar";

export default function ProdutoCard({ p }: { p: Produto }) {
  const { pedido, muda } = useCarrinho();
  const img = fotoUrl([...p.produto_imagens].sort((a, b) => a.ordem - b.ordem)[0]);
  const q = pedido[p.id] ?? 0;
  const vendido = p.status === "vendido";
  const esgotado = p.status === "disponivel" && p.controla_estoque && p.estoque <= 0;
  const resumo = { id: p.id, titulo: p.titulo, preco: p.preco != null ? precoTexto(p) : "" };

  return (
    <article className={`card ${q ? "on" : ""}`}>
      <div className="pic">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {img && <img src={img} alt={p.titulo} loading="lazy" />}
        <span className={`tag ${p.foto_real ? "" : "p"}`}>{p.foto_real ? "foto real" : "prévia"}</span>
      </div>
      <div className="body">
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span className={`st ${esgotado ? "vendido" : p.status}`}>{esgotado ? "Esgotado" : STATUS_LABEL[p.status]}</span>
          {p.dimensoes && <span style={{ fontSize: 13, color: "var(--soft)" }}>{p.dimensoes}</span>}
        </div>
        <h3>{p.titulo}</h3>
        {(p.marca || p.compatibilidade) && (
          <p style={{ fontSize: 13 }}>{[p.marca, p.compatibilidade].filter(Boolean).join(" · ")}</p>
        )}
        {p.descricao && <p>{p.descricao}</p>}
        {p.tecnica && <p style={{ fontSize: 13 }}>{p.tecnica}</p>}
        {p.personalizacao_url && (
          <a className="mk" href={p.personalizacao_url} target={p.personalizacao_url.includes("wa.me") ? "_blank" : undefined} rel="noopener">
            {p.personalizacao_url.includes("wa.me") ? "Personalizar com nome e data no WhatsApp →" : "Crie o seu agora →"}
          </a>
        )}
        <div className="foot">
          <span className="price">{precoTexto(p)}</span>
          {vendido || esgotado ? null : q ? (
            <span className="step">
              <button type="button" aria-label={`Tirar uma unidade de ${p.titulo}`} onClick={() => muda(resumo, -1)}>
                −
              </button>
              <b>{q}</b>
              <button type="button" aria-label={`Mais uma unidade de ${p.titulo}`} onClick={() => muda(resumo, 1)}>
                +
              </button>
            </span>
          ) : (
            <button className="add" type="button" onClick={() => muda(resumo, 1)}>
              Quero este
            </button>
          )}
        </div>
        {p.ml_url && (
          <a className="ml" href={p.ml_url} target="_blank" rel="noopener">
            Também no Mercado Livre ↗
          </a>
        )}
        {p.codigo && (
          <Compartilhar
            url={`https://gcodecaravelas.com.br/p/${p.codigo}`}
            titulo={p.titulo}
            texto={`${p.titulo} · ${precoTexto(p)} na G-Code`}
            imagem={img}
          />
        )}
      </div>
    </article>
  );
}

export function Grade({ produtos }: { produtos: Produto[] }) {
  return (
    <div className="cards-grid">
      {produtos.map((p) => (
        <ProdutoCard key={p.id} p={p} />
      ))}
    </div>
  );
}
