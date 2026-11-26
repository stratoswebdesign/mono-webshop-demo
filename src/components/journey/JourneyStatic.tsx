import { asset } from "@/lib/asset";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { journeyChapters } from "@/data/journey";
import { getProduct } from "@/lib/commerce/catalog";
import { formatPrice } from "@/lib/commerce/format";

/**
 * Az utazás álló változata: ugyanazok a fejezetek a Blenderben renderelt
 * képekkel. Ez jelenik meg csökkentett mozgásnál és WebGL nélkül.
 */
export function JourneyStatic() {
  return (
    <section aria-label="mono – termékutazás">
      {journeyChapters.map((chapter, index) => {
        const product = getProduct(chapter.product);
        const Heading = index === 0 ? "h1" : "h2";
        return (
          <div key={chapter.id} data-tone={chapter.tone} className="relative flex min-h-svh items-end bg-bg text-fg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset(chapter.image)}
              alt={chapter.imageAlt}
              loading={index === 0 ? "eager" : "lazy"}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="wrap relative pb-16 pt-40">
              <div className="on-image max-w-[21rem]">
                <p className="label">{chapter.label}</p>
                <Heading className="statement-lg mt-3 whitespace-pre-line lowercase">{chapter.statement}</Heading>
                {chapter.text && <p className="copy mt-4 opacity-80">{chapter.text}</p>}
                {(index === 0 || index >= 4) && (
                  <div className="mt-6 flex items-center gap-5">
                    <AddToCartButton productId={product.id} />
                    <span className="tabular-nums">{formatPrice(product.price)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
