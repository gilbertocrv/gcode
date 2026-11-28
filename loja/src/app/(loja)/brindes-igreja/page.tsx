import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicClient } from "@/lib/supabase/public";
import { BRINDE_COLS, numBrinde, type Dia } from "@/lib/brindes";
import Escolha from "./Escolha";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Brindes da festa · G-Code",
  description: "Escolha o brinde do seu dia. Presente da G-Code para a comunidade.",
  robots: { index: false },
};

export default async function BrindesIgreja() {
  const pub = createPublicClient();
  const adm = createAdminClient();
  const [{ data: bs }, { data: ds }, escolhas] = await Promise.all([
    pub.from("brindes").select(BRINDE_COLS).eq("ativo", true).order("ordem"),
    pub.from("brinde_dias").select("dia, data, rotulo").order("dia"),
    adm ? adm.from("brinde_escolhas").select("dia, brinde_id") : Promise.resolve({ data: [] as { dia: number; brinde_id: string }[] }),
  ]);
  return (
    <main className="band" style={{ paddingTop: 16 }}>
      <div className="wrap">
        <h1 className="tit">Brindes da festa 🙏</h1>
        <p className="lead">
          A G-Code vai presentear a comunidade com <b>20 brindes por dia</b>, todos feitos aqui no nosso laser. Escolha o brinde do seu dia.
          Se quiser mais unidades para a sua família ou pastoral, já veja o preço de cada um.
        </p>
        <Escolha brindes={(bs ?? []).map((b) => numBrinde(b))} dias={(ds ?? []) as Dia[]} ocupados={(escolhas.data ?? []) as { dia: number; brinde_id: string }[]} />
      </div>
    </main>
  );
}
