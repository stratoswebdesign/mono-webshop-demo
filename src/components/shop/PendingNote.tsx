import { pendingContent, type PendingKey } from "@/data/pending";
import { cn } from "@/lib/cn";

/**
 * Véglegesítésre váró tartalom helye. Ha a központi adatban már van
 * jóváhagyott szöveg, azt mutatja; különben jól látható jelölést.
 */
export function PendingNote({ field, className }: { field: PendingKey; className?: string }) {
  const item = pendingContent[field];
  if (item.text !== null) {
    return <p className={cn("prose-serif", className)}>{item.text}</p>;
  }
  return (
    <div className={cn("border-l-2 border-notice py-1 pl-4", className)}>
      <p className="eyebrow !text-notice">Véglegesítésre vár</p>
      <p className="prose-serif mt-1.5 text-muted">{item.note}</p>
    </div>
  );
}
