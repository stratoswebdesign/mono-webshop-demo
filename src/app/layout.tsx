import type { Metadata, Viewport } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { site } from "@/data/site";
import { cormorant, outfit } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "mono – menthol drops és sleep", template: "%s · mono" },
  description: site.description,
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ece7dd" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0d0b" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu" className={`${outfit.variable} ${cormorant.variable}`} suppressHydrationWarning>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
