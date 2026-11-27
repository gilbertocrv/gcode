-- Envio por embrulho em papelão ondulado (bobina) no lugar das caixas M e G.
-- O pacote embrulhado usa as medidas caixa_*_cm do produto (peça + ~2 cm de folga).
-- Papelão gasto = superfície do pacote × 2,2 (duas camadas + 10% de sobra), baixado em m².

alter table produtos add column if not exists embalagem text not null default 'caixa'
  check (embalagem in ('caixa', 'embrulho'));
alter table pedidos add column if not exists papelao_m2 numeric(8,3) not null default 0;
alter table config_precificacao add column if not exists papelao_id uuid references materiais(id);

create or replace function public.embrulho_m2(c numeric, l numeric, a numeric)
returns numeric language sql immutable as $$
  select round(2 * (coalesce(c,0)*coalesce(l,0) + coalesce(c,0)*coalesce(a,0) + coalesce(l,0)*coalesce(a,0)) / 10000 * 2.2, 3)
$$;

-- material do estoque: bobina 1,20 m × 50 m = 60 m², R$ 163,29 → R$ 2,72/m²
insert into materiais (nome, material, quantidade, custo_unitario, minimo, obs)
select 'Papelão ondulado em bobina (m²)', 'Proteção', 0, 2.72, 10,
       'Bobina 1,20 m × 50 m = 60 m² · ~R$ 163,29 · https://lista.mercadolivre.com.br/papelao-ondulado'
where not exists (select 1 from materiais where nome = 'Papelão ondulado em bobina (m²)');

update config_precificacao set papelao_id = (select id from materiais where nome = 'Papelão ondulado em bobina (m²)')
where id = 1;

create or replace function public.trg_pedido_embalagem()
returns trigger language plpgsql security definer set search_path to '' as $function$
declare v_caixa uuid; v_m2 numeric; v_papelao uuid;
begin
  if new.status = 'enviado' and old.status is distinct from 'enviado' and not new.embalagem_baixada
     and new.entrega <> 'retirada' then
    -- caixa: a escolhida no pedido ou a maior entre os produtos que vão em caixa
    v_caixa := new.caixa_usada_id;
    if v_caixa is null then
      select m.id into v_caixa
        from public.itens_pedido i
        join public.produtos p on p.id = i.produto_id
        join public.materiais m on m.id = p.caixa_id
       where i.pedido_id = new.id and p.embalagem = 'caixa'
       order by m.largura_cm * m.altura_cm desc nulls last limit 1;
    end if;
    if v_caixa is not null then
      update public.materiais set quantidade = greatest(0, quantidade - 1) where id = v_caixa;
      new.caixa_usada_id := v_caixa;
    end if;
    -- embrulho: soma o papelão dos itens embrulhados
    select coalesce(sum(i.quantidade * public.embrulho_m2(p.caixa_comp_cm, p.caixa_larg_cm, p.caixa_alt_cm)), 0)
      into v_m2
      from public.itens_pedido i join public.produtos p on p.id = i.produto_id
     where i.pedido_id = new.id and p.embalagem = 'embrulho';
    select papelao_id into v_papelao from public.config_precificacao where id = 1;
    if v_m2 > 0 and v_papelao is not null then
      update public.materiais set quantidade = greatest(0, quantidade - v_m2) where id = v_papelao;
      new.papelao_m2 := v_m2;
    end if;
    if v_caixa is not null or v_m2 > 0 then
      new.embalagem_baixada := true;
    end if;
  end if;
  if new.status = 'cancelado' and old.embalagem_baixada then
    if new.caixa_usada_id is not null then
      update public.materiais set quantidade = quantidade + 1 where id = new.caixa_usada_id;
    end if;
    if new.papelao_m2 > 0 then
      update public.materiais set quantidade = quantidade + new.papelao_m2
       where id = (select papelao_id from public.config_precificacao where id = 1);
      new.papelao_m2 := 0;
    end if;
    new.embalagem_baixada := false;
  end if;
  return new;
end $function$;

-- peças grandes e planas (as que iam nas caixas M e G, ou sem caixa) passam a ir embrulhadas
update produtos set embalagem = 'embrulho', caixa_id = null
 where caixa_id in (select id from materiais where nome in ('Caixa M 30×30×5', 'Caixa G 35×35×5'))
    or (caixa_id is null and caixa_comp_cm is not null);
