import { ORIGENS } from "@/lib/pedidos";
import { btn, campo, cartao, rotulo } from "./ui";

type C = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export default function FormCliente({ acao, c = {} }: { acao: (f: FormData) => Promise<void>; c?: C }) {
  return (
    <form action={acao} className={`${cartao} grid gap-3 md:grid-cols-3`}>
      {c.id && <input type="hidden" name="id" value={c.id} />}
      <label className={`${rotulo} md:col-span-2`}>Nome *<input name="nome" required defaultValue={c.nome} className={campo} /></label>
      <label className={rotulo}>WhatsApp (com DDD)<input name="whatsapp" inputMode="tel" defaultValue={c.whatsapp ?? ""} className={campo} /></label>
      <label className={rotulo}>E-mail<input name="email" type="email" defaultValue={c.email ?? ""} className={campo} /></label>
      <label className={rotulo}>Instagram<input name="instagram" defaultValue={c.instagram ?? ""} placeholder="@usuario" className={campo} /></label>
      <label className={rotulo}>
        Como chegou
        <select name="origem" defaultValue={c.origem ?? "whatsapp"} className={campo}>
          {ORIGENS.map((o) => <option key={o.v} value={o.v}>{o.nome}</option>)}
        </select>
      </label>
      <label className={`${rotulo} md:col-span-2`}>Cidade<input name="cidade" defaultValue={c.cidade ?? ""} className={campo} /></label>
      <label className={rotulo}>UF<input name="uf" maxLength={2} defaultValue={c.uf ?? ""} className={campo} /></label>
      <label className={`${rotulo} md:col-span-3`}>Observações<textarea name="observacoes" rows={3} defaultValue={c.observacoes ?? ""} className={`${campo} py-2`} /></label>
      <div><button className={btn} type="submit">{c.id ? "Salvar" : "Cadastrar cliente"}</button></div>
    </form>
  );
}
