import { requireAdmin } from "@/lib/admin";
import { Topo } from "@/components/admin/ui";
import Folha from "./Folha";

export const dynamic = "force-dynamic";

export default async function Etiquetas() {
  const sb = await requireAdmin();
  const { data } = await sb
    .from("produtos")
    .select("id, titulo, preco, codigo, marca, compatibilidade, controla_estoque, estoque, categoria")
    .neq("status", "inativo")
    .not("preco", "is", null)
    .order("titulo");
  return (
    <>
      <Topo titulo="Etiquetas com código" />
      <Folha produtos={(data ?? []).map((p) => ({ ...p, preco: Number(p.preco) }))} />
    </>
  );
}
