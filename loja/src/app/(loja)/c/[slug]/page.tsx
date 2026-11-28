import TabelaAtacado from "@/components/loja/TabelaAtacado";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMenu, getProdutos } from "@/lib/catalogo";
import { Ajuda, Chips, Prateleira, Trilha } from "@/components/loja/Blocos";
import { Grade } from "@/components/loja/ProdutoCard";

export const revalidate = 60;
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const menu = await getMenu();
  const dep = menu.departamentos.find((d) => d.slug === slug);
  const cat = menu.categorias.find((c) => c.slug === slug);
  const nome = slug === "todos" ? "Catálogo completo" : dep?.nome ?? cat?.nome ?? "Catálogo";
  return { title: `${nome} · G-Code`, description: dep?.descricao ?? undefined };
}

export default async function Pagina({ params }: Props) {
  const { slug } = await params;
  const [menu, produtos] = await Promise.all([getMenu(), getProdutos()]);

  // Catálogo completo: uma seção por categoria, na ordem do menu
  if (slug === "todos") {
    const cats = menu.departamentos.flatMap((d) => d.categorias);
    return (
      <main className="band" style={{ paddingTop: 16 }}>
        <div className="wrap">
          <Trilha itens={[{ nome: "Catálogo completo" }]} />
          <h1 className="tit">Catálogo completo</h1>
          <Chips itens={cats.map((c) => ({ slug: c.slug, nome: c.nome, href: `/c/${c.slug}` }))} />
          {cats.map((c) => (
            <Prateleira key={c.slug} titulo={c.nome} href={`/c/${c.slug}`} max={99} produtos={produtos.filter((p) => p.categoria === c.slug)} />
          ))}
          <Ajuda />
        </div>
      </main>
    );
  }

  const dep = menu.departamentos.find((d) => d.slug === slug);
  if (dep) {
    const itens = [
      ...dep.categorias.map((c) => ({ slug: c.slug, nome: c.nome, href: `/c/${c.slug}` })),
      ...dep.colecoes.map((c) => ({ slug: c.slug, nome: c.nome, href: `/colecao/${c.slug}` })),
    ];
    const vazio = dep.categorias.length + dep.colecoes.length === 0;
    return (
      <main className="band" style={{ paddingTop: 16 }}>
        <div className="wrap">
          <Trilha itens={[{ nome: dep.nome }]} />
          <h1 className="tit">{dep.nome}</h1>
          {dep.descricao && <p className="lead">{dep.descricao}</p>}
          <Chips itens={itens} />
          {vazio ? (
            <div className="empty" style={{ marginTop: 20 }}>
              Estamos preparando esta seção. Enquanto isso, chame a gente no WhatsApp que fazemos sob encomenda.
            </div>
          ) : (
            <>
              {dep.categorias.map((c) => (
                <Prateleira key={c.slug} titulo={c.nome} href={`/c/${c.slug}`} produtos={produtos.filter((p) => p.categoria === c.slug)} />
              ))}
              {dep.colecoes.map((c) => (
                <Prateleira key={c.slug} titulo={c.nome} href={`/colecao/${c.slug}`} produtos={produtos.filter((p) => p.tags?.includes(c.slug))} />
              ))}
            </>
          )}
          <Ajuda />
        </div>
      </main>
    );
  }

  const cat = menu.categorias.find((c) => c.slug === slug);
  if (!cat) notFound();
  const pai = menu.departamentos.find((d) => d.slug === cat.departamento);
  const irmas = pai?.categorias ?? [];
  const lista = produtos.filter((p) => p.categoria === cat.slug);

  return (
    <main className="band" style={{ paddingTop: 16 }}>
      <div className="wrap">
        <Trilha itens={[...(pai ? [{ nome: pai.nome, href: `/c/${pai.slug}` }] : []), { nome: cat.nome }]} />
        <h1 className="tit">{cat.nome}</h1>
        <p className="lead">
          {lista.length} {lista.length === 1 ? "produto" : "produtos"}
        </p>
        <Chips itens={irmas.map((c) => ({ slug: c.slug, nome: c.nome, href: `/c/${c.slug}` }))} ativo={cat.slug} />
        <div style={{ marginTop: 18 }}>
          <Grade produtos={lista} />
        </div>
        {cat.slug === "chav" && <TabelaAtacado />}
        <Ajuda />
      </div>
    </main>
  );
}
