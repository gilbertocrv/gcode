export type StatusProduto = "disponivel" | "sob_encomenda" | "vendido" | "inativo";
export type TipoProduto = "peca_unica" | "tiragem" | "sob_medida" | "servico" | "kit";

export interface Categoria { slug: string; nome: string; ordem: number; departamento?: string | null }

export interface Departamento { slug: string; nome: string; descricao: string | null; ordem: number; link: string | null }

export interface Colecao { slug: string; nome: string; descricao: string | null; departamento: string | null; destaque: boolean; ordem: number }

export interface ProdutoImagem { url: string | null; storage_path: string | null; alt: string | null; ordem: number }

export interface Produto {
  id: string;
  slug: string;
  categoria: string | null;
  titulo: string;
  descricao: string | null;
  tecnica: string | null;
  dimensoes: string | null;
  preco: number | null;
  preco_a_partir_de: boolean;
  status: StatusProduto;
  tipo: TipoProduto;
  controla_estoque: boolean;
  estoque: number;
  prazo_producao_dias: number | null;
  personalizacao_url: string | null;
  destaque: boolean;
  foto_real: boolean;
  ml_url: string | null;
  ordem: number;
  tags?: string[];
  marca?: string | null;
  compatibilidade?: string | null;
  created_at?: string;
  produto_imagens: ProdutoImagem[];
}

export interface Dashboard {
  vendas_mes: number;
  pedidos_pagos_mes: number;
  orcamentos: number;
  aguardando_pagamento: number;
  em_producao: number;
  produtos_estoque_baixo: number;
  materiais_baixos: number;
}
