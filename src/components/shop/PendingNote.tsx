import { pendingContent, type PendingKey } from "@/data/pending";
import { cn } from "@/lib/cn";

/**
 * Véglegesítésre váró tartalom helye. Ha a központi adatban már van
 * jóváhagyott szöveg, azt mutatja; különben jól látható jelölést.
 */
export function PendingNote({ field, className }: { field: PendingKey; className?: string }) {
  const item = pendingContent[field];
  if (item.text !== null) {
    return <p className={cn("copy", className)}>{item.text}</p>;
  }
  return (
    <div className={cn("border-l border-notice pl-4", className)}>
      <p className="label text-[0.625rem] text-notice">Véglegesítésre vár</p>
      <p className="copy mt-1 text-muted">{item.note}</p>
    </div>
  );
}
