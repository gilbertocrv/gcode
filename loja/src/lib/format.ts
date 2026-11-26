import type { Produto, ProdutoImagem } from "./types";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const formatBRL = (v: number) => brl.format(v);

export function precoTexto(p: Pick<Produto, "preco" | "preco_a_partir_de">) {
  if (p.preco == null) return "Sob consulta";
  return (p.preco_a_partir_de ? "a partir de " : "") + brl.format(Number(p.preco));
}

export const STATUS_LABEL: Record<Produto["status"], string> = {
  disponivel: "Pronta entrega",
  sob_encomenda: "Sob encomenda",
  vendido: "Vendido",
  inativo: "Inativo",
};

/** URL pública da foto: Storage do Supabase ou link antigo do GitHub Pages. */
export function fotoUrl(img?: ProdutoImagem | null) {
  if (!img) return null;
  if (img.storage_path) {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/produtos/${img.storage_path}`;
  }
  return img.url;
}
