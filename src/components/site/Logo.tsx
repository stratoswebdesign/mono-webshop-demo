import { cn } from "@/lib/cn";

/** A mono szóvédjegy: a záró „o” jobb felső ívén a csomagolásról ismert bevágással. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("logo", className)}>
      mon<span className="logo-o">o</span>
    </span>
  );
}
