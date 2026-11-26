-- Funções de gatilho não precisam ser chamadas pela API (os gatilhos continuam funcionando)
revoke execute on function public.trg_itens_recalc()   from public, anon, authenticated;
revoke execute on function public.trg_pedido_inicial() from public, anon, authenticated;
revoke execute on function public.trg_pedido_status()  from public, anon, authenticated;
revoke execute on function public.trg_pedido_totais()  from public, anon, authenticated;
revoke execute on function public.set_updated_at()     from public, anon, authenticated;
