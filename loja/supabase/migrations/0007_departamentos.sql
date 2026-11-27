-- Menu por departamentos, coleções (tags), campos de acessórios e busca

create table if not exists departamentos (
  slug text primary key,
  nome text not null,
  icone text,                 -- nome do ícone Tabler (sem o prefixo ti-)
  descricao text,
  ordem int not null default 0,
  ativa boolean not null default true,
  link text                   -- departamento sem categorias (ex.: assistência) aponta para uma página
);

alter table categorias add column if not exists departamento text references departamentos(slug);

create table if not exists colecoes (
  slug text primary key,      -- é também a tag usada em produtos.tags
  nome text not null,
  descricao text,
  departamento text references departamentos(slug),
  destaque boolean not null default false,   -- aparece no topo do menu (ex.: Natal)
  ordem int not null default 0,
  ativa boolean not null default true
);

alter table produtos add column if not exists tags text[] not null default '{}';
alter table produtos add column if not exists marca text;
alter table produtos add column if not exists compatibilidade text;
alter table produtos add column if not exists created_at timestamptz not null default now();

create index if not exists produtos_tags_idx on produtos using gin (tags);

-- leitura pública, escrita só admin (mesmo padrão das categorias)
alter table departamentos enable row level security;
alter table colecoes enable row level security;
drop policy if exists departamentos_leitura on departamentos;
create policy departamentos_leitura on departamentos for select using (true);
drop policy if exists departamentos_admin on departamentos;
create policy departamentos_admin on departamentos for all using (is_admin()) with check (is_admin());
drop policy if exists colecoes_leitura on colecoes;
create policy colecoes_leitura on colecoes for select using (true);
drop policy if exists colecoes_admin on colecoes;
create policy colecoes_admin on colecoes for all using (is_admin()) with check (is_admin());

insert into departamentos (slug, nome, icone, descricao, ordem, link) values
  ('laser',    'Laser e MDF',              'tree',    'Decoração, relógios, fé, cozinha, organização e festas', 10, null),
  ('presentes','Presentes',                'gift',    'Personalizados e ideias por ocasião',                    20, null),
  ('imp3d',    'Impressão 3D',             'cube',    'Peças impressas em 3D — em breve',                       30, null),
  ('grafica',  'Gráfica e criação',        'printer', 'Adesivos, rótulos, placas e criação de marca',           40, null),
  ('tec',      'Acessórios e tecnologia',  'plug',    'Cabos, carregadores, fones e pilhas a pronta entrega',   50, null),
  ('assist',   'Assistência técnica',      'tool',    'Celular, computador e impressora',                       60, '/assistencia')
on conflict (slug) do update set nome = excluded.nome, icone = excluded.icone, descricao = excluded.descricao,
  ordem = excluded.ordem, link = excluded.link;

-- categorias novas
insert into categorias (slug, nome, ordem, ativa) values
  ('pers',    'Cantis, copos e garrafas', 130, true),
  ('kitpres', 'Kits presente',            140, true),
  ('p3d',     'Peças 3D',                 150, true),
  ('cabos',   'Cabos',                    160, true),
  ('carreg',  'Carregadores e fontes',    170, true),
  ('fones',   'Fones e áudio',            180, true),
  ('pilhas',  'Pilhas e baterias',        190, true),
  ('util',    'Lanternas e utilidades',   200, true)
on conflict (slug) do nothing;

update categorias set departamento = 'laser'    where slug in ('dec','rel','mus','fe','hol','coz','org','chav','festa');
update categorias set departamento = 'presentes' where slug in ('pers','kitpres');
update categorias set departamento = 'imp3d'    where slug in ('p3d');
update categorias set departamento = 'grafica'  where slug in ('ades','neg','arte');
update categorias set departamento = 'tec'      where slug in ('cabos','carreg','fones','pilhas','util');

insert into colecoes (slug, nome, descricao, departamento, destaque, ordem) values
  ('natal',     'Natal 2026',     'Presentes personalizados para o Natal', 'presentes', true, 10),
  ('abrolhos',  'Abrolhos e mar', 'Jubarte, veleiros, ondas e o mar de Caravelas', 'presentes', false, 20),
  ('para-ele',  'Para ele',       null, 'presentes', false, 30),
  ('para-ela',  'Para ela',       null, 'presentes', false, 40),
  ('casa-nova', 'Casa nova',      null, 'presentes', false, 50)
on conflict (slug) do update set nome = excluded.nome, descricao = excluded.descricao,
  departamento = excluded.departamento, destaque = excluded.destaque, ordem = excluded.ordem;

update produtos set tags = array(select distinct unnest(tags || array['abrolhos']))
  where slug in ('esp','chav','luz','cauda','veleiro','relondas','barquinho');
update produtos set tags = array(select distinct unnest(tags || array['natal']))
  where slug in ('natal','portaret','musonda','relnome','chav1','inox','cozhex','copos','musvinil','luz','conceicao');
update produtos set tags = array(select distinct unnest(tags || array['para-ele']))
  where slug in ('relgel','copos','musvinil','inox','chav1','musonda');
update produtos set tags = array(select distinct unnest(tags || array['para-ela']))
  where slug in ('portaret','flor','lotus','filtro','lua','relmand','musonda');
update produtos set tags = array(select distinct unnest(tags || array['casa-nova']))
  where slug in ('cozhex','cozja','coztri','relnome','relmand','nicho','suporte','vaz','barquinho','arvore');
