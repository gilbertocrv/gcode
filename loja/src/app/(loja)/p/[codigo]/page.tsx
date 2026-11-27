import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMenu, getProdutos, WHATSAPP } from "@/lib/catalogo";
import { precoTexto } from "@/lib/format";
import { Ajuda, Prateleira, Trilha } from "@/components/loja/Blocos";
import ProdutoCard from "@/components/loja/ProdutoCard";

export const revalidate = 60;
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ codigo: string }> };

async function achar(codigo: string) {
  const produtos = await getProdutos();
  const k = decodeURIComponent(codigo).toUpperCase();
  return { produtos, p: produtos.find((x) => x.codigo?.toUpperCase() === k) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { p } = await achar((await params).codigo);
  if (!p) return { title: "Produto · G-Code" };
  return { title: `${p.titulo} · ${precoTexto(p)} · G-Code`, description: [p.marca, p.compatibilidade, p.descricao].filter(Boolean).join(" · ") || undefined };
}

/** Página aberta pelo QR da etiqueta: o cliente vê preço, detalhes e pode pedir. */
export default async function ProdutoPorCodigo({ params }: Props) {
  const { codigo } = await params;
  const [{ produtos, p }, menu] = await Promise.all([achar(codigo), getMenu()]);
  if (!p) notFound();
  const cat = menu.categorias.find((c) => c.slug === p.categoria);
  const dep = menu.departamentos.find((d) => d.slug === cat?.departamento);
  const parecidos = produtos.filter((x) => x.id !== p.id && x.categoria === p.categoria);
  const msg = encodeURIComponent(`Olá! Vi na etiqueta o produto ${p.titulo} (${p.codigo}). Ainda tem?`);

  return (
    <main className="band" style={{ paddingTop: 16 }}>
      <div className="wrap">
        <Trilha
          itens={[
            ...(dep ? [{ nome: dep.nome, href: `/c/${dep.slug}` }] : []),
            ...(cat ? [{ nome: cat.nome, href: `/c/${cat.slug}` }] : []),
            { nome: p.titulo },
          ]}
        />
        <div style={{ maxWidth: 440, margin: "12px auto 0" }}>
          <ProdutoCard p={p} />
          <a className="btn wa" style={{ display: "flex", justifyContent: "center", marginTop: 12 }} href={`https://wa.me/${WHATSAPP}?text=${msg}`} target="_blank" rel="noopener">
            Tirar dúvida no WhatsApp
          </a>
          <p style={{ fontSize: 13, color: "var(--soft)", textAlign: "center", marginTop: 8 }}>Código {p.codigo}</p>
        </div>
        {parecidos.length > 0 && <Prateleira titulo="Veja também" href={cat ? `/c/${cat.slug}` : undefined} produtos={parecidos} />}
        <Ajuda />
      </div>
    </main>
  );
}
