"use client";

/**
 * A valós idejű jelenet: a Blenderben renderelt háttérkép előtt a GLB üveg,
 * a jelenet saját panorámájával megvilágítva.
 *
 * A kamera rögzített (ugyanaz, amivel a háttér készült); „közelítés” a
 * négyzetes képből vágott részlet nagyításával történik, így az üveg és a
 * háttér mindig fedésben marad. Azt, hogy épp mit látunk, a `director`
 * függvény mondja meg képkockánként (görgetés vagy forgatás alapján).
 *
 * Ez a fájl húzza be a three.js-t – késleltetve töltődik (lásd SceneStage).
 */
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";
import { asset } from "@/lib/asset";
import { scrollIsSmoothed } from "@/lib/smooth-scroll";
import { createLabelTextures, type LabelTextures } from "./label-textures";
import { CAMERA, PAIR_OFFSET, SCENES, type SceneId, type Shot } from "./scene-config";

export type Director = (elapsed: number, delta: number, viewport: { width: number; height: number }) => Shot;

export interface SceneCanvasProps {
  director: RefObject<Director | null>;
  /** A jelenetek, betöltési sorrendben – az első azonnal kell. */
  scenes: SceneId[];
  /** Fut-e a képkockahurok (képernyőn kívül szünetel). */
  active: boolean;
  /** Kisebb textúrák és alacsonyabb felbontás (mobil). */
  lite: boolean;
  fontFamily: string;
  onReady: () => void;
  onLost: () => void;
}

const MODEL = asset("/models/mono-bottle.glb");
const damp = THREE.MathUtils.damp;
const lerp = THREE.MathUtils.lerp;

/* ── Háttér: a renderelt kép kivágása, két jelenet közti áttűnéssel ───────── */

const backdropVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 1.0, 1.0);
  }
`;

const backdropFragment = /* glsl */ `
  uniform sampler2D tA;
  uniform sampler2D tB;
  uniform float uMix;
  uniform vec4 uRect;      // a látható részlet a négyzetes képen: x, y (felülről), szél., mag.
  uniform vec3 uFallbackA;
  uniform vec3 uFallbackB;
  uniform float uHasA;
  uniform float uHasB;
  varying vec2 vUv;
  void main() {
    vec2 uv = vec2(uRect.x + vUv.x * uRect.z, 1.0 - (uRect.y + (1.0 - vUv.y) * uRect.w));
    vec3 a = mix(uFallbackA, texture2D(tA, uv).rgb, uHasA);
    vec3 b = mix(uFallbackB, texture2D(tB, uv).rgb, uHasB);
    gl_FragColor = vec4(mix(a, b, uMix), 1.0);
    #include <colorspace_fragment>
  }
