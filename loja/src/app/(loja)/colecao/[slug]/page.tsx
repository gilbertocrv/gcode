import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMenu, getProdutos } from "@/lib/catalogo";
import { Ajuda, Chips, Trilha } from "@/components/loja/Blocos";
import { Grade } from "@/components/loja/ProdutoCard";

export const revalidate = 60;
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const col = (await getMenu()).colecoes.find((c) => c.slug === slug);
  return { title: `${col?.nome ?? "Coleção"} · G-Code`, description: col?.descricao ?? undefined };
}

export default async function Colecao({ params }: Props) {
  const { slug } = await params;
  const [menu, produtos] = await Promise.all([getMenu(), getProdutos()]);
  const col = menu.colecoes.find((c) => c.slug === slug);
  if (!col) notFound();
  const pai = menu.departamentos.find((d) => d.slug === col.departamento);
  const lista = produtos.filter((p) => p.tags?.includes(col.slug));

  return (
    <main className="band" style={{ paddingTop: 16 }}>
      <div className="wrap">
        <Trilha itens={[...(pai ? [{ nome: pai.nome, href: `/c/${pai.slug}` }] : []), { nome: col.nome }]} />
        <h1 className="tit">{col.nome}</h1>
        {col.descricao && <p className="lead">{col.descricao}</p>}
        <Chips itens={menu.colecoes.map((c) => ({ slug: c.slug, nome: c.nome, href: `/colecao/${c.slug}` }))} ativo={col.slug} />
        <div style={{ marginTop: 18 }}>
          <Grade produtos={lista} />
        </div>
        <Ajuda />
      </div>
    </main>
  );
}
