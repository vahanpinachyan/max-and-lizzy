"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A pine garland swagged along the bottom edge of the header.
 *
 * Deliberately *not* a second string of lights. The scrollbar down the right
 * edge is already a light string, and two of them in one viewport read as one
 * repeated effect rather than as a decorated shop. This is the thing the
 * reference board actually shows: a thick evergreen swag — layered fir sprigs,
 * pine cones, clusters of red berries — with a few small ornaments hanging
 * below it on short threads. The greenery is the decoration; the ornaments are
 * accents in it, not the point of it.
 *
 * Drawn rather than photographed, and drawn procedurally rather than as one
 * fixed path, so it fills any window width at any zoom without tiling or
 * stretching. Every needle is part of one stroked path per sprig, which keeps
 * it to a few dozen nodes instead of a few thousand.
 *
 * Decoration only: it tracks nothing, it is `aria-hidden`, and it never takes
 * a click.
 */

const PINE_DARK = "#1b4029";
const PINE = "#1f4a33";
const PINE_MID = "#2e6347";
const PINE_LIGHT = "#44795a";
const HOLLY = "#a3262a";
const HOLLY_DARK = "#7f1d21";
const GOLD = "#c9a24a";
const GOLD_DEEP = "#9c7a2f";
const SNOW = "#fffaf0";
const CONE = "#8a6a44";
const CONE_DARK = "#6b5234";
const THREAD = "#8a7355";

/** The hook and shaft of a candy cane, stroked three times over. */
const CANE = "M-3.2 3.2a3.2 3.2 0 0 1 6.4 0v11.6";

/** How far apart the clumps of foliage sit along the swag. */
const NODE_PITCH = 19;
/**
 * Tall enough for the longest sprig plus the longest hanging ornament. An SVG
 * clips to its own box, so too short a box slices the garland in half — the
 * same arithmetic that bit the light string.
 */
const HEIGHT = 70;
/** Where the swag's spine sits at its lowest, measured from the header edge. */
const SPINE_Y = 15;

function hash(i: number, salt: number) {
  const x = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * One fir sprig, drawn down the +y axis from the origin: a stem with needles
 * paired off it, shortening towards the tip. Returned as a single path so a
 * whole sprig costs one node.
 */
function sprigPath(len: number, needle: number) {
  let d = `M0 0L0 ${len.toFixed(1)}`;
  for (let y = 1.6; y < len - 0.5; y += 1.35) {
    const t = y / len;
    const nl = needle * (1 - t * 0.5);
    const dy = nl * 0.72;
    d += `M0 ${y.toFixed(1)}l${(-nl).toFixed(2)} ${dy.toFixed(2)}`;
    d += `M0 ${y.toFixed(1)}l${nl.toFixed(2)} ${dy.toFixed(2)}`;
  }
  return d;
}

function PineCone({ x, y, tilt }: { x: number; y: number; tilt: number }) {
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${tilt.toFixed(1)})`}>
      <ellipse cx="0" cy="0" rx="3" ry="4.6" fill={CONE} />
      <path
        d="M-2.5-2.4q2.5 1.7 5 0M-2.9-.5q2.9 1.8 5.8 0M-2.3 1.5q2.3 1.6 4.6 0"
        fill="none"
        stroke={CONE_DARK}
        strokeWidth="0.75"
        strokeLinecap="round"
      />
    </g>
  );
}

function Berries({ x, y, seed }: { x: number; y: number; seed: number }) {
  // One berry in roughly half the clusters is gold rather than red — the
  // warm fleck the reference garlands have, without adding a second string
  // of lights to a page that already has one.
  const accent = hash(seed, 13) > 0.5 ? GOLD : HOLLY;
  const dots = [
    [0, 0, 1.95, HOLLY],
    [2.7, 1.2, 1.7, HOLLY_DARK],
    [-2.4, 1.6, 1.75, HOLLY],
    [0.8, 3.4, 1.55, accent],
    [-0.4, -2.5, 1.45, HOLLY],
  ] as const;
  const flip = hash(seed, 11) > 0.5 ? -1 : 1;
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${flip} 1)`}>
      <path
        d="M0 0-1.6-3.4M2.5 1.1.4-2.6"
        fill="none"
        stroke={PINE_DARK}
        strokeWidth="0.6"
        strokeLinecap="round"
      />
      {dots.map(([dx, dy, r, fill], i) => (
        <circle key={i} cx={dx} cy={dy} r={r} fill={fill} />
      ))}
      <circle cx="-0.6" cy="-0.6" r="0.5" fill={SNOW} opacity="0.4" />
    </g>
  );
}

type Hanger = "bauble" | "star" | "heart" | "cane" | "creamBauble";

