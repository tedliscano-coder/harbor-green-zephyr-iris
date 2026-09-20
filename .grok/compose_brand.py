#!/usr/bin/env python3
"""Compose RUN FROM OLIVER share cards from in-game sprites + code type."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps

ROOT = Path("/workspace")
PUB = ROOT / "public"
ANTON = ROOT / ".grok/fonts/Anton-Regular.ttf"

NEAR_BLACK = (12, 10, 9)
CREAM = (243, 238, 230)
TERRACOTTA = (196, 92, 74)


def load_rgba(path: Path) -> Image.Image:
    return Image.open(path).convert("RGBA")


def nn_scale(im: Image.Image, factor: int) -> Image.Image:
    if factor == 1:
        return im
    return im.resize((im.width * factor, im.height * factor), Image.Resampling.NEAREST)


def tracked_width(text: str, font: ImageFont.FreeTypeFont, spacing: float) -> float:
    if not text:
        return 0.0
    return sum(font.getlength(ch) for ch in text) + spacing * (len(text) - 1)


def draw_tracked(draw, text, font, xy, fill, spacing, stroke_fill=None, stroke_width=0):
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill, stroke_width=stroke_width, stroke_fill=stroke_fill)
        x += font.getlength(ch) + spacing


def lockup_fonts(line1: str, line2: str, w_budget: int, max_hero: int = 210):
    def fit(text: str, spacing_ratio: float, lo: int, hi: int):
        best = lo
        while lo <= hi:
            mid = (lo + hi) // 2
            font = ImageFont.truetype(str(ANTON), mid)
            spacing = mid * spacing_ratio
            if tracked_width(text, font, spacing) <= w_budget:
                best = mid
                lo = mid + 1
            else:
                hi = mid - 1
        font = ImageFont.truetype(str(ANTON), best)
        return font, best, best * spacing_ratio

    font2, size2, sp2 = fit(line2, 0.045, 40, max_hero)
    size1 = max(22, int(size2 * 0.40))
    font1 = ImageFont.truetype(str(ANTON), size1)
    sp1 = size1 * 0.16
    while tracked_width(line1, font1, sp1) > w_budget and size1 > 18:
        size1 -= 2
        font1 = ImageFont.truetype(str(ANTON), size1)
        sp1 = size1 * 0.16
    return font1, sp1, font2, sp2


def draw_lockup(
    img: Image.Image,
    line1: str,
    line2: str,
    *,
    center=None,
    left_top=None,
    w_budget: int,
    align: str = "center",
    plate_alpha: int = 150,
    max_hero: int = 210,
) -> Image.Image:
    font1, sp1, font2, sp2 = lockup_fonts(line1, line2, w_budget, max_hero=max_hero)
    w1 = tracked_width(line1, font1, sp1)
    w2 = tracked_width(line2, font2, sp2)
    dummy = ImageDraw.Draw(Image.new("RGB", (8, 8)))
    h1 = dummy.textbbox((0, 0), "Ay", font=font1)
    h2 = dummy.textbbox((0, 0), "Ay", font=font2)
    h1 = h1[3] - h1[1]
    h2 = h2[3] - h2[1]
    gap = max(6, int(font2.size * 0.07))
    bar_h = max(4, int(font2.size * 0.042))
    total_h = h1 + gap + bar_h + gap + h2
    total_w = max(w1, w2)

    if center is not None:
        cx, cy = center
        x0 = cx - total_w / 2
        y0 = cy - total_h / 2
    else:
        x0, y0 = left_top

    overlay = img.convert("RGBA")
    layer = Image.new("RGBA", overlay.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    def line_x(width: float) -> float:
        return x0 if align == "left" else x0 + (total_w - width) / 2

    pad_x, pad_y = int(font2.size * 0.20), int(font2.size * 0.10)
    draw.rounded_rectangle(
        [x0 - pad_x, y0 - pad_y, x0 + total_w + pad_x, y0 + total_h + pad_y],
        radius=int(font2.size * 0.08),
        fill=(12, 10, 9, plate_alpha),
    )

    y = y0
    draw_tracked(
        draw, line1, font1, (line_x(w1), y), CREAM, sp1,
        stroke_fill=NEAR_BLACK, stroke_width=max(3, font1.size // 16),
    )
    y += h1 + gap
    bar_w = int(total_w * 0.40)
    bx = line_x(bar_w) if align == "center" else x0
    draw.rectangle([bx, y, bx + bar_w, y + bar_h], fill=TERRACOTTA + (235,))
    y += bar_h + gap

    shadow = Image.new("RGBA", overlay.size, (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    draw_tracked(
        sdraw, line2, font2,
        (line_x(w2) + font2.size * 0.028, y + font2.size * 0.04),
        TERRACOTTA, sp2,
    )
    draw_tracked(
        draw, line2, font2, (line_x(w2), y), CREAM, sp2,
        stroke_fill=NEAR_BLACK, stroke_width=max(4, font2.size // 15),
    )
    composed = Image.alpha_composite(overlay, shadow)
    composed = Image.alpha_composite(composed, layer)
    return composed.convert("RGB")


def darken_rgb(im: Image.Image, factor: float) -> Image.Image:
    return ImageEnhance.Brightness(im.convert("RGB")).enhance(factor)


def tile_band(canvas: Image.Image, tile: Image.Image, y0: int, y1: int, darken: float) -> None:
    t = darken_rgb(tile, darken).convert("RGBA")
    tw, th = t.size
    w = canvas.width
    y = y0
    while y < y1:
        x = 0
        while x < w:
            canvas.paste(t, (x, y), t)
            x += tw
        y += th


def ground_shadow(canvas: Image.Image, cx: int, cy: int, rw: int, rh: int, alpha: int = 140) -> None:
    blob = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(blob)
    d.ellipse([cx - rw, cy - rh, cx + rw, cy + rh], fill=(0, 0, 0, alpha))
    blob = blob.filter(ImageFilter.GaussianBlur(8))
    canvas.alpha_composite(blob)


def paste(canvas: Image.Image, sprite: Image.Image, xy: tuple[int, int]) -> None:
    canvas.alpha_composite(sprite, xy)


def glow(canvas: Image.Image, cx: int, cy: int, r: int, color: tuple[int, int, int], alpha: int) -> None:
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color + (alpha,))
    layer = layer.filter(ImageFilter.GaussianBlur(int(r * 0.45)))
    canvas.alpha_composite(layer)


def vignette(img: Image.Image, amount: float = 0.55) -> Image.Image:
    w, h = img.size
    radial = Image.radial_gradient("L").resize((w, h), Image.Resampling.LANCZOS)
    edge = ImageOps.invert(radial)
    edge = ImageEnhance.Brightness(edge).enhance(amount * 2)
    veil = Image.new("RGB", (w, h), NEAR_BLACK)
    return Image.composite(veil, img, edge)


def build_og() -> Image.Image:
    wall = Image.open(PUB / "tiles/wall.png")
    wood = Image.open(PUB / "tiles/wood.png")
    oliver = nn_scale(load_rgba(PUB / "sprites/oliver.png"), 2)
    player = nn_scale(load_rgba(PUB / "sprites/player/left-2.png"), 2)
    door = nn_scale(load_rgba(PUB / "sprites/door.png"), 2)
    plant = nn_scale(load_rgba(PUB / "props/prop-3.png"), 2)

    W, H = 1200, 630
    canvas = Image.new("RGBA", (W, H), NEAR_BLACK + (255,))
    tile_band(canvas, wall, 0, 360, 0.38)
    tile_band(canvas, wood, 348, H, 0.58)

    # Floor/wall seam shadow
    seam = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(seam)
    sd.rectangle([0, 330, W, 390], fill=(12, 10, 9, 90))
    canvas.alpha_composite(seam.filter(ImageFilter.GaussianBlur(10)))

    feet = 592
    # Door — escape on the far left
    dw, dh = door.size
    paste(canvas, door, (36, feet - dh))

    # Lamp + terracotta glow behind Oliver
    glow(canvas, 980, 300, 220, TERRACOTTA, 70)
    glow(canvas, 980, 260, 140, (243, 238, 230), 40)

    pw, ph = plant.size
    paste(canvas, plant, (880, feet - ph + 12))

    # Oliver — the threat, right side, generous edge margin
    ow, oh = oliver.size
    ox = W - ow - 56
    oy = feet - oh + 18
    ground_shadow(canvas, ox + ow // 2, feet - 6, ow // 2 - 20, 28, 160)
    paste(canvas, oliver, (ox, oy))

    # Player fleeing left toward the door
    plw, plh = player.size
    px, py = 210, feet - plh + 8
    ground_shadow(canvas, px + plw // 2, feet - 4, plw // 2 - 8, 18, 130)
    paste(canvas, player, (px, py))

    rgb = vignette(canvas.convert("RGB"), 0.48)
    # Centered lockup, ~54% width, both axes centered with breathing room
    return draw_lockup(
        rgb,
        "RUN FROM",
        "OLIVER",
        center=(600, 268),
        w_budget=int(W * 0.54),
        align="center",
        plate_alpha=155,
    )


def build_banner() -> Image.Image:
    wall = Image.open(PUB / "tiles/wall.png")
    wood = Image.open(PUB / "tiles/wood.png")
    oliver = nn_scale(load_rgba(PUB / "sprites/oliver.png"), 1)
    plant = nn_scale(load_rgba(PUB / "props/prop-3.png"), 1)
    player = nn_scale(load_rgba(PUB / "sprites/player/left-2.png"), 1)

    W, H = 1200, 264
    canvas = Image.new("RGBA", (W, H), NEAR_BLACK + (255,))
    tile_band(canvas, wall, 0, 170, 0.34)
    tile_band(canvas, wood, 158, H, 0.52)

    feet = 248
    glow(canvas, 1020, 120, 160, TERRACOTTA, 80)

    pw, ph = plant.size
    paste(canvas, plant, (820, feet - ph + 10))

    ow, oh = oliver.size
    ox = W - ow - 28
    oy = feet - oh + 10
    ground_shadow(canvas, ox + ow // 2, feet - 4, ow // 2 - 10, 16, 150)
    paste(canvas, oliver, (ox, oy))

    # Tiny fleeing player in the mid-right of the LEFT half? Keep him out of the lockup.
    # Place just left of Oliver, still in the scenery zone, not under type.
    plw, plh = player.size
    paste(canvas, player, (700, feet - plh + 6))

    # Dark veil over the left half so type sits cleanly
    veil = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    vd = ImageDraw.Draw(veil)
    for i in range(620):
        a = int(165 * (1 - i / 620) ** 1.1)
        vd.line([(i, 0), (i, H - 1)], fill=NEAR_BLACK + (a,))
    canvas.alpha_composite(veil)

    rgb = vignette(canvas.convert("RGB"), 0.42)
    # Title lockup: left half, above midline, empty bottom strip
    return draw_lockup(
        rgb,
        "RUN FROM",
        "OLIVER",
        left_top=(48, 16),
        w_budget=420,
        align="left",
        plate_alpha=120,
        max_hero=68,
    )


def main() -> None:
    out = Path("/workspace/.grok")
    og = build_og()
    banner = build_banner()
    assert og.size == (1200, 630), og.size
    assert banner.size == (1200, 264), banner.size
    og.save(out / "og-raw.jpg", "JPEG", quality=95, subsampling=0)
    banner.save(out / "x-banner-raw.jpg", "JPEG", quality=95, subsampling=0)
    print("og", og.size, (out / "og-raw.jpg").stat().st_size)
    print("banner", banner.size, (out / "x-banner-raw.jpg").stat().st_size)


if __name__ == "__main__":
    main()
