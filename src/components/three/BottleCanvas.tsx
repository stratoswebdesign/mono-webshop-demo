"use client";

/**
 * A 3D jelenet: üveg a pulton, fal, fények. Késleltetve töltődik be
 * (lásd ProductStage) – ez a fájl húzza be a three.js-t.
 */
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import type { Variant } from "@/data/products";
import { getSingle } from "@/lib/commerce/catalog";
import { BOTTLE } from "./bottle-geometry";
import { BottleModel } from "./BottleModel";
import { createBlobTexture, createWindowLightTexture } from "./label-texture";

export interface BottleCanvasProps {
  variant: Variant;
  /** Fut-e a képkockahurok (képernyőn kívül szünetel). */
  active: boolean;
  reducedMotion: boolean;
  lite: boolean;
  scrollLinked: boolean;
  /** A színpad eleme – innen olvassuk a --bx/--bb/--bh elhelyezést. */
  stageRef: RefObject<HTMLDivElement | null>;
  fontFamily: string;
  label: string;
  onReady: () => void;
  onLost: () => void;
  onInteract: () => void;
}

interface Rig {
  frame: { x: number; base: number; height: number };
  dragTarget: number;
  dragging: boolean;
  lastDragAt: number;
  scroll: number;
}

/* A színek megegyeznek a globals.css --stage-wall / --stage-counter értékeivel. */
const WALL = [new THREE.Color("#e4d8c5"), new THREE.Color("#1b1511")] as const;
const COUNTER = [new THREE.Color("#cdbda6"), new THREE.Color("#3a2518")] as const;
const KEY = [new THREE.Color("#fff1de"), new THREE.Color("#ffb777")] as const;

const FOV = 26;
const EYE_HEIGHT = 5.6;
const WALL_Z = -4.5;
const TAU = Math.PI * 2;
const lerp = THREE.MathUtils.lerp;
const damp = THREE.MathUtils.damp;

