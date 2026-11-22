"use client";

import { useEffect, useRef } from "react";

/**
 * Falling snow over the whole site.
 *
 * One canvas rather than a few dozen DOM nodes: sixty animated elements would
 * each cost the browser layout and paint work on every frame, on top of a
 * page that is already scrolling a catalogue of photographs. A canvas is one
 * element and one paint.
 *
 * It is `pointer-events: none` and `aria-hidden`, so nothing on the page
 * becomes harder to click or to hear read out. It stops entirely when the tab
 * is hidden, and never starts at all for a visitor who has asked for less
 * motion — for them a drift of snow across every page is the exact thing the
 * setting exists to prevent.
 */

const DESKTOP_FLAKES = 60;
const MOBILE_FLAKES = 25;
const MOBILE_WIDTH = 768;

type Flake = {
  x: number;
  y: number;
  r: number;
  /** Downward speed, px per second. */
  fall: number;
  /** How far it swings sideways, and where in that swing it currently is. */
  drift: number;
  phase: number;
  alpha: number;
};

function makeFlake(w: number, h: number, seeded: boolean): Flake {
  const r = 1 + Math.random() * 2.6;
  return {
    x: Math.random() * w,
    // On the first fill the flakes are scattered over the whole screen, so
    // the snow is already falling when the page appears rather than arriving
    // as a curtain from the top edge.
    y: seeded ? Math.random() * h : -10 - Math.random() * 40,
    r,
    // Bigger flakes read as nearer, so they fall faster and are less sheer.
    fall: 14 + r * 11,
    drift: 8 + Math.random() * 22,
    phase: Math.random() * Math.PI * 2,
    alpha: 0.35 + (r / 3.6) * 0.5,
  };
}

export function Snowfall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Checked here rather than with a hook so that nothing is allocated at
    // all — no canvas context, no flakes, no frame loop.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const flakes: Flake[] = [];
    let w = 0;
    let h = 0;
    let raf: number | null = null;
    let last = 0;

    function resize() {
      if (!canvas || !ctx) return;
      w = window.innerWidth;
      h = window.innerHeight;
      // Draw at the screen's real pixel density, or the flakes are mush on a
      // retina display. Capped at 2: a 3x phone gains nothing visible from
      // nine times the fill cost.
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const want = w < MOBILE_WIDTH ? MOBILE_FLAKES : DESKTOP_FLAKES;
      if (flakes.length > want) flakes.length = want;
      while (flakes.length < want) flakes.push(makeFlake(w, h, true));
    }

    function frame(now: number) {
      if (!ctx) return;
      // Seconds since the previous frame, so the snow falls at the same rate
      // on a 60Hz and a 120Hz screen. Clamped, because a frame delayed by a
      // slow page would otherwise teleport every flake down the screen.
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#fffaf0";

      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        f.y += f.fall * dt;
        f.phase += dt * 0.8;
        const x = f.x + Math.sin(f.phase) * f.drift;

        if (f.y - f.r > h) {
          flakes[i] = makeFlake(w, h, false);
          continue;
        }

        ctx.globalAlpha = f.alpha;
        ctx.beginPath();
        ctx.arc(x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (raf != null) return;
      // Reset the clock, or the first frame back from a hidden tab is handed
      // however many minutes it was away as its delta.
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      if (raf != null) cancelAnimationFrame(raf);
      raf = null;
    }

    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }

    resize();
    start();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="christmas-snow" aria-hidden="true" />;
}
