/** Osztálynevek összefűzése, a hamis értékek kihagyásával. */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
