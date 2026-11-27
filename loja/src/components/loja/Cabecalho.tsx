"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { Menu } from "@/lib/catalogo";
import { useCarrinho } from "./Carrinho";

const Ico = {
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  busca: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 20 20" />
    </>
  ),
  sacola: (
    <>
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6 6 18" />,
  seta: <path d="m9 6 6 6-6 6" />,
};
const Svg = ({ d, size = 22 }: { d: React.ReactNode; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
);

const hrefDep = (d: Menu["departamentos"][number]) => d.link ?? `/c/${d.slug}`;

export default function Cabecalho({ menu, whatsapp }: { menu: Menu; whatsapp: string }) {
  const { pedido } = useCarrinho();
  const pecas = Object.values(pedido).reduce((s, n) => s + n, 0);
  const [aberto, setAberto] = useState(false);
  const [dep, setDep] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const caminho = usePathname();
  const destaque = menu.colecoes.find((c) => c.destaque);

  useEffect(() => {
    setAberto(false);
    setDep(null);
  }, [caminho]);
  useEffect(() => {
    const fora = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setDep(null);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && (setDep(null), setAberto(false));
    document.addEventListener("click", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("click", fora);
      document.removeEventListener("keydown", esc);
    };
  }, []);

  const busca = (
    <form action="/busca" className="busca" role="search">
      <input name="q" type="search" placeholder="Buscar: cabo tipo C, relógio, chaveiro…" aria-label="Buscar na loja" />
      <button type="submit" aria-label="Buscar">
        <Svg d={Ico.busca} size={20} />
      </button>
    </form>
  );

  return (
    <>
      <div className="topo">Entrega para todo o Brasil · Pix ou cartão · Retire grátis em Caravelas</div>
      <header className="cab">
        <div className="wrap cab-in">
          <button className="ib so-m" type="button" aria-label="Abrir menu" aria-expanded={aberto} onClick={() => setAberto(true)}>
            <Svg d={Ico.menu} />
          </button>
          <Link href="/" className="marca" aria-label="G-Code, página inicial">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="G-Code" />
          </Link>
          <div className="so-d" style={{ flex: 1 }}>{busca}</div>
          <a className="ib" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener" aria-label="Falar no WhatsApp">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
            </svg>
          </a>
          <Link className="ib sacola" href="/finalizar" aria-label={`Seu pedido: ${pecas} peças`}>
            <Svg d={Ico.sacola} />
            {pecas > 0 && <span className="bolha">{pecas}</span>}
          </Link>
        </div>
        <div className="wrap so-m" style={{ paddingBottom: 10 }}>{busca}</div>

        <nav className="deps so-d" ref={navRef} aria-label="Departamentos">
          <div className="wrap deps-in">
            {destaque && (
              <Link className="dep quente" href={`/colecao/${destaque.slug}`}>
                {destaque.nome}
              </Link>
            )}
            {menu.departamentos.map((d) => {
              const temSub = d.categorias.length + d.colecoes.length > 0;
              return (
                <div key={d.slug} className="dep-w">
                  {temSub ? (
                    <button
                      type="button"
                      className="dep"
                      aria-expanded={dep === d.slug}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDep(dep === d.slug ? null : d.slug);
                      }}
                    >
                      {d.nome} <span aria-hidden="true">▾</span>
                    </button>
                  ) : (
                    <Link className="dep" href={hrefDep(d)}>
                      {d.nome}
                    </Link>
                  )}
                  {dep === d.slug && (
                    <div className="mega">
                      <Link className="mega-tudo" href={hrefDep(d)}>
                        Ver tudo em {d.nome} →
                      </Link>
                      <div className="mega-cols">
                        {d.categorias.length > 0 && (
                          <ul>
                            {d.categorias.map((c) => (
                              <li key={c.slug}>
                                <Link href={`/c/${c.slug}`}>{c.nome}</Link>
                              </li>
                            ))}
                          </ul>
                        )}
                        {d.colecoes.length > 0 && (
                          <ul>
                            <li className="mega-t">Por ocasião</li>
                            {d.colecoes.map((c) => (
                              <li key={c.slug}>
                                <Link href={`/colecao/${c.slug}`}>{c.nome}</Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </header>

      {aberto && (
        <div className="gaveta-fundo" onClick={() => setAberto(false)}>
          <aside className="gaveta" role="dialog" aria-label="Menu" onClick={(e) => e.stopPropagation()}>
            <div className="gaveta-cab">
              <strong>Menu</strong>
              <button className="ib" type="button" aria-label="Fechar menu" onClick={() => setAberto(false)}>
                <Svg d={Ico.x} />
              </button>
            </div>
            {destaque && (
              <Link className="g-item quente" href={`/colecao/${destaque.slug}`}>
                {destaque.nome}
              </Link>
            )}
            <Link className="g-item" href="/c/todos">
              Catálogo completo
            </Link>
            {menu.departamentos.map((d) => {
              const temSub = d.categorias.length + d.colecoes.length > 0;
              return temSub ? (
                <details key={d.slug} className="g-dep">
                  <summary className="g-item">
                    {d.nome}
                    <Svg d={Ico.seta} size={18} />
                  </summary>
                  <div className="g-sub">
                    <Link href={hrefDep(d)}>Ver tudo em {d.nome}</Link>
                    {d.categorias.map((c) => (
                      <Link key={c.slug} href={`/c/${c.slug}`}>
                        {c.nome}
                      </Link>
                    ))}
                    {d.colecoes.map((c) => (
                      <Link key={c.slug} href={`/colecao/${c.slug}`}>
                        {c.nome}
                      </Link>
                    ))}
                  </div>
                </details>
              ) : (
                <Link key={d.slug} className="g-item" href={hrefDep(d)}>
                  {d.nome}
                </Link>
              );
            })}
            <Link className="g-item" href="/politicas">
              Trocas, entrega e privacidade
            </Link>
          </aside>
        </div>
      )}
    </>
  );
}
