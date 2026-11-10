import Link from "next/link";
import type { Product } from "@/data/products";
import { bundleListPrice, productHref } from "@/lib/commerce/catalog";
import { Photo } from "@/components/site/Photo";
import { AddToCartButton } from "./AddToCartButton";
import { Price } from "./Price";

export function ProductCard({
  product,
  aspect,
  sizes,
  priority,
}: {
  product: Product;
  /** A kép keretének arányosztálya. */
  aspect: string;
  sizes: string;
  priority?: boolean;
}) {
  const href = productHref(product);
  return (
    <article>
      <Link href={href} tabIndex={-1} aria-hidden="true" className="block">
        <Photo
          image={product.cardImage}
          focus={product.cardFocus}
          sizes={sizes}
          className={aspect}
          priority={priority}
        />
      </Link>
      <div className="mt-5 flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
        <div className="max-w-md">
          <p className="eyebrow">
            {product.kind === "bundle" ? "2 × 30 ml" : `${product.shortName} · ${product.volume}`}
          </p>
          <h2 className="display-md mt-1.5">
            <Link href={href}>{product.name}</Link>
          </h2>
          <p className="prose-serif mt-2 text-muted">{product.summary}</p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <Price
            amount={product.price}
            compareAt={product.kind === "bundle" ? bundleListPrice(product) : undefined}
            className="text-[1.375rem]"
          />
          <AddToCartButton productId={product.id} />
        </div>
      </div>
    </article>
  );
}
