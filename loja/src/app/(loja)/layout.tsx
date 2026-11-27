import { getMenu, WHATSAPP } from "@/lib/catalogo";
import { BarraPedido, CarrinhoProvider } from "@/components/loja/Carrinho";
import Cabecalho from "@/components/loja/Cabecalho";
import Rodape from "@/components/loja/Rodape";

export const revalidate = 60;

export default async function LojaLayout({ children }: { children: React.ReactNode }) {
  const menu = await getMenu();
  return (
    <CarrinhoProvider>
      <Cabecalho menu={menu} whatsapp={WHATSAPP} />
      {children}
      <Rodape menu={menu} whatsapp={WHATSAPP} />
      <BarraPedido whatsapp={WHATSAPP} />
    </CarrinhoProvider>
  );
}
