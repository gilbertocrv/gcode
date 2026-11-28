-- Brindes da igreja: cada dia escolhe o seu brinde; preços para quem quiser mais unidades
create table if not exists public.brindes (
  id uuid primary key default gen_random_uuid(),
  ordem int not null default 0,
  icone text, nome text not null, descricao text, contato text,
  preco_1 numeric not null, preco_20 numeric not null, preco_50 numeric not null, preco_100 numeric not null,
  ativo boolean not null default true
);
create table if not exists public.brinde_dias (
  dia int primary key, data date, rotulo text
);
create table if not exists public.brinde_escolhas (
  id uuid primary key default gen_random_uuid(),
  dia int not null references public.brinde_dias(dia) unique,
  brinde_id uuid not null references public.brindes(id),
  nome text not null, whatsapp text not null, grupo text,
  extra int not null default 0 check (extra >= 0 and extra <= 5000),
  obs text, created_at timestamptz not null default now()
);
alter table public.brindes enable row level security;
alter table public.brinde_dias enable row level security;
alter table public.brinde_escolhas enable row level security;
create policy "brindes leitura" on public.brindes for select using (true);
create policy "brindes admin" on public.brindes for all using (public.is_admin()) with check (public.is_admin());
create policy "brinde_dias leitura" on public.brinde_dias for select using (true);
create policy "brinde_dias admin" on public.brinde_dias for all using (public.is_admin()) with check (public.is_admin());
create policy "brinde_escolhas admin" on public.brinde_escolhas for all using (public.is_admin()) with check (public.is_admin());
grant select on public.brindes, public.brinde_dias to anon, authenticated;
grant insert, update, delete on public.brindes, public.brinde_dias, public.brinde_escolhas to authenticated;
grant select on public.brinde_escolhas to authenticated;

insert into public.brinde_dias (dia, rotulo) select g, g || 'º dia' from generate_series(1,8) g on conflict do nothing;
insert into public.brindes (ordem, icone, nome, descricao, contato, preco_1, preco_20, preco_50, preco_100)
select * from (values
 (1,'⛪','Chaveiro Nossa Senhora da Conceição','MDF gravado, ~5 cm, com argola e saquinho.','Contato gravado no verso',6.90,3.50,2.90,2.50),
 (2,'📑','Marcador de página com oração','MDF com Salmo 23 (ou a oração que preferir) e fitinha de cetim.','Contato no pé do marcador',6.90,3.90,3.20,2.80),
 (3,'📖','Chaveiro Bíblia aberta','Bíblia aberta com versículo (João 3:16), com argola e saquinho.','Contato gravado no verso',6.90,3.50,2.90,2.50),
 (4,'🙏','Santinho de MDF','Cartão 6×9 cm em MDF com a Ave-Maria.','Contato e QR do site no verso',4.90,2.90,2.40,1.99),
 (5,'🧲','Ímã de geladeira','"Deus abençoe este lar" em MDF com ímã forte.','Contato no cantinho da frente',7.90,4.90,4.20,3.80),
 (6,'🎁','Caixinha com bombom','Caixinha 5×5×4 cm de tampa gravada, com bombom dentro.','Contato gravado no fundo',9.90,7.50,6.50,6.00),
 (7,'🕊️','Chaveiro pomba do Espírito Santo','Pomba vazada em MDF, com argola e saquinho.','Contato gravado no verso',6.90,3.50,2.90,2.50),
 (8,'✨','Chaveiro Conceição espelho dourado','Edição especial em acrílico espelhado dourado.','Contato gravado no verso',9.90,5.90,4.90,4.20)
) v where not exists (select 1 from public.brindes);
