import { derivados, type Config } from "./precificacao";

/** Chaveiros saem em folhas: o pedido paga as folhas que gasta, mesmo que sobrem lugares. */
export type Formato = {
  id: string; nome: string; descricao: string | null; largura_cm: number; altura_cm: number;
  pecas_folha: number; custo_folha: number; impressao_folha: number; maquina_min: number; mao_obra_min: number;
  ativo: boolean; ordem: number;
};
export type ConfigChav = Config & { chav_argola: number; chav_saco: number; chav_montagem_min: number; chav_arte_nova: number };
export type Opcoes = { saco: boolean; arteNova: boolean; pagamento: "pix" | "cartao" };

export const FORMATO_COLS = "id, nome, descricao, largura_cm, altura_cm, pecas_folha, custo_folha, impressao_folha, maquina_min, mao_obra_min, ativo, ordem";
export const numFormato = (f: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(f).map(([k, v]) => [k, typeof v === "string" && v !== "" && !isNaN(+v) && k !== "id" && k !== "nome" ? +v : v])) as unknown as Formato;

const fim90 = (v: number) => Math.max(0.9, Math.ceil(v) - 0.1);

export function orcar(cfg: ConfigChav, f: Formato, qtd: number, o: Opcoes) {
  const d = derivados(cfg);
  const q = Math.max(0, Math.floor(qtd));
  const folhas = q ? Math.ceil(q / f.pecas_folha) : 0;
  const porFolha = f.custo_folha * (1 + cfg.perda) + f.impressao_folha
    + (f.maquina_min / 60) * d.maquinaHora + (f.mao_obra_min / 60) * d.valorHora;
  const porPeca = cfg.chav_argola + (o.saco ? cfg.chav_saco : 0) + (cfg.chav_montagem_min / 60) * d.valorHora;
  const custo = q ? folhas * porFolha + q * porPeca + d.dasPeca : 0;
  const taxa = o.pagamento === "pix" ? cfg.taxa_pix : cfg.taxa_cartao;
  const arte = o.arteNova && q ? cfg.chav_arte_nova : 0;
  const total = q ? fim90(custo / (1 - taxa - cfg.margem)) + arte : 0;
  const vagas = folhas * f.pecas_folha;
  return {
    qtd: q, folhas, vagas, sobra: vagas - q, aproveitamento: vagas ? q / vagas : 0,
    custo, arte, total, unit: q ? total / q : 0, porFolha, porPeca,
  };
}

/** Faixas de preço em folhas cheias (para a tabela da loja e do orçamento). */
export function faixas(cfg: ConfigChav, f: Formato, o: Opcoes, folhas = [1, 2, 3, 5, 10]) {
  return folhas.map((n) => orcar(cfg, f, n * f.pecas_folha, o));
}
