"use client";

import { useEffect, useRef, useState } from "react";

/** Câmera do celular lendo QR (etiqueta G-Code) e código de barras de fábrica (EAN). */
export default function LeitorCodigo({ onCodigo, onFechar }: { onCodigo: (c: string) => void; onFechar: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [erro, setErro] = useState<string | null>(null);
  const ultimo = useRef({ c: "", t: 0 });
  const cb = useRef(onCodigo);
  cb.current = onCodigo;

  useEffect(() => {
    let parar: (() => void) | null = null;
    let vivo = true;
    (async () => {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        const leitor = new BrowserMultiFormatReader();
        const ctl = await leitor.decodeFromConstraints(
          { video: { facingMode: { ideal: "environment" } }, audio: false },
          video.current!,
          (r) => {
            if (!r) return;
            const c = r.getText().trim();
            const agora = Date.now();
            // a mesma etiqueta parada na frente da câmera não conta duas vezes seguidas
            if (c === ultimo.current.c && agora - ultimo.current.t < 1800) return;
            ultimo.current = { c, t: agora };
            navigator.vibrate?.(80);
            cb.current(c);
          },
        );
        if (!vivo) ctl.stop();
        else parar = () => ctl.stop();
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setErro(/permission|notallowed/i.test(msg) ? "Permita o uso da câmera no navegador para ler os códigos." : "Não consegui abrir a câmera neste aparelho.");
      }
    })();
    return () => {
      vivo = false;
      parar?.();
    };
  }, []);

  return (
    <div className="rounded-xl overflow-hidden bg-black relative">
      <video ref={video} className="w-full max-h-[45vh] object-cover" muted playsInline />
      <div className="pointer-events-none absolute inset-x-[15%] top-1/2 -translate-y-1/2 h-[40%] border-2 border-white/80 rounded-lg" />
      {erro && <p className="absolute inset-x-0 bottom-12 text-center text-white text-sm px-4">{erro}</p>}
      <button type="button" onClick={onFechar} className="absolute bottom-2 right-2 rounded-lg bg-white/90 px-3 py-1.5 text-sm font-semibold">
        Fechar câmera
      </button>
    </div>
  );
}
