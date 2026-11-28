alter table public.brindes add column if not exists foto text;
update public.brindes set foto = '/brindes/' || case ordem
 when 1 then '1-chaveiro-conceicao.jpg' when 2 then '2-marcador-pagina.jpg' when 3 then '3-chaveiro-biblia.jpg' when 4 then '4-santinho-mdf.jpg'
 when 5 then '5-ima-geladeira.jpg' when 6 then '6-caixinha.jpg' when 7 then '7-chaveiro-pomba.jpg' when 8 then '8-chaveiro-espelho-dourado.jpg' end
where foto is null;
