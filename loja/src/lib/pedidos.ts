export const STATUS_PEDIDO = [
  { v: "orcamento", nome: "Orçamento" },
  { v: "aguardando_pagamento", nome: "Aguardando pagamento" },
  { v: "em_producao", nome: "Em produção" },
  { v: "enviado", nome: "Enviado" },
  { v: "concluido", nome: "Concluído" },
  { v: "cancelado", nome: "Cancelado" },
] as const;
export type StatusPedido = (typeof STATUS_PEDIDO)[number]["v"];
export const nomeStatus = (s: string) => STATUS_PEDIDO.find((x) => x.v === s)?.nome ?? s;

/** Próximo passo natural do fluxo. */
export const PROXIMO: Partial<Record<StatusPedido, StatusPedido>> = {
  orcamento: "aguardando_pagamento",
  aguardando_pagamento: "em_producao",
  em_producao: "enviado",
  enviado: "concluido",
};

export const ORIGENS = [
  { v: "site", nome: "Site" },
  { v: "whatsapp", nome: "WhatsApp" },
  { v: "mercado_livre", nome: "Mercado Livre" },
  { v: "instagram", nome: "Instagram" },
  { v: "balcao", nome: "Balcão" },
] as const;
export const nomeOrigem = (s: string) => ORIGENS.find((x) => x.v === s)?.nome ?? s;

export const PAGAMENTOS = [
  { v: "pix", nome: "Pix" },
  { v: "mercado_pago", nome: "Mercado Pago" },
  { v: "mercado_livre", nome: "Mercado Livre" },
  { v: "dinheiro", nome: "Dinheiro" },
  { v: "cartao", nome: "Cartão" },
  { v: "outro", nome: "Outro" },
] as const;

export const COR_STATUS: Record<string, string> = {
  orcamento: "#B7791F",
  aguardando_pagamento: "#C2452A",
  em_producao: "#167C81",
  enviado: "#2B6CB0",
  concluido: "#1E7A46",
  cancelado: "#718096",
};
