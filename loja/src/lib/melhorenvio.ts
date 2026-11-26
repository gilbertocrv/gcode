import "server-only";

/** Melhor Envio: cotação e etiqueta. Sem MELHORENVIO_TOKEN, o site oferece só retirada e "combinar frete". */
const BASE = process.env.MELHORENVIO_SANDBOX === "1" ? "https://sandbox.melhorenvio.com.br" : "https://melhorenvio.com.br";
export const meConfigurado = () => !!process.env.MELHORENVIO_TOKEN;
export const cepOrigem = () => (process.env.MELHORENVIO_CEP_ORIGEM ?? "45900000").replace(/\D/g, "");

async function me<T>(path: string, body?: unknown, method = body ? "POST" : "GET"): Promise<T> {
  const r = await fetch(BASE + path, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MELHORENVIO_TOKEN}`,
      "User-Agent": "G-Code Loja (gcodecaravelas@gmail.com)",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const txt = await r.text();
  if (!r.ok) throw new Error(`Melhor Envio ${r.status}: ${txt.slice(0, 400)}`);
  return (txt ? JSON.parse(txt) : null) as T;
}

export type ItemFrete = { id: string; largura: number; altura: number; comprimento: number; pesoKg: number; valor: number; quantidade: number };
export type OpcaoFrete = { id: number; nome: string; empresa: string; preco: number; prazo: number };

export async function cotar(cepDestino: string, itens: ItemFrete[]): Promise<OpcaoFrete[]> {
  type R = { id: number; name: string; company?: { name: string }; price?: string; custom_price?: string; delivery_time?: number; custom_delivery_time?: number; error?: string };
  const res = await me<R[]>("/api/v2/me/shipment/calculate", {
    from: { postal_code: cepOrigem() },
    to: { postal_code: cepDestino.replace(/\D/g, "") },
    products: itens.map((i) => ({
      id: i.id, width: i.largura, height: i.altura, length: i.comprimento, weight: i.pesoKg,
      insurance_value: Number(i.valor.toFixed(2)), quantity: i.quantidade,
    })),
    options: { receipt: false, own_hand: false },
  });
  return (res ?? [])
    .filter((o) => !o.error && (o.custom_price ?? o.price))
    .map((o) => ({
      id: o.id, nome: o.name, empresa: o.company?.name ?? "",
      preco: Number(o.custom_price ?? o.price), prazo: Number(o.custom_delivery_time ?? o.delivery_time ?? 0),
    }))
    .sort((a, b) => a.preco - b.preco);
}

type Endereco = { nome: string; telefone?: string | null; email?: string | null; documento?: string | null; rua: string; numero: string; complemento?: string | null; bairro: string; cidade: string; uf: string; cep: string };

const remetente = (): Endereco => {
  const r = JSON.parse(process.env.MELHORENVIO_REMETENTE ?? "{}");
  return { ...r, cep: cepOrigem() };
};
const fmt = (e: Endereco) => ({
  name: e.nome, phone: e.telefone?.replace(/\D/g, ""), email: e.email ?? undefined, document: e.documento?.replace(/\D/g, ""),
  address: e.rua, number: e.numero, complement: e.complemento ?? undefined, district: e.bairro,
  city: e.cidade, state_abbr: e.uf, postal_code: e.cep.replace(/\D/g, ""), country_id: "BR",
});

/** Compra e gera a etiqueta (usa o saldo da carteira do Melhor Envio). */
export async function gerarEtiqueta(o: { servicoId: number; destino: Endereco; itens: ItemFrete[]; valor: number; numeroPedido: number }) {
  const vol = o.itens.reduce(
    (a, i) => ({ c: Math.max(a.c, i.comprimento), l: Math.max(a.l, i.largura), h: a.h + i.altura * i.quantidade, p: a.p + i.pesoKg * i.quantidade }),
    { c: 16, l: 11, h: 0, p: 0 },
  );
  const cart = await me<{ id: string }>("/api/v2/me/cart", {
    service: o.servicoId,
    from: fmt(remetente()),
    to: fmt(o.destino),
    products: o.itens.map((i) => ({ name: i.id, quantity: i.quantidade, unitary_value: Number(i.valor.toFixed(2)) })),
    volumes: [{ height: Math.max(2, Math.ceil(vol.h)), width: Math.ceil(vol.l), length: Math.ceil(vol.c), weight: Number(vol.p.toFixed(3)) }],
    options: { insurance_value: Number(o.valor.toFixed(2)), receipt: false, own_hand: false, non_commercial: true, tags: [{ tag: `Pedido ${o.numeroPedido}` }] },
  });
  await me("/api/v2/me/shipment/checkout", { orders: [cart.id] });
  await me("/api/v2/me/shipment/generate", { orders: [cart.id] });
  const print = await me<{ url: string }>("/api/v2/me/shipment/print", { mode: "public", orders: [cart.id] });
  return { id: cart.id, url: print.url };
}

export async function rastreio(meOrderId: string) {
  const o = await me<{ tracking?: string | null; status?: string }>(`/api/v2/me/orders/${encodeURIComponent(meOrderId)}`);
  return { codigo: o.tracking ?? null, status: o.status ?? null };
}
