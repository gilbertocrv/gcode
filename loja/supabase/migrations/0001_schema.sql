-- =====================================================================
-- G-Code · Sistema da loja  ·  0001_schema.sql
-- Supabase (PostgreSQL 15+). Rode inteiro no SQL Editor, uma vez.
-- Tabelas: categorias, produtos, produto_imagens, produto_custos,
--          clientes, pedidos, itens_pedido, pedido_historico,
--          materiais, admins  ·  + funções, gatilhos, RLS e Storage
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Tipos
-- ---------------------------------------------------------------------
create type public.status_produto as enum ('disponivel','sob_encomenda','vendido','inativo');
create type public.tipo_produto   as enum ('peca_unica','tiragem','sob_medida','servico','kit');
create type public.status_pedido  as enum ('orcamento','aguardando_pagamento','em_producao','enviado','concluido','cancelado');
create type public.origem         as enum ('site','whatsapp','mercado_livre','instagram','balcao');
create type public.forma_pagamento as enum ('pix','mercado_pago','mercado_livre','dinheiro','cartao','outro');

-- ---------------------------------------------------------------------
-- 1. Utilidades
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end $$;

-- Quem é administrador (você). Cadastre o seu usuário aqui depois do 1º login.
create table public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  nome       text not null,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------
-- 2. Catálogo
-- ---------------------------------------------------------------------
create table public.categorias (
  slug  text primary key,                    -- ex.: 'mus'
  nome  text not null,                       -- ex.: 'Música'
  ordem int  not null default 0,
  ativa boolean not null default true
);

