"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The scrollbar, as a string of Christmas lights.
 *
 * Two strings, one shown at a time, chosen in CSS rather than JavaScript so
 * the server and the browser always agree on the markup:
 *
 *   - a vertical string down the right edge, on pointer-driven screens, where
 *     it replaces the native scrollbar and can be clicked and dragged;
 *   - a thin horizontal string across the top on touch screens, where a
 *     native scrollbar is an overlay nobody drags, so it is a progress bar
 *     and nothing more.
 *
 * Native scrolling is untouched. The wheel, the trackpad, Page Down, Home,
 * End, a find-in-page jump and a touch flick all behave exactly as before;
 * only the painted scrollbar is hidden, and only where this string replaces
 * it (see globals.css).
 *
 * Decoration, so `aria-hidden`: a screen reader is told about the string
 * neither as lights nor as a scrollbar, and loses nothing, because every
 * position it can reach is reachable by keyboard without it.
 */

/** Red, green, gold, blue and pink, as the board's C9 strings run. */
const BULB_COLORS = ["#c33a33", "#2f7350", "#c9a24a", "#3f6fa8", "#c47d99"] as const;

/**
 * How many bulbs fit, within the 20–30 the brief asks for. The count follows
 * the window rather than being fixed: two dozen full-size bulbs on a short
 * laptop window touch each other and read as one striped ribbon, and the
 * alternative — shrinking them to fit — leaves specks nobody can see.
 */
const BULB_PITCH = 34;
const MIN_BULBS = 20;
const MAX_BULBS = 30;
const HORIZONTAL_BULBS = 18;

/**
 * Width of the vertical strip. Wide enough that a lit bulb's blurred glow
 * finishes inside the SVG instead of being sliced off at its edge.
 */
const STRIP_W = 46;

/**
 * The first bulb hangs below the header rather than behind it. The header is
 * translucent, so a string running up underneath it would show as a smear
 * rather than as lights, and the brief asks for the top bulb to be readable
 * the moment the page loads.
 */
const TOP_INSET = 96;
const BOTTOM_INSET = 28;

/**
 * Deterministic pseudo-random in [0, 1) from an integer. Each bulb needs its
 * own twinkle rhythm, but `Math.random()` would give the server one set of
 * numbers and the browser another, and React would throw away the markup it
 * was sent. This gives both the same answer.
 */
