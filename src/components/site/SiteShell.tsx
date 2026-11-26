"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { Tone } from "@/data/products";
import { normalizePath } from "@/lib/asset";
import { listSingles, productHref } from "@/lib/commerce/catalog";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { SmoothScroll } from "./SmoothScroll";

interface ShellContext {
  tone: Tone;
  /** A főoldali utazás állítja: épp nappali vagy esti jelenet látszik. */
  setHomeTone: (tone: Tone) => void;
  openCart: () => void;
  cartOpen: boolean;
}

const Context = createContext<ShellContext | null>(null);

export function useShell(): ShellContext {
  const value = useContext(Context);
  if (!value) throw new Error("useShell csak a SiteShell-en belül használható.");
  return value;
}

/** Az esti hangulatú oldalak a termékadatokból adódnak. */
const NIGHT_PATHS = new Set(
  listSingles()
    .filter((p) => p.tone === "night")
    .flatMap((p) => [productHref(p), p.routine.href]),
);

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = normalizePath(usePathname());
  const [homeTone, setHomeTone] = useState<Tone>("day");
  const [cartOpen, setCartOpen] = useState(false);
  const isHome = pathname === "/";

  const tone: Tone = isHome ? homeTone : NIGHT_PATHS.has(pathname) ? "night" : "day";

  useEffect(() => {
    document.documentElement.dataset.tone = tone;
  }, [tone]);

  useEffect(() => {
    setCartOpen(false);
  }, [pathname]);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const value = useMemo(
    () => ({ tone, setHomeTone, openCart, cartOpen }),
    [tone, openCart, cartOpen],
  );

  return (
    <Context.Provider value={value}>
      <SmoothScroll />
      <div data-tone={tone} className="tone-root flex min-h-dvh flex-col bg-bg text-fg">
        <a
          href="#tartalom"
          className="btn btn-primary sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50"
        >
          Ugrás a tartalomra
        </a>
        <Header overlay={isHome} />
        <main id="tartalom" className="flex-1">
          {children}
        </main>
        <Footer />
        <CartDrawer open={cartOpen} onClose={closeCart} />
      </div>
    </Context.Provider>
  );
}
