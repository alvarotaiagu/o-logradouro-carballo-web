"""Genera el emblema/icono de marca y la imagen Open Graph para O Logradouro.
No hay logo real del negocio disponible (Facebook/Instagram bloquean el
scraping y las fichas de turismo no traen imagen), así que se crea un
emblema propio (no una foto) con la paleta de la web: iniciales "OL" sobre
un círculo vino, con una onda estilizada debajo (eco del acabado
gelatinoso del hero). Se usa consistentemente en favicon, iconos de
"añadir a inicio" y como marca en el pie de página (inline SVG en el
propio index.html; este script solo genera los PNG/JPG de icono y OG).
"""
import math
from PIL import Image, ImageDraw, ImageFont

VINO = (122, 31, 46)         # --vino
VINO_HONDO = (78, 18, 25)    # --vino-hondo
BARRO = (193, 89, 46)        # --barro
BARRO_TENUE = (232, 177, 142)  # --barro-tenue
OLIVA = (107, 122, 69)       # --oliva
PAPEL = (255, 251, 243)      # --papel
TINTA = (36, 26, 22)         # --tinta

FONT_BOLD = "C:/Windows/Fonts/georgiab.ttf"


def wave_path(w, h, y_center, amplitude, cycles, phase=0):
    pts = []
    for x in range(0, w + 1, 4):
        y = y_center + amplitude * math.sin((x / w) * cycles * 2 * math.pi + phase)
        pts.append((x, y))
    return pts


def make_icon(size, out_path, rounded=True):
    scale = 4
    S = size * scale
    base = Image.new("RGBA", (S, S), (0, 0, 0, 0))

    pad = int(S * 0.04)
    circle_mask = Image.new("L", (S, S), 0)
    cmd = ImageDraw.Draw(circle_mask)
    if rounded:
        cmd.ellipse([pad, pad, S - pad, S - pad], fill=255)
    else:
        cmd.rounded_rectangle([0, 0, S, S], radius=int(S * 0.22), fill=255)

    layer = Image.new("RGBA", (S, S), VINO + (255,))
    ld = ImageDraw.Draw(layer)
    ld.rectangle([0, int(S * 0.78), S, S], fill=VINO_HONDO + (255,))

    wave_y = int(S * 0.78)
    pts = wave_path(S, S, wave_y, S * 0.03, 1.6)
    ld.line(pts, fill=BARRO, width=max(2, int(S * 0.02)))

    font_size = int(S * 0.34)
    font = ImageFont.truetype(FONT_BOLD, font_size)
    text = "OL"
    bbox = ld.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = (S - tw) / 2 - bbox[0]
    ty = (S * 0.38) - th / 2 - bbox[1]
    ld.text((tx, ty), text, font=font, fill=PAPEL)

    base.paste(layer, (0, 0), circle_mask)
    img = base.resize((size, size), Image.LANCZOS)
    img.save(out_path)
    print("wrote", out_path, size)


def make_og_image(out_path):
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), VINO_HONDO)
    d = ImageDraw.Draw(img)

    for y in range(H):
        t = y / H
        r = int(VINO[0] * (1 - t) + VINO_HONDO[0] * t)
        g = int(VINO[1] * (1 - t) + VINO_HONDO[1] * t)
        b = int(VINO[2] * (1 - t) + VINO_HONDO[2] * t)
        d.line([(0, y), (W, y)], fill=(r, g, b))

    # Manchas suaves (eco abstracto del acabado "gooey" del hero), sin
    # dibujar ninguna escena o plato literal.
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for cx, cy, r, color, alpha in [
        (900, 140, 220, BARRO, 90),
        (1040, 420, 160, BARRO_TENUE, 70),
        (760, 480, 190, OLIVA, 70),
    ]:
        od.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color + (alpha,))
    overlay = overlay.filter(__import__("PIL.ImageFilter", fromlist=["ImageFilter"]).GaussianBlur(60))
    img.paste(Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB"), (0, 0))
    d = ImageDraw.Draw(img)

    cx, cy, r = 150, 150, 78
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=PAPEL)
    font_ol = ImageFont.truetype(FONT_BOLD, 58)
    text = "OL"
    bbox = d.textbbox((0, 0), text, font=font_ol)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text((cx - tw / 2 - bbox[0], cy - th / 2 - bbox[1] - 6), text, font=font_ol, fill=VINO)

    font_title = ImageFont.truetype(FONT_BOLD, 70)
    d.text((80, 260), "O Logradouro", font=font_title, fill=PAPEL)

    font_sub = ImageFont.truetype(FONT_BOLD, 30)
    d.text((82, 350), "Bar-taberna en el centro de Carballo", font=font_sub, fill=(224, 210, 200))

    img.save(out_path, quality=88)
    print("wrote", out_path)


if __name__ == "__main__":
    import os
    base = "assets/img/logo"
    os.makedirs(base, exist_ok=True)
    make_icon(96, f"{base}/icon-96.png")
    make_icon(180, f"{base}/icon-180.png")
    make_icon(192, f"{base}/icon-192.png")
    make_icon(512, f"{base}/icon-512.png")
    os.makedirs("assets/img/web", exist_ok=True)
    make_og_image("assets/img/web/og-image.jpg")
