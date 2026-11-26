import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // fotos antigas (GitHub Pages) e novas (Supabase Storage)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "gilbertocrv.github.io" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  // gerador da onda sonora continua sendo uma página estática em /public
  async rewrites() {
    return [{ source: "/onda", destination: "/onda.html" }];
  },
};

export default nextConfig;
