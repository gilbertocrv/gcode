import Link from "next/link";
import { getMenu, getProdutos } from "@/lib/catalogo";
import { fotoUrl } from "@/lib/format";
import type { Produto } from "@/lib/types";
import { Ajuda, Prateleira } from "@/components/loja/Blocos";

// A vitrine é regerada a cada 60 s: mudanças no painel aparecem em até um minuto.
export const revalidate = 60;

const capa = (p?: Produto) => (p ? fotoUrl([...p.produto_imagens].sort((a, b) => a.ordem - b.ordem)[0]) : null);

export default async function Home() {
  const [menu, produtos] = await Promise.all([getMenu(), getProdutos()]);
  const mosaico = produtos.filter((p) => p.foto_real).slice(0, 5);
  const porTag = (t: string) => produtos.filter((p) => p.tags?.includes(t));
  const destaque = menu.colecoes.find((c) => c.destaque);
  const destaques = produtos.filter((p) => p.destaque || p.foto_real);
  const novidades = [...produtos].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? "")).slice(0, 8);

  return (
    <>
      <section className="band hero-b">
        <div className="wrap hero">
          <div>
            <h1>Peças a laser, presentes e acessórios — do seu jeito</h1>
            <p>
              Decoração, relógios, chaveiros, kits de festa e placas cortados e gravados a laser, mais acessórios de celular a
              pronta entrega. Escolha, pague por Pix ou cartão e receba em casa.
            </p>
            <div className="chips0">
              <span>Nome e tema do seu jeito</span>
              <span>Entrega para todo o Brasil</span>
              <span>Retire grátis em Caravelas</span>
            </div>
          </div>
          <div className="mosaic">
            {mosaico.map((p) => {
              const src = capa(p);
              // eslint-disable-next-line @next/next/no-img-element
              return src ? <img key={p.id} src={src} alt={p.titulo} /> : null;
            })}
          </div>
        </div>
      </section>

      <main className="band" style={{ paddingTop: 10 }}>
        <div className="wrap">
          <section>
            <div className="sec">
              <h2>Departamentos</h2>
            </div>
            <div className="deps-grid">
              {menu.departamentos.map((d) => {
                const doDep = produtos.filter((p) => d.categorias.some((c) => c.slug === p.categoria));
                const src = capa(doDep.find((p) => p.foto_real) ?? doDep[0]);
                const vazio = !d.link && doDep.length === 0;
                return (
                  <Link key={d.slug} href={d.link ?? `/c/${d.slug}`} className="dep-tile">
                    <div className="dep-pic">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {src ? <img src={src} alt="" loading="lazy" /> : <span>{vazio ? "Em breve" : d.nome}</span>}
                    </div>
                    <div className="dep-txt">
                      <b>{d.nome}</b>
                      {d.descricao && <small>{d.descricao}</small>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {destaque && (
            <Prateleira titulo={destaque.nome} sub={destaque.descricao ?? undefined} href={`/colecao/${destaque.slug}`} produtos={porTag(destaque.slug)} />
          )}
          <Prateleira titulo="Queridinhos" sub="Peças que já saíram da nossa bancada" href="/c/todos" produtos={destaques} />
          <Prateleira titulo="Abrolhos e mar" sub="Jubarte, veleiros e ondas" href="/colecao/abrolhos" produtos={porTag("abrolhos")} />
          <Prateleira titulo="Novidades" produtos={novidades} />

          <p style={{ marginTop: 28 }}>
            <Link className="ver" href="/c/todos">
              Ver o catálogo completo →
            </Link>
          </p>

          <Ajuda />
        </div>
      </main>
    </>
  );
}