`;

/** Jelenetenkénti helykitöltő szín, amíg a háttérkép töltődik (lineáris). */
const FALLBACK: Record<SceneId, THREE.Color> = {
  reggel: new THREE.Color("#b9aa97"),
  este: new THREE.Color("#2a1a10"),
  paros: new THREE.Color("#c9c0b2"),
};

interface Loaded {
  plate?: THREE.Texture;
  env?: THREE.Texture;
}

/* ── Az üveg ────────────────────────────────────────────────────────────── */

interface BottleHandle {
  group: THREE.Group;
  labelTop: THREE.Mesh;
  labelTopMaterial: THREE.MeshStandardMaterial;
}

function useBottleMaterials(simple: boolean) {
  return useMemo(() => {
    const lite = simple;
    const glass = lite
      ? new THREE.MeshPhysicalMaterial({
          color: "#4a2609",
          roughness: 0.08,
          clearcoat: 1,
          clearcoatRoughness: 0.05,
          transparent: true,
          opacity: 0.94,
        })
      : new THREE.MeshPhysicalMaterial({
          color: "#ffffff",
          transmission: 1,
          thickness: 0.0055,
          ior: 1.52,
          roughness: 0.03,
          attenuationColor: new THREE.Color(0.6, 0.31, 0.075),
          attenuationDistance: 0.0021,
          specularIntensity: 1,
          envMapIntensity: 1.7,
        });
    if (!lite) {
      // A fal ferde szögből nézve vastagabb: a széleken mélyebb a borostyán,
      // ahogy a valódi üvegnél. (A three.js alapból állandó vastagsággal számol.)
      glass.onBeforeCompile = (shader) => {
        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <transmission_fragment>",
          THREE.ShaderChunk.transmission_fragment.replace(
            "material.thickness = thickness;",
            "material.thickness = thickness * ( 1.0 + 2.2 * pow( 1.0 - clamp( dot( normalize( vViewPosition ), normal ), 0.0, 1.0 ), 2.0 ) );",
          ),
        );
      };
    }
    return {
      glass,
      pipette: new THREE.MeshStandardMaterial({ color: "#c98f4a", roughness: 0.2 }),
      plastic: new THREE.MeshStandardMaterial({ color: "#0a0a0b", roughness: 0.36 }),
      rubber: new THREE.MeshStandardMaterial({ color: "#090909", roughness: 0.62 }),
    };
  }, [simple]);
}

function Bottle({
  handle,
  textures,
  simple,
  fixedLabel,
}: {
  handle: RefObject<BottleHandle | null>;
  textures: LabelTextures | null;
  /** Fénytörés nélküli, olcsóbb üveganyag (ha a gép nem bírja a teljeset). */
  simple: boolean;
  /** Ha meg van adva, a címke nem vált (a páros második üvege). */
  fixedLabel?: "classic";
}) {
  const { nodes } = useGLTF(MODEL, false, false) as unknown as {
    nodes: Record<string, THREE.Mesh>;
  };
  const materials = useBottleMaterials(simple);
  const group = useRef<THREE.Group>(null);
  const labelTop = useRef<THREE.Mesh>(null);
  const labelTopMaterial = useRef<THREE.MeshStandardMaterial>(null);

  useEffect(() => {
    if (group.current && labelTop.current && labelTopMaterial.current) {
      handle.current = {
        group: group.current,
        labelTop: labelTop.current,
        labelTopMaterial: labelTopMaterial.current,
      };
    }
  });

  useEffect(
    () => () => Object.values(materials).forEach((material) => material.dispose()),
    [materials],
  );

  const normalScale = useMemo(() => new THREE.Vector2(1.1, 1.1), []);
  const labelProps = {
    roughness: 0.9,
    normalMap: textures?.normal ?? null,
    normalScale,
    side: THREE.DoubleSide,
  };

  return (
    <group ref={group}>
      <mesh geometry={nodes.GlassShell.geometry} material={materials.glass} />
      <mesh geometry={nodes.Pipette.geometry} material={materials.pipette} />
      <mesh geometry={nodes.CapRing.geometry} material={materials.plastic} />
      <mesh geometry={nodes.CapCollar.geometry} material={materials.plastic} />
      <mesh geometry={nodes.Bulb.geometry} material={materials.rubber} />
      {/* Címke: alul a klasszikus, fölötte az áttűnő sleep */}
      <mesh geometry={nodes.Label.geometry}>
        <meshStandardMaterial
          key={textures ? "textured" : "plain"}
          color={textures ? "#ffffff" : "#ebe3d3"}
          map={textures?.classic ?? null}
          {...labelProps}
        />
      </mesh>
      <mesh ref={labelTop} geometry={nodes.Label.geometry} scale={[1.0012, 1, 1.0012]} visible={false}>
        <meshStandardMaterial
          ref={labelTopMaterial}
          key={textures ? "textured" : "plain"}
          color={textures ? "#ffffff" : "#1f3b30"}
          map={fixedLabel ? null : (textures?.sleep ?? null)}
          {...labelProps}
        />
      </mesh>
    </group>
  );
}

function setLabelMix(handle: BottleHandle | null, mix: number) {
  if (!handle) return;
  const { labelTop, labelTopMaterial } = handle;
  labelTop.visible = mix > 0.001;
  const fading = mix > 0.001 && mix < 0.999;
  if (labelTopMaterial.transparent !== fading) {
    labelTopMaterial.transparent = fading;
    labelTopMaterial.needsUpdate = true;
  }
  labelTopMaterial.opacity = mix;
}

/* ── A világ: kamera, háttér, fény – képkockánként a director szerint ────── */

function World({
  director,
  scenes,
  lite,
  simple,
  fontFamily,
  onReady,
}: Omit<SceneCanvasProps, "active" | "onLost"> & { simple: boolean }) {
  const { gl, scene, camera, size } = useThree();
  const loaded = useRef<Partial<Record<SceneId, Loaded>>>({});
  const mainBottle = useRef<BottleHandle | null>(null);
  const pairBottle = useRef<BottleHandle | null>(null);
  const keyLight = useRef<THREE.DirectionalLight>(null);
  const texturesRef = useRef<LabelTextures | null>(null);
  const [textures, setTextures] = useState<LabelTextures | null>(null);
  const announced = useRef(false);
  const envScene = useRef<SceneId | null>(null);

  const smooth = useRef<{
    zoom: number;
    focus: THREE.Vector3;
    anchor: THREE.Vector2;
    yaw: number;
    orbit: THREE.Vector2;
    label: number;
    pair: number;
    follow: number;
    blend: number;
    ready: boolean;
  }>({
    zoom: 1,
    focus: new THREE.Vector3(),
    anchor: new THREE.Vector2(0.5, 0.5),
    yaw: 0,
    orbit: new THREE.Vector2(),
    label: 0,
    pair: 0,
    follow: 0,
    blend: 0,
    ready: false,
  });
  const pivot = useMemo(() => new THREE.Vector3(), []);

  const backdrop = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: backdropVertex,
        fragmentShader: backdropFragment,
        uniforms: {
          tA: { value: null },
          tB: { value: null },
          uMix: { value: 0 },
          uRect: { value: new THREE.Vector4(0, 0, 1, 1) },
          uFallbackA: { value: new THREE.Color() },
          uFallbackB: { value: new THREE.Color() },
          uHasA: { value: 0 },
          uHasB: { value: 0 },
        },
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );

  // A kamerát mi vezéreljük: négyzetes látómező, a képernyőre vágva.
  const base = useMemo(() => {
    const position = new THREE.Vector3(...CAMERA.position);
    const helper = new THREE.PerspectiveCamera(CAMERA.fov, 1, 0.02, 20);
    helper.position.copy(position);
    helper.lookAt(new THREE.Vector3(...CAMERA.target));
    helper.updateMatrixWorld();
    helper.matrixWorldInverse.copy(helper.matrixWorld).invert();
    helper.updateProjectionMatrix();
    return { position, quaternion: helper.quaternion.clone(), helper };
  }, []);

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera & { manual?: boolean };
    cam.manual = true;
    cam.fov = CAMERA.fov;
    cam.aspect = 1;
    cam.near = 0.02;
    cam.far = 20;
  }, [camera]);

  // Hátterek és panorámák betöltése – az első jelenet után a többi a háttérben.
  useEffect(() => {
    let alive = true;
    const pmrem = new THREE.PMREMGenerator(gl);
    const textureLoader = new THREE.TextureLoader();
    const envLoader = new EXRLoader().setDataType(THREE.FloatType);
    const created: THREE.Texture[] = [];

    const load = async (id: SceneId) => {
      const def = SCENES[id];
      const entry: Loaded = (loaded.current[id] ??= {});
      const plate = textureLoader.loadAsync(asset(def.plate)).then((texture) => {
        if (!alive) return texture.dispose();
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        created.push(texture);
        entry.plate = texture;
      });
      const env = envLoader.loadAsync(asset(def.env)).then((hdr) => {
        if (!alive) return hdr.dispose();
        // A napkorong és a lámpa nyers fényereje szikrázást okozna: felülről vágjuk.
        const data = hdr.image.data as Float32Array;
        for (let i = 0; i < data.length; i++) if (data[i] > 60) data[i] = 60;
        hdr.mapping = THREE.EquirectangularReflectionMapping;
        hdr.needsUpdate = true;
        const target = pmrem.fromEquirectangular(hdr);
        hdr.dispose();
        created.push(target.texture);
        entry.env = target.texture;
      });
      await Promise.all([plate, env]).catch((error) => console.warn("Jelenet betöltése sikertelen:", id, error));
    };

    (async () => {
      for (const id of scenes) {
        if (!alive) break;
        await load(id);
      }
      pmrem.dispose();
    })();

    createLabelTextures(fontFamily, lite ? 2048 : 4096).then((set) => {
      if (!alive) return set.dispose();
      texturesRef.current = set;
      setTextures(set);
    });

    return () => {
      alive = false;
      created.forEach((texture) => texture.dispose());
      texturesRef.current?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, fontFamily, lite, scenes.join(",")]);

  const scratch = useMemo(
    () => ({
      projected: new THREE.Vector3(),
      rotation: new THREE.Quaternion(),
      tilt: new THREE.Quaternion(),
      right: new THREE.Vector3(),
      offset: new THREE.Vector3(),
      up: new THREE.Vector3(0, 1, 0),
      colorA: new THREE.Color(),
      colorB: new THREE.Color(),
    }),
    [],
  );

  useFrame((state, rawDelta) => {
    const direct = director.current;
    if (!direct) return;
    const delta = Math.min(rawDelta, 0.05);
    const shot = direct(state.clock.elapsedTime, delta, size);
    const s = smooth.current;

    // ── Simítás (az első képkockán azonnal a helyére ugrik). Ha a görgetést
    // már a Lenis simítja, a kamera szorosabban követ – különben a két késés
    // összeadódna, és a kép „úszna” a görgetés után.
    const k = s.ready ? (scrollIsSmoothed() ? 1.9 : 1) : 1e6;
    s.zoom = Math.exp(damp(Math.log(s.zoom), Math.log(shot.zoom), 4.2 * k, delta));
    s.pair = damp(s.pair, shot.pair, 9 * k, delta);
    s.follow = damp(s.follow, shot.followMain ? 1 : 0, 4.2 * k, delta);
    s.focus.x = damp(s.focus.x, shot.focus[0], 4.2 * k, delta);
    s.focus.y = damp(s.focus.y, shot.focus[1], 4.2 * k, delta);
    s.focus.z = damp(s.focus.z, shot.focus[2], 4.2 * k, delta);
    s.anchor.x = damp(s.anchor.x, shot.anchor[0], 4.2 * k, delta);
    s.anchor.y = damp(s.anchor.y, shot.anchor[1], 4.2 * k, delta);
    s.yaw = damp(s.yaw, shot.yaw, 5 * k, delta);
    s.orbit.x = damp(s.orbit.x, shot.orbit[0], 3.6 * k, delta);
    s.orbit.y = damp(s.orbit.y, shot.orbit[1], 3.6 * k, delta);
    s.label = damp(s.label, shot.label, 3.2 * k, delta);
    s.blend = damp(s.blend, shot.blend, 6 * k, delta);
    s.ready = true;

    // ── Kamera: a fókuszpont körül kitér (közelin), majd a kép eltolása teszi
    // a fókuszt a képernyő kívánt pontjára.
    const cam = camera as THREE.PerspectiveCamera;
    scratch.rotation.setFromAxisAngle(scratch.up, s.orbit.x);
    scratch.right.set(1, 0, 0).applyQuaternion(base.quaternion).applyQuaternion(scratch.rotation);
    scratch.tilt.setFromAxisAngle(scratch.right, -s.orbit.y);
    scratch.rotation.premultiply(scratch.tilt);
    // A fókusz a fő üveggel tarthat, amikor az a páros helyére csúszik.
    pivot.copy(s.focus);
    pivot.x += s.follow * s.pair * PAIR_OFFSET;
    scratch.offset.copy(base.position).sub(pivot).applyQuaternion(scratch.rotation);
    cam.position.copy(pivot).add(scratch.offset);
    cam.quaternion.copy(base.quaternion).premultiply(scratch.rotation);

    // A fókusz helye a négyzetes képen (az alapkamera szerint, 0..1, y felülről)
    scratch.projected.copy(pivot).project(base.helper);
    const u = scratch.projected.x * 0.5 + 0.5;
    const v = 1 - (scratch.projected.y * 0.5 + 0.5);

    const side = Math.max(size.width, size.height) * s.zoom;
    const x0 = THREE.MathUtils.clamp(u * side - s.anchor.x * size.width, 0, Math.max(0, side - size.width));
    const y0 = THREE.MathUtils.clamp(v * side - s.anchor.y * size.height, 0, Math.max(0, side - size.height));
    cam.aspect = 1;
    cam.setViewOffset(side, side, x0, y0, size.width, size.height);
    backdrop.uniforms.uRect.value.set(x0 / side, y0 / side, size.width / side, size.height / side);

    // ── Háttér és fény: a két jelenet közti áttűnés
    const a = loaded.current[shot.scene];
    const b = loaded.current[shot.nextScene];
    const uniforms = backdrop.uniforms;
    uniforms.tA.value = a?.plate ?? null;
    uniforms.tB.value = b?.plate ?? null;
    uniforms.uHasA.value = a?.plate ? 1 : 0;
    uniforms.uHasB.value = b?.plate ? 1 : 0;
    uniforms.uFallbackA.value.copy(FALLBACK[shot.scene]);
    uniforms.uFallbackB.value.copy(FALLBACK[shot.nextScene]);
    uniforms.uMix.value = s.blend;

    const dominant = s.blend < 0.5 ? shot.scene : shot.nextScene;
    const env = loaded.current[dominant]?.env;
    if (env && envScene.current !== dominant) {
      scene.environment = env;
      envScene.current = dominant;
    }
    // Váltáskor a környezeti fény rövid időre visszahúzódik: ez takarja a cserét.
    const dip = 1 - 0.65 * Math.sin(Math.PI * THREE.MathUtils.clamp(s.blend, 0, 1));
    scene.environmentIntensity = SCENES[dominant].envIntensity * dip * (env ? 1 : 0);

    const keyA = SCENES[shot.scene].key;
    const keyB = SCENES[shot.nextScene].key;
    if (keyLight.current) {
      keyLight.current.position.set(
        lerp(keyA.position[0], keyB.position[0], s.blend),
        lerp(keyA.position[1], keyB.position[1], s.blend),
        lerp(keyA.position[2], keyB.position[2], s.blend),
      );
      keyLight.current.color.lerpColors(scratch.colorA.set(keyA.color), scratch.colorB.set(keyB.color), s.blend);
      keyLight.current.intensity = lerp(keyA.intensity, keyB.intensity, s.blend) * dip;
    }
    gl.toneMappingExposure = lerp(SCENES[shot.scene].exposure, SCENES[shot.nextScene].exposure, s.blend);

    // ── Üveg(ek)
    const main = mainBottle.current;
    if (main) {
      main.group.rotation.y = s.yaw;
      main.group.position.x = s.pair * PAIR_OFFSET;
      setLabelMix(main, s.label);
    }
    const second = pairBottle.current;
    if (second) {
      second.group.visible = s.pair > 0.01;
      second.group.position.x = lerp(-0.34, -PAIR_OFFSET, THREE.MathUtils.smoothstep(s.pair, 0, 1));
      // A második üveg a címkéjével előre érkezik meg (a fő üveg teljes fordulatai nélkül).
      const turn = Math.PI * 2;
      const facing = ((((s.yaw + Math.PI) % turn) + turn) % turn) - Math.PI;
      second.group.rotation.y = facing * 0.6 + (1 - s.pair) * -1.4;
      setLabelMix(second, 0);
    }

    if (!announced.current && a?.plate && a?.env && texturesRef.current && main) {
      announced.current = true;
      onReady();
    }
  });

  return (
    <>
      <mesh renderOrder={-1000} frustumCulled={false} material={backdrop}>
        <planeGeometry args={[2, 2]} />
      </mesh>
      <directionalLight ref={keyLight} />
      <Bottle handle={mainBottle} textures={textures} simple={simple} />
      <Bottle handle={pairBottle} textures={textures} simple={simple} fixedLabel="classic" />
    </>
  );
}

export default function SceneCanvas({ active, lite, onLost, ...world }: SceneCanvasProps) {
  // Ha a képkockasebesség tartósan alacsony, egyszerűbb üvegre és kisebb
  // felbontásra váltunk – a gördülékenység fontosabb a fénytörésnél.
  const [degraded, setDegraded] = useState(false);
  return (
    <Canvas
      dpr={degraded ? 1 : lite ? [1, 1.5] : [1, 1.75]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.AgXToneMapping;
        gl.toneMappingExposure = 1.0;
        gl.domElement.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
          onLost();
        });
      }}
    >
      <PerformanceMonitor bounds={() => [28, 60]} flipflops={2} onDecline={() => setDegraded(true)} />
      <World lite={lite} simple={degraded} {...world} />
    </Canvas>
  );
}

useGLTF.preload(MODEL, false, false);
