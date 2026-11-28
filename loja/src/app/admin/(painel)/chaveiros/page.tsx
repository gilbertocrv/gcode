import { requireAdmin } from "@/lib/admin";
import { Topo, cartao, campo, rotulo, btn2 } from "@/components/admin/ui";
import { numCfg } from "@/lib/precificacao";
import { FORMATO_COLS, numFormato, type ConfigChav } from "@/lib/chaveiros";
import { fotoUrl } from "@/lib/format";
import Orcamento from "./Orcamento";
import { salvarExtras, salvarFormato } from "./actions";

export const dynamic = "force-dynamic";

export default async function Chaveiros() {
  const sb = await requireAdmin();
  const [{ data: cfgRaw }, { data: fmts }, { data: prods }] = await Promise.all([
    sb.from("config_precificacao").select("*").eq("id", 1).single(),
    sb.from("chaveiro_formatos").select(FORMATO_COLS).order("ordem"),
    sb.from("produtos").select("id, codigo, titulo, preco, categoria, produto_imagens(url, storage_path, ordem)")
      .or("categoria.eq.chav,titulo.ilike.%chaveiro%").neq("status", "inativo").order("titulo"),
  ]);
  const cfg = numCfg(cfgRaw ?? {}) as ConfigChav;
  const formatos = (fmts ?? []).map((f) => numFormato(f));
  const modelos = (prods ?? []).map((p) => {
    const imgs = [...((p.produto_imagens as { url: string | null; storage_path: string | null; ordem: number }[]) ?? [])].sort((a, b) => a.ordem - b.ordem);
    return { id: p.id, codigo: p.codigo as string, titulo: p.titulo as string, preco: Number(p.preco ?? 0), foto: fotoUrl(imgs[0] as never) };
  });

  return (
    <>
      <Topo titulo="Orçamento de chaveiros" />
      <Orcamento cfg={cfg} formatos={formatos.filter((f) => f.ativo)} modelos={modelos} />

      <details className={`${cartao} mt-6`}>
        <summary className="cursor-pointer font-semibold">Formatos de folha e custos (editar)</summary>
        <p className="text-sm text-[var(--soft)] mt-2">
          Cada formato é uma folha que vai na máquina. O orçamento cobra as folhas inteiras que o pedido gasta. Valor da hora e custo da máquina vêm da Precificação.
        </p>
        <div className="mt-4 flex flex-col gap-4">
          {[...formatos, null].map((f, i) => (
            <form key={f?.id ?? `novo${i}`} action={salvarFormato} className="grid gap-2 sm:grid-cols-4 border-t border-[var(--line)] pt-4">
              <input type="hidden" name="id" defaultValue={f?.id ?? ""} />
              <label className={`${rotulo} sm:col-span-2`}>Nome<input name="nome" defaultValue={f?.nome ?? ""} placeholder={f ? "" : "Novo formato"} className={campo} /></label>
              <label className={`${rotulo} sm:col-span-2`}>Descrição<input name="descricao" defaultValue={f?.descricao ?? ""} className={campo} /></label>
              <label className={rotulo}>Folha largura (cm)<input name="largura_cm" defaultValue={f?.largura_cm ?? 20} className={campo} inputMode="decimal" /></label>
              <label className={rotulo}>Folha altura (cm)<input name="altura_cm" defaultValue={f?.altura_cm ?? 28} className={campo} inputMode="decimal" /></label>
              <label className={rotulo}>Chaveiros por folha<input name="pecas_folha" defaultValue={f?.pecas_folha ?? 16} className={campo} inputMode="numeric" /></label>
              <label className={rotulo}>Material da folha (R$)<input name="custo_folha" defaultValue={f?.custo_folha ?? 0} className={campo} inputMode="decimal" /></label>
              <label className={rotulo}>Impressão colorida por folha (R$)<input name="impressao_folha" defaultValue={f?.impressao_folha ?? 0} className={campo} inputMode="decimal" /></label>
              <label className={rotulo}>Laser por folha (min)<input name="maquina_min" defaultValue={f?.maquina_min ?? 30} className={campo} inputMode="decimal" /></label>
              <label className={rotulo}>Mão de obra por folha (min)<input name="mao_obra_min" defaultValue={f?.mao_obra_min ?? 15} className={campo} inputMode="decimal" /></label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="ativo" defaultChecked={f?.ativo ?? true} /> Ativo</label>
              <button className={`${btn2} sm:col-span-4 justify-self-start`}>{f ? "Salvar formato" : "Adicionar formato"}</button>
            </form>
          ))}
        </div>
        <form action={salvarExtras} className="grid gap-2 sm:grid-cols-4 border-t border-[var(--line)] pt-4 mt-4">
          <p className="sm:col-span-4 font-semibold">Por chaveiro e extras</p>
          <label className={rotulo}>Argola (R$)<input name="chav_argola" defaultValue={cfg.chav_argola} className={campo} inputMode="decimal" /></label>
          <label className={rotulo}>Saquinho individual (R$)<input name="chav_saco" defaultValue={cfg.chav_saco} className={campo} inputMode="decimal" /></label>
          <label className={rotulo}>Montagem por chaveiro (min)<input name="chav_montagem_min" defaultValue={cfg.chav_montagem_min} className={campo} inputMode="decimal" /></label>
          <label className={rotulo}>Criação de arte nova (R$)<input name="chav_arte_nova" defaultValue={cfg.chav_arte_nova} className={campo} inputMode="decimal" /></label>
          <button className={`${btn2} sm:col-span-4 justify-self-start`}>Salvar</button>
        </form>
      </details>
    </>
  );
}
