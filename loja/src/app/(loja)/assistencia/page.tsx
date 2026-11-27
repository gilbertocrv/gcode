import { WHATSAPP } from "@/lib/catalogo";
import { Trilha } from "@/components/loja/Blocos";

export const metadata = {
  title: "Assistência técnica · G-Code",
  description: "Conserto e manutenção de computador, notebook e impressora em Caravelas – BA.",
};

const servicos = [
  { t: "Computador e notebook", d: "Formatação, limpeza interna, troca de pasta térmica, SSD e memória, remoção de vírus." },
  { t: "Impressora", d: "Limpeza de cabeça, desentupimento, troca de peças e instalação de tanque de tinta." },
  { t: "Instalação e configuração", d: "Wi-Fi, impressora na rede, e-mail, programas e tomadas inteligentes." },
];

export default function Assistencia() {
  const msg = encodeURIComponent("Olá, G-Code! Preciso de assistência técnica. O aparelho é: ");
  return (
    <main className="band" style={{ paddingTop: 16 }}>
      <div className="wrap">
        <Trilha itens={[{ nome: "Assistência técnica" }]} />
        <h1 className="tit">Assistência técnica</h1>
        <p className="lead">Computador, notebook e impressora. Avaliação na loja em Caravelas e orçamento antes de qualquer serviço.</p>
        <div className="how" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", marginTop: 20 }}>
          {servicos.map((s) => (
            <div key={s.t}>
              <b>{s.t}</b>
              <span>{s.d}</span>
            </div>
          ))}
        </div>
        <div className="ask">
          <div>
            <h2>Como funciona</h2>
            <p>
              Conte pelo WhatsApp o que está acontecendo (e o modelo do aparelho). A gente responde com uma estimativa, você
              traz na loja para avaliação e só fazemos o serviço depois que você aprovar o orçamento.
            </p>
          </div>
          <div className="bt">
            <a href={`https://wa.me/${WHATSAPP}?text=${msg}`} target="_blank" rel="noopener">
              Pedir orçamento no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