const HANGERS: Hanger[] = ["star", "bauble", "heart", "creamBauble", "cane", "bauble", "star", "heart"];

function Ornament({ kind, seed }: { kind: Hanger; seed: number }) {
  switch (kind) {
    case "star":
      return (
        <>
          <path
            d="M0 0 1.7 4.25 6.28 4.56 2.76 7.5 3.88 11.94 0 9.5 -3.88 11.94 -2.76 7.5 -6.28 4.56 -1.7 4.25Z"
            fill={GOLD}
          />
          <path d="M0 1.9 1 5.1 3.6 5.3 1.6 7 2.2 9.6 0 8.3Z" fill={SNOW} opacity="0.25" />
        </>
      );

    case "heart":
      return (
        <>
          <path
            d="M0 3.1C-1.5-.5-5.2.3-5.2 3.4-5.2 6.5-1.3 9.2 0 11.2 1.3 9.2 5.2 6.5 5.2 3.4 5.2.3 1.5-.5 0 3.1Z"
            fill={HOLLY}
          />
          <ellipse cx="-2.2" cy="3.4" rx="0.9" ry="1.5" fill={SNOW} opacity="0.25" />
        </>
      );

    case "cane":
      return (
        <>
          {/* Three passes over one path: a dark edge, a cream body, then red
              dashes for the stripes. The edge is not decoration — the cane is
              cream on a cream page, so without it the white stripes read as
              holes and the cane looks like a broken dashed line. */}
          <path d={CANE} fill="none" stroke={HOLLY_DARK} strokeWidth="4.2" strokeLinecap="round" />
          <path d={CANE} fill="none" stroke={SNOW} strokeWidth="3" strokeLinecap="round" />
          <path d={CANE} fill="none" stroke={HOLLY} strokeWidth="3" strokeDasharray="2.1 3" />
        </>
      );

    case "creamBauble":
      return (
        <>
          <rect x="-1.7" y="0" width="3.4" height="2.6" rx="0.8" fill={GOLD} />
          <circle cx="0" cy="8" r="5.4" fill={SNOW} />
          <circle cx="0" cy="8" r="5.4" fill="none" stroke={GOLD_DEEP} strokeWidth="0.5" opacity="0.5" />
          {/* A little painted fir, the way a hand-decorated bauble carries one. */}
          <path d="M0 4.6 2.2 8H-2.2Z" fill={PINE_MID} />
          <path d="M0 6.6 3 10.6H-3Z" fill={PINE} />
        </>
      );

    case "bauble": {
      const deep = hash(seed, 17) > 0.5;
      return (
        <>
          <rect x="-1.7" y="0" width="3.4" height="2.6" rx="0.8" fill={GOLD} />
          <circle cx="0" cy="8" r="5.4" fill={deep ? HOLLY_DARK : HOLLY} />
          <ellipse cx="-1.9" cy="6.1" rx="1.2" ry="2" fill={SNOW} opacity="0.26" />
        </>
      );
    }
  }
}

