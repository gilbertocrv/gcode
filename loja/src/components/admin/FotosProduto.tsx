"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { atualizarVitrine } from "@/app/admin/(painel)/produtos/actions";

type Foto = { id: string; url: string | null; storage_path: string | null; ordem: number };

const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/produtos/`;
const src = (f: Foto) => (f.storage_path ? base + f.storage_path : f.url ?? "");

/** Reduz a foto do celular para no máx. 1600 px e JPEG ~85% antes de enviar. */
async function reduzir(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const max = 1600;
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((ok, err) => c.toBlob((b) => (b ? ok(b) : err(new Error("Falha ao converter a foto"))), "image/jpeg", 0.85));
}

export default function FotosProduto({ produtoId, slug, fotos: inicial }: { produtoId: string; slug: string; fotos: Foto[] }) {
  const [fotos, setFotos] = useState(inicial);
  const [msg, setMsg] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [, start] = useTransition();
  const input = useRef<HTMLInputElement>(null);
  const sb = createClient();

  const sync = () => start(() => atualizarVitrine(produtoId));

  async function enviar(files: FileList | null) {
    if (!files?.length) return;
    setOcupado(true);
    setMsg(null);
    try {
      let ordem = fotos.length ? Math.max(...fotos.map((f) => f.ordem)) + 1 : 0;
      const novas: Foto[] = [];
      for (const file of Array.from(files)) {
        const blob = await reduzir(file);
        const path = `${slug}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.jpg`;
        const up = await sb.storage.from("produtos").upload(path, blob, { contentType: "image/jpeg", upsert: false });
        if (up.error) throw up.error;
        const { data, error } = await sb
          .from("produto_imagens")
          .insert({ produto_id: produtoId, storage_path: path, ordem: ordem++ })
          .select("id, url, storage_path, ordem")
          .single();
        if (error) throw error;
        novas.push(data as Foto);
      }
      setFotos((f) => [...f, ...novas]);
      setMsg(`${novas.length} foto(s) enviada(s).`);
      sync();
    } catch (e) {
      setMsg("Erro ao enviar: " + (e as Error).message);
    } finally {
      setOcupado(false);
      if (input.current) input.current.value = "";
    }
  }

  async function apagar(f: Foto) {
    if (!confirm("Apagar esta foto?")) return;
    const { error } = await sb.from("produto_imagens").delete().eq("id", f.id);
    if (error) return setMsg(error.message);
    if (f.storage_path) await sb.storage.from("produtos").remove([f.storage_path]);
    setFotos((l) => l.filter((x) => x.id !== f.id));
    sync();
  }

  async function capa(f: Foto) {
    const ordenadas = [f, ...fotos.filter((x) => x.id !== f.id)].map((x, i) => ({ ...x, ordem: i }));
    setFotos(ordenadas);
    for (const x of ordenadas) await sb.from("produto_imagens").update({ ordem: x.ordem }).eq("id", x.id);
    sync();
  }

  const lista = [...fotos].sort((a, b) => a.ordem - b.ordem);

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {lista.map((f, i) => (
          <figure key={f.id} className="relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--sel)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src(f)} alt="" className="aspect-square w-full object-cover" />
            {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-[var(--teal)] px-2 py-0.5 text-xs font-bold text-white">Capa</span>}
            <figcaption className="flex justify-between gap-1 p-1.5 text-xs">
              {i > 0 ? <button type="button" onClick={() => capa(f)} className="underline cursor-pointer">Usar como capa</button> : <span />}
              <button type="button" onClick={() => apagar(f)} className="text-[var(--coral)] underline cursor-pointer">Apagar</button>
            </figcaption>
          </figure>
        ))}
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={ocupado}
          className="grid aspect-square place-items-center rounded-xl border-2 border-dashed border-[var(--line)] text-center text-sm text-[var(--soft)] hover:border-[var(--teal)] cursor-pointer disabled:opacity-50"
        >
          {ocupado ? "Enviando…" : "+ Adicionar fotos\n(câmera ou galeria)"}
        </button>
      </div>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => enviar(e.target.files)} />
      {msg && <p className="mt-2 text-sm text-[var(--soft)]" role="status">{msg}</p>}
    </div>
  );
}
