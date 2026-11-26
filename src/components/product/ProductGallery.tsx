"use client";

import { useState } from "react";
import Image from "next/image";
import type { SingleProduct } from "@/data/products";
import { ProductViewer } from "@/components/scene/ProductViewer";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/cn";

/** Termékgaléria: forgatható 3D nézet és renderelt/fotózott képek között vált. */
export function ProductGallery({ product }: { product: SingleProduct }) {
  // -1 = 3D nézet, egyébként a kép sorszáma
  const [selected, setSelected] = useState(-1);
  const photo = selected >= 0 ? product.gallery[selected] : null;

  const thumb = (active: boolean) =>
    cn(
      "relative h-14 w-11 shrink-0 overflow-hidden transition-opacity duration-500",
      active ? "opacity-100 outline outline-1 outline-offset-[3px] outline-fg" : "opacity-55 hover:opacity-100",
    );

  return (
    <div className="relative h-[78svh] min-h-[30rem] lg:sticky lg:top-0 lg:h-svh">
      {/* A 3D színpad rejtve is betöltve marad, így visszaváltáskor azonnal ott van. */}
      <ProductViewer variant={product.id} className={cn("absolute inset-0", photo && "invisible")} />
      {photo && (
        <Image
          key={photo.src}
          src={asset(photo.src)}
          alt={photo.alt}
          fill
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="fade object-cover"
        />
      )}

      <div
        role="group"
        aria-label="Nézetek"
        className="absolute bottom-5 left-5 flex gap-3 md:left-10 lg:bottom-auto lg:left-auto lg:right-6 lg:top-1/2 lg:-translate-y-1/2 lg:flex-col"
      >
        <button
          type="button"
          onClick={() => setSelected(-1)}
          aria-pressed={selected === -1}
          aria-label="Forgatható 3D nézet"
          className={cn(thumb(selected === -1), "grid place-items-center bg-bg/70 backdrop-blur")}
        >
          <span className="label text-[0.5625rem]">3D</span>
        </button>
        {product.gallery.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => setSelected(index)}
            aria-pressed={selected === index}
            aria-label={`Kép: ${image.alt}`}
            className={thumb(selected === index)}
          >
            <Image src={asset(image.src)} alt="" fill sizes="44px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
