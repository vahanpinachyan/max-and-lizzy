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

## 5. A licence for the background pattern — needs a decision before launch

**What:** permission to use the Christmas doodles that now tile behind every
page, or a replacement I am allowed to use.

**Why this is here:** the drawings are cut out of the reference picture you
sent me. I did not draw them and I have no idea who did — it came off
Pinterest, which almost always means somebody's paid illustration pack. Six
ornaments are lifted from it: a present, a snowflake, holly, a candy cane, a
bauble and a gingerbread man.

That is fine for looking at on your own screen. It is not fine on a shop that
takes money, where using someone's artwork without a licence is the owner's
problem, not mine. **Do not let this go live as it stands.**

Three ways out, cheapest first:
1. **Find the original.** If the artist sells the pack (these usually go for
   $5-20 on Creative Market or Etsy), buy it and send me the files. Straight
   swap, same look.
2. **Buy an equivalent.** Any "Christmas line art doodle" set with a
   commercial licence. Send me the files and I will cut a new tile.
3. **Have it drawn.** The same person who drew Max and Lizzy could draw six
   ornaments in their style, which would look better than any of this.

`scripts/build-christmas-pattern.py` does the cutting, so replacing the source
picture and rerunning it is the whole job — the layout, the strength and the
spacing all stay as they are.

---

## Already here, nothing needed

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
