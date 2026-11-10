"use client";

/**
 * A mono üveg procedurális modellje: borostyánüveg, fekete pipettás kupak
 * és külön címkepalást. A címke külön háló és külön textúra – a modell
 * később GLB-re, a címke nyomdai grafikára cserélhető a jelenet átírása
 * nélkül.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Variant } from "@/data/products";
import {
  BOTTLE,
  createBulbGeometry,
  createCollarGeometry,
  createGlassGeometry,
  createLabelGeometry,
} from "./bottle-geometry";
import { LABEL_COLORS } from "./label-colors";
import { createLabelTextures, loadLabelFonts, type LabelTextures } from "./label-texture";

export function BottleModel({
  variant,
  lite,
  instant,
  fontFamily,
  onReady,
}: {
  variant: Variant;
  /** Egyszerűbb anyagok és kevesebb sokszög (mobil). */
  lite: boolean;
  /** Áttűnés nélküli címkeváltás (csökkentett mozgás). */
  instant: boolean;
  fontFamily: string;
  onReady: () => void;
}) {
  const geometry = useMemo(() => {
    const segments = lite ? 56 : 96;
    return {
      glass: createGlassGeometry(segments),
      collar: createCollarGeometry(lite ? 40 : 56),
      bulb: createBulbGeometry(lite ? 32 : 56),
      ring: new THREE.CylinderGeometry(BOTTLE.ring.radius, BOTTLE.ring.radius, BOTTLE.ring.height, segments),
      labelBase: createLabelGeometry(BOTTLE.label.radius, segments),
      labelTop: createLabelGeometry(BOTTLE.label.radius + 0.003, segments),
      tube: new THREE.CylinderGeometry(0.075, 0.075, 4.0, 16),
      tip: new THREE.CylinderGeometry(0.075, 0.04, 0.32, 16),
    };
  }, [lite]);

  useEffect(() => () => Object.values(geometry).forEach((g) => g.dispose()), [geometry]);

  const [textures, setTextures] = useState<Record<Variant, LabelTextures> | null>(null);

  useEffect(() => {
    let alive = true;
    let created: Record<Variant, LabelTextures> | null = null;
    loadLabelFonts(fontFamily)
      .catch(() => undefined)
      .then(() => {
        if (!alive) return;
        created = {
          classic: createLabelTextures("classic", fontFamily),
          sleep: createLabelTextures("sleep", fontFamily),
        };
        setTextures(created);
        onReady();
      });
    return () => {
      alive = false;
      if (created) {
        Object.values(created).forEach((t) => {
          t.map.dispose();
          t.bump.dispose();
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontFamily]);

  // A sleep címke a klasszikus fölött fekszik; az átlátszósága váltja a kettőt.
  const topMesh = useRef<THREE.Mesh>(null);
  const topMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const mix = useRef(variant === "sleep" ? 1 : 0);

  useFrame((_, delta) => {
    const target = variant === "sleep" ? 1 : 0;
    mix.current = instant
      ? target
      : THREE.MathUtils.damp(mix.current, target, 3.4, Math.min(delta, 0.05));
    if (Math.abs(mix.current - target) < 0.004) mix.current = target;
    const mesh = topMesh.current;
    const material = topMaterial.current;
    if (!mesh || !material) return;
    mesh.visible = mix.current > 0;
    const fading = mix.current > 0 && mix.current < 1;
    if (material.transparent !== fading) {
      material.transparent = fading;
      material.needsUpdate = true;
    }
    material.opacity = mix.current;
  });

  const labelY = BOTTLE.label.bottom + BOTTLE.label.height / 2;

  return (
    <group>
      {/* Üvegtest */}
      <mesh geometry={geometry.glass}>
        {lite ? (
          <meshPhysicalMaterial
            color="#5a300e"
            roughness={0.14}
            clearcoat={1}
            clearcoatRoughness={0.08}
            transparent
            opacity={0.95}
          />
        ) : (
          <meshPhysicalMaterial
            color="#fff0dc"
            transmission={1}
            thickness={1.3}
            ior={1.5}
            roughness={0.05}
            attenuationColor="#8a5322"
            attenuationDistance={1.0}
          />
        )}
      </mesh>

      {/* Üvegpipetta az üveg belsejében */}
      <mesh geometry={geometry.tube} position-y={2.6}>
        <meshStandardMaterial color="#e2b06c" roughness={0.25} />
      </mesh>
      <mesh geometry={geometry.tip} position-y={0.44}>
        <meshStandardMaterial color="#e2b06c" roughness={0.25} />
      </mesh>

      {/* Címke – klasszikus (alap) és sleep (áttűnő) */}
      <mesh geometry={geometry.labelBase} position-y={labelY}>
        <meshStandardMaterial
          key={textures ? "textured" : "plain"}
          color={textures ? "#ffffff" : LABEL_COLORS.classic.paper}
          map={textures?.classic.map ?? null}
          bumpMap={textures?.classic.bump ?? null}
          bumpScale={2.2}
          roughness={0.93}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={topMesh} geometry={geometry.labelTop} position-y={labelY} visible={variant === "sleep"}>
        <meshStandardMaterial
          ref={topMaterial}
          key={textures ? "textured" : "plain"}
          color={textures ? "#ffffff" : LABEL_COLORS.sleep.paper}
          map={textures?.sleep.map ?? null}
          bumpMap={textures?.sleep.bump ?? null}
          bumpScale={2.2}
          roughness={0.93}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Kupak: zárógyűrű, bordázott gallér, gumipipetta */}
      <mesh geometry={geometry.ring} position-y={BOTTLE.ring.y + BOTTLE.ring.height / 2}>
        <meshStandardMaterial color="#0f0f0f" roughness={0.42} />
      </mesh>
      <mesh geometry={geometry.collar} position-y={BOTTLE.collar.y + BOTTLE.collar.height / 2}>
        <meshStandardMaterial color="#111111" roughness={0.46} />
      </mesh>
      <mesh geometry={geometry.bulb} position-y={BOTTLE.bulbY}>
        <meshStandardMaterial color="#0c0c0c" roughness={0.6} />
      </mesh>
    </group>
  );
}
