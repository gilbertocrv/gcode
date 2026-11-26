import { requireAdmin } from "@/lib/admin";
import { formatBRL } from "@/lib/format";
import { Topo, Vazio, btn, btn2, campo, cartao, rotulo } from "@/components/admin/ui";
import BotaoConfirmar from "@/components/admin/BotaoConfirmar";
import { ajustarQuantidade, excluirMaterial, salvarMaterial } from "./actions";

type M = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const n = (v: unknown) => (v == null ? "" : String(v));

function Campos({ m = {} }: { m?: M }) {
  return (
    <>
      {m.id && <input type="hidden" name="id" value={m.id} />}
      <label className={`${rotulo} col-span-2`}>Nome *<input name="nome" required defaultValue={m.nome} placeholder="Chapa MDF cru 60×30" className={campo} /></label>
      <label className={rotulo}>Material *<input name="material" required defaultValue={m.material} placeholder="MDF cru" className={campo} /></label>
      <label className={rotulo}>Espessura (mm)<input name="espessura_mm" inputMode="decimal" defaultValue={n(m.espessura_mm)} className={campo} /></label>
      <label className={rotulo}>Largura (cm)<input name="largura_cm" inputMode="decimal" defaultValue={n(m.largura_cm)} className={campo} /></label>
      <label className={rotulo}>Altura (cm)<input name="altura_cm" inputMode="decimal" defaultValue={n(m.altura_cm)} className={campo} /></label>
      <label className={rotulo}>Quantidade<input name="quantidade" inputMode="decimal" defaultValue={n(m.quantidade ?? 0)} className={campo} /></label>
      <label className={rotulo}>Custo un. (R$)<input name="custo_unitario" inputMode="decimal" defaultValue={n(m.custo_unitario)} className={campo} /></label>
      <label className={rotulo}>Avisar abaixo de<input name="minimo" inputMode="decimal" defaultValue={n(m.minimo)} className={campo} /></label>
      <label className={`${rotulo} col-span-2 md:col-span-3`}>Obs.<input name="obs" defaultValue={n(m.obs)} className={campo} /></label>
    </>
  );
}

export default async function Materiais() {
  const sb = await requireAdmin();
  const { data: lista } = await sb.from("materiais").select("*").order("material").order("espessura_mm");
  const valor = (lista ?? []).reduce((s, m) => s + Number(m.quantidade) * Number(m.custo_unitario ?? 0), 0);

  return (
    <>
      <Topo titulo="Materiais" />
      <p className="mb-4 text-sm text-[var(--soft)]">Valor parado em estoque: <b>{formatBRL(valor)}</b></p>

      {!lista?.length && <Vazio>Nenhum material cadastrado.</Vazio>}
      <ul className="flex flex-col gap-3 mb-8">
        {lista?.map((m) => {
          const baixo = m.minimo != null && Number(m.quantidade) < Number(m.minimo);
          return (
            <li key={m.id} className={cartao} style={baixo ? { borderColor: "var(--coral)" } : undefined}>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-48">
                  <b>{m.nome}</b>
                  <div className="text-sm text-[var(--soft)]">
                    {m.material}{m.espessura_mm ? ` · ${m.espessura_mm} mm` : ""}{m.largura_cm ? ` · ${m.largura_cm}×${m.altura_cm} cm` : ""}
                    {m.custo_unitario ? ` · ${formatBRL(Number(m.custo_unitario))} un.` : ""}
                  </div>
                </div>
                <form action={ajustarQuantidade} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={m.id} />
                  <button name="delta" value="-1" className={`${btn2} w-11 px-0`} aria-label="Usar 1">−</button>
                  <span className="min-w-12 text-center text-xl font-bold tabular-nums" style={baixo ? { color: "var(--coral)" } : undefined}>{Number(m.quantidade)}</span>
                  <button name="delta" value="1" className={`${btn2} w-11 px-0`} aria-label="Adicionar 1">+</button>
                </form>
              </div>
              {baixo && <p className="mt-1 text-sm text-[var(--coral)]">Abaixo do mínimo ({Number(m.minimo)}). Hora de repor.</p>}
              <details className="mt-2">
                <summary className="cursor-pointer text-sm underline">Editar</summary>
                <form action={salvarMaterial} className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Campos m={m} />
                  <div className="col-span-2 md:col-span-4 flex gap-3">
                    <button className={btn} type="submit">Salvar</button>
                  </div>
                </form>
                <form action={excluirMaterial} className="mt-2">
                  <input type="hidden" name="id" value={m.id} />
                  <BotaoConfirmar className="text-sm text-[var(--coral)] underline cursor-pointer" msg="Excluir este material?">Excluir material</BotaoConfirmar>
                </form>
              </details>
            </li>
          );
        })}
      </ul>

      <section className={cartao}>
        <h2 className="text-xl mb-3">Cadastrar material</h2>
        <form action={salvarMaterial} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Campos />
          <div className="col-span-2 md:col-span-4"><button className={btn} type="submit">Adicionar</button></div>
        </form>
      </section>
    </>
  );
}
