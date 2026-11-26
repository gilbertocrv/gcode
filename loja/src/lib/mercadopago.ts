import "server-only";

const API = "https://api.mercadopago.com";
export const mpConfigurado = () => !!process.env.MERCADOPAGO_ACCESS_TOKEN && !!process.env.SUPABASE_SECRET_KEY;

async function mp<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(API + path, {
    ...init,
    headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`, "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`Mercado Pago ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return r.json() as Promise<T>;
}

export async function criarPreferencia(o: {
  pedidoId: string; numero: number; total: number; voltar: string; site: string; nome?: string | null; email?: string | null;
}) {
  return mp<{ id: string; init_point: string }>("/checkout/preferences", {
    method: "POST",
    headers: { "X-Idempotency-Key": `${o.pedidoId}-${Math.round(o.total * 100)}-${Date.now()}` },
    body: JSON.stringify({
      items: [{ id: o.pedidoId, title: `Pedido #${o.numero} · G-Code`, quantity: 1, unit_price: Number(o.total.toFixed(2)), currency_id: "BRL" }],
      external_reference: o.pedidoId,
      notification_url: `${o.site}/api/mp/webhook`,
      back_urls: { success: o.voltar, pending: o.voltar, failure: o.voltar },
      auto_return: "approved",
      statement_descriptor: "GCODE",
      payer: { name: o.nome ?? undefined, email: o.email ?? undefined },
    }),
  });
}

export type Pagamento = {
  id: number; status: string; status_detail: string; external_reference: string | null;
  transaction_amount: number; payment_type_id: string; date_approved: string | null;
};
export const buscarPagamento = (id: string) => mp<Pagamento>(`/v1/payments/${encodeURIComponent(id)}`);
