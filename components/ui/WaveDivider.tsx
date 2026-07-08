type WaveDividerProps = {
  color?: string;
  className?: string;
  flip?: boolean;
};

/** Soft organic wave used to transition between two section backgrounds. */
export function WaveDivider({ color = "var(--color-cream)", className = "", flip = false }: WaveDividerProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative -mb-px h-12 w-full overflow-hidden sm:h-20 ${className}`}
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className={`h-full w-full ${flip ? "rotate-180" : ""}`}
      >
        <path
          d="M0,64 C240,120 480,0 720,32 C960,64 1200,112 1440,48 L1440,120 L0,120 Z"
          fill={color}
        />
      </svg>
    </div>
  );
}
