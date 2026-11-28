"use client";

import { useActionState, useState } from "react";
import { BRINDES_DE_PRESENTE, precoUn, rotuloDia, type Brinde, type Dia } from "@/lib/brindes";
import { formatBRL } from "@/lib/format";
import { escolherBrinde, type Estado } from "./actions";

export default function Escolha({ brindes, dias, ocupados }: { brindes: Brinde[]; dias: Dia[]; ocupados: { dia: number; brinde_id: string }[] }) {
  const [estado, enviar, enviando] = useActionState<Estado, FormData>(escolherBrinde, {});
  const [bid, setBid] = useState<string>("");
  const [extra, setExtra] = useState(0);
  const tomado = new Map(ocupados.map((o) => [o.dia, o.brinde_id]));
  const b = brindes.find((x) => x.id === bid);
  const livres = dias.filter((d) => !tomado.has(d.dia));

  if (estado.ok) {
    return (
      <div className="atac" role="status">
        <h2>Obrigado! 💛</h2>
        <p className="lead">{estado.ok}</p>
      </div>
    );
  }

  return (
    <>
      <section className="atac" aria-labelledby="dias-tit">
        <h2 id="dias-tit">Dias</h2>
        <ul className="brd-dias">
          {dias.map((d) => {
            const t = tomado.get(d.dia);
            const nome = t ? brindes.find((x) => x.id === t)?.nome : null;
            return (
              <li key={d.dia} className={t ? "tomado" : ""}>
                <b>{rotuloDia(d)}</b>
                <span>{t ? `✔ ${nome ?? "escolhido"}` : "livre"}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="atac" aria-labelledby="brd-tit">
        <h2 id="brd-tit">Brindes e preços</h2>
        <p className="lead">Os 20 do dia são presente. Quer mais? O preço de cada um cai conforme a quantidade:</p>
        <div className="atac-g">
          {brindes.map((x) => (
            <label key={x.id} className={`atac-c brd-c ${bid === x.id ? "sel" : ""}`}>
              <input type="radio" name="brinde-vis" className="sr-only" checked={bid === x.id} onChange={() => setBid(x.id)} />
              {x.foto ? <img src={x.foto} alt={x.nome} className="brd-foto" loading="lazy" /> : <span className="brd-ic" aria-hidden="true">{x.icone}</span>}
              <b>{x.nome}</b>
              <small>{x.descricao}</small>
              <small className="brd-ct">{x.contato}</small>
              <table>
                <thead><tr><th>Qtd</th><th>Cada</th></tr></thead>
                <tbody>
                  <tr><td>1 a 19</td><td>{formatBRL(x.preco_1)}</td></tr>
                  <tr><td>20 a 49</td><td>{formatBRL(x.preco_20)}</td></tr>
                  <tr><td>50 a 99</td><td>{formatBRL(x.preco_50)}</td></tr>
                  <tr><td>100 ou mais</td><td><strong>{formatBRL(x.preco_100)}</strong></td></tr>
                </tbody>
              </table>
              <span className="brd-esc">{bid === x.id ? "✔ Escolhido" : "Escolher este"}</span>
            </label>
          ))}
        </div>
      </section>

      <form action={enviar} className="atac brd-form" aria-labelledby="form-tit">
        <h2 id="form-tit">Reservar o brinde do seu dia</h2>
        {livres.length === 0 ? (
          <p className="lead">Todos os dias já foram escolhidos. Para encomendar brindes, chame no WhatsApp.</p>
        ) : (
          <>
            <input type="hidden" name="brinde" value={bid} />
            <label>Dia
              <select name="dia" required defaultValue="">
                <option value="" disabled>Escolha o dia</option>
                {livres.map((d) => <option key={d.dia} value={d.dia}>{rotuloDia(d)}</option>)}
              </select>
            </label>
            <p>Brinde: <b>{b ? `${b.icone} ${b.nome}` : "toque em um brinde acima"}</b></p>
            <label>Seu nome<input name="nome" required autoComplete="name" /></label>
            <label>WhatsApp com DDD<input name="whatsapp" required inputMode="tel" autoComplete="tel" placeholder="73 99999-9999" /></label>
            <label>Pastoral, grupo ou família (opcional)<input name="grupo" /></label>
            <label>Quer unidades a mais, além das {BRINDES_DE_PRESENTE} de presente? (opcional)
              <input name="extra" inputMode="numeric" value={extra || ""} onChange={(e) => setExtra(Math.max(0, Number(e.target.value.replace(/\D/g, "")) || 0))} placeholder="0" />
            </label>
            {b && extra > 0 && (
              <p className="brd-tot">{extra} × {formatBRL(precoUn(b, extra))} = <b>{formatBRL(extra * precoUn(b, extra))}</b> (pago à parte, combinamos no WhatsApp)</p>
            )}
            <label>Observação (opcional)<textarea name="obs" rows={2} placeholder="Ex.: trocar a oração do marcador" /></label>
            {estado.erro && <p className="brd-erro" role="alert">{estado.erro}</p>}
            <button className="btn" disabled={!bid || enviando}>{enviando ? "Reservando..." : "Reservar meu brinde"}</button>
          </>
        )}
      </form>
    </>
  );
}