function jitter(i: number, salt: number) {
  const x = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** A C9 bulb: brass collar, onion glass, hanging from the wire at (0, 0). */
function Bulb({
  index,
  color,
  ref,
}: {
  index: number;
  color: string;
  ref: (el: SVGGElement | null) => void;
}) {
  // Real bulbs on a slack wire do not all hang plumb. The tilt is an SVG
  // transform attribute, not a CSS one: CSS transforms on an SVG element
  // resolve their origin against the whole viewBox, which would swing each
  // bulb around a point somewhere off at the top of the strip.
  const tilt = (jitter(index, 3) - 0.5) * 26;
  return (
    <g
      ref={ref}
      className="ml-bulb"
      transform={`rotate(${tilt.toFixed(1)})`}
      style={
        {
          "--ml-bulb": color,
          "--ml-twinkle-delay": `${(jitter(index, 1) * 4).toFixed(2)}s`,
          "--ml-twinkle-dur": `${(2.6 + jitter(index, 2) * 3.4).toFixed(2)}s`,
        } as React.CSSProperties
      }
    >
      {/* The glow is painted first so the glass sits inside it. */}
      <circle className="ml-glow" cx="0" cy="7" r="11" fill={color} />
      <path className="ml-collar" d="M-2.6 -3.2h5.2a1 1 0 0 1 1 1v3.4h-7.2v-3.4a1 1 0 0 1 1-1z" />
      <path
        className="ml-glass"
        d="M-4.1 0a4.1 4.1 0 0 1 8.2 0c0 4.4-.5 7.9-4.1 11.4C.4 7.9-4.1 4.4-4.1 0z"
      />
      {/* A single highlight does most of the work of making glass read as glass. */}
      <ellipse className="ml-shine" cx="-1.5" cy="2.4" rx="1.1" ry="2.1" />
    </g>
  );
}

export function LightsScrollbar() {
  // Measured, not assumed: the wire is drawn in real pixels so its stroke and
  // the bulbs keep their proportions instead of being stretched by a viewBox.
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);

  // How much wire the string has to fill, and how many bulbs that affords.
  // Computed here rather than down with the drawing because an effect below
  // has to hand the same number to the painter.
  const vSpan = Math.max(1, height - TOP_INSET - BOTTOM_INSET);
  const vCount = Math.min(MAX_BULBS, Math.max(MIN_BULBS, Math.round(vSpan / BULB_PITCH)));

  const vRefs = useRef<(SVGGElement | null)[]>([]);
  const hRefs = useRef<(SVGGElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const litRef = useRef(-1);
  const draggingRef = useRef(false);
  // The bulb count changes with the window, and the painter runs outside
  // React, so it reads the current count from here rather than closing over
  // a value that was right when the component last rendered.
  const countRef = useRef(MIN_BULBS);

  useEffect(() => {
    function measure() {
      setHeight(window.innerHeight);
      setWidth(window.innerWidth);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /**
   * Classes are written straight onto the elements rather than held in state.
   * Scrolling a long catalogue page would otherwise re-render forty-odd SVG
   * nodes on every frame to change one attribute on one of them.
   */
  const paint = useCallback(() => {
    rafRef.current = null;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;

    const applyTo = (refs: (SVGGElement | null)[], count: number) => {
      const lit = 1 + Math.round(progress * (count - 1));
      refs.forEach((el, i) => {
        if (el) el.classList.toggle("is-lit", i < lit);
      });
    };

    // One integer summarises the whole string, so a scroll that does not
    // cross a bulb boundary costs a comparison and nothing else.
    const key = Math.round(progress * 1000);
    if (key === litRef.current) return;
    litRef.current = key;

    applyTo(vRefs.current, countRef.current);
    applyTo(hRefs.current, HORIZONTAL_BULBS);
  }, []);

  useEffect(() => {
    const schedule = () => {
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(paint);
    };
    // The first paint has to be unconditional: a visitor can land part-way
    // down a page from a shared link or a browser's restored scroll position.
    litRef.current = -1;
    schedule();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        // Clearing the slot matters as much as cancelling the frame. This
        // effect re-runs whenever the viewport is resized, and `schedule`
        // only queues a frame when the slot is empty — leaving a stale id
        // behind would wedge the string shut for the rest of the visit.
        rafRef.current = null;
      }
    };
  }, [paint, height]);

  // Runs after the refs for the new string have attached, so the painter is
  // never told a count the DOM does not yet have. Clearing `litRef` makes the
  // next frame repaint unconditionally, because the scroll position has not
  // changed and the painter would otherwise consider itself up to date.
  useEffect(() => {
    countRef.current = vCount;
    vRefs.current.length = vCount;
    litRef.current = -1;
  }, [vCount]);

  /** Click or drag along the string, the way a scrollbar behaves. */
  const scrollToPointer = useCallback(
    (clientY: number) => {
      const track = Math.max(1, height - TOP_INSET - BOTTOM_INSET);
      const fraction = Math.min(1, Math.max(0, (clientY - TOP_INSET) / track));
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: fraction * max, behavior: "instant" as ScrollBehavior });
    },
    [height],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<SVGRectElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      draggingRef.current = true;
      scrollToPointer(e.clientY);
    },
    [scrollToPointer],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<SVGRectElement>) => {
      if (draggingRef.current) scrollToPointer(e.clientY);
    },
    [scrollToPointer],
  );

  const endDrag = useCallback((e: React.PointerEvent<SVGRectElement>) => {
    draggingRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, []);

  // Nothing is drawn until the viewport has been measured, which keeps the
  // server's markup and the browser's first render identical.
  if (height === 0) return null;

  // --- the vertical string -------------------------------------------------
  const vGap = vSpan / (vCount - 1);
  const vAnchors = Array.from({ length: vCount }, (_, i) => ({
    x: i % 2 === 0 ? 17 : 31,
    y: TOP_INSET + i * vGap,
  }));
  // The wire droops between bulbs instead of running straight, which is what
  // makes a string of lights read as hanging rather than as a painted line.
  const vWire =
    `M ${vAnchors[0].x} 0 L ${vAnchors[0].x} ${vAnchors[0].y}` +
    vAnchors
      .slice(1)
      .map((a, i) => {
        const prev = vAnchors[i];
        return ` Q ${prev.x} ${((prev.y + a.y) / 2 + vGap * 0.26).toFixed(1)} ${a.x} ${a.y.toFixed(1)}`;
      })
      .join("");

  // --- the horizontal string -----------------------------------------------
  const hGap = width / (HORIZONTAL_BULBS - 1);
  const hAnchors = Array.from({ length: HORIZONTAL_BULBS }, (_, i) => ({
    x: i * hGap,
    y: i % 2 === 0 ? 5 : 8,
  }));
  const hWire = hAnchors
    .slice(1)
    .map((a, i) => {
      const prev = hAnchors[i];
      return ` Q ${((prev.x + a.x) / 2).toFixed(1)} ${(Math.max(prev.y, a.y) + 4).toFixed(1)} ${a.x.toFixed(1)} ${a.y}`;
    })
    .join("");

  return (
    <>
      <div className="ml-lights-v" aria-hidden="true">
        <svg width={STRIP_W} height={height} viewBox={`0 0 ${STRIP_W} ${height}`} fill="none">
          <path className="ml-wire" d={vWire} />
          {vAnchors.map((a, i) => (
            <g key={i} transform={`translate(${a.x} ${a.y.toFixed(1)}) scale(1.22)`}>
              <Bulb
                index={i}
                color={BULB_COLORS[i % BULB_COLORS.length]}
                ref={(el) => void (vRefs.current[i] = el)}
              />
            </g>
          ))}
          {/* The only part of the strip that takes a pointer: a narrow lane at
              the very edge, so nothing elsewhere on the page loses a click. */}
          <rect
            className="ml-track"
            x={STRIP_W - 16}
            y="0"
            width="16"
            height={height}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          />
        </svg>
      </div>

      <div className="ml-lights-h" aria-hidden="true">
        <svg width={width} height="26" viewBox={`0 0 ${width} 26`} fill="none">
          <path className="ml-wire" d={`M ${hAnchors[0].x} ${hAnchors[0].y}${hWire}`} />
          {hAnchors.map((a, i) => (
            <g key={i} transform={`translate(${a.x.toFixed(1)} ${a.y}) scale(0.62)`}>
              <Bulb
                index={i}
                color={BULB_COLORS[i % BULB_COLORS.length]}
                ref={(el) => void (hRefs.current[i] = el)}
              />
            </g>
          ))}
        </svg>
      </div>
    </>
  );
}
