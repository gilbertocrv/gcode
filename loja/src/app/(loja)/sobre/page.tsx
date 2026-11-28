import type { Metadata } from "next";
import Link from "next/link";
import { WHATSAPP } from "@/lib/catalogo";

export const metadata: Metadata = {
  title: "Sobre a G-Code · o código que vira peça",
  description: "Por que G-Code? O nome, o símbolo da jubarte e as cores de Abrolhos. Laser, gráfica, impressão 3D e assistência técnica em Caravelas - BA.",
};

const CORES = [
  { nome: "Azul profundo", hex: "#0E3A4F", txt: "#FFFFFF", sentido: "O mar de Abrolhos e a seriedade do trabalho técnico. É a cor de base da marca." },
  { nome: "Turquesa", hex: "#1F9AA0", txt: "#FFFFFF", sentido: "A água rasa dos recifes, a onda do símbolo. Tecnologia que é leve e próxima." },
  { nome: "Coral", hex: "#F2694B", txt: "#0E3A4F", sentido: "Os corais de Abrolhos e o brilho do laser. A energia de criar, a cor dos botões de ação." },
  { nome: "Areia", hex: "#E2C9A0", txt: "#0E3A4F", sentido: "A praia de Caravelas e a madeira do MDF: o material que vira peça nas nossas mãos." },
];

export default function Sobre() {
  return (
    <main className="band sobre" style={{ paddingTop: 16 }}>
      <div className="wrap">
        <header className="sob-hero">
          <span className="sob-logo"><img src="/logo.svg" alt="G-Code" /></span>
          <h1 className="tit">O código que vira peça.</h1>
          <p className="lead">
            A G-Code é uma loja de Caravelas, no extremo sul da Bahia, que transforma ideias em objetos: corte e gravação a laser,
            impressão 3D, gráfica rápida e assistência técnica. O nome, o símbolo e as cores contam essa história.
          </p>
        </header>

        <section className="sob-bloco" aria-labelledby="nome">
          <div>
            <h2 id="nome">Por que “G-Code”?</h2>
            <p>
              <b>G-code</b> é a linguagem que as máquinas de fabricação entendem. Cada linha diz para onde ir, em que velocidade
              e quando ligar o laser ou o bico da impressora 3D. Quando você escolhe um chaveiro com o seu nome, ele vira um
              desenho e o desenho vira G-code: centenas de linhas que a nossa máquina segue, ponto por ponto, até a peça ficar pronta.
            </p>
            <p>
              O nome é uma homenagem a esse trabalho que ninguém vê, entre a ideia e a peça na sua mão. E também tem o <b>G</b> de
              Gilberto, que começou a G-Code unindo a paixão por tecnologia com o artesanato.
            </p>
          </div>
          <pre className="sob-code" aria-label="Exemplo de G-code de um chaveiro">
{`; chaveiro "Ana" — MDF 3 mm
G21        ; medidas em milímetros
G90        ; posição absoluta
G0 X12 Y30 ; vai até o início
M4 S600    ; liga o laser
G1 X18 Y42 F1800 ; grava o "A"
G1 X24 Y30
M5         ; desliga o laser
; ...e assim, linha por linha,
; o código vira peça ✨`}
          </pre>
        </section>

        <section className="sob-bloco" aria-labelledby="simbolo">
          <div className="sob-simb" aria-hidden="true">
            <img src="/logo.svg" alt="" />
          </div>
          <div>
            <h2 id="simbolo">O símbolo: a cauda da jubarte</h2>
            <p>
              Todo ano, de julho a novembro, as baleias jubarte vêm de longe para o Parque Nacional Marinho de Abrolhos,
              bem aqui na frente de Caravelas, para ter seus filhotes. A cauda saindo da água é a imagem mais bonita da nossa região.
            </p>
            <p>
              No símbolo, a cauda nasce de dentro do <b>G</b> e mergulha na <b>onda</b>: a tecnologia (o G) abraçando o que é daqui
              (o mar, a baleia). As ondinhas embaixo lembram as linhas que o laser grava, uma depois da outra.
            </p>
          </div>
        </section>

        <section aria-labelledby="cores" className="sob-sec">
          <h2 id="cores">As cores vêm de Abrolhos</h2>
          <ul className="sob-cores">
            {CORES.map((c) => (
              <li key={c.hex}>
                <span className="sob-sw" style={{ background: c.hex, color: c.txt }}>{c.hex}</span>
                <b>{c.nome}</b>
                <p>{c.sentido}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="faz" className="sob-sec">
          <h2 id="faz">O que a gente faz</h2>
          <ul className="sob-faz">
            <li><b>Corte e gravação a laser</b><span>Chaveiros, quadros, mandalas, lembrancinhas, placas e presentes em MDF, acrílico e cortiça.</span></li>
            <li><b>Impressão 3D</b><span>Peças, suportes e miniaturas impressas camada por camada.</span></li>
            <li><b>Gráfica rápida</b><span>Adesivos, impressões, cartões e artes para o seu negócio.</span></li>
            <li><b>Assistência técnica</b><span>Computador, notebook e impressora: formatação, limpeza, peças e configuração.</span></li>
          </ul>
        </section>

        <section className="sob-cta">
          <h2>De Caravelas para todo o Brasil</h2>
          <p>Cada peça é feita aqui, com cuidado, e enviada para onde você estiver.</p>
          <div className="sob-bts">
            <Link className="btn" href="/c/todos">Ver o catálogo</Link>
            <a className="btn wa" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener">Falar no WhatsApp</a>
            <a className="btn sec" href="https://www.instagram.com/gcodecaravelas" target="_blank" rel="noopener">@gcodecaravelas</a>
          </div>
        </section>
      </div>
    </main>
  );
}
