import { requireAdmin } from "@/lib/admin";
import { Topo, cartao, campo, rotulo, btn2, btnPerigo } from "@/components/admin/ui";
import { BRINDE_COLS, BRINDES_DE_PRESENTE, numBrinde, precoUn, rotuloDia, type Dia } from "@/lib/brindes";
import { formatBRL } from "@/lib/format";
import { liberarDia, salvarBrinde, salvarDias } from "./actions";

export const dynamic = "force-dynamic";

export default async function Brindes() {
  const sb = await requireAdmin();
  const [{ data: bs }, { data: ds }, { data: es }] = await Promise.all([
    sb.from("brindes").select(BRINDE_COLS).order("ordem"),
    sb.from("brinde_dias").select("dia, data, rotulo").order("dia"),
    sb.from("brinde_escolhas").select("id, dia, brinde_id, nome, whatsapp, grupo, extra, obs, created_at"),
  ]);
  const brindes = (bs ?? []).map((b) => numBrinde(b));
  const dias = (ds ?? []) as Dia[];
  const porDia = new Map((es ?? []).map((e) => [e.dia as number, e]));
  const totalExtra = (es ?? []).reduce((s, e) => {
    const b = brindes.find((x) => x.id === e.brinde_id);
    return s + (b ? e.extra * precoUn(b, e.extra) : 0);
  }, 0);

  return (
    <>
      <Topo titulo="Brindes da igreja">
        <a className={btn2} href="/brindes-igreja" target="_blank">Ver página ↗</a>
      </Topo>
      <p className="text-sm text-[var(--soft)] mb-4">
        Link para mandar no grupo: <b>gcodecaravelas.com.br/brindes-igreja</b>. Cada dia leva {BRINDES_DE_PRESENTE} brindes de presente; unidades a mais são pagas.
      </p>

      <section className={`${cartao} mb-5`}>
        <h2 className="text-lg mb-3">Escolhas por dia · extras somam {formatBRL(totalExtra)}</h2>
        <ul className="flex flex-col divide-y divide-[var(--line)]">
          {dias.map((d) => {
            const e = porDia.get(d.dia);
            const b = e ? brindes.find((x) => x.id === e.brinde_id) : null;
            return (
              <li key={d.dia} className="py-3 flex flex-wrap items-center gap-3">
                <b className="w-28">{rotuloDia(d)}</b>
                {e && b ? (
                  <>
                    <span className="flex-1 min-w-[220px]">
                      {b.icone} {b.nome} · <b>{BRINDES_DE_PRESENTE + e.extra} un.</b>
                      {e.extra > 0 && ` (${e.extra} pagas: ${formatBRL(e.extra * precoUn(b, e.extra))})`}
                      <small className="block text-[var(--soft)]">
                        {e.nome}{e.grupo ? ` · ${e.grupo}` : ""} · <a className="underline" href={`https://wa.me/55${String(e.whatsapp).replace(/^55/, "")}`} target="_blank">{e.whatsapp}</a>
                        {e.obs ? ` · “${e.obs}”` : ""}
                      </small>
                    </span>
                    <form action={liberarDia}><input type="hidden" name="id" value={e.id} /><button className={btnPerigo}>Liberar dia</button></form>
                  </>
                ) : (
                  <span className="text-[var(--soft)]">livre</span>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <form action={salvarDias} className={`${cartao} mb-5 grid gap-2 sm:grid-cols-4`}>
        <h2 className="text-lg sm:col-span-4">Datas dos dias</h2>
        {dias.map((d) => (
          <label key={d.dia} className={rotulo}>{d.dia}º dia<input type="date" name={`data${d.dia}`} defaultValue={d.data ?? ""} className={campo} /></label>
        ))}
        <button className={`${btn2} sm:col-span-4 justify-self-start`}>Salvar datas</button>
      </form>

      <details className={cartao}>
        <summary className="cursor-pointer font-semibold">Brindes e preços (editar)</summary>
        {brindes.map((b) => (
          <form key={b.id} action={salvarBrinde} className="grid gap-2 sm:grid-cols-6 border-t border-[var(--line)] pt-3 mt-3">
            <input type="hidden" name="id" value={b.id} />
            <label className={`${rotulo} sm:col-span-2`}>{b.icone} Nome<input name="nome" defaultValue={b.nome} className={campo} /></label>
            <label className={`${rotulo} sm:col-span-4`}>Descrição<input name="descricao" defaultValue={b.descricao ?? ""} className={campo} /></label>
            <label className={rotulo}>1–19<input name="preco_1" defaultValue={b.preco_1} className={campo} inputMode="decimal" /></label>
            <label className={rotulo}>20–49<input name="preco_20" defaultValue={b.preco_20} className={campo} inputMode="decimal" /></label>
            <label className={rotulo}>50–99<input name="preco_50" defaultValue={b.preco_50} className={campo} inputMode="decimal" /></label>
            <label className={rotulo}>100+<input name="preco_100" defaultValue={b.preco_100} className={campo} inputMode="decimal" /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="ativo" defaultChecked={b.ativo} /> Ativo</label>
            <button className={btn2}>Salvar</button>
          </form>
        ))}
      </details>
    </>
  );
}
