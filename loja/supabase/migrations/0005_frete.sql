-- Frete: medidas de embalagem por produto e dados de entrega no pedido
alter table public.produtos
  add column peso_g        int check (peso_g is null or peso_g > 0),
  add column caixa_comp_cm numeric(5,1),
  add column caixa_larg_cm numeric(5,1),
  add column caixa_alt_cm  numeric(5,1);

alter table public.pedidos
  add column entrega          text not null default 'retirada' check (entrega in ('retirada','envio','combinar')),
  add column frete_servico    text,
  add column frete_servico_id int,
  add column frete_prazo_dias int,
  add column endereco         jsonb,      -- {cep, rua, numero, complemento, bairro, cidade, uf, documento}
  add column me_order_id      text,       -- pedido de etiqueta no Melhor Envio
  add column etiqueta_url     text;

-- O cliente passa a ver entrega e frete na página de acompanhamento
create or replace function public.consultar_pedido(p_numero bigint, p_token uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'numero', p.numero, 'status', p.status, 'subtotal', p.subtotal, 'frete', p.frete, 'total', p.total,
    'entrega', p.entrega, 'frete_servico', p.frete_servico, 'frete_prazo_dias', p.frete_prazo_dias,
    'prazo_entrega', p.prazo_entrega, 'codigo_rastreio', p.codigo_rastreio, 'criado_em', p.created_at,
    'itens', (select jsonb_agg(jsonb_build_object('descricao', i.descricao, 'quantidade', i.quantidade))
                from public.itens_pedido i where i.pedido_id = p.id))
  from public.pedidos p where p.numero = p_numero and p.token_acompanhamento = p_token;
$$;