export function HeaderGarland() {
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

  const count = width > 0 ? Math.max(6, Math.round(width / NODE_PITCH)) : 0;
  const gap = count > 0 ? width / count : 0;

  // The swag hangs lowest between its fixings. One shallow sine over the whole
  // width rather than a scallop per node: a garland nailed up at two ends dips
  // once, and a repeating scallop reads as wallpaper.
  const spineAt = (x: number) =>
    SPINE_Y - 5 + Math.sin((x / Math.max(1, width)) * Math.PI) * 7;

  const nodes = Array.from({ length: count }, (_, i) => {
    const x = gap * (i + 0.5);
    return { x, y: spineAt(x), i };
  });

  const spine =
    count > 0
      ? `M0 ${spineAt(0).toFixed(1)}` +
        nodes.map((n) => `L${n.x.toFixed(1)} ${n.y.toFixed(1)}`).join("") +
        `L${width} ${spineAt(width).toFixed(1)}`
      : "";

  return (
    <div ref={ref} className="christmas-header-garland" aria-hidden="true">
      {count > 0 && (
        <svg
          width={width}
          height={HEIGHT}
          viewBox={`0 0 ${width} ${HEIGHT}`}
          fill="none"
          // Set here rather than in the stylesheet: the build strips an
          // `overflow` rule aimed at this element, so the garland would be
          // sliced off at the SVG's edges.
          style={{ overflow: "visible" }}
        >
          {/* Back layer: shorter, darker sprigs, so the swag has depth instead
              of reading as one flat cut-out. */}
          <g stroke={PINE_DARK} strokeWidth="0.8" strokeLinecap="round" opacity="0.85">
            {nodes.map((n) => {
              const a = (hash(n.i, 1) - 0.5) * 150;
              const b = a + 90 + hash(n.i, 2) * 60;
              return (
                <g key={n.i} transform={`translate(${n.x.toFixed(1)} ${n.y.toFixed(1)})`}>
                  <path d={sprigPath(15 + hash(n.i, 3) * 8, 4.4)} transform={`rotate(${a.toFixed(1)})`} />
                  <path d={sprigPath(13 + hash(n.i, 4) * 7, 4.1)} transform={`rotate(${b.toFixed(1)})`} />
                  <path d={sprigPath(10 + hash(n.i, 16) * 6, 3.8)} transform={`rotate(${(a + 40).toFixed(1)})`} />
                </g>
              );
            })}
          </g>

          {/* The branch the sprigs are wired to. */}
          <path d={spine} stroke={PINE_DARK} strokeWidth="2.4" strokeLinecap="round" />

          {/* Front layer: longer, lighter sprigs fanning down and out. */}
          <g strokeWidth="0.85" strokeLinecap="round">
            {nodes.map((n) => {
              // Mostly downward, fanned either side, with one short sprig
              // reaching up to tuck the swag under the shelf it hangs from.
              const spread = [
                { a: -70 - hash(n.i, 5) * 20, len: 14 + hash(n.i, 6) * 7, c: PINE_MID },
                { a: -34 - hash(n.i, 18) * 12, len: 19 + hash(n.i, 19) * 8, c: PINE },
                {
                  a: -8 + hash(n.i, 7) * 16,
                  // Every few nodes the centre sprig runs much longer, which
                  // is what gives the swag a clumped, uneven lower edge
                  // instead of a trimmed hedge.
                  len: 22 + hash(n.i, 8) * 9 + (hash(n.i, 24) > 0.72 ? 11 : 0),
                  c: PINE_MID,
                },
                { a: 30 + hash(n.i, 9) * 16, len: 19 + hash(n.i, 10) * 8, c: PINE },
                { a: 72 + hash(n.i, 12) * 22, len: 13 + hash(n.i, 13) * 6, c: PINE_MID },
                { a: 158 + hash(n.i, 14) * 44, len: 7 + hash(n.i, 15) * 4, c: PINE_LIGHT },
              // A clump is not a comb: each node drops one or two of its
              // sprigs, so the swag thickens and thins along its length.
              ].filter((_, k) => hash(n.i * 7 + k, 20) > 0.22);
              return (
                <g key={n.i} transform={`translate(${n.x.toFixed(1)} ${n.y.toFixed(1)})`}>
                  {spread.map((s, k) => (
                    <path
                      key={k}
                      d={sprigPath(s.len, 4.6)}
                      stroke={s.c}
                      transform={`rotate(${s.a.toFixed(1)})`}
                    />
                  ))}
                </g>
              );
            })}
          </g>

          {/* Cones and berries tucked into the foliage, on their own rhythms so
              they never line up with each other. */}
          {nodes
            .filter((n) => n.i % 5 === 2)
            .map((n) => (
              <PineCone
                key={`c${n.i}`}
                x={n.x + (hash(n.i, 21) - 0.5) * 9}
                y={n.y + 7 + hash(n.i, 22) * 5}
                tilt={(hash(n.i, 23) - 0.5) * 70}
              />
            ))}
          {nodes
            .filter((n) => n.i % 3 === 1)
            .map((n) => (
              <Berries
                key={`b${n.i}`}
                x={n.x + (hash(n.i, 31) - 0.5) * 12}
                y={n.y + 8 + hash(n.i, 32) * 7}
                seed={n.i}
              />
            ))}

          {/* A few things hanging below, far enough apart that they read as
              picked out by hand rather than strung at a fixed interval. */}
          {nodes
            .filter((n) => n.i % 7 === 4)
            .map((n) => {
              const kind = HANGERS[Math.floor(hash(n.i, 41) * HANGERS.length) % HANGERS.length];
              const drop = 24 + hash(n.i, 42) * 9;
              const tilt = (hash(n.i, 43) - 0.5) * 14;
              return (
                <g key={`h${n.i}`} transform={`translate(${n.x.toFixed(1)} ${n.y.toFixed(1)})`}>
                  <g transform={`rotate(${tilt.toFixed(1)})`}>
                    <path d={`M0 0V${drop.toFixed(1)}`} stroke={THREAD} strokeWidth="0.85" />
                    <g transform={`translate(0 ${drop.toFixed(1)})`}>
                      <Ornament kind={kind} seed={n.i} />
                    </g>
                  </g>
                </g>
              );
            })}
        </svg>
      )}
    </div>
  );
}
