"""Cut the ornaments out of the reference wallpaper and lay them into a
repeating tile for the site's page background.

The source is a flat cream field with red pen drawings on it, so coverage can
be recovered exactly: every pixel is ink laid over that one background colour,
and the green channel separates them furthest. Solving for coverage gives a
clean anti-aliased cut-out with no halo, and rebuilding each pixel from one
ink colour means the tile's strength is a single number rather than whatever
the photograph happened to contain.
"""
import sys
from PIL import Image

SRC = sys.argv[1]
OUT = sys.argv[2]

BG_G = 236          # the flat background's green channel
INK_G = 20          # the pen's
INK = (150, 42, 40)  # the red everything is redrawn in
STRENGTH = 0.50      # coverage ceiling — see the contrast note in globals.css

src = Image.open(SRC).convert("RGB")
sp = src.load()

def cut(box, scale):
    """Lift one drawing out of the sheet as a transparent image."""
    x0, y0, x1, y1 = box
    w, h = x1 - x0 + 1, y1 - y0 + 1
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    op = out.load()
    for y in range(h):
        for x in range(w):
            g = sp[x0 + x, y0 + y][1]
            a = (BG_G - g) / (BG_G - INK_G)
            if a <= 0.02:
                continue
            op[x, y] = (*INK, int(min(1.0, a) * STRENGTH * 255))
    nw, nh = max(1, round(w * scale)), max(1, round(h * scale))
    return out.resize((nw, nh), Image.LANCZOS)

# Boxes found by find_motifs.py, one instance of each drawing. The two
# "ho ho ho" scripts are left out: hand-lettered English across the page of an
# Armenian shop is a different decision from a pattern of ornaments.
MOTIFS = {
    "gift":        (239, 361, 367, 511),
    "snowflake":   (528, 247, 655, 368),
    "holly":       (472, 424, 599, 575),
    "cane":        (352, 550, 438, 664),
    "bauble":      (404, 271, 474, 367),
    "gingerbread": (63, 255, 175, 385),
}

# Small on purpose. The pattern lies under sections that paint their own
# background — a tinted band, a curved divider, a card — and a background is
# always clipped by whatever sits on top of it. At full size that clip lands
# mid-drawing and reads as a broken present; at this size a drawing caught by
# an edge reads as what it is, a pattern continuing underneath something.
SCALE = 0.44
TILE = 600

# Placed by hand on an irregular scatter: no two drawings share a height or a
# distance from the left edge, so the repeat gives the eye no row to follow,
# and every one sits clear of the edges, so the tile joins itself cleanly.
PLACEMENT = [
    ("gift",         50,  60),
    ("snowflake",   390,  70),
    ("cane",        212, 232),
    ("holly",       436, 330),
    ("bauble",       92, 392),
    ("gingerbread", 300, 462),
]

tile = Image.new("RGBA", (TILE, TILE), (0, 0, 0, 0))
cuts = {name: cut(box, SCALE) for name, box in MOTIFS.items()}
for name, x, y in PLACEMENT:
    c = cuts[name]
    assert x >= 0 and y >= 0 and x + c.width <= TILE and y + c.height <= TILE, \
        f"{name} runs off the tile: {x},{y} + {c.size}"
    tile.alpha_composite(c, (x, y))

tile.save(OUT, "WEBP", quality=88, method=6)
print("wrote", OUT, tile.size)
for name, c in cuts.items():
    print(f"  {name:12} {c.size}")
