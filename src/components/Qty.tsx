"use client";

import { MAX_QTY } from "@/lib/catalog";

export function Qty({
  value,
  onChange,
  small,
  label,
  min = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  small?: boolean;
  label?: string;
  min?: number;
}) {
  return (
    <div className={`qty${small ? " sm" : ""}`} role="group" aria-label={`Quantity${label ? ` for ${label}` : ""}`}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} aria-label="Decrease quantity">
        −
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={() => onChange(Math.min(MAX_QTY, value + 1))} aria-label="Increase quantity">
        +
      </button>
    </div>
  );
}
