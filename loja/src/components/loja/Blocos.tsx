import Link from "next/link";
import type { Produto } from "@/lib/types";
import { Grade } from "./ProdutoCard";
import { WHATSAPP } from "@/lib/catalogo";

export function Prateleira({ titulo, sub, href, produtos, max = 8 }: { titulo: string; sub?: string; href?: string; produtos: Produto[]; max?: number }) {
  if (!produtos.length) return null;
  return (
    <section>
      <div className="sec">
        <h2>{titulo}</h2>
        {sub && <p>{sub}</p>}
        {href && produtos.length > max && (
          <Link className="ver" href={href}>
            Ver todos ({produtos.length}) →
          </Link>
        )}
      </div>
      <Grade produtos={produtos.slice(0, max)} />
    </section>
  );
}

export function Trilha({ itens }: { itens: { nome: string; href?: string }[] }) {
  return (
    <nav className="trilha" aria-label="Você está em">
      <Link href="/">Início</Link>
      {itens.map((i) => (
        <span key={i.nome}>
          <span aria-hidden="true"> / </span>
          {i.href ? <Link href={i.href}>{i.nome}</Link> : <b>{i.nome}</b>}
        </span>
      ))}
    </nav>
  );
}

export function Chips({ itens, ativo }: { itens: { slug: string; nome: string; href: string }[]; ativo?: string }) {
  if (itens.length < 2) return null;
  return (
    <div className="chips-l">
      {itens.map((i) => (
        <Link key={i.slug} className="cat" href={i.href} aria-current={ativo === i.slug ? "page" : undefined}>
          {i.nome}
        </Link>
      ))}
    </div>
  );
}

export function Ajuda() {
  return (
    <>
      <div className="ask">
        <div>
          <h2>Não encontrou o que procura?</h2>
          <p>
            A gente faz sob medida: mande uma foto, um desenho ou só a ideia, com o tamanho e o tema, que respondemos com uma
            prévia e o orçamento.
          </p>
        </div>
        <div className="bt">
          <a
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Olá, G-Code! Não encontrei no site o que procuro. Queria: ")}`}
            target="_blank"
            rel="noopener"
          >
            Fale com a gente no WhatsApp
          </a>
          <a className="ig" href="https://www.instagram.com/gcodecaravelas" target="_blank" rel="noopener">
            Ver no Instagram @gcodecaravelas
          </a>
        </div>
      </div>
      <div className="how" id="como-comprar">
        <div>
          <b>1. Escolha</b>
          <span>Toque em “Quero este” nas peças que gostou. Nome, tamanho e cores a gente ajusta com você.</span>
        </div>
        <div>
          <b>2. Finalize</b>
          <span>Diga se vai retirar na loja, receber pelos Correios ou combinar a entrega, e pague por Pix ou cartão.</span>
        </div>
        <div>
          <b>3. Acompanhe</b>
          <span>Você recebe o número do pedido e vê cada etapa, da produção ao envio.</span>
        </div>
      </div>
    </>
  );
}
