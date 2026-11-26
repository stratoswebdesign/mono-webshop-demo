"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav, secondaryNav } from "@/data/site";
import { normalizePath } from "@/lib/asset";
import { lockScroll, unlockScroll } from "@/lib/smooth-scroll";
import { useCart } from "@/lib/commerce/cart-store";
import { cn } from "@/lib/cn";
import { Logo } from "./Logo";
import { useShell } from "./SiteShell";

/** Fejléc: szóvédjegy, néhány apró hivatkozás, kosár. Képre ültetve átlátszó. */
export function Header({ overlay = false }: { overlay?: boolean }) {
  const pathname = normalizePath(usePathname());
  const { openCart } = useShell();
  const { totals, hydrated } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const count = hydrated ? totals.itemCount : 0;

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    lockScroll();
    window.addEventListener("keydown", onKey);
    return () => {
      unlockScroll();
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Az oldal tetején átlátszó; lefelé görgetve eltűnik, felfelé visszajön.
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 160);
        last = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const solid = menuOpen || (scrolled && !overlay);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[transform,background-color] duration-700 ease-[var(--ease-quiet)]",
        solid ? "bg-bg" : "bg-transparent",
        hidden && !menuOpen && !overlay && "-translate-y-full",
      )}
    >
      <div className="wrap flex h-[4.5rem] items-center justify-between gap-6">
        <Link href="/" aria-label="mono – főoldal" className="-my-3 flex items-baseline gap-3 py-3">
          <Logo className="text-[1.625rem]" />
          <span className="label text-[0.5625rem] text-muted">demó</span>
        </Link>

        <nav aria-label="Fő navigáció" className="hidden lg:block">
          <ul className="flex items-center gap-10">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "label relative py-3 transition-opacity duration-500 hover:opacity-100",
                    isActive(item.href)
                      ? "after:absolute after:inset-x-0 after:bottom-1.5 after:h-px after:bg-fg"
                      : "opacity-60",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCart}
            aria-label={`Kosár megnyitása, ${count} termék`}
            className="label flex h-11 items-center gap-2 px-2"
          >
            Kosár
            <span aria-hidden="true" className="tabular-nums opacity-60">
              ({count})
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobil-menu"
            className="label -mr-2 flex h-11 items-center px-2 lg:hidden"
          >
            {menuOpen ? "Bezárás" : "Menü"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobil-menu"
          aria-label="Mobil navigáció"
          data-lenis-prevent
          className="absolute inset-x-0 top-full h-[calc(100dvh-4.5rem)] overflow-y-auto bg-bg lg:hidden"
        >
          <ul className="wrap flex flex-col pb-10 pt-8">
            {mainNav.map((item, i) => (
              <li key={item.href} className="rise" style={{ "--i": i } as React.CSSProperties}>
                <Link href={item.href} className="statement block py-2.5 lowercase">
                  {item.label}
                </Link>
              </li>
            ))}
            {secondaryNav.map((item, i) => (
              <li key={item.href} className={i === 0 ? "mt-8" : undefined}>
                <Link href={item.href} className="label block py-3 text-muted">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
