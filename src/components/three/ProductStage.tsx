"use client";

/**
 * 3D termékszínpad fokozatos betöltéssel:
 *  1. azonnal megjelenik a rajzolt helyettesítő kép (szerveroldalon is),
 *  2. a three.js csak tétlen időben, a színpad láthatóvá válásakor töltődik,
 *  3. WebGL-hiba vagy kontextusvesztés esetén a helyettesítő kép marad.
 */
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { outfit } from "@/app/fonts";
import type { Variant } from "@/data/products";
import { getSingle } from "@/lib/commerce/catalog";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { BottleIllustration } from "./BottleIllustration";

const BottleCanvas = dynamic(() => import("./BottleCanvas"), { ssr: false });

class Boundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function webglAvailable(): boolean {
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
}

export function ProductStage({
  variant,
  hero = false,
  scrollLinked = false,
  paused = false,
  className,
}: {
  variant: Variant;
  /** A főoldali nyitószakasz elrendezése (az üveg jobbra, mobilon alul áll). */
  hero?: boolean;
  scrollLinked?: boolean;
  /** A jelenet szüneteltetése (pl. amíg a galériában fotó látszik). */
  paused?: boolean;
  className?: string;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [mount, setMount] = useState(false);
  const [lite, setLite] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const product = getSingle(variant);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    if (!webglAvailable()) {
      setFailed(true);
      return;
    }
    setLite(window.matchMedia("(max-width: 767px), (pointer: coarse)").matches);

    let idle = false;
    let seen = false;
    const maybeMount = () => {
      if (idle && seen) setMount(true);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) {
          seen = true;
          maybeMount();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(element);

    const onIdle = () => {
      idle = true;
      maybeMount();
    };
    const hasIdle = typeof window.requestIdleCallback === "function";
    const handle = hasIdle
      ? window.requestIdleCallback(onIdle, { timeout: 1500 })
      : window.setTimeout(onIdle, 250);

    return () => {
      observer.disconnect();
      if (hasIdle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
  }, []);

  const handleReady = useCallback(() => {
    // Két képkocka múlva már a kész címkével rajzol a jelenet.
    requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
  }, []);
  const handleFail = useCallback(() => {
    setFailed(true);
    setReady(false);
  }, []);
  const handleInteract = useCallback(() => setInteracted(true), []);

  const show3d = mount && !failed;

  return (
    <div ref={stage} className={cn("stage", hero && "stage-hero", className ?? "relative")}>
      {show3d && (
        <Boundary onError={handleFail}>
          <div className={cn("absolute inset-0 transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")}>
            <BottleCanvas
              variant={variant}
              active={visible && !paused}
              reducedMotion={reducedMotion}
              lite={lite}
              scrollLinked={scrollLinked}
              stageRef={stage}
              fontFamily={outfit.style.fontFamily}
              label={product.name}
              onReady={handleReady}
              onLost={handleFail}
              onInteract={handleInteract}
            />
          </div>
        </Boundary>
      )}

      <div
        className={cn(
          "stage-placeholder pointer-events-none transition-opacity duration-700",
          show3d && ready && "opacity-0",
        )}
      >
        <BottleIllustration
          variant={variant}
          className="h-full w-full drop-shadow-[0_18px_18px_rgb(20_12_4/0.28)]"
          title={show3d && ready ? undefined : `${product.name} üveg`}
        />
      </div>

      {show3d && ready && !interacted && (
        <p
          className="pointer-events-none absolute bottom-3 -translate-x-1/2 text-[0.75rem] tracking-wide text-muted"
          style={{ left: "calc(var(--bx) * 100%)" }}
        >
          <span className="rise block">Húzd el a forgatáshoz</span>
        </p>
      )}
    </div>
  );
}