function Scene({
  variant,
  reducedMotion,
  lite,
  rig,
  fontFamily,
  onReady,
}: Pick<BottleCanvasProps, "variant" | "reducedMotion" | "lite" | "fontFamily" | "onReady"> & {
  rig: RefObject<Rig>;
}) {
  const night = getSingle(variant).tone === "night";
  const { camera, size, scene } = useThree();

  const bottle = useRef<THREE.Group>(null);
  const wall = useRef<THREE.MeshBasicMaterial>(null);
  const counter = useRef<THREE.MeshBasicMaterial>(null);
  const sun = useRef<THREE.MeshBasicMaterial>(null);
  const sunMesh = useRef<THREE.Mesh>(null);
  const lampGlow = useRef<THREE.MeshBasicMaterial>(null);
  const lampPool = useRef<THREE.MeshBasicMaterial>(null);
  const castShadow = useRef<THREE.Mesh>(null);
  const castShadowMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const contactShadow = useRef<THREE.MeshBasicMaterial>(null);
  const caustic = useRef<THREE.MeshBasicMaterial>(null);
  const ambient = useRef<THREE.AmbientLight>(null);
  const keyLight = useRef<THREE.DirectionalLight>(null);
  const lamp = useRef<THREE.PointLight>(null);

  const state = useRef({
    tone: night ? 1 : 0,
    spin: 0,
    spinTarget: 0,
    sway: 0,
    drag: 0,
    scroll: 0,
    variant,
  });

  const blob = useMemo(() => createBlobTexture(), []);
  const windowLight = useMemo(() => createWindowLightTexture(), []);
  useEffect(
    () => () => {
      blob.dispose();
      windowLight.dispose();
    },
    [blob, windowLight],
  );

  // Termékváltás: egy teljes fordulat, közben a címke és a fények áttűnnek.
  useEffect(() => {
    const s = state.current;
    if (s.variant === variant) return;
    s.variant = variant;
    if (!reducedMotion) s.spinTarget += TAU;
  }, [variant, reducedMotion]);

  useFrame((frameState, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const s = state.current;
    const r = rig.current;
    const k = (s.tone = reducedMotion ? (night ? 1 : 0) : damp(s.tone, night ? 1 : 0, 2.6, delta));

    // ── Kamera: vízszintesen néz, a kép eltolása (lens shift) teszi az üveget
    // a színpad kívánt pontjára – így a függőlegesek párhuzamosak maradnak.
    s.scroll = reducedMotion ? 0 : damp(s.scroll, r.scroll, 4, delta);
    const cam = camera as THREE.PerspectiveCamera;
    const viewHeight = BOTTLE.height / r.frame.height;
    const distance = viewHeight / (2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)));
    const eye = EYE_HEIGHT + Math.max(-0.4, s.scroll) * 2.2;
    cam.position.set(0, eye, distance);
    cam.rotation.set(0, 0, 0);
    const shiftX = r.frame.x - 0.5;
    const shiftY = r.frame.base - 0.5 + eye / viewHeight;
    cam.setViewOffset(
      size.width,
      size.height,
      -shiftX * size.width,
      shiftY * size.height,
      size.width,
      size.height,
    );

    // ── Az üveg forgása: lassú ringás + húzás + görgetés + váltáskori fordulat
    if (!r.dragging && !reducedMotion) s.sway += delta;
    const now = frameState.clock.elapsedTime;
    if (!r.dragging && now - r.lastDragAt > 4) {
      // Pihenő után a címke visszafordul előre, a rövidebb úton.
      r.dragTarget = Math.round(r.dragTarget / TAU) * TAU;
    }
    s.drag = damp(s.drag, r.dragTarget, r.dragging ? 14 : 3.5, delta);
    s.spin = damp(s.spin, s.spinTarget, 3, delta);
    if (bottle.current) {
      bottle.current.rotation.y =
        0.1 + Math.sin(s.sway * 0.42) * 0.36 + s.drag + s.scroll * 1.1 + s.spin;
    }

    // ── Reggel ↔ este: fal, pult, fények
    wall.current?.color.lerpColors(WALL[0], WALL[1], k);
    counter.current?.color.lerpColors(COUNTER[0], COUNTER[1], k);
    if (sun.current) sun.current.opacity = (1 - k) * 0.55;
    // Keskeny (álló) színpadon a fényfolt közelebb húzódik az üveghez.
    if (sunMesh.current) {
      const halfWidth = (viewHeight * size.width) / size.height / 2;
      sunMesh.current.position.x = -Math.min(7.5, halfWidth + 2.6);
    }
    if (lampGlow.current) lampGlow.current.opacity = k * 0.5;
    if (lampPool.current) lampPool.current.opacity = k * 0.3;
    if (caustic.current) caustic.current.opacity = lerp(0.5, 0.34, k);
    if (contactShadow.current) contactShadow.current.opacity = lerp(0.42, 0.7, k);
    if (castShadowMaterial.current) castShadowMaterial.current.opacity = lerp(0.3, 0.42, k);
    if (castShadow.current) {
      castShadow.current.position.x = lerp(1.9, 0.9, k);
      castShadow.current.scale.set(lerp(6.4, 4.6, k), lerp(2.6, 3, k), 1);
    }
    if (ambient.current) ambient.current.intensity = lerp(0.38, 0.2, k);
    if (keyLight.current) {
      keyLight.current.intensity = lerp(1.25, 0.75, k);
      keyLight.current.color.lerpColors(KEY[0], KEY[1], k);
    }
    if (lamp.current) lamp.current.intensity = lerp(0, 2.6, k);
    scene.environmentIntensity = lerp(0.8, 0.3, k);
  });

  return (
    <>
      <ambientLight ref={ambient} />
      <directionalLight ref={keyLight} position={[-7, 8, 6]} />
      <directionalLight position={[6, 5, -5]} intensity={0.35} />
      <pointLight ref={lamp} position={[-4, 8, 7]} color="#ffab66" decay={0} intensity={0} />

      <Environment resolution={lite ? 128 : 256} frames={1}>
        <color attach="background" args={["#231b14"]} />
        <Lightformer form="rect" intensity={5} color="#ffe9cf" position={[-9, 4, 3]} scale={[8, 14, 1]} target={[0, 3, 0]} />
        <Lightformer form="rect" intensity={1.3} color="#e9eef5" position={[9, 3, 2]} scale={[5, 10, 1]} target={[0, 3, 0]} />
        <Lightformer form="rect" intensity={2.2} color="#fff6ea" position={[0, 12, 0]} scale={[12, 12, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1} color="#f6ead9" position={[0, 4, 14]} scale={[18, 10, 1]} target={[0, 3, 0]} />
        <Lightformer form="rect" intensity={0.8} color="#e9d9c0" position={[0, 4, -12]} scale={[24, 12, 1]} target={[0, 3, 0]} />
      </Environment>

      {/* Fal a pult mögött */}
      <mesh position={[0, 0, WALL_Z]}>
        <planeGeometry args={[400, 200]} />
        <meshBasicMaterial ref={wall} color={WALL[night ? 1 : 0]} toneMapped={false} />
      </mesh>
      {/* Reggel: ablakon beeső fény a falon */}
      <mesh ref={sunMesh} position={[-7.5, 7.2, WALL_Z + 0.02]} rotation={[0, 0, -0.12]} scale={[1, 1.15, 1]}>
        <planeGeometry args={[13, 13]} />
        <meshBasicMaterial
          ref={sun}
          map={windowLight}
          color="#fff3dc"
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* Este: lámpafény a falon */}
      <mesh position={[-10, 12.5, WALL_Z + 0.03]}>
        <planeGeometry args={[30, 30]} />
        <meshBasicMaterial
          ref={lampGlow}
          map={blob}
          color="#e39247"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* Pult */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, WALL_Z + 30]}>
        <planeGeometry args={[400, 60]} />
        <meshBasicMaterial ref={counter} color={COUNTER[night ? 1 : 0]} toneMapped={false} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[-2.5, 0.004, 0.5]} renderOrder={1}>
        <planeGeometry args={[22, 11]} />
        <meshBasicMaterial
          ref={lampPool}
          map={blob}
          color="#c97b3d"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      {/* Vetett és érintkezési árnyék, borostyán fényfolt */}
      <mesh ref={castShadow} rotation-x={-Math.PI / 2} position={[1.9, 0.008, -0.5]} renderOrder={2}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          ref={castShadowMaterial}
          map={blob}
          color="#1a120a"
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0.1, 0.012, 0]} renderOrder={3}>
        <planeGeometry args={[3.3, 3.3]} />
        <meshBasicMaterial
          ref={contactShadow}
          map={blob}
          color="#140d07"
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[1.7, 0.016, 0.35]} renderOrder={4}>
        <planeGeometry args={[3.6, 1.5]} />
        <meshBasicMaterial
          ref={caustic}
          map={blob}
          color="#f08a2c"
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <group ref={bottle}>
        <BottleModel
          variant={variant}
          lite={lite}
          instant={reducedMotion}
          fontFamily={fontFamily}
          onReady={onReady}
        />
      </group>
    </>
  );
}

