"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  /** The final value to count up to (string, displayed as-is after animation) */
  value: string;
  /** Duration in ms (default 800) */
  duration?: number;
}

/**
 * Animates from 0 to a numeric value on mount.
 * For non-numeric strings, just displays the value with a fade-in.
 */
export default function CountUp({ value, duration = 800 }: Props) {
  const [display, setDisplay] = useState("0");
  const rafRef  = useRef<number | null>(null);

  useEffect(() => {
    // Extract a numeric portion if the value starts with a number
    const numeric = parseFloat(value.replace(/[^0-9.,]/g, "").replace(",", "."));
    if (isNaN(numeric)) { setDisplay(value); return; }

    const prefix  = value.match(/^[^0-9]*/)?.[0] ?? "";
    const suffix  = value.match(/[^0-9.]+$/)?.[0] ?? "";
    const start   = performance.now();

    function tick(now: number) {
      const elapsed = Math.min(1, (now - start) / duration);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - elapsed, 3);
      const current = numeric * eased;

      // Format similar to the original
      let formatted: string;
      if (value.includes(",") || value.includes(".")) {
        formatted = current.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      } else {
        formatted = Math.round(current).toString();
      }
      setDisplay(`${prefix}${formatted}${suffix}`);

      if (elapsed < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value, duration]);

  return <span>{display}</span>;
}
