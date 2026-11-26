"use client";

/**
 * A főoldali termékutazás: az üveg a helyén áll, a nap telik el körülötte.
 * A görgetés viszi a kamerát a reggeli kőpulttól a részleteken át az esti
 * éjjeliszekrényig, a végén megérkezik a páros.
 *
 * Csökkentett mozgásnál és WebGL nélkül ugyanez a történet álló, renderelt
 * képekkel jelenik meg (JourneyStatic).
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { useShell } from "@/components/site/SiteShell";
import type { Director } from "@/components/scene/SceneCanvas";
import { SceneStage, type StageStatus } from "@/components/scene/SceneStage";
import { journeyShot, type StageLayout } from "@/components/scene/journey-director";
import { SCENES, type SceneId } from "@/components/scene/scene-config";
import { chapterAt, journeyChapters } from "@/data/journey";
import { asset } from "@/lib/asset";
import { bundleListPrice, bundleSaving, getBundle, getSingle, productHref } from "@/lib/commerce/catalog";
import { formatPrice } from "@/lib/commerce/format";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { BuyBar } from "./BuyBar";
import { JourneyStatic } from "./JourneyStatic";

const SCENE_ORDER: SceneId[] = ["reggel", "este", "paros"];

export function Journey() {
  const { setHomeTone } = useShell();
  const reducedMotion = useReducedMotion();
  const track = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const layout = useRef<StageLayout>({ zoom: 1, ax: 0.5, ay: 0.52, portrait: false });
  const director = useRef<Director | null>(null);
  const [chapter, setChapter] = useState(0);
  const [status, setStatus] = useState<StageStatus>("poster");
  const [inView, setInView] = useState(true);

  const staticMode = reducedMotion || status === "failed";

  useEffect(() => {
    director.current = (elapsed) => journeyShot(progress.current, layout.current, elapsed);
  }, []);

  useEffect(() => {
    if (staticMode) {
      setHomeTone("day");
      return;
    }
    const element = track.current;
    if (!element) return;
    const onScroll = () => {
      const rect = element.getBoundingClientRect();
      const distance = rect.height - window.innerHeight;
      const p = distance > 0 ? Math.min(1, Math.max(0, -rect.top / distance)) : 0;
      progress.current = p;
      setChapter(chapterAt(p));
      // A vásárlósáv addig marad, amíg a színpad kitölti a képernyőt.
      setInView(rect.bottom > window.innerHeight * 0.75);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [staticMode, setHomeTone]);

  const current = journeyChapters[chapter];

  useEffect(() => {
    if (!staticMode) setHomeTone(current.tone);
    return () => setHomeTone("day");
  }, [current.tone, staticMode, setHomeTone]);

  if (staticMode) return <JourneyStatic />;

  const bundle = getBundle();
  const last = chapter === journeyChapters.length - 1;

  return (
    <section aria-label="mono – termékutazás" data-tone={current.tone}>
      <div ref={track} className="relative h-[760svh]">
        <SceneStage
          director={director}
          layout={layout}
          scenes={SCENE_ORDER}
          poster={SCENES.reggel.still}
          posterAlt={journeyChapters[0].imageAlt}
          onStatus={setStatus}
          className="stage-journey sticky top-0 h-svh w-full"
        >
          {/* Amíg a 3D töltődik, a fejezet renderelt képe áll a helyén */}
          {status !== "live" && chapter > 0 && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={current.id}
              src={asset(current.image)}
              alt=""
              className="fade absolute inset-0 h-full w-full object-cover"
            />
          )}

          {/* Álló kijelzőn a szöveg a termék elé kerül: halvány átmenet tartja olvashatónak */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-[color-mix(in_srgb,var(--bg)_88%,transparent)] via-[color-mix(in_srgb,var(--bg)_48%,transparent)] to-transparent lg:hidden"
          />

          {/* Fejezetszövegek: apró képaláírás a bal alsó sarokban */}
          <div className="wrap pointer-events-none absolute inset-0 flex items-end pb-24 text-fg transition-colors duration-1000 sm:pb-28 lg:pb-16">
            <div className="relative w-full max-w-[21rem]">
              {journeyChapters.map((item, index) => {
                const active = index === chapter;
                const Heading = index === 0 ? "h1" : "h2";
                return (
                  <div
                    key={item.id}
                    aria-hidden={!active}
                    className={cn(
                      "on-image bottom-0 left-0 w-full transition-[opacity,transform] duration-[900ms] ease-[var(--ease-quiet)]",
                      index === 0 ? "relative" : "absolute",
                      active ? "opacity-100 delay-200" : "translate-y-2 opacity-0",
                    )}
                  >
                    <p className="label">{item.label}</p>
                    <Heading className="statement-lg mt-3 whitespace-pre-line lowercase">{item.statement}</Heading>
                    {item.text && <p className="copy mt-4 max-w-[19rem] opacity-80">{item.text}</p>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fejezetjelző a jobb szélen */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-5 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-3 text-fg transition-colors duration-1000 md:right-10 lg:flex xl:right-14"
          >
            {journeyChapters.map((item, index) => (
              <span key={item.id} className="flex items-center gap-3">
                <span
                  className={cn(
                    "label text-[0.5625rem] transition-opacity duration-700",
                    index === chapter ? "opacity-100" : "opacity-0",
                  )}
                >
                  {item.label.split(" · ")[0]}
                </span>
                <span
                  className={cn(
                    "h-px bg-current transition-all duration-700",
                    index === chapter ? "w-8 opacity-100" : "w-3 opacity-35",
                  )}
                />
              </span>
            ))}
          </div>

          {/* Görgetésre hívó jel a nyitón */}
          <p
            aria-hidden="true"
            className={cn(
              "label pointer-events-none absolute bottom-6 right-5 text-[0.5625rem] text-fg transition-opacity duration-700 md:right-10 xl:right-14",
              chapter === 0 ? "opacity-70" : "opacity-0",
            )}
          >
            Görgess
          </p>

          {/* Záró fejezet: a páros ajánlata */}
          <div
            aria-hidden={!last}
            inert={!last}
            className={cn(
              "wrap pointer-events-none absolute inset-x-0 bottom-24 flex justify-end text-fg transition-[opacity,transform] duration-[900ms] ease-[var(--ease-quiet)] sm:bottom-28 lg:bottom-16",
              last ? "opacity-100 delay-300" : "translate-y-2 opacity-0",
            )}
          >
            <div className={cn("hidden w-full max-w-[17rem] lg:block", last && "pointer-events-auto")}>
              <p className="text-[1.375rem] tabular-nums">
                {formatPrice(bundle.price)}
                <s className="ml-3 text-[0.8125rem] text-muted">{formatPrice(bundleListPrice(bundle))}</s>
              </p>
              <p className="copy mt-1 opacity-70">{formatPrice(bundleSaving(bundle))} megtakarítás</p>
              <div className="mt-5 flex flex-col gap-2">
                <AddToCartButton productId="bundle" label="Páros a kosárba" />
                <div className="flex gap-5 pt-2">
                  {(["classic", "sleep"] as const).map((id) => (
                    <Link key={id} href={productHref(getSingle(id))} className="label link-line">
                      {getSingle(id).shortName}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SceneStage>
      </div>

      <BuyBar productId={current.product} visible={inView} />
    </section>
  );
}
