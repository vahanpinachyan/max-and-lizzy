"""Cut the link-preview cards out of photographs the shop already has.

When someone pastes a maxandlizzy.com link into WhatsApp, Facebook, Telegram
or iMessage, the app fetches the page and looks for an `og:image`. That image
is what it shows in the little card. Without one — or with one that 404s —
the link arrives as bare blue text and gets ignored.

The cards have to be their own files rather than the originals, because the
originals are the wrong shape. A preview card is shown at roughly 1.91:1
(1200x630 is the size every platform documents). The carousel photograph is
3:1, so an app would letterbox or crop it to taste, and the shop photograph
is 1.5:1, which gets the top and bottom cut off. Cropping deliberately means
the rocking horse and the shop sign survive rather than whichever band of the
picture the platform happened to keep.

They are also kept under ~200KB. WhatsApp in particular gives up on large
images and falls back to no picture at all.

Run:  python3 scripts/build-share-cards.py
"""

from PIL import Image

# What every platform documents for a large link card.
CARD = (1200, 630)
RATIO = CARD[0] / CARD[1]


def card(src_path, out_path, anchor_x=0.5, anchor_y=0.5, quality=86):
    """Crop the widest 1.91:1 window that fits, then resize to the card size.

    anchor_x / anchor_y choose which part survives when the source is the
    wrong shape: 0 keeps the left or top edge, 1 the right or bottom, 0.5
    centres. They are the whole point of doing this by hand.
    """
    im = Image.open(src_path).convert("RGB")
    w, h = im.size

    if w / h > RATIO:
        # Too wide: full height, take a window of the width.
        cw, ch = round(h * RATIO), h
    else:
        # Too tall: full width, take a band of the height.
        cw, ch = w, round(w / RATIO)

    x = round((w - cw) * anchor_x)
    y = round((h - ch) * anchor_y)

    out = im.crop((x, y, x + cw, y + ch)).resize(CARD, Image.LANCZOS)
    out.save(out_path, "JPEG", quality=quality, optimize=True, progressive=True)
    return out_path


if __name__ == "__main__":
    # The season's card. anchor_x=1 keeps the right-hand side: the presents,
    # the rocking horse and the tree. The left third of that photograph is
    # empty cream, there to hold the carousel's headline, and a centred crop
    # would hand half the card to blank paper.
    card(
        "public/images/promotions/christmas-collection-v1.jpg",
        "public/images/share/christmas-v1.jpg",
        anchor_x=1.0,
    )

    # The card for everything else. The shop's own interior, with the sign on
    # the wall, so a link to any page arrives looking like the shop. Anchored
    # a little above centre to keep the whole sign and lose some counter.
    card(
        "public/images/store/shop-interior.jpg",
        "public/images/share/default-v1.jpg",
        anchor_y=0.35,
    )

    print("wrote public/images/share/christmas-v1.jpg and default-v1.jpg")
