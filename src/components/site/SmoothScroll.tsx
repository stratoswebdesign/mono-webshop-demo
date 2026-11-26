"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { registerLenis, syncSmoothScroll } from "@/lib/smooth-scroll";

/**
 * Sima görgetés az egész oldalon (Lenis). Egérrel és érintőpaddal a görgetés
 * lágyan fut ki; érintőképernyőn a böngésző saját lendülete marad. Csökkentett
 * mozgás beállításnál a simítás kikapcsol.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.085,
      wheelMultiplier: 0.9,
      anchors: true,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
      respectReducedMotion: true,
    });
    registerLenis(lenis);
    return () => {
      registerLenis(null);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    syncSmoothScroll();
  }, [pathname]);

  return null;
}
