"""Turn the Pixabay source into the header garland this site ships.

Source: pixabay.com/illustrations/new-year-christmas-decoration-1911483/
(Alexey_Hulsov, Pixabay Content License — commercial use, no attribution).
Kept here so the asset can be rebuilt or re-tuned without guesswork.
"""
import sys, colorsys
from PIL import Image, ImageEnhance

# Only the upper band is a hanging garland; the lower one is a plain hedge.
# 1163 trims the right edge back to a stretch of plain foliage (measured: no
# baubles between columns 1125 and 1201) so the mirror join lands in needles.
im = Image.open(sys.argv[1]).convert("RGBA").crop((0, 0, 1163, 215))

px = im.load()
for y in range(im.height):
    for x in range(im.width):
        r, g, b, a = px[x, y]
        if a < 20:
            continue
        hh, ss, vv = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        if 0.055 <= hh <= 0.17 and ss > 0.25:
            # The original's gold baubles, swung to the shop's deep red.
            # Foliage sits at hue 0.22-0.45 and is left alone.
            nr, ng, nb = colorsys.hsv_to_rgb(0.988, min(1.0, ss * 0.92), vv * 0.86)
            px[x, y] = (int(nr * 255), int(ng * 255), int(nb * 255), a)
        elif ss < 0.17 and vv > 0.72:
            # Stuck-on white snowflake decals, pulled down towards the
            # foliage so they read as frost rather than as stickers.
            k = 0.62
            px[x, y] = (int(r * 0.38 + 206 * k), int(g * 0.38 + 214 * k), int(b * 0.38 + 198 * k), a)

r, g, b, a = im.split()
rgb = ImageEnhance.Brightness(ImageEnhance.Color(Image.merge("RGB", (r, g, b))).enhance(0.66)).enhance(0.87)
# The source carries coloured compression junk in near-transparent pixels,
# invisible on white but not over a photograph. Clear anything barely there.
im = Image.merge("RGBA", (*rgb.split(), a.point(lambda v: 0 if v < 30 else v)))

# Mirror-pair it: `repeat-x` then joins the strip to its own reflection at
# every boundary, which always meets exactly, so there is never a seam.
tile = Image.new("RGBA", (im.width * 2, im.height), (0, 0, 0, 0))
tile.paste(im, (0, 0))
tile.paste(im.transpose(Image.FLIP_LEFT_RIGHT), (im.width, 0))

H = 150  # shown at 75px, so this is exactly 2x for a retina screen
tile = tile.resize((round(tile.width * H / tile.height), H), Image.LANCZOS)
tile.save(sys.argv[2], "WEBP", quality=72, method=6)
print(tile.size)
