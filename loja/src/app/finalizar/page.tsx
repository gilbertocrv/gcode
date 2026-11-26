import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import type { Produto } from "@/lib/types";
import Finalizar from "./Finalizar";

export const revalidate = 60;
export const metadata = { title: "Finalizar pedido · G-Code", robots: { index: false } };

export default async function Page() {
  const { data } = await createPublicClient()
    .from("produtos")
    .select("id, titulo, preco, preco_a_partir_de, status, controla_estoque, estoque, personalizacao_url")
    .in("status", ["disponivel", "sob_encomenda"]);
  return (
    <main className="min-h-dvh p-5" style={{ background: "var(--bg)" }}>
      <div className="mx-auto max-w-xl">
        <Link href="/" className="text-sm underline">← Voltar ao catálogo</Link>
        <h1 className="text-3xl mt-3 mb-5">Finalizar pedido</h1>
        <Finalizar produtos={(data ?? []) as Pick<Produto, "id" | "titulo" | "preco" | "preco_a_partir_de" | "personalizacao_url">[]} />
      </div>
    </main>
  );
}
