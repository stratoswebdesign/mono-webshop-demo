import { formatPrice } from "@/lib/commerce/format";
import { cn } from "@/lib/cn";

export function Price({
  amount,
  compareAt,
  className,
}: {
  amount: number;
  /** Áthúzott összehasonlító ár (pl. a csomag tartalma külön). */
  compareAt?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-baseline gap-3 tabular-nums", className)}>
      <span>{formatPrice(amount)}</span>
      {compareAt !== undefined && compareAt > amount && (
        <s className="text-[0.7em] text-muted">
          <span className="sr-only">Külön vásárolva: </span>
          {formatPrice(compareAt)}
        </s>
      )}
    </span>
  );
}
