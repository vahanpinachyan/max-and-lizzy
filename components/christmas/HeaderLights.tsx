"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A string of small lights hanging from the bottom edge of the header.
 *
 * Decoration only: unlike the scrollbar string it tracks nothing and does
 * nothing, it just hangs there and twinkles. It borrows that string's CSS
 * (`.ml-bulb` and friends in globals.css) so the two read as the same set of
 * lights, with every bulb permanently lit.
 *
 * Shown only where the scrollbar's own horizontal string is hidden, so a
 * phone never ends up with two light strings stacked across its top.
 */

const BULB_COLORS = ["#c33a33", "#2f7350", "#c9a24a", "#3f6fa8", "#c47d99"] as const;

/** Roughly how far apart the bulbs hang. The real spacing divides evenly. */
const PITCH = 54;
/**
 * Tall enough that a lit bulb's glow finishes inside the SVG. A bulb reaches
 * about (11 + 6) × the scale below past its anchor, and an SVG clips to its
 * own box, so too short a box slices the bulbs in half.
 */
const HEIGHT = 34;
const BULB_SCALE = 0.68;

function hash(i: number, salt: number) {
  const x = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function HeaderLights() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // The header is as wide as the window, but measuring the element rather
    // than the window keeps the garland right if it is ever placed inside
    // something narrower.
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.round(entry.contentRect.width));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const count = width > 0 ? Math.max(6, Math.round(width / PITCH)) : 0;
  const gap = count > 0 ? width / count : 0;

  // The wire sags between its fixings and the bulbs hang from the low points,
  // which is what separates a garland from a dotted line.
  const anchors = Array.from({ length: count }, (_, i) => ({
    x: gap * (i + 0.5),
    y: 11,
  }));
  const wire =
    count > 0
      ? `M 0 2` +
        anchors
          .map((a) => ` Q ${(a.x - gap * 0.25).toFixed(1)} ${a.y} ${a.x.toFixed(1)} ${a.y}`)
          .join("") +
        ` Q ${(width - gap * 0.25).toFixed(1)} 2 ${width} 2`
      : "";

  return (
    <div ref={ref} className="christmas-header-lights" aria-hidden="true">
      {count > 0 && (
        <svg width={width} height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} fill="none">
          <path className="ml-wire" d={wire} />
          {anchors.map((a, i) => (
            <g key={i} transform={`translate(${a.x.toFixed(1)} ${a.y}) scale(${BULB_SCALE})`}>
              <g
                className="ml-bulb is-lit"
                transform={`rotate(${((hash(i, 3) - 0.5) * 18).toFixed(1)})`}
                style={
                  {
                    "--ml-bulb": BULB_COLORS[i % BULB_COLORS.length],
                    "--ml-twinkle-delay": `${(hash(i, 1) * 4).toFixed(2)}s`,
                    "--ml-twinkle-dur": `${(3 + hash(i, 2) * 3.5).toFixed(2)}s`,
                  } as React.CSSProperties
                }
              >
                <circle className="ml-glow" cx="0" cy="7" r="11" fill={BULB_COLORS[i % BULB_COLORS.length]} />
                <path className="ml-collar" d="M-2.6 -3.2h5.2a1 1 0 0 1 1 1v3.4h-7.2v-3.4a1 1 0 0 1 1-1z" />
                <path
                  className="ml-glass"
                  d="M-4.1 0a4.1 4.1 0 0 1 8.2 0c0 4.4-.5 7.9-4.1 11.4C.4 7.9-4.1 4.4-4.1 0z"
                />
                <ellipse className="ml-shine" cx="-1.5" cy="2.4" rx="1.1" ry="2.1" />
              </g>
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}
