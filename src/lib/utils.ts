/**
 * Format a date as a relative time string (pt-BR)
 * e.g. "há 3 minutos", "há 2 horas", "há 1 dia"
 */
export function relativeTime(date: Date | string): string {
  const d   = typeof date === "string" ? new Date(date) : date;
  const now = Date.now();
  const diff = now - d.getTime(); // ms

  const secs  = Math.floor(diff / 1_000);
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);

  const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

  if (secs  <  60)  return "agora";
  if (mins  <  60)  return rtf.format(-mins,  "minute");
  if (hours <  24)  return rtf.format(-hours, "hour");
  if (days  <  30)  return rtf.format(-days,  "day");
  return d.toLocaleDateString("pt-BR");
}

/**
 * Format a number as BRL currency
 */
export function brl(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Truncate a string to maxLen characters + ellipsis
 */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + "…";
}

/**
 * Debounce a function (returns a cleanup fn)
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
