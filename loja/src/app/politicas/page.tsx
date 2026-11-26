import Link from "next/link";

export const metadata = {
  title: "Políticas da loja · G-Code",
  description: "Pedidos, pagamento, entrega, trocas, devoluções e privacidade na G-Code.",
};

const WA = "5573988062663";

function Secao({ id, titulo, children }: { id: string; titulo: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 mb-8">
      <h2 className="text-2xl mb-3">{titulo}</h2>
      <div className="flex flex-col gap-3 leading-relaxed">{children}</div>
    </section>
  );
}

export default function Politicas() {
  return (
    <main className="min-h-dvh p-5" style={{ background: "var(--bg)" }}>
      <article className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm underline">← Voltar ao catálogo</Link>
        <h1 className="text-4xl mt-4 mb-2">Políticas da loja</h1>
        <p className="text-sm mb-6" style={{ color: "var(--soft)" }}>Última atualização: 26 de novembro de 2026</p>

        <nav className="mb-8 flex flex-wrap gap-2 text-sm">
          {[["quem", "Quem somos"], ["pedidos", "Pedidos"], ["pagamento", "Pagamento"], ["entrega", "Entrega"],
            ["trocas", "Trocas e devoluções"], ["privacidade", "Privacidade"], ["contato", "Contato"]].map(([id, t]) => (
            <a key={id} href={`#${id}`} className="rounded-full border px-3 py-1" style={{ borderColor: "var(--line)", background: "var(--card)" }}>{t}</a>
          ))}
        </nav>

        <Secao id="quem" titulo="Quem somos">
          <p>A G-Code é uma loja de Caravelas (BA) que faz peças em corte e gravação a laser, além de gráfica rápida e assistência técnica. Muitas peças são feitas sob encomenda, com o nome, a frase ou o som que você escolher.</p>
          <p>Responsável: Gilberto Gonçalves dos Santos Filho · Caravelas – BA · WhatsApp (73) 98806-2663 · gcodecaravelas@gmail.com</p>
        </Secao>

        <Secao id="pedidos" titulo="Pedidos e personalização">
          <p>Você monta o pedido no site e recebe um link para acompanhar cada etapa. Peças com preço “a partir de” ou sob consulta viram orçamento: mandamos o valor final pelo WhatsApp e você paga pelo mesmo link.</p>
          <p>Nas peças personalizadas, enviamos a prévia da arte para você aprovar antes de produzir. Confira nomes, datas e textos: depois da aprovação, a peça é feita exatamente como foi aprovada.</p>
          <p>O prazo de produção aparece em cada produto e começa a contar depois da confirmação do pagamento e da aprovação da arte. Por ser trabalho artesanal em MDF, cortiça e acrílico, pequenas variações de veio, cor e acabamento são normais e não são defeito.</p>
        </Secao>

        <Secao id="pagamento" titulo="Pagamento">
          <p>O pagamento é feito no ambiente do Mercado Pago, por Pix ou cartão de crédito. A G-Code não recebe nem guarda dados do seu cartão. A produção começa quando o pagamento é aprovado.</p>
        </Secao>

        <Secao id="entrega" titulo="Entrega e frete">
          <p><b>Retirada na loja:</b> sem custo, em Caravelas. Avisamos pelo WhatsApp quando estiver pronto.</p>
          <p><b>Envio:</b> o frete é calculado pelo CEP no fechamento do pedido, com Correios e transportadoras parceiras pelo Melhor Envio. O prazo informado conta a partir da postagem, que acontece depois do prazo de produção. O código de rastreio aparece na página do seu pedido e é enviado pelo WhatsApp.</p>
          <p><b>Combinar pelo WhatsApp:</b> para entrega local ou quando nenhuma transportadora atende o seu CEP.</p>
          <p>Confira o endereço com atenção. Se a encomenda voltar por endereço incorreto ou ausência repetida, o novo envio é cobrado.</p>
        </Secao>

        <Secao id="trocas" titulo="Trocas, devoluções e arrependimento">
          <p><b>Direito de arrependimento:</b> em compras feitas pela internet, você pode desistir em até 7 dias corridos após receber o pedido, como prevê o Código de Defesa do Consumidor (art. 49). Avise pelo WhatsApp ou e-mail; devolvemos o valor pago, inclusive o frete, pelo mesmo meio de pagamento, depois que a peça voltar.</p>
          <p><b>Defeito ou avaria no transporte:</b> fale com a gente em até 90 dias do recebimento, com fotos da peça e da embalagem. Consertamos, refazemos a peça ou devolvemos o valor, e o custo do envio é nosso.</p>
          <p><b>Erro na personalização:</b> se a peça não corresponder à arte aprovada, refazemos sem custo. Erros em textos já aprovados por você não são considerados defeito.</p>
          <p>Para devolver, embale a peça protegida, de preferência na caixa original. Enviamos as instruções de postagem.</p>
        </Secao>

        <Secao id="privacidade" titulo="Privacidade e seus dados (LGPD)">
          <p><b>O que coletamos:</b> nome, WhatsApp e e-mail para o pedido e o contato; endereço e CPF somente quando você escolhe envio, porque as transportadoras exigem na etiqueta; e o conteúdo da personalização (textos, fotos ou áudios) que você enviar.</p>
          <p><b>Para que usamos:</b> produzir, entregar e dar suporte ao seu pedido, e cumprir obrigações legais. Não vendemos seus dados e não enviamos propaganda sem você pedir.</p>
          <p><b>Com quem compartilhamos:</b> apenas o necessário com o Mercado Pago (pagamento), o Melhor Envio e a transportadora escolhida (entrega) e os serviços que hospedam o site e o banco de dados (Vercel e Supabase).</p>
          <p><b>Por quanto tempo:</b> enquanto for necessário para o pedido, garantias e obrigações legais. Arquivos de personalização podem ser apagados depois da entrega, a seu pedido.</p>
          <p><b>Seus direitos:</b> você pode pedir para ver, corrigir ou excluir seus dados a qualquer momento pelo WhatsApp ou e-mail abaixo.</p>
          <p>O site usa apenas o armazenamento do seu navegador para lembrar o seu carrinho; não usamos cookies de propaganda.</p>
        </Secao>

        <Secao id="contato" titulo="Contato">
          <p>WhatsApp: <a className="underline" href={`https://wa.me/${WA}`}>(73) 98806-2663</a> · E-mail: <a className="underline" href="mailto:gcodecaravelas@gmail.com">gcodecaravelas@gmail.com</a> · Instagram: <a className="underline" href="https://www.instagram.com/gcodecaravelas" target="_blank" rel="noopener">@gcodecaravelas</a></p>
        </Secao>
      </article>
    </main>
  );
}
