import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { formatBRL } from "@/lib/format";
import { PAGAMENTOS, PROXIMO, nomeOrigem, nomeStatus, type StatusPedido } from "@/lib/pedidos";
import { Status, Topo, btn, btn2, btnPerigo, campo, cartao, dataHoraBR, rotulo } from "@/components/admin/ui";
import { adicionarItem, atualizarItem, atualizarRastreio, gerarEtiquetaPedido, mudarStatus, removerItem, salvarPedido } from "../actions";

type Item = { id: string; descricao: string; quantidade: number; preco_unitario: number | null; subtotal: number | null; personalizacao: Record<string, unknown>; produto_id: string | null };

export default async function Pedido({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await requireAdmin();
  const [{ data: p }, { data: itens }, { data: hist }, { data: produtos }, { data: caixas }] = await Promise.all([
    sb.from("pedidos").select("*, clientes(id, nome, whatsapp, email, cidade, uf)").eq("id", id).maybeSingle(),
    sb.from("itens_pedido").select("id, descricao, quantidade, preco_unitario, subtotal, personalizacao, produto_id").eq("pedido_id", id).order("id"),
    sb.from("pedido_historico").select("id, status_de, status_para, nota, created_at").eq("pedido_id", id).order("created_at"),
    sb.from("produtos").select("id, titulo, preco, preco_a_partir_de").neq("status", "inativo").order("titulo"),
    sb.from("materiais").select("id, nome, quantidade").eq("material", "Caixas de envio").order("nome"),
  ]);
  if (!p) notFound();

  const c = (Array.isArray(p.clientes) ? p.clientes[0] : p.clientes) as { id: string; nome: string; whatsapp: string | null; cidade: string | null } | null;
  const prox = PROXIMO[p.status as StatusPedido];
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gcodecaravelas.com.br";
  const linkAcomp = `${site}/pedido/${p.numero}?t=${p.token_acompanhamento}`;
  const wa = c?.whatsapp
    ? `https://wa.me/${c.whatsapp.length <= 11 ? "55" + c.whatsapp : c.whatsapp}?text=${encodeURIComponent(
        `Olá, ${c.nome.split(" ")[0]}! Aqui é da G-Code, sobre o seu pedido #${p.numero}.` +
          (p.total != null ? ` Total: ${formatBRL(Number(p.total))}.` : "") +
          `\nAcompanhe por aqui: ${linkAcomp}`,
      )}`
    : null;
  const fechado = p.status === "concluido" || p.status === "cancelado";

  return (
    <>
      <Topo titulo={`Pedido #${p.numero}`} voltar="/admin/pedidos">
        <Status s={p.status} />
      </Topo>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-5">
          {/* status */}
          <section className={`${cartao} flex flex-wrap items-center gap-3`}>
            <span className="text-sm text-[var(--soft)]">Origem: {nomeOrigem(p.origem)}{p.encomenda_manual ? " · criado no painel" : ""}</span>
            <div className="ml-auto flex flex-wrap gap-2">
              {prox && (
                <form action={mudarStatus}>
                  <input type="hidden" name="pedido_id" value={p.id} />
                  <input type="hidden" name="status" value={prox} />
                  <button className={btn} type="submit">Avançar para “{nomeStatus(prox)}”</button>
                </form>
              )}
              {!fechado && (
                <form action={mudarStatus}>
                  <input type="hidden" name="pedido_id" value={p.id} />
                  <input type="hidden" name="status" value="cancelado" />
                  <button className={btnPerigo} type="submit">Cancelar pedido</button>
                </form>
              )}
              {p.status === "cancelado" && (
                <form action={mudarStatus}>
                  <input type="hidden" name="pedido_id" value={p.id} />
                  <input type="hidden" name="status" value="orcamento" />
                  <button className={btn2} type="submit">Reabrir como orçamento</button>
                </form>
              )}
            </div>
            {p.status === "enviado" && <p className="w-full text-sm text-[var(--soft)]">Ao marcar como concluído, o estoque das peças com controle de estoque baixa sozinho.</p>}
          </section>

          {/* itens */}
          <section className={cartao}>
            <h2 className="text-xl mb-3">Itens</h2>
            {!itens?.length && <p className="text-[var(--soft)] mb-3">Nenhum item ainda.</p>}
            <ul className="flex flex-col gap-3">
              {(itens as Item[] | null)?.map((i) => (
                <li key={i.id} className="rounded-xl border border-[var(--line)] p-3">
                  <div className="font-semibold">{i.descricao}</div>
                  {Object.keys(i.personalizacao ?? {}).length > 0 && (
                    <pre className="mt-1 whitespace-pre-wrap break-all text-xs text-[var(--soft)]">{JSON.stringify(i.personalizacao, null, 1).replace(/[{}"]/g, "").trim()}</pre>
                  )}
                  <form action={atualizarItem} className="mt-2 flex flex-wrap items-end gap-2">
                    <input type="hidden" name="pedido_id" value={p.id} />
                    <input type="hidden" name="item_id" value={i.id} />
                    <label className={`${rotulo} w-20`}>Qtd<input name="quantidade" type="number" min={1} defaultValue={i.quantidade} className={campo} /></label>
                    <label className={`${rotulo} w-32`}>Preço un.<input name="preco_unitario" inputMode="decimal" defaultValue={i.preco_unitario ?? ""} placeholder="a orçar" className={campo} /></label>
                    <button className={btn2} type="submit">Salvar</button>
                    <span className="ml-auto tabular-nums font-semibold">{i.subtotal != null ? formatBRL(Number(i.subtotal)) : "a orçar"}</span>
                  </form>
                  <form action={removerItem} className="mt-1">
                    <input type="hidden" name="pedido_id" value={p.id} />
                    <input type="hidden" name="item_id" value={i.id} />
                    <button className="text-sm text-[var(--coral)] hover:underline cursor-pointer" type="submit">Remover item</button>
                  </form>
                </li>
              ))}
            </ul>

            <form action={adicionarItem} className="mt-4 grid gap-2 md:grid-cols-[1fr_80px_120px] items-end border-t border-[var(--line)] pt-4">
              <input type="hidden" name="pedido_id" value={p.id} />
              <label className={rotulo}>
                Adicionar produto do catálogo
                <select name="produto_id" className={campo} defaultValue="">
                  <option value="">— Item avulso (descreva abaixo) —</option>
                  {produtos?.map((x) => (
                    <option key={x.id} value={x.id}>{x.titulo}{x.preco != null ? ` · ${x.preco_a_partir_de ? "a partir de " : ""}${formatBRL(Number(x.preco))}` : ""}</option>
                  ))}
                </select>
              </label>
              <label className={rotulo}>Qtd<input name="quantidade" type="number" min={1} defaultValue={1} className={campo} /></label>
              <label className={rotulo}>Preço un.<input name="preco_unitario" inputMode="decimal" placeholder="do catálogo" className={campo} /></label>
              <label className={`${rotulo} md:col-span-2`}>Descrição (opcional para produto do catálogo)<input name="descricao" className={campo} /></label>
              <label className={`${rotulo} md:col-span-3`}>Personalização (texto, cores, código da onda…)<input name="personalizacao" className={campo} /></label>
              <div><button className={btn} type="submit">+ Adicionar</button></div>
            </form>
          </section>

          {/* totais e dados */}
          <form action={salvarPedido} className={`${cartao} grid gap-3 md:grid-cols-3`}>
            <input type="hidden" name="pedido_id" value={p.id} />
            <h2 className="text-xl md:col-span-3">Valores e entrega</h2>
            <label className={rotulo}>Frete (R$)<input name="frete" inputMode="decimal" defaultValue={p.frete ?? 0} className={campo} /></label>
            <label className={rotulo}>Desconto (R$)<input name="desconto" inputMode="decimal" defaultValue={p.desconto ?? 0} className={campo} /></label>
            <label className={rotulo}>
              Pagamento
              <select name="forma_pagamento" defaultValue={p.forma_pagamento ?? ""} className={campo}>
                <option value="">—</option>
                {PAGAMENTOS.map((x) => <option key={x.v} value={x.v}>{x.nome}</option>)}
              </select>
            </label>
            <label className={rotulo}>Prazo de entrega<input name="prazo_entrega" type="date" defaultValue={p.prazo_entrega ?? ""} className={campo} /></label>
            <label className={rotulo}>Código de rastreio<input name="codigo_rastreio" defaultValue={p.codigo_rastreio ?? ""} className={campo} /></label>
            <label className={rotulo}>Nº venda Mercado Livre<input name="ml_order_id" defaultValue={p.ml_order_id ?? ""} className={campo} /></label>
            {p.entrega !== "retirada" && (
              <label className={`${rotulo} md:col-span-3`}>
                Caixa usada {p.embalagem_baixada ? "(já baixada do estoque)" : "(em branco: a maior caixa entre os itens)"}
                <select name="caixa_usada_id" defaultValue={p.caixa_usada_id ?? ""} className={campo} disabled={p.embalagem_baixada}>
                  <option value="">Automática</option>
                  {caixas?.map((c) => <option key={c.id} value={c.id}>{c.nome} · {Number(c.quantidade)} em estoque</option>)}
                </select>
              </label>
            )}
            <label className={`${rotulo} md:col-span-3`}>Notas internas (só você vê)<textarea name="notas_internas" rows={3} defaultValue={p.notas_internas ?? ""} className={`${campo} py-2`} /></label>
            <div className="md:col-span-3 flex flex-wrap items-center gap-4">
              <button className={btn} type="submit">Salvar</button>
              <span className="text-sm text-[var(--soft)]">Subtotal {p.subtotal != null ? formatBRL(Number(p.subtotal)) : "a orçar"}</span>
              <span className="ml-auto text-xl font-bold tabular-nums">Total {p.total != null ? formatBRL(Number(p.total)) : "a orçar"}</span>
            </div>
          </form>
        </div>

        <aside className="flex flex-col gap-5">
          <section className={cartao}>
            <h2 className="text-lg mb-2">Cliente</h2>
            {c ? (
              <>
                <Link href={`/admin/clientes/${c.id}`} className="font-semibold hover:underline">{c.nome}</Link>
                <div className="text-sm text-[var(--soft)]">{c.whatsapp ?? "sem WhatsApp"}{c.cidade ? ` · ${c.cidade}` : ""}</div>
                {wa && <a href={wa} target="_blank" rel="noopener" className={`${btn} mt-3 w-full`}>Falar no WhatsApp</a>}
              </>
            ) : <p className="text-[var(--soft)]">Sem cliente.</p>}
            {p.observacoes && <p className="mt-3 text-sm whitespace-pre-wrap"><b>Pedido do cliente:</b> {p.observacoes}</p>}
          </section>

          {p.entrega !== "retirada" && (p.status === "em_producao" || p.status === "enviado") && (
            <section className={cartao}>
              <h2 className="text-lg mb-2">Roteiro de envio</h2>
              <ol className="list-decimal pl-5 text-sm flex flex-col gap-1">
                <li>Confira a peça e a personalização com o pedido.</li>
                <li>Embrulhe no plástico bolha (acrílico e peças vazadas com 2 voltas).</li>
                <li>Coloque na caixa com o cartão de agradecimento; preencha os vazios para não balançar.</li>
                <li>Feche com fita marrom e lacre com o adesivo da logo.</li>
                <li>{p.entrega === "envio" ? "Gere e imprima a etiqueta abaixo e cole no lado maior." : "Combine a entrega com o cliente."}</li>
                <li>Poste{p.frete_servico ? ` (${p.frete_servico})` : ""} e marque o pedido como “Enviado” — a caixa sai do estoque.</li>
                <li>Busque o rastreio e mande pelo botão do WhatsApp.</li>
              </ol>
            </section>
          )}

          <section className={cartao}>
            <h2 className="text-lg mb-2">Entrega</h2>
            {p.entrega === "retirada" && <p>Retirada na loja.</p>}
            {p.entrega === "combinar" && <p>Combinar entrega pelo WhatsApp (ajuste o frete em “Valores e entrega”).</p>}
            {p.entrega === "envio" && <p><b>{p.frete_servico ?? "Envio"}</b>{p.frete_prazo_dias ? ` · até ${p.frete_prazo_dias} dias úteis` : ""} · {formatBRL(Number(p.frete ?? 0))}</p>}
            {p.endereco && (() => { const e = p.endereco as Record<string, string>; return (
              <p className="mt-2 text-sm whitespace-pre-line">{`${e.rua}, ${e.numero}${e.complemento ? " - " + e.complemento : ""}\n${e.bairro ? e.bairro + " · " : ""}${e.cidade}/${e.uf} · CEP ${e.cep}`}</p>
            ); })()}
            {p.entrega === "envio" && !p.me_order_id && (p.status === "em_producao" || p.status === "enviado") && (
              <form action={gerarEtiquetaPedido} className="mt-3">
                <input type="hidden" name="pedido_id" value={p.id} />
                <button className={`${btn} w-full`} type="submit">Gerar etiqueta (Melhor Envio)</button>
                <p className="mt-1 text-xs text-[var(--soft)]">Usa o saldo da sua carteira no Melhor Envio.</p>
              </form>
            )}
            {p.etiqueta_url && <a href={p.etiqueta_url} target="_blank" rel="noopener" className={`${btn2} mt-3 w-full`}>Imprimir etiqueta</a>}
            {p.me_order_id && (
              <form action={atualizarRastreio} className="mt-2">
                <input type="hidden" name="pedido_id" value={p.id} />
                <button className="text-sm underline cursor-pointer" type="submit">Buscar código de rastreio</button>
              </form>
            )}
          </section>

          <section className={cartao}>
            <h2 className="text-lg mb-2">Link de acompanhamento</h2>
            <p className="text-sm text-[var(--soft)] break-all">{linkAcomp}</p>
            <a href={linkAcomp} target="_blank" rel="noopener" className="mk">Abrir como o cliente vê ↗</a>
          </section>

          <section className={cartao}>
            <h2 className="text-lg mb-2">Histórico</h2>
            <ol className="flex flex-col gap-2 text-sm">
              {hist?.map((h) => (
                <li key={h.id} className="flex flex-col">
                  <span><Status s={h.status_para} /> {h.nota && <span className="text-[var(--soft)]">· {h.nota}</span>}</span>
                  <span className="text-xs text-[var(--soft)]">{dataHoraBR(h.created_at)}</span>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </>
  );
}
