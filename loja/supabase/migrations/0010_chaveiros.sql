-- Orçamento de chaveiros por folha: o preço depende de quantas folhas o pedido gasta
create table if not exists public.chaveiro_formatos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  largura_cm numeric not null,
  altura_cm numeric not null,
  pecas_folha int not null check (pecas_folha > 0),
  custo_folha numeric not null default 0,       -- material da folha (R$)
  impressao_folha numeric not null default 0,   -- adesivo impresso colorido por folha (R$)
  maquina_min numeric not null default 0,       -- laser por folha
  mao_obra_min numeric not null default 0,      -- preparar, tirar da máquina, limpar
  ativo boolean not null default true,
  ordem int not null default 0
);
alter table public.chaveiro_formatos enable row level security;
create policy "chaveiro_formatos leitura" on public.chaveiro_formatos for select using (true);
create policy "chaveiro_formatos admin" on public.chaveiro_formatos for all using (public.is_admin()) with check (public.is_admin());
grant select on public.chaveiro_formatos to anon, authenticated;
grant insert, update, delete on public.chaveiro_formatos to authenticated;

alter table public.config_precificacao
  add column if not exists chav_argola numeric not null default 0.34,
  add column if not exists chav_saco numeric not null default 0.23,
  add column if not exists chav_montagem_min numeric not null default 0.5,
  add column if not exists chav_arte_nova numeric not null default 15;

insert into public.chaveiro_formatos (nome, descricao, largura_cm, altura_cm, pecas_folha, custo_folha, impressao_folha, maquina_min, mao_obra_min, ordem)
select * from (values
  ('MDF 3 mm gravado', 'Folha 20×28 cm, 16 chaveiros de ~5 cm', 20, 28, 16, 1.40, 0, 35, 15, 1),
  ('MDF 3 mm + adesivo colorido', 'Arte impressa em papel fotográfico adesivo e recortada no laser', 20, 28, 16, 1.40, 1.90, 25, 20, 2),
  ('Acrílico espelhado dourado 2 mm', 'Folha 30×40 cm, 48 chaveiros', 30, 40, 48, 20.04, 0, 60, 20, 3),
  ('Acrílico espelhado prata 2 mm', 'Folha 30×40 cm, 48 chaveiros', 30, 40, 48, 18.19, 0, 60, 20, 4)
) v where not exists (select 1 from public.chaveiro_formatos);
