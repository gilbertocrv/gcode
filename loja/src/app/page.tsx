import { createPublicClient } from "@/lib/supabase/public";
import type { Categoria, Produto } from "@/lib/types";
import Vitrine from "@/components/Vitrine";

// A vitrine é regerada a cada 60 s: mudanças no painel aparecem em até um minuto.
export const revalidate = 60;

export default async function Home() {
  const supabase = createPublicClient();
  const [{ data: categorias, error: e1 }, { data: produtos, error: e2 }] = await Promise.all([
    supabase.from("categorias").select("slug, nome, ordem").order("ordem"),
    supabase
      .from("produtos")
      .select(
        "id, slug, categoria, titulo, descricao, tecnica, dimensoes, preco, preco_a_partir_de, status, tipo, controla_estoque, estoque, prazo_producao_dias, personalizacao_url, destaque, foto_real, ml_url, ordem, produto_imagens(url, storage_path, alt, ordem)",
      )
      .neq("status", "inativo")
      .order("ordem"),
  ]);

  const erro = e1 || e2;
  const mosaico = (produtos ?? []).filter((p) => p.foto_real).slice(0, 5) as Produto[];

  return (
    <>
      <header className="band">
        <div className="wrap hero">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="logo" src="/logo.svg" alt="G-Code" />
            <h1>Peças cortadas e gravadas a laser, feitas sob encomenda</h1>
            <p>
              Organizadores, decoração, chaveiros, kits de festa e placas para o seu negócio. Escolha o que gostou aqui
              embaixo e mande o pedido: a gente responde com o orçamento e o prazo.
            </p>
            <div className="chips0">
              <span>MDF cru ou pintado</span>
              <span>Nome e tema do seu jeito</span>
              <span>Do chaveiro ao painel de 80 cm</span>
            </div>
          </div>
          <div className="mosaic">
            {mosaico.map((p) => {
              const img = [...p.produto_imagens].sort((a, b) => a.ordem - b.ordem)[0];
              // eslint-disable-next-line @next/next/no-img-element
              return img?.url || img?.storage_path ? <img key={p.id} src={img.url ?? ""} alt={p.titulo} /> : null;
            })}
          </div>
        </div>
      </header>

      {erro ? (
        <main className="band">
          <div className="wrap empty">Não consegui carregar o catálogo agora. Tente de novo em instantes.</div>
        </main>
      ) : (
        <Vitrine
          categorias={(categorias ?? []) as Categoria[]}
          produtos={(produtos ?? []) as Produto[]}
          whatsapp={process.env.NEXT_PUBLIC_WHATSAPP ?? "5573988062663"}
        />
      )}
    </>
  );
}
