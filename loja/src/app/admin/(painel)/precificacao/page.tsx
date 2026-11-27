import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { formatBRL } from "@/lib/format";
import { CFG_SELECT, PROD_EMB, custoPeca, derivados, embalagemCusto, numCfg, papelaoDoCfg, precos, sugerido } from "@/lib/precificacao";
import { Topo, btn, btn2, campo, cartao, rotulo } from "@/components/admin/ui";
import BotaoConfirmar from "@/components/admin/BotaoConfirmar";
import { aplicarPrecos, salvarConfig } from "./actions";



type Linha = {
  produto_id: string; largura_cm: number | null; altura_cm: number | null; camadas: number | null; extras: number | null;
  tempo_maquina_min: number | null; tempo_mao_obra_min: number | null; preco_mercado: number | null;
  preco_mercado_vendas: number | null; preco_mercado_titulo: string | null; preco_mercado_link: string | null;
  produtos: { titulo: string; preco: number | null; preco_a_partir_de: boolean; status: string } | null;
  materiais: { nome: string; custo_unitario: number; largura_cm: number; altura_cm: number } | null;
};

const pct = (v: number) => +(v * 100).toFixed(2);
const vendas = (v: number | null) => (v == null ? "" : v >= 1000 ? `+${v / 1000} mil` : `+${v}`);

