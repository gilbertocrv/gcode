import Link from "next/link";
import { buscar, getMenu, getProdutos, WHATSAPP } from "@/lib/catalogo";
import { Trilha } from "@/components/loja/Blocos";
import { Grade } from "@/components/loja/ProdutoCard";

export const metadata = { title: "Busca · G-Code" };

export default async function Busca({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 80);
  const [menu, produtos] = await Promise.all([getMenu(), getProdutos()]);
  const achados = q ? buscar(produtos, menu.categorias, q) : [];

  return (
    <main className="band" style={{ paddingTop: 16 }}>
      <div className="wrap">
        <Trilha itens={[{ nome: "Busca" }]} />
        <h1 className="tit">{q ? `Resultados para “${q}”` : "Buscar na loja"}</h1>
        {q && (
          <p className="lead">
            {achados.length} {achados.length === 1 ? "produto encontrado" : "produtos encontrados"}
          </p>
        )}
        {q && achados.length === 0 ? (
          <div className="empty" style={{ marginTop: 20 }}>
            Não achamos “{q}” no site. Tente outra palavra, veja o <Link href="/c/todos">catálogo completo</Link> ou{" "}
            <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Olá, G-Code! Vocês têm ${q}?`)}`} target="_blank" rel="noopener">
              pergunte no WhatsApp
            </a>
            .
          </div>
        ) : (
          <div style={{ marginTop: 18 }}>
            <Grade produtos={achados} />
          </div>
        )}
      </div>
    </main>
  );
}
