import { Stocking } from "@/components/christmas/ornaments";

/**
 * The row of knitted stockings hung across the top of the footer, from the
 * board's red-stocking garland.
 *
 * The stockings are laid out with flexbox and a repeating line behind them
 * rather than being measured in JavaScript: there is nothing here that has to
 * line up with anything, so a server component with no script at all does the
 * job. The row is cropped rather than wrapped on a narrow screen, which is
 * what a real garland strung across a wall does.
 */

/** Red, cream and pine, repeating, as the board's garland runs. */
const COLORS = [
  "var(--color-holly)",
  "#d9c4a0",
  "var(--color-pine-light)",
  "var(--color-holly-dark)",
  "#eee0c7",
  "var(--color-pine)",
];

export function StockingGarland() {
  return (
    <div className="christmas-garland" aria-hidden="true">
      <span className="christmas-garland-line" />
      <div className="christmas-garland-row">
        {Array.from({ length: 14 }, (_, i) => (
          <Stocking
            key={i}
            color={COLORS[i % COLORS.length]}
            // Hung by hand, so no two hang at quite the same angle or height.
            className="christmas-garland-sock"
            />
        ))}
      </div>
    </div>
  );
}
