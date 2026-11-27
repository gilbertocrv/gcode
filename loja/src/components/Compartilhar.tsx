"use client";

import { useState } from "react";

type Props = {
  url: string;
  titulo: string;
  texto: string;
  /** foto do produto: no celular vai junto, para postar no story ou no feed do Instagram */
  imagem?: string | null;
  className?: string;
  rotulo?: string;
};

/** Botão de compartilhar: no celular abre a lista do aparelho (Instagram, WhatsApp…); no computador copia legenda e link. */
export default function Compartilhar({ url, titulo, texto, imagem, className, rotulo = "Compartilhar" }: Props) {
  const [aviso, setAviso] = useState<string | null>(null);
  const legenda = `${texto}\n\n${url}`;

  async function clicar() {
    setAviso(null);
    try {
      if (imagem && navigator.canShare) {
        const r = await fetch(imagem);
        const blob = await r.blob();
        const tipo = blob.type || "image/jpeg";
        const arq = new File([blob], `${titulo.slice(0, 40).replace(/[^\w-]+/g, "-")}.jpg`, { type: tipo });
        if (navigator.canShare({ files: [arq] })) {
          // o Instagram ignora o texto que vem junto: deixa a legenda copiada para colar
          await navigator.clipboard?.writeText(legenda).catch(() => {});
          await navigator.share({ files: [arq], title: titulo, text: legenda });
          setAviso("Legenda copiada: é só colar no Instagram.");
          return;
        }
      }
      if (navigator.share) {
        await navigator.share({ title: titulo, text: texto, url });
        return;
      }
      await navigator.clipboard.writeText(legenda);
      setAviso("Legenda e link copiados. Abra o Instagram e cole.");
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return; // a pessoa fechou a lista
      try {
        await navigator.clipboard.writeText(legenda);
        setAviso("Legenda e link copiados. Abra o Instagram e cole.");
      } catch {
        setAviso(url);
      }
    }
  }

  return (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}>
      <button type="button" className={className ?? "compart"} onClick={clicar}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
        </svg>
        {rotulo}
      </button>
      {aviso && (
        <small role="status" style={{ fontSize: 12, color: "var(--soft)" }}>
          {aviso}
        </small>
      )}
    </span>
  );
}