create table public.produtos (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique,                  -- usado na URL: /produto/quadro-onda-sonora
  categoria          text references public.categorias(slug) on update cascade,
  titulo             text not null,
  descricao          text,
  tecnica            text,                                   -- ex.: 'MDF 3 mm, corte e gravação a laser'
  dimensoes          text,                                   -- ex.: '30 × 14 cm'
  preco              numeric(10,2) check (preco is null or preco >= 0),  -- null = sob consulta
  preco_a_partir_de  boolean not null default false,         -- mostra "a partir de R$ ..."
  status             public.status_produto not null default 'sob_encomenda',
  tipo               public.tipo_produto   not null default 'sob_medida',
  controla_estoque   boolean not null default false,         -- true p/ peça única e tiragem
  estoque            int not null default 0 check (estoque >= 0),
  estoque_minimo     int not null default 0 check (estoque_minimo >= 0),
  prazo_producao_dias int check (prazo_producao_dias is null or prazo_producao_dias >= 0),
  personalizavel     boolean not null default true,
  personalizacao_url text,                                   -- ex.: '/onda' (gerador da onda sonora)
  destaque           boolean not null default false,
  foto_real          boolean not null default false,         -- "foto real" x "prévia"
  ml_item_id         text,                                   -- ex.: 'MLB5615553467'
  ml_url             text,                                   -- link do anúncio no Mercado Livre
  ordem              int not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index on public.produtos (categoria, ordem);
create index on public.produtos (status);
create trigger trg_produtos_upd before update on public.produtos
  for each row execute function public.set_updated_at();

-- Fotos: storage_path (Supabase Storage) OU url (imagens antigas do GitHub Pages)
create table public.produto_imagens (
  id           uuid primary key default gen_random_uuid(),
  produto_id   uuid not null references public.produtos(id) on delete cascade,
  storage_path text,
  url          text,
  alt          text,
  ordem        int not null default 0,
  check (storage_path is not null or url is not null)
);
create index on public.produto_imagens (produto_id, ordem);

-- Dados internos do produto (nunca aparecem na vitrine)
create table public.produto_custos (
  produto_id         uuid primary key references public.produtos(id) on delete cascade,
  custo_material     numeric(10,2),
  tempo_maquina_min  int,
  extras             numeric(10,2),
  descricao_extras   text,
  arquivo_corte      text,      -- ex.: 'D:\CNC LASER\01 MINHAS ARTES\36 Musica'
  notas              text,
  updated_at         timestamptz not null default now()
);
create trigger trg_custos_upd before update on public.produto_custos
  for each row execute function public.set_updated_at();

-- Estoque de matéria-prima (MDF, acrílico, cortiça...) — vem da "Gestão"
create table public.materiais (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  material      text not null,                 -- 'MDF cru', 'Acrílico', ...
  espessura_mm  numeric(4,1),
  largura_cm    numeric(6,1),
  altura_cm     numeric(6,1),
  quantidade    numeric(8,2) not null default 0 check (quantidade >= 0),
  custo_unitario numeric(10,2),
  minimo        numeric(8,2),
  obs           text,
  updated_at    timestamptz not null default now()
);
create trigger trg_materiais_upd before update on public.materiais
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 3. Clientes e pedidos
-- ---------------------------------------------------------------------
create table public.clientes (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  whatsapp      text unique,                   -- só dígitos com DDD: 73988062663
  email         text,
  instagram     text,
  cidade        text,
  uf            char(2),
  origem        public.origem not null default 'site',
  aceite_lgpd_em timestamptz,                  -- quando aceitou guardar os dados
  observacoes   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on public.clientes (lower(nome));
create trigger trg_clientes_upd before update on public.clientes
  for each row execute function public.set_updated_at();

create table public.pedidos (
  id                uuid primary key default gen_random_uuid(),
  numero            bigint generated always as identity (start with 1001) unique,
  cliente_id        uuid references public.clientes(id) on delete set null,
  origem            public.origem not null default 'site',
  encomenda_manual  boolean not null default false,          -- criada por você no painel
  status            public.status_pedido not null default 'orcamento',
  subtotal          numeric(10,2),
  frete             numeric(10,2) not null default 0,
  desconto          numeric(10,2) not null default 0,
  total             numeric(10,2),
  forma_pagamento   public.forma_pagamento,
  pago_em           timestamptz,
  -- Mercado Pago (Checkout Pro) / Mercado Livre
  mp_preference_id  text,
  mp_payment_id     text,
  mp_status         text,                                    -- approved, pending, rejected...
  ml_order_id       text,                                    -- venda feita no Mercado Livre
  -- produção e entrega
  prazo_entrega     date,
  codigo_rastreio   text,
  observacoes       text,                                    -- do cliente
  notas_internas    text,                                    -- só você vê
  estoque_baixado   boolean not null default false,
  token_acompanhamento uuid not null default gen_random_uuid(),  -- p/ o cliente consultar o status
  concluido_em      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index on public.pedidos (status, created_at desc);
create index on public.pedidos (cliente_id);
create unique index on public.pedidos (mp_payment_id) where mp_payment_id is not null;
create unique index on public.pedidos (ml_order_id)   where ml_order_id   is not null;
create trigger trg_pedidos_upd before update on public.pedidos
  for each row execute function public.set_updated_at();

create table public.itens_pedido (
  id              uuid primary key default gen_random_uuid(),
  pedido_id       uuid not null references public.pedidos(id) on delete cascade,
  produto_id      uuid references public.produtos(id) on delete set null,  -- null = item avulso
  descricao       text not null,                         -- cópia do título no momento do pedido
  quantidade      int not null default 1 check (quantidade > 0),
  preco_unitario  numeric(10,2),                         -- null = a orçar
  subtotal        numeric(10,2) generated always as (quantidade * preco_unitario) stored,
  -- Ex. onda sonora: {"codigo_onda":"GC1.…","texto1":"…","texto2":"…","cores":"Creme e azul-petróleo","qr":true,"audio":"pedidos/1001/audio.mp3"}
  personalizacao  jsonb not null default '{}'::jsonb
);
create index on public.itens_pedido (pedido_id);
create index on public.itens_pedido (produto_id);

create table public.pedido_historico (
  id          bigint generated always as identity primary key,
  pedido_id   uuid not null references public.pedidos(id) on delete cascade,
  status_de   public.status_pedido,
  status_para public.status_pedido not null,
  nota        text,
  feito_por   uuid default auth.uid(),
  created_at  timestamptz not null default now()
);
create index on public.pedido_historico (pedido_id, created_at);

-- ---------------------------------------------------------------------
-- 4. Regras automáticas
-- ---------------------------------------------------------------------

-- 4.1 Recalcula subtotal/total do pedido quando os itens mudam
create or replace function public.recalcular_pedido(p_pedido uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_sub numeric(10,2); v_tem_null boolean;
begin
  select sum(subtotal), bool_or(preco_unitario is null)
    into v_sub, v_tem_null
    from public.itens_pedido where pedido_id = p_pedido;
  update public.pedidos
     set subtotal = case when v_tem_null then null else coalesce(v_sub,0) end,
         total    = case when v_tem_null then null else coalesce(v_sub,0) + frete - desconto end
   where id = p_pedido;
end $$;

create or replace function public.trg_itens_recalc()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform public.recalcular_pedido(coalesce(new.pedido_id, old.pedido_id));
  return null;
end $$;
create trigger trg_itens_recalc after insert or update or delete on public.itens_pedido
  for each row execute function public.trg_itens_recalc();

create or replace function public.trg_pedido_totais()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.subtotal is not null then new.total := new.subtotal + new.frete - new.desconto; end if;
  return new;
end $$;
create trigger trg_pedido_totais before update of frete, desconto on public.pedidos
  for each row execute function public.trg_pedido_totais();

-- 4.2 Histórico de status + baixa/devolução automática de estoque
create or replace function public.trg_pedido_status()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status is distinct from old.status then
    insert into public.pedido_historico (pedido_id, status_de, status_para)
    values (new.id, old.status, new.status);

    if new.status = 'concluido' then
      new.concluido_em := coalesce(new.concluido_em, now());
    end if;

    -- baixa quando concluir (uma vez só)
    if new.status = 'concluido' and not old.estoque_baixado then
      update public.produtos p
         set estoque = greatest(0, p.estoque - i.qtd),
             status  = case when p.tipo in ('peca_unica','tiragem')
                             and p.estoque - i.qtd <= 0 then 'vendido'::public.status_produto
                            else p.status end
        from (select produto_id, sum(quantidade) qtd from public.itens_pedido
               where pedido_id = new.id and produto_id is not null group by produto_id) i
       where p.id = i.produto_id and p.controla_estoque;
      new.estoque_baixado := true;
    end if;

    -- devolve se cancelar depois de ter baixado
    if new.status = 'cancelado' and old.estoque_baixado then
      update public.produtos p
         set estoque = p.estoque + i.qtd,
             status  = case when p.status = 'vendido' then 'disponivel'::public.status_produto else p.status end
        from (select produto_id, sum(quantidade) qtd from public.itens_pedido
               where pedido_id = new.id and produto_id is not null group by produto_id) i
       where p.id = i.produto_id and p.controla_estoque;
      new.estoque_baixado := false;
    end if;
  end if;
  return new;
end $$;
create trigger trg_pedido_status before update of status on public.pedidos
  for each row execute function public.trg_pedido_status();

create or replace function public.trg_pedido_inicial()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.pedido_historico (pedido_id, status_de, status_para, nota)
  values (new.id, null, new.status, 'pedido criado');
  return null;
end $$;
create trigger trg_pedido_inicial after insert on public.pedidos
  for each row execute function public.trg_pedido_inicial();

-- ---------------------------------------------------------------------
-- 5. Pedido feito pela vitrine (único jeito de o público gravar algo)
--    O preço é sempre lido do banco: o cliente não consegue mudar valores.
-- ---------------------------------------------------------------------
create or replace function public.criar_pedido(
  p_cliente     jsonb,      -- {"nome":"…","whatsapp":"73999999999","email":"…","cidade":"…","uf":"BA"}
  p_itens       jsonb,      -- [{"produto_id":"uuid","quantidade":1,"personalizacao":{…}}]
  p_observacoes text default null,
  p_aceite_lgpd boolean default false
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_nome  text := btrim(p_cliente->>'nome');
  v_wpp   text := regexp_replace(coalesce(p_cliente->>'whatsapp',''), '\D', '', 'g');
  v_cli   uuid; v_ped uuid; v_num bigint; v_tok uuid;
  v_item  jsonb; v_prod public.produtos%rowtype; v_qtd int;
  v_algum_sem_preco boolean := false; v_total numeric(10,2); v_status public.status_pedido;
begin
  if not p_aceite_lgpd then raise exception 'É preciso aceitar o uso dos dados para o pedido.'; end if;
  if v_nome is null or length(v_nome) not between 2 and 80 then raise exception 'Nome inválido.'; end if;
  if length(v_wpp) not between 10 and 13 then raise exception 'WhatsApp inválido (use DDD + número).'; end if;
  if jsonb_typeof(p_itens) <> 'array' or jsonb_array_length(p_itens) not between 1 and 20 then
    raise exception 'O pedido precisa ter de 1 a 20 itens.'; end if;
  if length(coalesce(p_observacoes,'')) > 2000 then raise exception 'Observação muito longa.'; end if;

  -- cliente: reaproveita pelo WhatsApp (não sobrescreve dados existentes)
  select id into v_cli from public.clientes where whatsapp = v_wpp;
  if v_cli is null then
    insert into public.clientes (nome, whatsapp, email, cidade, uf, origem, aceite_lgpd_em)
    values (v_nome, v_wpp, nullif(btrim(p_cliente->>'email'),''), nullif(btrim(p_cliente->>'cidade'),''),
            upper(nullif(left(btrim(p_cliente->>'uf'),2),'')), 'site', now())
    returning id into v_cli;
  end if;

  insert into public.pedidos (cliente_id, origem, status, observacoes)
  values (v_cli, 'site', 'orcamento', nullif(btrim(p_observacoes),''))
  returning id, numero, token_acompanhamento into v_ped, v_num, v_tok;

  for v_item in select * from jsonb_array_elements(p_itens) loop
    v_qtd := coalesce((v_item->>'quantidade')::int, 1);
    if v_qtd not between 1 and 50 then raise exception 'Quantidade inválida.'; end if;
    if length(coalesce(v_item->>'personalizacao','')) > 4000 then raise exception 'Personalização muito longa.'; end if;

    select * into v_prod from public.produtos
     where id = (v_item->>'produto_id')::uuid and status in ('disponivel','sob_encomenda');
    if not found then raise exception 'Produto indisponível.'; end if;
    if v_prod.controla_estoque and v_prod.status = 'disponivel' and v_prod.estoque < v_qtd then
      raise exception 'Só temos % unidade(s) de "%".', v_prod.estoque, v_prod.titulo; end if;

    if v_prod.preco is null or v_prod.preco_a_partir_de then v_algum_sem_preco := true; end if;

    insert into public.itens_pedido (pedido_id, produto_id, descricao, quantidade, preco_unitario, personalizacao)
    values (v_ped, v_prod.id, v_prod.titulo, v_qtd,
            case when v_prod.preco_a_partir_de then null else v_prod.preco end,
            coalesce(v_item->'personalizacao','{}'::jsonb));
  end loop;

  -- tudo com preço fechado → pode ir direto para o pagamento
  v_status := case when v_algum_sem_preco then 'orcamento' else 'aguardando_pagamento' end;
  update public.pedidos set status = v_status where id = v_ped returning total into v_total;

  return jsonb_build_object('pedido_id', v_ped, 'numero', v_num, 'token', v_tok,
                            'status', v_status, 'total', v_total);
end $$;

-- Cliente acompanha o pedido com número + token (link enviado no WhatsApp)
create or replace function public.consultar_pedido(p_numero bigint, p_token uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'numero', p.numero, 'status', p.status, 'total', p.total, 'prazo_entrega', p.prazo_entrega,
    'codigo_rastreio', p.codigo_rastreio, 'criado_em', p.created_at,
    'itens', (select jsonb_agg(jsonb_build_object('descricao', i.descricao, 'quantidade', i.quantidade))
                from public.itens_pedido i where i.pedido_id = p.id))
  from public.pedidos p where p.numero = p_numero and p.token_acompanhamento = p_token;
$$;

-- ---------------------------------------------------------------------
-- 6. Painel: visões (respeitam o RLS de quem consulta)
-- ---------------------------------------------------------------------
create or replace view public.vw_dashboard with (security_invoker = on) as
select
  (select coalesce(sum(total),0) from public.pedidos
    where status in ('em_producao','enviado','concluido')
      and coalesce(pago_em, created_at) >= date_trunc('month', now()))      as vendas_mes,
  (select count(*) from public.pedidos
    where status in ('em_producao','enviado','concluido')
      and coalesce(pago_em, created_at) >= date_trunc('month', now()))      as pedidos_pagos_mes,
  (select count(*) from public.pedidos where status = 'orcamento')            as orcamentos,
  (select count(*) from public.pedidos where status = 'aguardando_pagamento') as aguardando_pagamento,
  (select count(*) from public.pedidos where status = 'em_producao')          as em_producao,
  (select count(*) from public.produtos
    where controla_estoque and status <> 'inativo' and estoque <= estoque_minimo) as produtos_estoque_baixo,
  (select count(*) from public.materiais where minimo is not null and quantidade < minimo) as materiais_baixos;

create or replace view public.vw_estoque_baixo with (security_invoker = on) as
  select 'produto'::text as tipo, id, titulo as nome, estoque::numeric as quantidade, estoque_minimo::numeric as minimo
    from public.produtos where controla_estoque and status <> 'inativo' and estoque <= estoque_minimo
  union all
  select 'material', id, nome, quantidade, minimo
    from public.materiais where minimo is not null and quantidade < minimo;

-- ---------------------------------------------------------------------
-- 7. Segurança (RLS)
-- ---------------------------------------------------------------------
alter table public.admins           enable row level security;
alter table public.categorias       enable row level security;
alter table public.produtos         enable row level security;
alter table public.produto_imagens  enable row level security;
alter table public.produto_custos   enable row level security;
alter table public.materiais        enable row level security;
alter table public.clientes         enable row level security;
alter table public.pedidos          enable row level security;
alter table public.itens_pedido     enable row level security;
alter table public.pedido_historico enable row level security;

-- Vitrine: qualquer pessoa lê categorias ativas, produtos visíveis e as fotos deles
create policy "vitrine lê categorias" on public.categorias for select
  to anon, authenticated using (ativa or public.is_admin());
create policy "vitrine lê produtos" on public.produtos for select
  to anon, authenticated using (status <> 'inativo' or public.is_admin());
create policy "vitrine lê fotos" on public.produto_imagens for select
  to anon, authenticated using (exists (select 1 from public.produtos p
                                         where p.id = produto_id and (p.status <> 'inativo' or public.is_admin())));

-- Admin: acesso total a tudo
create policy "admin categorias" on public.categorias       for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin produtos"   on public.produtos         for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin fotos"      on public.produto_imagens  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin custos"     on public.produto_custos   for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin materiais"  on public.materiais        for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin clientes"   on public.clientes         for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin pedidos"    on public.pedidos          for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin itens"      on public.itens_pedido     for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin historico"  on public.pedido_historico for select to authenticated using (public.is_admin());
create policy "admin vê admins"  on public.admins           for select to authenticated using (public.is_admin());
-- (inclusões em "admins" só pelo SQL Editor: ninguém se promove pelo site)

-- O público só grava pedidos pelas funções acima
revoke all on function public.criar_pedido(jsonb, jsonb, text, boolean) from public;
revoke all on function public.consultar_pedido(bigint, uuid)            from public;
revoke all on function public.recalcular_pedido(uuid)                   from public, anon, authenticated;
grant execute on function public.criar_pedido(jsonb, jsonb, text, boolean) to anon, authenticated;
grant execute on function public.consultar_pedido(bigint, uuid)            to anon, authenticated;

-- ---------------------------------------------------------------------
-- 8. Storage (fotos dos produtos e arquivos de pedidos)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('produtos', 'produtos', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit)
values ('pedidos', 'pedidos', false, 52428800)        -- áudios, SVGs e prévias: privado
on conflict (id) do nothing;

create policy "fotos públicas" on storage.objects for select
  to anon, authenticated using (bucket_id = 'produtos');
create policy "admin envia fotos" on storage.objects for insert
  to authenticated with check (bucket_id in ('produtos','pedidos') and public.is_admin());
create policy "admin altera arquivos" on storage.objects for update
  to authenticated using (bucket_id in ('produtos','pedidos') and public.is_admin());
create policy "admin apaga arquivos" on storage.objects for delete
  to authenticated using (bucket_id in ('produtos','pedidos') and public.is_admin());
create policy "admin lê pedidos" on storage.objects for select
  to authenticated using (bucket_id = 'pedidos' and public.is_admin());
