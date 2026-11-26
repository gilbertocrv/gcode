/** Mesma conta da planilha "Precificação G-Code". */
export type Config = {
  teto_mei: number; das_mensal: number; horas_mes: number; parte_retirada: number; pecas_mes: number;
  tarifa_kwh: number; potencia_kw: number; valor_laser: number; vida_laser_h: number; manutencao_h: number;
  perda: number; margem: number; taxa_pix: number; taxa_cartao: number; ml_comissao: number; ml_fixo: number;
  shp_pct1: number; shp_fixo1: number; shp_pct2: number; shp_fixo2: number; shp_fixo3: number; shp_fixo4: number;
};
export type CustoProduto = {
  material_custo: number | null; material_largura: number | null; material_altura: number | null;
  largura_cm: number | null; altura_cm: number | null; camadas: number | null; extras: number | null;
  tempo_maquina_min: number | null; tempo_mao_obra_min: number | null;
};

export const numCfg = (c: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(c).map(([k, v]) => [k, typeof v === "string" && v !== "" && !isNaN(+v) ? +v : v])) as unknown as Config;

export function derivados(c: Config) {
  const faturamentoMes = c.teto_mei / 12;
  const valorHora = (faturamentoMes * c.parte_retirada) / c.horas_mes;
  const dasPeca = c.das_mensal / c.pecas_mes;
  const maquinaHora = c.tarifa_kwh * c.potencia_kw + c.valor_laser / c.vida_laser_h + c.manutencao_h;
  return { faturamentoMes, valorHora, dasPeca, maquinaHora };
}

const n = (v: unknown) => (v == null || v === "" ? 0 : Number(v));
const fim90 = (v: number) => Math.ceil(v) - 0.1;

export function custoPeca(c: Config, p: CustoProduto) {
  const d = derivados(c);
  const m2 = p.material_custo && p.material_largura && p.material_altura
    ? n(p.material_custo) / ((n(p.material_largura) * n(p.material_altura)) / 10000) : 0;
  const material = m2 * (n(p.largura_cm) * n(p.altura_cm)) / 10000 * Math.max(1, n(p.camadas)) * (1 + c.perda);
  return material + n(p.extras) + (n(p.tempo_maquina_min) / 60) * d.maquinaHora
    + (n(p.tempo_mao_obra_min) / 60) * d.valorHora + d.dasPeca;
}

export function precos(c: Config, custo: number) {
  const pix = fim90(custo / (1 - c.taxa_pix - c.margem));
  const cartao = fim90(custo / (1 - c.taxa_cartao - c.margem));
  const mlBase = custo / (1 - c.ml_comissao - c.margem);
  const ml = fim90(mlBase < 79 ? (custo + c.ml_fixo) / (1 - c.ml_comissao - c.margem) : mlBase);
  const a = (custo + c.shp_fixo1) / (1 - c.shp_pct1 - c.margem);
  const b = (custo + c.shp_fixo2) / (1 - c.shp_pct2 - c.margem);
  const cc = (custo + c.shp_fixo3) / (1 - c.shp_pct2 - c.margem);
  const dd = (custo + c.shp_fixo4) / (1 - c.shp_pct2 - c.margem);
  const shopee = fim90(a < 80 ? a : b < 100 ? Math.max(80, b) : cc < 200 ? Math.max(100, cc) : Math.max(200, dd));
  return { pix, cartao, ml, shopee };
}

/** Regra da loja: preço do anúncio que mais vende; se ficar abaixo do mínimo no Pix, usa o mínimo. */
export function sugerido(mercado: number | null, minimoPix: number, atual: number | null = null) {
  if (mercado == null) {
    if (atual != null && atual >= minimoPix) return { valor: atual, motivo: "sem referência: mantém o atual" as const };
    return { valor: minimoPix, motivo: "sem referência: usa o mínimo" as const };
  }
  if (mercado < minimoPix) return { valor: minimoPix, motivo: "mercado abaixo do seu mínimo" as const };
  return { valor: mercado, motivo: "mercado" as const };
}
