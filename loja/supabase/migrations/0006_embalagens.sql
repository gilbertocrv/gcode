-- Embalagens: caixas no estoque (materiais), caixa padrão por produto e baixa automática ao enviar
alter table public.materiais add column profundidade_cm numeric(6,1);   -- altura da caixa (largura × altura × profundidade)

alter table public.produtos add column caixa_id uuid references public.materiais(id) on delete set null;

alter table public.pedidos
  add column caixa_usada_id    uuid references public.materiais(id) on delete set null,
  add column embalagem_baixada boolean not null default false;

-- Ao marcar "enviado": baixa 1 unidade da caixa usada (a escolhida no pedido ou a maior entre os itens)
create or replace function public.trg_pedido_embalagem()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_caixa uuid;
begin
  if new.status = 'enviado' and old.status is distinct from 'enviado' and not new.embalagem_baixada
     and new.entrega <> 'retirada' then
    v_caixa := new.caixa_usada_id;
    if v_caixa is null then
      select m.id into v_caixa
        from public.itens_pedido i
        join public.produtos p on p.id = i.produto_id
        join public.materiais m on m.id = p.caixa_id
       where i.pedido_id = new.id
       order by m.largura_cm * m.altura_cm desc nulls last limit 1;
    end if;
    if v_caixa is not null then
      update public.materiais set quantidade = greatest(0, quantidade - 1) where id = v_caixa;
      new.caixa_usada_id := v_caixa;
      new.embalagem_baixada := true;
    end if;
  end if;
  -- cancelou depois de enviar: devolve a caixa
  if new.status = 'cancelado' and old.embalagem_baixada and new.caixa_usada_id is not null then
    update public.materiais set quantidade = quantidade + 1 where id = new.caixa_usada_id;
    new.embalagem_baixada := false;
  end if;
  return new;
end $$;
revoke all on function public.trg_pedido_embalagem() from public, anon, authenticated;
create trigger trg_pedido_embalagem before update of status on public.pedidos
  for each row execute function public.trg_pedido_embalagem();
