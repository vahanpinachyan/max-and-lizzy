"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatAmd } from "@/lib/format";
import { useI18n } from "@/lib/i18n/context";

const MIN = 0;
const MAX = 100000;
const STEP = 1000;

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

export function PriceRangeFilter({
  min,
  max,
  onApply,
  applyLabel,
  minAriaLabel,
  maxAriaLabel,
}: {
  min: number;
  max: number;
  onApply: (min: number, max: number) => void;
  applyLabel: string;
  minAriaLabel: string;
  maxAriaLabel: string;
}) {
  const { locale } = useI18n();
  const [localMin, setLocalMin] = useState(min);
  const [localMax, setLocalMax] = useState(max);
  const trackRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef({ min: localMin, max: localMax });
  const draggingRef = useRef<"min" | "max" | null>(null);

  useEffect(() => {
    valuesRef.current = { min: localMin, max: localMax };
  }, [localMin, localMax]);

  useEffect(() => {
    setLocalMin(min);
    setLocalMax(max);
  }, [min, max]);

  const valueFromClientX = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return MIN;
    const rect = track.getBoundingClientRect();
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    return Math.round((MIN + ratio * (MAX - MIN)) / STEP) * STEP;
  }, []);

  useEffect(() => {
    function handleMove(e: PointerEvent) {
      const handle = draggingRef.current;
      if (!handle) return;
      const value = valueFromClientX(e.clientX);
      if (handle === "min") setLocalMin(Math.min(value, valuesRef.current.max));
      else setLocalMax(Math.max(value, valuesRef.current.min));
    }
    function handleUp() {
      draggingRef.current = null;
    }
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [valueFromClientX]);

  function startDrag(handle: "min" | "max") {
    return (e: React.PointerEvent) => {
      e.preventDefault();
      draggingRef.current = handle;
    };
  }

  function handleKeyDown(handle: "min" | "max") {
    return (e: React.KeyboardEvent) => {
      let delta = 0;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") delta = -STEP;
      else if (e.key === "ArrowRight" || e.key === "ArrowUp") delta = STEP;
      else if (e.key === "Home") delta = -MAX;
      else if (e.key === "End") delta = MAX;
      else return;
      e.preventDefault();
      if (handle === "min") setLocalMin((v) => clamp(v + delta, MIN, valuesRef.current.max));
      else setLocalMax((v) => clamp(v + delta, valuesRef.current.min, MAX));
    };
  }

  const minPct = ((localMin - MIN) / (MAX - MIN)) * 100;
  const maxPct = ((localMax - MIN) / (MAX - MIN)) * 100;
  const dirty = localMin !== min || localMax !== max;

  return (
    <div>
      <p className="flex items-center justify-between text-sm font-medium text-espresso/80">
        <span>{formatAmd(localMin, locale)}</span>
        <span>{formatAmd(localMax, locale)}</span>
      </p>

      <div ref={trackRef} className="relative mt-4 h-1.5 touch-none rounded-full bg-tan/50">
        <div
          className="absolute h-1.5 rounded-full bg-terracotta"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />
        <div
          role="slider"
          tabIndex={0}
          aria-label={minAriaLabel}
          aria-valuemin={MIN}
          aria-valuemax={MAX}
          aria-valuenow={localMin}
          onPointerDown={startDrag("min")}
          onKeyDown={handleKeyDown("min")}
          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-full border-2 border-terracotta bg-white shadow-sm transition-transform hover:scale-110 active:cursor-grabbing focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
          style={{ left: `${minPct}%` }}
        />
        <div
          role="slider"
          tabIndex={0}
          aria-label={maxAriaLabel}
          aria-valuemin={MIN}
          aria-valuemax={MAX}
          aria-valuenow={localMax}
          onPointerDown={startDrag("max")}
          onKeyDown={handleKeyDown("max")}
          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-full border-2 border-terracotta bg-white shadow-sm transition-transform hover:scale-110 active:cursor-grabbing focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
          style={{ left: `${maxPct}%` }}
        />
      </div>

      <button
        type="button"
        onClick={() => onApply(localMin, localMax)}
        disabled={!dirty}
        className="mt-4 w-full rounded-full bg-terracotta px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-terracotta-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        {applyLabel}
      </button>
    </div>
  );
}
