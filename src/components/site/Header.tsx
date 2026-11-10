"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav, secondaryNav, site } from "@/data/site";
import { useCart } from "@/lib/commerce/cart-store";
import { cn } from "@/lib/cn";
import { Logo } from "./Logo";
import { useShell } from "./SiteShell";

export function Header() {
  const pathname = usePathname();
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
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <p className="bg-surface px-4 py-1.5 text-center text-[0.75rem] tracking-wide text-muted">
        {site.demoNotice}
      </p>
      <header className="sticky top-0 z-40 border-b border-line bg-bg">
        <div className="wrap flex h-16 items-center justify-between gap-6">
          <Link href="/" aria-label="mono – főoldal" className="-my-2 py-2">
            <Logo className="text-[1.875rem]" />
          </Link>

          <nav aria-label="Fő navigáció" className="hidden lg:block">
            <ul className="flex items-center gap-9 text-[0.9375rem]">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "relative py-2 transition-colors hover:text-fg",
                      isActive(item.href)
                        ? "text-fg after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-fg"
                        : "text-muted",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1 text-[0.9375rem]">
            <button
              type="button"
              onClick={openCart}
              aria-label={`Kosár megnyitása, ${count} termék`}
              className="flex h-11 items-center gap-2 px-3 font-medium"
            >
              Kosár
              <span
                aria-hidden="true"
                className={cn(
                  "grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-[0.75rem] tabular-nums transition-colors",
                  count > 0 ? "bg-accent text-accent-fg" : "border border-line text-muted",
                )}
              >
                {count}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobil-menu"
              className="-mr-3 flex h-11 items-center px-3 font-medium lg:hidden"
            >
              {menuOpen ? "Bezárás" : "Menü"}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            id="mobil-menu"
            aria-label="Mobil navigáció"
            className="absolute inset-x-0 top-full h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-bg lg:hidden"
          >
            <ul className="wrap flex flex-col py-6">
              {mainNav.map((item, i) => (
                <li key={item.href} className="rise border-b border-line" style={{ "--i": i } as React.CSSProperties}>
                  <Link href={item.href} className="display-md block py-4 lowercase">
                    {item.label}
                  </Link>
                </li>
              ))}
              {secondaryNav.map((item, i) => (
                <li key={item.href} className={i === 0 ? "mt-5" : undefined}>
                  <Link href={item.href} className="block py-2.5 text-muted">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>
    </>
  );
}
