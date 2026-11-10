"use client";

import { useState } from "react";
import Image from "next/image";
import type { SingleProduct } from "@/data/products";
import { BottleIllustration } from "@/components/three/BottleIllustration";
import { ProductStage } from "@/components/three/ProductStage";
import { cn } from "@/lib/cn";

/** Termékgaléria: forgatható 3D nézet és környezeti fotók között vált. */
export function ProductGallery({ product }: { product: SingleProduct }) {
  // -1 = 3D nézet, egyébként a fotó sorszáma
  const [selected, setSelected] = useState(-1);
  const photo = selected >= 0 ? product.gallery[selected] : null;

  const thumb = (active: boolean) =>
    cn(
      "relative h-20 w-16 shrink-0 overflow-hidden transition-opacity sm:h-24 sm:w-[4.75rem]",
      active ? "outline outline-1 outline-offset-2 outline-fg" : "opacity-70 hover:opacity-100",
    );

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden lg:aspect-auto lg:h-[calc(100svh-9rem)] lg:max-h-[52rem] lg:min-h-[34rem]">
        {/* A 3D színpad rejtve is betöltve marad, így visszaváltáskor azonnal ott van. */}
        <ProductStage
          variant={product.id}
          scrollLinked
          paused={photo !== null}
          className={cn("absolute inset-0", photo && "invisible")}
        />
        {photo && (
          <Image
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(min-width: 1024px) 56vw, 100vw"
            className="rise object-cover"
          />
        )}
      </div>

      <div role="group" aria-label="Nézetek" className="mt-4 flex gap-3 overflow-x-auto p-1">
        <button
          type="button"
          onClick={() => setSelected(-1)}
          aria-pressed={selected === -1}
          aria-label="Forgatható 3D nézet"
          className={cn(thumb(selected === -1), "stage")}
        >
          <BottleIllustration variant={product.id} className="absolute inset-x-0 bottom-[10%] mx-auto h-[72%]" />
          <span className="absolute left-1 top-1 bg-bg px-1 text-[0.625rem] font-medium tracking-wide text-fg">
            3D
          </span>
        </button>
        {product.gallery.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => setSelected(index)}
            aria-pressed={selected === index}
            aria-label={`Fotó: ${image.alt}`}
            className={thumb(selected === index)}
          >
            <Image src={image.src} alt="" fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
