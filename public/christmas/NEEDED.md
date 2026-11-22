# Christmas assets — what I'd like from you

Everything on the site works right now without any of these. Each one below
has a working stand-in, so nothing is broken or half-finished while you decide
whether you want to supply the real thing. This is a wishlist, not a blocker.

Put anything you send into this folder (`public/christmas/`).

---

## 1. Max and Lizzy in Santa hats — the one that really needs you

**What:** Max and Lizzy drawn wearing Santa hats or scarves, in the same soft
watercolour storybook style as their existing artwork.

**Size:** transparent PNG, same dimensions as the current mascot images so they
drop straight in.

**Why I have not done it:** Max and Lizzy are your characters, drawn by a real
illustrator. I will not generate imitations of them, and painting a flat vector
hat on top of their watercolour heads would look exactly like what it is. This
needs the person who drew them, or a decision from you that a rougher version
is fine.

**Standing in for now:** the mascots appear as they always do, undecorated.

---

## 2. Christmas favicon

**What:** the Max & Lizzy mark with a small Santa hat on it.

**Size:** a 512×512 PNG is enough; I can produce the `.ico` and the other sizes
from it.

**Why I have not done it:** the logo is your mark. Editing it is a decision for
you, not a side effect of a seasonal job.

**Standing in for now:** the ordinary favicon.

---

## 3. A photo of the shop's Christmas display

**What:** the frosted trees, the cream and blush tones, the pink knitted Santa,
the wooden animals — the window or the table as you actually dress it.

**Size:** landscape, at least 2000px wide, JPEG. I will compress it.

**Where it would go:** the Christmas Collection page, above the products, and
as the share image when someone posts that page to Facebook or WhatsApp.

**Standing in for now:** the page opens on the script headline and the candy
stripe, with no photograph.

---

## 4. Pine branches with fairy lights

**What:** dense pine with warm white lights and red berries, shot flat from
above, with an empty middle.

**Size:** landscape, at least 2400px wide, JPEG.

**Where it would go:** behind the Christmas Collection headline, and behind any
seasonal section that wants a dark backdrop.

**Standing in for now:** nothing — those areas are plain cream, which is not
wrong, just quieter.

---

## Things I need in words, not pictures

- **The announcement bar.** It is currently running one new line, "Christmas
  gifts, chosen by Max & Lizzy", alongside three of your existing year-round
  messages. I have not written anything about offers, discounts, delivery dates
  or gift wrapping, because none of that has been confirmed. Send me the real
  lines and I will put them in.

- **Which products are in the Christmas Collection.** There are eight in there
  now, picked from the catalogue as things that read as presents. They are a
  placeholder. The list is one line in `data/christmas-collection.ts`.

---

## Already here, nothing needed

- `garland-tile.webp` — the fir garland that hangs under the announcement bar
  on a desktop. Not drawn by me and not AI-generated: it is a free stock
  illustration by Alexey_Hulsov on Pixabay
  (pixabay.com/illustrations/new-year-christmas-decoration-1911483/) under the
  **Pixabay Content License** — free for commercial use, no attribution
  required, no payment. I cropped it to the upper band, changed its gold
  baubles to the same deep red as the announcement bar, took off the white
  snowflake stickers that were stuck on the branches, quietened the whole
  thing down to sit with our palette, and mirrored it so it repeats across any
  screen width without a seam. `scripts/build-christmas-garland.py` is the
  recipe, so any of that can be re-tuned later.

  If you would rather have a nicer one, this is a single file to replace:
  anything roughly 1600 x 150, transparent background, garland flush to the
  top edge, drops straight in. The two Pinterest pins you sent are both paid
  stock; buying one of those (about $10-30, or free on an existing Adobe
  subscription) and sending me the PNG would be a straight swap.

- `collection-en.svg`, `collection-ru.svg` — "Christmas Collection" as drawn
  script lettering (Pinyon Script and Marck Script, both SIL Open Font
  License 1.1, converted to outlines).
- `lettering-en.svg`, `lettering-ru.svg` — "Merry Christmas" and "С Новым
  годом", same treatment, used in the footer.

There is no Armenian script lettering because no calligraphic Armenian face
exists under an open licence; Noto Serif and Noto Sans Armenian are the whole
field. Armenian headlines are set in the site's own Armenian serif instead,
which is a deliberate choice rather than a gap. If you have, or want to
commission, Armenian hand-lettering for "Շնորհավոր Սուրբ Ծնունդ", it would
slot straight into the same place as the other two.
