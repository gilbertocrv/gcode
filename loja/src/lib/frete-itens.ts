import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ItemFrete } from "./melhorenvio";

/** Monta os volumes do frete a partir dos produtos do banco (medidas de embalagem e preço). */
export async function itensDoPedido(sb: SupabaseClient, itens: { produto_id: string | null; quantidade: number; preco?: number | null }[]) {
  const ids = itens.map((i) => i.produto_id).filter(Boolean) as string[];
  const { data } = await sb.from("produtos").select("id, titulo, preco, peso_g, caixa_comp_cm, caixa_larg_cm, caixa_alt_cm").in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
  const mapa = new Map((data ?? []).map((p) => [p.id, p]));
  return itens.map((i): ItemFrete => {
    const p = i.produto_id ? mapa.get(i.produto_id) : null;
    return {
      id: p?.titulo?.slice(0, 40) ?? "Item",
      comprimento: Number(p?.caixa_comp_cm ?? 20), largura: Number(p?.caixa_larg_cm ?? 15), altura: Number(p?.caixa_alt_cm ?? 4),
      pesoKg: Number(p?.peso_g ?? 200) / 1000, valor: Number(i.preco ?? p?.preco ?? 30), quantidade: i.quantidade,
    };
  });
}
