-- Precificação no painel: parâmetros (1 linha), custos por produto e preço de mercado
create table public.config_precificacao (
  id            int primary key default 1 check (id = 1),
  teto_mei      numeric(12,2) not null default 81000,
  das_mensal    numeric(10,2) not null default 82.05,
  horas_mes     numeric(6,1)  not null default 80,
  parte_retirada numeric(5,4) not null default 0.5,
  pecas_mes     int           not null default 60,
  tarifa_kwh    numeric(6,3)  not null default 1.17,
  potencia_kw   numeric(6,3)  not null default 0.2,
  valor_laser   numeric(10,2) not null default 2500,
  vida_laser_h  int           not null default 3000,
  manutencao_h  numeric(8,2)  not null default 0.5,
  perda         numeric(5,4)  not null default 0.10,
  margem        numeric(5,4)  not null default 0.20,
  taxa_pix      numeric(6,4)  not null default 0.0099,
  taxa_cartao   numeric(6,4)  not null default 0.0498,
  ml_comissao   numeric(6,4)  not null default 0.12,
  ml_fixo       numeric(8,2)  not null default 6.5,
  shp_pct1      numeric(6,4)  not null default 0.20,
  shp_fixo1     numeric(8,2)  not null default 4.5,
  shp_pct2      numeric(6,4)  not null default 0.14,
  shp_fixo2     numeric(8,2)  not null default 16,
  shp_fixo3     numeric(8,2)  not null default 20,
  shp_fixo4     numeric(8,2)  not null default 26,
  updated_at    timestamptz not null default now()
);
insert into public.config_precificacao (id) values (1);
create trigger trg_config_prec_upd before update on public.config_precificacao
  for each row execute function public.set_updated_at();
alter table public.config_precificacao enable row level security;
create policy "admin config precificacao" on public.config_precificacao
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

alter table public.produto_custos
  add column material_id        uuid references public.materiais(id) on delete set null,
  add column largura_cm         numeric(6,1),
  add column altura_cm          numeric(6,1),
  add column camadas            int not null default 1 check (camadas > 0),
  add column tempo_mao_obra_min int,
  add column preco_mercado        numeric(10,2),
  add column preco_mercado_vendas int,
  add column preco_mercado_titulo text,
  add column preco_mercado_link   text,
  add column preco_mercado_em     date;
