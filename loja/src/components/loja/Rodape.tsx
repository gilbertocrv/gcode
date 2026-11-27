import Link from "next/link";
import type { Menu } from "@/lib/catalogo";

export default function Rodape({ menu, whatsapp }: { menu: Menu; whatsapp: string }) {
  return (
    <footer className="rod">
      <div className="wrap rod-in">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="G-Code" style={{ height: 40, width: "auto", marginBottom: 10 }} />
          <p>Laser, gráfica, acessórios e assistência técnica. Peças cortadas e gravadas a laser, feitas sob encomenda em Caravelas – BA.</p>
        </div>
        <div>
          <h3>Loja</h3>
          <ul>
            {menu.departamentos.map((d) => (
              <li key={d.slug}>
                <Link href={d.link ?? `/c/${d.slug}`}>{d.nome}</Link>
              </li>
            ))}
            <li>
              <Link href="/c/todos">Catálogo completo</Link>
            </li>
          </ul>
        </div>
        <div>
          <h3>Ajuda</h3>
          <ul>
            <li><Link href="/#como-comprar">Como comprar</Link></li>
            <li><Link href="/politicas#pagamento">Formas de pagamento</Link></li>
            <li><Link href="/politicas#entrega">Entrega e frete</Link></li>
            <li><Link href="/politicas#trocas">Trocas e devoluções</Link></li>
            <li><Link href="/politicas#privacidade">Privacidade</Link></li>
            <li><Link href="/politicas#quem">Quem somos</Link></li>
          </ul>
        </div>
        <div>
          <h3>Contato</h3>
          <ul>
            <li><a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener">WhatsApp (73) 98806-2663</a></li>
            <li><a href="https://www.instagram.com/gcodecaravelas" target="_blank" rel="noopener">Instagram @gcodecaravelas</a></li>
            <li><a href="mailto:contato@gcodecaravelas.com.br">contato@gcodecaravelas.com.br</a></li>
            <li>Caravelas – BA</li>
          </ul>
          <p style={{ marginTop: 10 }}>Pagamento por Pix ou cartão (Mercado Pago). Envio pelos Correios e transportadoras (Melhor Envio).</p>
        </div>
      </div>
      <div className="wrap rod-pe">
        © 2026 G-Code. As fotos marcadas como “prévia” são o projeto da peça; as “foto real” já foram feitas.
      </div>
    </footer>
  );
}
