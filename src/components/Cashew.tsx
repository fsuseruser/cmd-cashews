export const CASHEW_PATH =
  "M -4,-34 C 18,-36 34,-20 32,2 C 30,22 16,36 -2,36 C -14,36 -20,28 -14,22 C -6,18 8,14 8,0 C 8,-12 -2,-16 -12,-14 C -22,-12 -24,-30 -4,-34 Z";

export function CashewIcon({ size = 22, color = "currentColor", stroke = false }: { size?: number; color?: string; stroke?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="-40 -40 80 80" aria-hidden="true">
      <path
        d={CASHEW_PATH}
        transform="rotate(-25)"
        fill={stroke ? "none" : color}
        stroke={stroke ? color : "none"}
        strokeWidth={stroke ? 3 : 0}
        strokeLinejoin="round"
      />
    </svg>
  );
}
