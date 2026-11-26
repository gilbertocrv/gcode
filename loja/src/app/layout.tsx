import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Space Grotesk servida pelo próprio site (sem depender do Google Fonts no build)
const grotesk = localFont({
  src: [
    { path: "./fonts/SpaceGrotesk-Medium.ttf", weight: "400" },
    { path: "./fonts/SpaceGrotesk-Medium.ttf", weight: "500" },
    { path: "./fonts/SpaceGrotesk-Bold.ttf", weight: "700" },
  ],
  variable: "--font-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://gcodecaravelas.com.br"),
  title: "G-Code · peças a laser sob encomenda",
  description:
    "Organizadores, decoração, chaveiros, kits de festa, quadros de onda sonora e placas para o seu negócio, cortados e gravados a laser.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={grotesk.variable}>
      <body>{children}</body>
    </html>
  );
}
