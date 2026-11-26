import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/products";
import { asset } from "@/lib/asset";
import { bundleListPrice, productHref } from "@/lib/commerce/catalog";
import { formatPrice } from "@/lib/commerce/format";
import { cn } from "@/lib/cn";
import { AddToCartButton } from "./AddToCartButton";

/**
 * Termékcsempe: nagy kép, rajta apró felirat és ár. A kép hangulata adja a
 * szöveg színét (esti képen világos, nappalin sötét).
 */
export function ProductTile({
  product,
  image,
  className,
  sizes,
  priority,
}: {
  product: Product;
  /** Eltérő kép a kártyaképtől (pl. széles csempéhez). */
  image?: { src: string; alt: string };
  className?: string;
  sizes: string;
  priority?: boolean;
}) {
  const href = productHref(product);
  const picture = image ?? product.cardImage;
  const tone = product.kind === "single" ? product.tone : "day";
  const compareAt = product.kind === "bundle" ? bundleListPrice(product) : null;

  return (
    <article data-tone={tone} className={cn("group relative overflow-hidden bg-bg text-fg", className)}>
      <Link href={href} aria-label={product.name} className="absolute inset-0">
        <Image
          src={asset(picture.src)}
          alt={picture.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-[2400ms] ease-[var(--ease-quiet)] group-hover:scale-[1.025]"
        />
      </Link>
      <div className="on-image pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-5 md:p-8">
        <div>
          <p className="label">
            {product.kind === "bundle" ? "2 × 30 ml" : `${product.routine.label} · ${product.volume}`}
          </p>
          <h2 className="title mt-2">{product.name}</h2>
        </div>
        <div className="pointer-events-auto flex shrink-0 flex-col items-end gap-3">
          <p className="tabular-nums">
            {compareAt !== null && compareAt > product.price && (
              <s className="mr-2 text-[0.8125rem] opacity-60">
                <span className="sr-only">Külön vásárolva: </span>
                {formatPrice(compareAt)}
              </s>
            )}
            {formatPrice(product.price)}
          </p>
          <AddToCartButton productId={product.id} className="min-h-10 px-5" />
        </div>
      </div>
    </article>
  );
}