export default async function Precificacao() {
  const sb = await requireAdmin();
  const [{ data: cfgRaw }, { data }] = await Promise.all([
    sb.from("config_precificacao").select(CFG_SELECT).eq("id", 1).single(),
    sb.from("produto_custos").select(`produto_id, largura_cm, altura_cm, camadas, extras, tempo_maquina_min, tempo_mao_obra_min, preco_mercado, preco_mercado_vendas, preco_mercado_titulo, preco_mercado_link, produtos!inner(titulo, preco, preco_a_partir_de, status, ${PROD_EMB}), materiais(nome, custo_unitario, largura_cm, altura_cm)`).neq("produtos.status", "inativo").not("material_id", "is", null),
  ]);
  const papelaoM2 = papelaoDoCfg(cfgRaw);
  const cfg = numCfg(cfgRaw!);
  const d = derivados(cfg);
  const linhas = ((data ?? []) as unknown as Linha[]).map((r) => {
    const m = Array.isArray(r.materiais) ? r.materiais[0] : r.materiais;
    const p = Array.isArray(r.produtos) ? r.produtos[0] : r.produtos;
    const custo = custoPeca(cfg, {
      material_custo: m?.custo_unitario ?? null, material_largura: m?.largura_cm ?? null, material_altura: m?.altura_cm ?? null,
      largura_cm: r.largura_cm, altura_cm: r.altura_cm, camadas: r.camadas, extras: r.extras,
      tempo_maquina_min: r.tempo_maquina_min, tempo_mao_obra_min: r.tempo_mao_obra_min,
      caixa_custo: embalagemCusto(r.produtos, papelaoM2),
    });
    const pr = precos(cfg, custo);
    const s = sugerido(r.preco_mercado != null ? Number(r.preco_mercado) : null, pr.pix, p?.preco != null && !p.preco_a_partir_de ? Number(p.preco) : null);
    return { r, p, custo, pr, s };
  }).sort((a, b) => (a.p?.titulo ?? "").localeCompare(b.p?.titulo ?? "", "pt-BR"));

  const C = (k: keyof typeof cfg, label: string, pc = false) => (
    <label className={rotulo}>{label}<input name={k} inputMode="decimal" defaultValue={pc ? pct(cfg[k]) : cfg[k]} className={campo} /></label>
  );

  return (
    <>
      <Topo titulo="Precificação" />
      <p className="mb-4 text-sm text-[var(--soft)] max-w-3xl">
        Regra da loja: o preço é o do anúncio que <b>mais vende</b> no Mercado Livre para a mesma peça (empate: o mais barato).
        Se ele ficar abaixo do seu preço mínimo no Pix, vale o mínimo. O custo usa os materiais do estoque.
      </p>

      <details className={`${cartao} mb-5`}>
        <summary className="cursor-pointer font-semibold">
          Parâmetros · hora {formatBRL(d.valorHora)} · máquina {formatBRL(d.maquinaHora)}/h · DAS {formatBRL(d.dasPeca)}/peça · margem {pct(cfg.margem)}%
        </summary>
        <form action={salvarConfig} className="mt-4 grid gap-3 grid-cols-2 md:grid-cols-4">
          <h3 className="col-span-full font-semibold">MEI e sua hora</h3>
          {C("teto_mei", "Teto anual do MEI (R$)")}{C("das_mensal", "DAS mensal (R$)")}{C("horas_mes", "Horas de produção/mês")}
          {C("parte_retirada", "Sua retirada (% do faturamento)", true)}{C("pecas_mes", "Peças por mês")}
          <h3 className="col-span-full font-semibold mt-2">Máquina</h3>
          {C("tarifa_kwh", "Energia (R$/kWh)")}{C("potencia_kw", "Potência ligada (kW)")}{C("valor_laser", "Valor do laser (R$)")}
          {C("vida_laser_h", "Vida útil (horas)")}{C("manutencao_h", "Manutenção (R$/h)")}
          <h3 className="col-span-full font-semibold mt-2">Venda e taxas</h3>
          {C("perda", "Perda de material (%)", true)}{C("margem", "Margem de lucro (%)", true)}{C("taxa_pix", "Pix MP (%)", true)}
          {C("taxa_cartao", "Cartão MP (%)", true)}{C("ml_comissao", "Comissão ML (%)", true)}{C("ml_fixo", "Custo ML < R$79 (R$)")}
          {C("shp_pct1", "Shopee até 79,99 (%)", true)}{C("shp_fixo1", "Shopee até 79,99 fixo (R$)")}{C("shp_pct2", "Shopee 80+ (%)", true)}
          {C("shp_fixo2", "Shopee 80–99 fixo")}{C("shp_fixo3", "Shopee 100–199 fixo")}{C("shp_fixo4", "Shopee 200+ fixo")}
          <div className="col-span-full"><button className={btn} type="submit">Salvar parâmetros</button></div>
        </form>
      </details>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <form action={aplicarPrecos}>
          <BotaoConfirmar className={btn} msg="Trocar o preço de TODOS os produtos da lista pelo sugerido?">Aplicar sugeridos em todos</BotaoConfirmar>
        </form>
        <span className="text-sm text-[var(--soft)]">Entram aqui os produtos com chapa e medidas preenchidas na página do produto, em “Custos”. Serviços e kits de marca ficam de fora.</span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-[var(--card)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--sel)] text-left">
            <tr>
              {["Produto", "Custo", "Mínimo Pix", "Mín. ML", "Mín. Shopee", "Mercado (mais vendido)", "Sugerido", "Na loja", ""].map((h) => (
                <th key={h} className="px-3 py-2 font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {linhas.map(({ r, p, custo, pr, s }) => {
              const naLoja = p?.preco != null ? Number(p.preco) : null;
              const igual = naLoja != null && Math.abs(naLoja - s.valor) < 0.01 && !p?.preco_a_partir_de;
              return (
                <tr key={r.produto_id} className="border-t border-[var(--line)] align-top">
                  <td className="px-3 py-2"><Link href={`/admin/produtos/${r.produto_id}`} className="font-semibold hover:underline">{p?.titulo}</Link></td>
                  <td className="px-3 py-2 tabular-nums">{formatBRL(custo)}</td>
                  <td className="px-3 py-2 tabular-nums">{formatBRL(pr.pix)}</td>
                  <td className="px-3 py-2 tabular-nums">{formatBRL(pr.ml)}</td>
                  <td className="px-3 py-2 tabular-nums">{formatBRL(pr.shopee)}</td>
                  <td className="px-3 py-2">
                    {r.preco_mercado != null ? (
                      <>
                        <span className="tabular-nums font-semibold">{formatBRL(Number(r.preco_mercado))}</span>
                        <span className="text-xs text-[var(--soft)]"> · {vendas(r.preco_mercado_vendas)} vendidos</span>
                        {r.preco_mercado_titulo && (
                          <div className="text-xs text-[var(--soft)] max-w-64 truncate">
                            {r.preco_mercado_link ? <a href={r.preco_mercado_link} target="_blank" rel="noopener" className="underline">{r.preco_mercado_titulo}</a> : r.preco_mercado_titulo}
                          </div>
                        )}
                      </>
                    ) : <span className="text-[var(--soft)]">—</span>}
                  </td>
                  <td className="px-3 py-2">
                    <b className="tabular-nums">{formatBRL(s.valor)}</b>
                    {s.motivo !== "mercado" && <div className="text-xs" style={{ color: s.motivo.startsWith("sem") ? "var(--soft)" : "var(--coral)" }}>{s.motivo}</div>}
                  </td>
                  <td className="px-3 py-2 tabular-nums">{naLoja != null ? `${p?.preco_a_partir_de ? "a partir de " : ""}${formatBRL(naLoja)}` : "sob consulta"}</td>
                  <td className="px-3 py-2">
                    {!igual && (
                      <form action={aplicarPrecos}>
                        <input type="hidden" name="produto_id" value={r.produto_id} />
                        <button className={`${btn2} min-h-8 px-3 text-xs`} type="submit">Aplicar</button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
