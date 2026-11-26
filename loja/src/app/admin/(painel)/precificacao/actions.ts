"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, num } from "@/lib/admin";
import { custoPeca, numCfg, precos, sugerido } from "@/lib/precificacao";

const CAMPOS_PCT = ["parte_retirada", "perda", "margem", "taxa_pix", "taxa_cartao", "ml_comissao", "shp_pct1", "shp_pct2"];
const CAMPOS = ["teto_mei", "das_mensal", "horas_mes", "pecas_mes", "tarifa_kwh", "potencia_kw", "valor_laser", "vida_laser_h",
  "manutencao_h", "ml_fixo", "shp_fixo1", "shp_fixo2", "shp_fixo3", "shp_fixo4", ...CAMPOS_PCT];

export async function salvarConfig(form: FormData) {
  const sb = await requireAdmin();
  const dados: Record<string, number> = {};
  for (const k of CAMPOS) {
    const v = num(form, k);
    if (v == null) continue;
    dados[k] = CAMPOS_PCT.includes(k) ? v / 100 : v; // percentuais digitados como 20 = 20%
  }
  const { error } = await sb.from("config_precificacao").update(dados).eq("id", 1);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/precificacao");
}

const caixaCusto = (pr: unknown) => { const p = (Array.isArray(pr) ? pr[0] : pr) as { caixa?: { custo_unitario: number | null } | { custo_unitario: number | null }[] | null } | null; const c = Array.isArray(p?.caixa) ? p?.caixa[0] : p?.caixa; return c?.custo_unitario != null ? Number(c.custo_unitario) : null; };

async function carregar(sb: Awaited<ReturnType<typeof requireAdmin>>) {
  const [{ data: cfg }, { data: lista }] = await Promise.all([
    sb.from("config_precificacao").select("*").eq("id", 1).single(),
    sb.from("produto_custos").select("produto_id, largura_cm, altura_cm, camadas, extras, tempo_maquina_min, tempo_mao_obra_min, preco_mercado, materiais(custo_unitario, largura_cm, altura_cm), produtos(preco, preco_a_partir_de, caixa:materiais(custo_unitario))").not("material_id", "is", null),
  ]);
  return { cfg: numCfg(cfg!), lista: lista ?? [] };
}

/** Aplica o preço sugerido (mercado ou mínimo) em um ou em todos os produtos. */
export async function aplicarPrecos(form: FormData) {
  const sb = await requireAdmin();
  const so = form.get("produto_id") ? String(form.get("produto_id")) : null;
  const { cfg, lista } = await carregar(sb);
  for (const r of lista) {
    if (so && r.produto_id !== so) continue;
    const m = (Array.isArray(r.materiais) ? r.materiais[0] : r.materiais) as { custo_unitario: number; largura_cm: number; altura_cm: number } | null;
    const custo = custoPeca(cfg, {
      material_custo: m?.custo_unitario ?? null, material_largura: m?.largura_cm ?? null, material_altura: m?.altura_cm ?? null,
      largura_cm: r.largura_cm, altura_cm: r.altura_cm, camadas: r.camadas, extras: r.extras,
      tempo_maquina_min: r.tempo_maquina_min, tempo_mao_obra_min: r.tempo_mao_obra_min,
      caixa_custo: caixaCusto(r.produtos),
    });
    const p = precos(cfg, custo);
    const prod = (Array.isArray(r.produtos) ? r.produtos[0] : r.produtos) as { preco: number | null; preco_a_partir_de: boolean } | null;
    const atual = prod?.preco != null && !prod.preco_a_partir_de ? Number(prod.preco) : null;
    const s = sugerido(r.preco_mercado != null ? Number(r.preco_mercado) : null, p.pix, atual);
    await sb.from("produtos").update({ preco: s.valor, preco_a_partir_de: false }).eq("id", r.produto_id);
    await sb.from("produto_custos").update({ custo_material: Math.round(custo * 100) / 100 }).eq("produto_id", r.produto_id);
  }
  revalidatePath("/admin/precificacao");
  revalidatePath("/admin/produtos");
  revalidatePath("/");
}
