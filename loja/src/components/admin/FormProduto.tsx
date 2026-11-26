import { STATUS_LABEL } from "@/lib/format";
import { btn, campo, cartao, rotulo } from "./ui";

type P = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const TIPOS = [
  { v: "sob_medida", nome: "Sob medida / personalizado" },
  { v: "peca_unica", nome: "Peça única" },
  { v: "tiragem", nome: "Tiragem (várias iguais)" },
  { v: "kit", nome: "Kit" },
  { v: "servico", nome: "Serviço" },
];

const Check = ({ name, label, on }: { name: string; label: string; on?: boolean }) => (
  <label className="flex items-center gap-2 text-sm">
    <input type="checkbox" name={name} defaultChecked={!!on} className="size-5 accent-[var(--teal)]" /> {label}
  </label>
);

export default function FormProduto({
  acao, p = {}, custos = {}, categorias,
}: { acao: (f: FormData) => Promise<void>; p?: P; custos?: P; categorias: { slug: string; nome: string }[] }) {
  return (
    <form action={acao} className="flex flex-col gap-5">
      {p.id && <input type="hidden" name="id" value={p.id} />}

      <section className={`${cartao} grid gap-3 md:grid-cols-2`}>
        <h2 className="text-xl md:col-span-2">Vitrine</h2>
        <label className={`${rotulo} md:col-span-2`}>Título *<input name="titulo" required defaultValue={p.titulo} className={campo} /></label>
        <label className={rotulo}>
          Categoria
          <select name="categoria" defaultValue={p.categoria ?? ""} className={campo}>
            <option value="">—</option>
            {categorias.map((c) => <option key={c.slug} value={c.slug}>{c.nome}</option>)}
          </select>
        </label>
        <label className={rotulo}>
          Situação
          <select name="status" defaultValue={p.status ?? "sob_encomenda"} className={campo}>
            {Object.entries(STATUS_LABEL).map(([v, n]) => <option key={v} value={v}>{n}{v === "inativo" ? " (escondido da loja)" : ""}</option>)}
          </select>
        </label>
        <label className={`${rotulo} md:col-span-2`}>Descrição<textarea name="descricao" rows={4} defaultValue={p.descricao ?? ""} className={`${campo} py-2`} /></label>
        <label className={rotulo}>Técnica / material<input name="tecnica" defaultValue={p.tecnica ?? ""} placeholder="MDF 3 mm, corte e gravação a laser" className={campo} /></label>
        <label className={rotulo}>Medidas<input name="dimensoes" defaultValue={p.dimensoes ?? ""} placeholder="30 × 14 cm" className={campo} /></label>
        <label className={rotulo}>Preço (R$) — vazio = sob consulta<input name="preco" inputMode="decimal" defaultValue={p.preco ?? ""} className={campo} /></label>
        <label className={rotulo}>Prazo de produção (dias)<input name="prazo_producao_dias" type="number" min={0} defaultValue={p.prazo_producao_dias ?? ""} className={campo} /></label>
        <div className="md:col-span-2 flex flex-wrap gap-x-6 gap-y-2">
          <Check name="preco_a_partir_de" label="Mostrar “a partir de”" on={p.preco_a_partir_de} />
          <Check name="destaque" label="Destaque" on={p.destaque} />
          <Check name="foto_real" label="Foto real (não é prévia)" on={p.foto_real} />
          <Check name="personalizavel" label="Personalizável" on={p.personalizavel ?? true} />
        </div>
      </section>

      <section className={`${cartao} grid gap-3 md:grid-cols-3`}>
        <h2 className="text-xl md:col-span-3">Estoque</h2>
        <label className={rotulo}>
          Tipo
          <select name="tipo" defaultValue={p.tipo ?? "sob_medida"} className={campo}>
            {TIPOS.map((t) => <option key={t.v} value={t.v}>{t.nome}</option>)}
          </select>
        </label>
        <label className={rotulo}>Em estoque<input name="estoque" type="number" min={0} defaultValue={p.estoque ?? 0} className={campo} /></label>
        <label className={rotulo}>Avisar quando chegar a<input name="estoque_minimo" type="number" min={0} defaultValue={p.estoque_minimo ?? 0} className={campo} /></label>
        <div className="md:col-span-3"><Check name="controla_estoque" label="Controlar estoque (baixa sozinho quando o pedido é concluído)" on={p.controla_estoque} /></div>
      </section>

      <section className={`${cartao} grid gap-3 md:grid-cols-2`}>
        <h2 className="text-xl md:col-span-2">Links</h2>
        <label className={rotulo}>Anúncio no Mercado Livre (link)<input name="ml_url" type="url" defaultValue={p.ml_url ?? ""} className={campo} /></label>
        <label className={rotulo}>Código do anúncio (MLB…)<input name="ml_item_id" defaultValue={p.ml_item_id ?? ""} className={campo} /></label>
        <label className={rotulo}>Página de personalização (ex.: /onda)<input name="personalizacao_url" defaultValue={p.personalizacao_url ?? ""} className={campo} /></label>
        <label className={rotulo}>Endereço na loja (slug)<input name="slug" defaultValue={p.slug ?? ""} placeholder="gerado pelo título" className={campo} /></label>
        <label className={rotulo}>Ordem na vitrine<input name="ordem" type="number" defaultValue={p.ordem ?? 0} className={campo} /></label>
      </section>

      <section className={`${cartao} grid gap-3 md:grid-cols-3`}>
        <h2 className="text-xl md:col-span-3">Custos (só você vê)</h2>
        <label className={rotulo}>Material (R$)<input name="custo_material" inputMode="decimal" defaultValue={custos.custo_material ?? ""} className={campo} /></label>
        <label className={rotulo}>Tempo de máquina (min)<input name="tempo_maquina_min" type="number" min={0} defaultValue={custos.tempo_maquina_min ?? ""} className={campo} /></label>
        <label className={rotulo}>Extras (R$)<input name="extras" inputMode="decimal" defaultValue={custos.extras ?? ""} className={campo} /></label>
        <label className={rotulo}>O que são os extras<input name="descricao_extras" defaultValue={custos.descricao_extras ?? ""} placeholder="ímã, verniz, mecanismo…" className={campo} /></label>
        <label className={`${rotulo} md:col-span-2`}>Pasta do arquivo de corte<input name="arquivo_corte" defaultValue={custos.arquivo_corte ?? ""} placeholder="D:\CNC LASER\01 MINHAS ARTES\…" className={campo} /></label>
        <label className={`${rotulo} md:col-span-3`}>Notas<textarea name="notas" rows={2} defaultValue={custos.notas ?? ""} className={`${campo} py-2`} /></label>
        {p.preco != null && custos.custo_material != null && (
          <p className="md:col-span-3 text-sm">
            Margem aproximada: <b>{Math.round(((Number(p.preco) - Number(custos.custo_material) - Number(custos.extras ?? 0)) / Number(p.preco)) * 100)}%</b> sobre o preço de venda.
          </p>
        )}
      </section>

      <div><button className={btn} type="submit">{p.id ? "Salvar alterações" : "Criar produto"}</button></div>
    </form>
  );
}
