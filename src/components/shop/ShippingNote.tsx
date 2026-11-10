import { shopConfig } from "@/data/shop-config";
import { formatPrice } from "@/lib/commerce/format";

/** Szállítási díj és ingyenes küszöb – a központi demóbeállításból. */
export function ShippingNote({ className }: { className?: string }) {
  const { fee, freeThreshold, label } = shopConfig.shipping;
  return (
    <p className={className}>
      {label}: {formatPrice(fee)}
      {freeThreshold !== null && <>, {formatPrice(freeThreshold)} felett ingyenes</>}. Demóérték.
    </p>
  );
}
