/**
 * Katalógus-hozzáférés. A felület csak ezeken a függvényeken keresztül éri el
 * a termékeket – WooCommerce-átálláskor ezek belseje cserélendő.
 */
import {
  productOrder,
  products,
  type BundleProduct,
  type Product,
  type ProductId,
  type SingleProduct,
  type Variant,
} from "@/data/products";

export function getProduct(id: ProductId): Product {
  return products[id];
}

export function getSingle(id: Variant): SingleProduct {
  return products[id] as SingleProduct;
}

export function getBundle(): BundleProduct {
  return products.bundle as BundleProduct;
}

export function listProducts(): Product[] {
  return productOrder.map((id) => products[id]);
}

export function listSingles(): SingleProduct[] {
  return listProducts().filter((p): p is SingleProduct => p.kind === "single");
}

export function getSingleBySlug(slug: string): SingleProduct | undefined {
  return listSingles().find((p) => p.slug === slug);
}

export function isProductId(value: unknown): value is ProductId {
  return typeof value === "string" && value in products;
}

export function productHref(product: Product): string {
  return product.kind === "bundle" ? "/paros-csomag" : `/termekek/${product.slug}`;
}

/** A csomag tartalmának külön megvásárolt ára. */
export function bundleListPrice(bundle: BundleProduct = getBundle()): number {
  return bundle.contains.reduce((sum, id) => sum + products[id].price, 0);
}

/** Megtakarítás a csomaggal a külön vásárláshoz képest. */
export function bundleSaving(bundle: BundleProduct = getBundle()): number {
  return Math.max(0, bundleListPrice(bundle) - bundle.price);
}
