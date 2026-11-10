import type { NextConfig } from "next";

/**
 * GitHub Pages: ha a PAGES_BASE_PATH környezeti változó meg van adva
 * (pl. "/mono-webshop-demo"), a build statikus exportot készít az `out`
 * mappába, ezzel az alútvonallal. Helyi fejlesztésnél és más hosztingnál
 * a változó nincs beállítva, minden a megszokott módon működik.
 */
const pagesBasePath = process.env.PAGES_BASE_PATH?.replace(/\/$/, "");
const isPagesExport = pagesBasePath !== undefined;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isPagesExport && {
    output: "export",
    basePath: pagesBasePath,
    trailingSlash: true,
    images: { unoptimized: true },
  }),
  env: { NEXT_PUBLIC_BASE_PATH: pagesBasePath ?? "" },
};

export default nextConfig;
