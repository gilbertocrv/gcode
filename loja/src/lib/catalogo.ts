import { createPublicClient } from "@/lib/supabase/public";
import type { Categoria, Colecao, Departamento, Produto } from "@/lib/types";

export const PRODUTO_COLS =
  "id, slug, categoria, titulo, descricao, tecnica, dimensoes, preco, preco_a_partir_de, status, tipo, controla_estoque, estoque, prazo_producao_dias, personalizacao_url, destaque, foto_real, ml_url, ordem, tags, marca, compatibilidade, codigo, created_at, produto_imagens(url, storage_path, alt, ordem)";

export const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? "5573988062663";

export interface Menu {
  departamentos: (Departamento & { categorias: Categoria[]; colecoes: Colecao[] })[];
  categorias: Categoria[];
  colecoes: Colecao[];
}

/** Departamentos com as categorias e coleções que têm produto à venda. */
export async function getMenu(): Promise<Menu> {
  const sb = createPublicClient();
  const [{ data: deps }, { data: cats }, { data: cols }, { data: prods }] = await Promise.all([
    sb.from("departamentos").select("slug, nome, descricao, ordem, link").eq("ativa", true).order("ordem"),
    sb.from("categorias").select("slug, nome, ordem, departamento").eq("ativa", true).order("ordem"),
    sb.from("colecoes").select("slug, nome, descricao, departamento, destaque, ordem").eq("ativa", true).order("ordem"),
    sb.from("produtos").select("categoria, tags").neq("status", "inativo"),
  ]);
  const comProduto = new Set((prods ?? []).map((p) => p.categoria));
  const tags = new Set((prods ?? []).flatMap((p) => p.tags ?? []));
  const categorias = ((cats ?? []) as Categoria[]).filter((c) => comProduto.has(c.slug));
  const colecoes = ((cols ?? []) as Colecao[]).filter((c) => tags.has(c.slug));
  const departamentos = ((deps ?? []) as Departamento[]).map((d) => ({
    ...d,
    categorias: categorias.filter((c) => c.departamento === d.slug),
    colecoes: colecoes.filter((c) => c.departamento === d.slug),
  }));
  return { departamentos, categorias, colecoes };
}

export async function getProdutos(): Promise<Produto[]> {
  const sb = createPublicClient();
  const { data } = await sb.from("produtos").select(PRODUTO_COLS).neq("status", "inativo").order("ordem");
  return (data ?? []) as Produto[];
}

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Busca sem acento em título, descrição, marca, compatibilidade e categoria. */
export function buscar(produtos: Produto[], categorias: Categoria[], q: string) {
  const termos = norm(q).split(/\s+/).filter(Boolean);
  if (!termos.length) return [];
  const nomeCat = new Map(categorias.map((c) => [c.slug, c.nome]));
  return produtos.filter((p) => {
    const texto = norm(
      [p.titulo, p.descricao, p.tecnica, p.marca, p.compatibilidade, nomeCat.get(p.categoria ?? ""), ...(p.tags ?? [])]
        .filter(Boolean)
        .join(" "),
    );
    return termos.every((t) => texto.includes(t));
  });
}

export const prontaEntrega = (p: Produto) =>
  p.status === "disponivel" && (!p.controla_estoque || p.estoque > 0);
