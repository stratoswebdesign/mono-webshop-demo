"use client";

/**
 * Forgatható termék a saját jelenetében (reggel vagy este) – termékoldalra.
 * Húzással, érintéssel és a bal/jobb nyíllal forgatható; magától lassan ring.
 */
import { useEffect, useRef, useState } from "react";
import type { Variant } from "@/data/products";
import { getSingle } from "@/lib/commerce/catalog";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import type { Director } from "./SceneCanvas";
import { SceneStage, type StageStatus } from "./SceneStage";
import type { StageLayout } from "./journey-director";
import { POINTS, SCENES, type SceneId } from "./scene-config";

const TAU = Math.PI * 2;

export function ProductViewer({ variant, className }: { variant: Variant; className?: string }) {
  const product = getSingle(variant);
  const sceneId: SceneId = product.tone === "night" ? "este" : "reggel";
  const reducedMotion = useReducedMotion();
  const director = useRef<Director | null>(null);
  const layout = useRef<StageLayout>({ zoom: 2.3, ax: 0.5, ay: 0.5, portrait: false });
  const drag = useRef({ yaw: 0, dragging: false, pointer: -1, x: 0, releasedAt: -100, now: 0 });
  const [status, setStatus] = useState<StageStatus>("poster");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const label = variant === "sleep" ? 1 : 0;
    director.current = (elapsed) => {
      const d = drag.current;
      d.now = elapsed;
      // Pihenő után a címke visszafordul előre, a rövidebb úton.
      if (!d.dragging && elapsed - d.releasedAt > 4) d.yaw = Math.round(d.yaw / TAU) * TAU;
      const sway = reducedMotion || d.dragging ? 0 : Math.sin(elapsed * 0.4) * 0.3;
      return {
        scene: sceneId,
        nextScene: sceneId,
        blend: 0,
        zoom: layout.current.zoom,
        focus: POINTS.center,
        anchor: [layout.current.ax, layout.current.ay],
        yaw: 0.12 + sway + d.yaw,
        orbit: [0, 0],
        label,
        pair: 0,
      };
    };
  }, [variant, sceneId, reducedMotion]);

  const release = () => {
    const d = drag.current;
    if (!d.dragging) return;
    d.dragging = false;
    d.releasedAt = d.now;
  };

  const live = status === "live";

  return (
    <div
      className={cn("stage-canvas outline-offset-[-6px]", className)}
      data-drag={live}
      role="img"
      aria-label={
        live
          ? `${product.name} – forgatható 3D modell. Húzással vagy a bal és jobb nyíllal forgatható.`
          : `${product.name} üveg`
      }
      tabIndex={live ? 0 : undefined}
      onPointerDown={(event) => {
        if (!live || (event.pointerType === "mouse" && event.button !== 0)) return;
        const d = drag.current;
        d.dragging = true;
        d.pointer = event.pointerId;
        d.x = event.clientX;
        event.currentTarget.setPointerCapture(event.pointerId);
        setTouched(true);
      }}
      onPointerMove={(event) => {
        const d = drag.current;
        if (!d.dragging || d.pointer !== event.pointerId) return;
        d.yaw += (event.clientX - d.x) * 0.011;
        d.x = event.clientX;
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onKeyDown={(event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const d = drag.current;
        d.yaw += event.key === "ArrowRight" ? 0.4 : -0.4;
        d.releasedAt = d.now;
        setTouched(true);
      }}
    >
      <SceneStage
        director={director}
        layout={layout}
        scenes={[sceneId]}
        poster={SCENES[sceneId].still}
        posterAlt=""
        onStatus={setStatus}
        className="stage-viewer absolute inset-0"
      >
        <p
          aria-hidden="true"
          className={cn(
            "label pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 text-[0.5625rem] text-fg transition-opacity duration-1000",
            live && !touched ? "opacity-70" : "opacity-0",
          )}
        >
          Húzd el a forgatáshoz
        </p>
      </SceneStage>
    </div>
  );
}
