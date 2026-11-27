-- Código interno (etiqueta com QR) e código de barras de fábrica (EAN) para dar baixa pelo celular
create sequence if not exists public.produtos_codigo_seq;
alter table public.produtos
  add column if not exists codigo text,
  add column if not exists ean text;
update public.produtos p set codigo = 'GC' || lpad(nextval('public.produtos_codigo_seq')::text, 4, '0')
  from (select id from public.produtos where codigo is null order by created_at, titulo) o
  where p.id = o.id;
alter table public.produtos
  alter column codigo set default ('GC' || lpad(nextval('public.produtos_codigo_seq')::text, 4, '0')),
  alter column codigo set not null;
create unique index if not exists produtos_codigo_key on public.produtos (codigo);
create index if not exists produtos_ean_idx on public.produtos (ean) where ean is not null;
