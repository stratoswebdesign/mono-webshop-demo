"use client";

/**
 * Színpad a valós idejű jelenethez, fokozatos betöltéssel:
 *  1. azonnal megjelenik a Blenderben renderelt kép (ugyanabból a kamerából),
 *  2. a three.js csak tétlen időben, láthatóvá váláskor töltődik,
 *  3. WebGL-hiba vagy kontextusvesztés esetén a renderelt kép marad.
 */
import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import dynamic from "next/dynamic";
import { outfit } from "@/app/fonts";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/cn";
import type { Director } from "./SceneCanvas";
import type { StageLayout } from "./journey-director";
import type { SceneId } from "./scene-config";

const SceneCanvas = dynamic(() => import("./SceneCanvas"), { ssr: false });

export type StageStatus = "poster" | "live" | "failed";

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

export function SceneStage({
  director,
  layout,
  scenes,
  poster,
  posterAlt,
  className,
  onStatus,
  children,
}: {
  director: RefObject<Director | null>;
  /** Ide írja a színpad a CSS-ből olvasott elrendezést (--zoom, --ax, --ay). */
  layout: RefObject<StageLayout>;
  scenes: SceneId[];
  /** A nyitó beállítás renderelt képe. */
  poster: string;
  posterAlt: string;
  className?: string;
  onStatus?: (status: StageStatus) => void;
  children?: ReactNode;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const [mount, setMount] = useState(false);
  const [lite, setLite] = useState(false);
  const [status, setStatus] = useState<StageStatus>("poster");
  const [visible, setVisible] = useState(false);

  const update = useCallback(
    (next: StageStatus) => {
      setStatus(next);
      onStatus?.(next);
    },
    [onStatus],
  );

  useEffect(() => {
    const element = stage.current;
    if (!element) return;

    const read = () => {
      const style = getComputedStyle(element);
      const value = (name: string, fallback: number) => {
        const n = parseFloat(style.getPropertyValue(name));
        return Number.isFinite(n) ? n : fallback;
      };
      layout.current = {
        zoom: value("--zoom", 1),
        ax: value("--ax", 0.5),
        ay: value("--ay", 0.5),
        portrait: element.clientHeight > element.clientWidth,
      };
    };
    read();
    const resize = new ResizeObserver(read);
    resize.observe(element);

    if (!webglAvailable()) {
      update("failed");
      return () => resize.disconnect();
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
      ? window.requestIdleCallback(onIdle, { timeout: 1200 })
      : window.setTimeout(onIdle, 200);

    return () => {
      resize.disconnect();
      observer.disconnect();
      if (hasIdle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
  }, [layout, update]);

  const handleReady = useCallback(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => update("live")));
  }, [update]);
  const handleFail = useCallback(() => update("failed"), [update]);

  const live = status === "live";

  return (
    <div ref={stage} className={cn("stage", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset(poster)}
        alt={live ? "" : posterAlt}
        aria-hidden={live || undefined}
        decoding="async"
        fetchPriority="high"
        className="stage-poster select-none"
        draggable={false}
      />
      {mount && status !== "failed" && (
        <Boundary onError={handleFail}>
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-[1400ms] ease-out",
              live ? "opacity-100" : "opacity-0",
            )}
          >
            <SceneCanvas
              director={director}
              scenes={scenes}
              active={visible}
              lite={lite}
              fontFamily={outfit.style.fontFamily}
              onReady={handleReady}
              onLost={handleFail}
            />
          </div>
        </Boundary>
      )}
      {children}
    </div>
  );
}
