"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { Tone, Variant } from "@/data/products";
import { getSingle, listSingles, productHref } from "@/lib/commerce/catalog";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { Footer } from "./Footer";
import { Header } from "./Header";

interface ShellContext {
  tone: Tone;
  /** A főoldali nyitószakaszban kiválasztott termék. */
  homeVariant: Variant;
  setHomeVariant: (variant: Variant) => void;
  openCart: () => void;
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
  const pathname = usePathname();
  const [homeVariant, setHomeVariant] = useState<Variant>("classic");
  const [cartOpen, setCartOpen] = useState(false);

  const tone: Tone =
    pathname === "/" ? getSingle(homeVariant).tone : NIGHT_PATHS.has(pathname) ? "night" : "day";

  useEffect(() => {
    document.documentElement.dataset.tone = tone;
  }, [tone]);

  useEffect(() => {
    setCartOpen(false);
  }, [pathname]);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const value = useMemo(
    () => ({ tone, homeVariant, setHomeVariant, openCart }),
    [tone, homeVariant, openCart],
  );

  return (
    <Context.Provider value={value}>
      <div data-tone={tone} className="tone-root flex min-h-dvh flex-col bg-bg text-fg">
        <a
          href="#tartalom"
          className="btn btn-primary sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50"
        >
          Ugrás a tartalomra
        </a>
        <Header />
        <main id="tartalom" className="flex-1">
          {children}
        </main>
        <Footer />
        <CartDrawer open={cartOpen} onClose={closeCart} />
      </div>
    </Context.Provider>
  );
}
