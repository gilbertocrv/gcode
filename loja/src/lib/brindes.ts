export type Brinde = {
  id: string; ordem: number; icone: string | null; nome: string; descricao: string | null; contato: string | null;
  preco_1: number; preco_20: number; preco_50: number; preco_100: number; ativo: boolean;
};
export type Dia = { dia: number; data: string | null; rotulo: string | null };
export const BRINDE_COLS = "id, ordem, icone, nome, descricao, contato, preco_1, preco_20, preco_50, preco_100, ativo";
export const numBrinde = (b: Record<string, unknown>) =>
  ({ ...b, preco_1: +(b.preco_1 as number), preco_20: +(b.preco_20 as number), preco_50: +(b.preco_50 as number), preco_100: +(b.preco_100 as number) }) as Brinde;
export const precoUn = (b: Brinde, q: number) => (q >= 100 ? b.preco_100 : q >= 50 ? b.preco_50 : q >= 20 ? b.preco_20 : b.preco_1);
export const BRINDES_DE_PRESENTE = 20;
export const rotuloDia = (d: Dia) => {
  const base = d.rotulo || `${d.dia}º dia`;
  if (!d.data) return base;
  const [y, m, dd] = d.data.split("-");
  return `${base} · ${dd}/${m}`;
};
