"use client";

import Image from "next/image";
import { useState } from "react";
import { CASHEW_PATH } from "./Cashew";

type Props = {
  name: string;
  tone: { bg: string; ink: string };
  image?: string;
  sizes?: string;
  priority?: boolean;
};

function sized(src: string, sizes: string) {
  // Unsplash resizes on its own CDN, so we ask for a sensible width and skip double optimisation.
  if (!src.includes("images.unsplash.com")) return src;
  const w = sizes.trim().endsWith("px") && !sizes.includes(",") ? Math.min(400, parseInt(sizes) * 2) : 1200;
  return src.replace(/([?&])w=\d+/, `$1w=${w}`);
}

/**
 * Shows the product photo if one is set (falling back to an illustrated tile
 * if the photo can't load), otherwise the illustrated tile in the product's colours.
 */
export function ProductArt({ name, tone, image, sizes = "(max-width: 860px) 50vw, 25vw", priority }: Props) {
  const [failed, setFailed] = useState(false);

  if (image && !failed) {
    const unsplash = image.includes("images.unsplash.com");
    return (
      <Image
        src={unsplash ? sized(image, sizes) : image}
        alt={name}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={unsplash}
        onError={() => setFailed(true)}
        style={{ objectFit: "cover", background: tone.bg }}
      />
    );
  }

  const nuts = [
    { x: 0, y: -6, r: -25, s: 1.35, o: 1 },
    { x: -52, y: 40, r: 40, s: 0.85, o: 0.85 },
    { x: 56, y: 46, r: -70, s: 0.9, o: 0.85 },
    { x: -40, y: -66, r: 120, s: 0.6, o: 0.55 },
    { x: 50, y: -58, r: 200, s: 0.55, o: 0.5 },
  ];
  return (
    <svg viewBox="-150 -180 300 360" preserveAspectRatio="xMidYMid slice" role="img" aria-label={name}>
      <rect x="-150" y="-180" width="300" height="360" fill={tone.bg} />
      <circle cx="0" cy="0" r="118" fill="none" stroke={tone.ink} strokeOpacity="0.16" strokeWidth="1" />
      <circle cx="0" cy="0" r="98" fill="#fff" fillOpacity="0.28" />
      {nuts.map((n, i) => (
        <g key={i} transform={`translate(${n.x} ${n.y}) rotate(${n.r}) scale(${n.s})`} opacity={n.o}>
          <path d={CASHEW_PATH} fill={tone.ink} />
          <path d="M 18,-20 C 24,-6 20,14 4,24" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="2" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
}