export default function BottleCanvas({
  variant,
  active,
  reducedMotion,
  lite,
  scrollLinked,
  stageRef,
  fontFamily,
  label,
  onReady,
  onLost,
  onInteract,
}: BottleCanvasProps) {
  const rig = useRef<Rig>({
    frame: { x: 0.5, base: 0.13, height: 0.7 },
    dragTarget: 0,
    dragging: false,
    lastDragAt: -100,
    scroll: 0,
  });
  const clock = useRef<THREE.Clock | null>(null);
  const pointer = useRef<{ id: number; x: number } | null>(null);

  // Az üveg helye a színpadon – a CSS-ből (--bx, --bb, --bh).
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const read = () => {
      const style = getComputedStyle(stage);
      const value = (name: string, fallback: number) => {
        const n = parseFloat(style.getPropertyValue(name));
        return Number.isFinite(n) ? n : fallback;
      };
      rig.current.frame = {
        x: value("--bx", 0.5),
        base: value("--bb", 0.13),
        height: value("--bh", 0.7),
      };
    };
    read();
    const observer = new ResizeObserver(read);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [stageRef]);

  // Visszafogott, görgetéshez kötött mozgás.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !scrollLinked || reducedMotion) {
      rig.current.scroll = 0;
      return;
    }
    const onScroll = () => {
      const rect = stage.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const offset = (viewport / 2 - (rect.top + rect.height / 2)) / viewport;
      rig.current.scroll = THREE.MathUtils.clamp(offset, -1, 1);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [stageRef, scrollLinked, reducedMotion]);

  const endDrag = () => {
    if (!pointer.current) return;
    pointer.current = null;
    rig.current.dragging = false;
    rig.current.lastDragAt = clock.current?.elapsedTime ?? 0;
  };

  return (
    <div
      className="stage-canvas absolute inset-0 outline-offset-[-4px]"
      role="img"
      aria-label={`${label} – forgatható 3D modell. Húzással vagy a bal és jobb nyíllal forgatható.`}
      tabIndex={0}
      onPointerDown={(event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        pointer.current = { id: event.pointerId, x: event.clientX };
        rig.current.dragging = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        onInteract();
      }}
      onPointerMove={(event) => {
        const p = pointer.current;
        if (!p || p.id !== event.pointerId) return;
        rig.current.dragTarget += (event.clientX - p.x) * 0.011;
        p.x = event.clientX;
      }}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={endDrag}
      onKeyDown={(event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        rig.current.dragTarget += event.key === "ArrowRight" ? 0.4 : -0.4;
        rig.current.lastDragAt = clock.current?.elapsedTime ?? 0;
        onInteract();
      }}
    >
      <Canvas
        dpr={[1, 2]}
        frameloop={active ? "always" : "never"}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        camera={{ fov: FOV, near: 1, far: 300, position: [0, EYE_HEIGHT, 24] }}
        onCreated={({ gl, clock: created }) => {
          clock.current = created;
          gl.domElement.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
            onLost();
          });
        }}
      >
        <Scene
          variant={variant}
          reducedMotion={reducedMotion}
          lite={lite}
          rig={rig}
          fontFamily={fontFamily}
          onReady={onReady}
        />
      </Canvas>
    </div>
  );
}
