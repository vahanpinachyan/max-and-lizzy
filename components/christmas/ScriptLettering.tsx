/**
 * Hand-script headlines, drawn as outlines rather than set in a font.
 *
 * The site stopped fetching fonts from Google at build time and its CSP
 * blocks them at runtime, so a script face would have to be vendored and
 * downloaded for one line on one page. These are outlines in an SVG: nothing
 * extra is fetched beyond the file itself, and the lettering cannot quietly
 * fall back to a serif if anything goes wrong.
 *
 * The SVG is applied as a mask with the colour painted behind it, not as an
 * `<img>`. An SVG loaded through `<img>` is a separate document — its
 * `currentColor` resolves to black, not to the colour of the text around it —
 * so the same file could not be holly red on the collection page and cream on
 * the espresso footer. As a mask it takes `currentColor` from whatever is
 * asking for it, and the Christmas tokens stay the single source of the
 * palette.
 *
 * It carries `role="img"` and a label, so the headline is read out as text
 * even though no text is in the page.
 */
export function ScriptLettering({
  src,
  ratio,
  label,
  className = "",
}: {
  /** Path under /public. */
  src: string;
  /** Width ÷ height of the file's viewBox, so no height has to be guessed. */
  ratio: number;
  label: string;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label={label}
      className={`christmas-lettering ${className}`}
      style={{
        WebkitMaskImage: `url("${src}")`,
        maskImage: `url("${src}")`,
        aspectRatio: String(ratio),
      }}
    />
  );
}
