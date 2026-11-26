/**
 * A sima görgetés (Lenis) közös kezelője.
 *
 * A Lenis példányt a SmoothScroll komponens hozza létre; innen érik el azok a
 * részek, amelyeknek zárolniuk kell a görgetést (kosárfiók, mobilmenü), vagy
 * tudniuk kell, hogy a görgetés épp simított-e (3D kamera).
 */
import type Lenis from "lenis";

let lenis: Lenis | null = null;
let locks = 0;

export function registerLenis(instance: Lenis | null) {
  lenis = instance;
  if (instance && locks > 0) instance.stop();
}

/** A háttér görgetésének zárolása. Minden hívást egy `unlockScroll` kövessen. */
export function lockScroll() {
  locks += 1;
  document.body.style.overflow = "hidden";
  lenis?.stop();
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks > 0) return;
  document.body.style.overflow = "";
  lenis?.start();
}

/**
 * Oldalváltás után a Lenis belső állását a böngésző tényleges görgetéséhez
 * igazítja (új oldalon a tető, visszalépésnél a visszaállított hely), hogy egy
 * még futó lendület ne húzza el az oldalt.
 */
export function syncSmoothScroll() {
  requestAnimationFrame(() => {
    lenis?.resize();
    lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
  });
}

/** Igaz, ha a görgetést épp a Lenis simítja (egér, érintőpad). */
export function scrollIsSmoothed(): boolean {
  return lenis !== null && lenis.isSmooth;
}
