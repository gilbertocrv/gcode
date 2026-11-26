import { NextResponse, type NextRequest } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { cotar, meConfigurado } from "@/lib/melhorenvio";
import { itensDoPedido } from "@/lib/frete-itens";

/** Cotação pública: { cep, itens: [{produto_id, quantidade}] } → opções de frete. */
export async function POST(req: NextRequest) {
  if (!meConfigurado()) return NextResponse.json({ disponivel: false, opcoes: [] });
  let body: { cep?: string; itens?: { produto_id: string; quantidade: number }[] } = {};
  try { body = await req.json(); } catch {}
  const cep = (body.cep ?? "").replace(/\D/g, "");
  const itens = (body.itens ?? []).slice(0, 20).map((i) => ({ produto_id: String(i.produto_id), quantidade: Math.min(50, Math.max(1, Number(i.quantidade) || 1)) }));
  if (cep.length !== 8 || !itens.length) return NextResponse.json({ erro: "Informe um CEP válido." }, { status: 400 });
  try {
    const opcoes = await cotar(cep, await itensDoPedido(createPublicClient(), itens));
    return NextResponse.json({ disponivel: true, opcoes });
  } catch (e) {
    if (String((e as Error).message).includes("cep_destino")) {
      return NextResponse.json({ disponivel: true, opcoes: [], erro: "CEP não encontrado. Confira os números." }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ disponivel: true, opcoes: [], erro: "Não foi possível calcular o frete agora." }, { status: 502 });
  }
}
