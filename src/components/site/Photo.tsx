import Image from "next/image";
import type { ProductImage } from "@/data/products";
import { cn } from "@/lib/cn";

/** Kivágott fotó: a keret adja az arányt, a `focus` a kivágás súlypontját. */
export function Photo({
  image,
  sizes,
  className,
  focus = "50% 50%",
  priority = false,
}: {
  image: ProductImage;
  sizes: string;
  /** A keret osztályai – arány vagy magasság megadásával. */
  className?: string;
  focus?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-surface", className)}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
        style={{ objectPosition: focus }}
      />
    </div>
  );
}
