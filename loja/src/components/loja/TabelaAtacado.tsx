import { createAdminClient } from "@/lib/supabase/admin";
import { numCfg } from "@/lib/precificacao";
import { FORMATO_COLS, faixas, numFormato, type ConfigChav } from "@/lib/chaveiros";
import { formatBRL } from "@/lib/format";
import { WHATSAPP } from "@/lib/catalogo";

/** Tabela "quanto mais, mais barato" dos chaveiros (folhas cheias), calculada no servidor. */
export default async function TabelaAtacado({ titulo = "Chaveiros por quantidade" }: { titulo?: string }) {
  const sb = createAdminClient();
  if (!sb) return null;
  const [{ data: cfgRaw }, { data: fmts }] = await Promise.all([
    sb.from("config_precificacao").select("*").eq("id", 1).single(),
    sb.from("chaveiro_formatos").select(FORMATO_COLS).eq("ativo", true).order("ordem"),
  ]);
  if (!cfgRaw || !fmts?.length) return null;
  const cfg = numCfg(cfgRaw) as ConfigChav;
  const formatos = fmts.map((f) => numFormato(f));
  const op = { saco: true, arteNova: false, pagamento: "pix" as const };
  const msg = encodeURIComponent("Olá! Quero um orçamento de chaveiros. Modelos: ___ · Quantidade: ___ · Material: ___");

  return (
    <section className="atac" aria-labelledby="atac-tit">
      <h2 id="atac-tit">{titulo}</h2>
      <p className="lead">O laser corta em folhas: completando a folha, cada chaveiro sai mais barato. Pode misturar modelos na mesma folha. Preços no Pix, com argola e saquinho.</p>
      <div className="atac-g">
        {formatos.map((f) => (
          <div key={f.id} className="atac-c">
            <b>{f.nome}</b>
            <table>
              <thead><tr><th>Qtd</th><th>Cada</th><th>Total</th></tr></thead>
              <tbody>
                {faixas(cfg, f, op, [1, 2, 3, 5]).map((t) => (
                  <tr key={t.qtd}><td>{t.qtd}</td><td><strong>{formatBRL(t.unit)}</strong></td><td>{formatBRL(t.total)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      <a className="btn wa" href={`https://wa.me/${WHATSAPP}?text=${msg}`} target="_blank" rel="noopener" style={{ marginTop: 14, display: "inline-flex" }}>
        Pedir orçamento com seus modelos
      </a>
    </section>
  );
}
