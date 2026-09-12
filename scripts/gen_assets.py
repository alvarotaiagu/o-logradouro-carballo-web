"""Genera el emblema/icono de marca y la imagen Open Graph para O Logradouro.

Actualizado (2026-09-12): el negocio compartió su logo real — un dibujo a
mano de la fachada (persiana + ventana con maceta + puerta) firmado
"O Logradouro" sobre el parche de una pandereta. `assets/img/logoweb.jpg`
es la foto original; `assets/img/logo/real-icon-mask.png` es un recorte
ajustado solo al dibujo del edificio (sin la mano ni el aro metálico de la
pandereta), pasado a blanco y negro puro (ver README para el recorte
exacto). Este script ya NO inventa un monograma "OL": compone ese dibujo
real (línea papel sobre fondo vino) en los íconos de favicon/PWA y en la
imagen Open Graph, sustituyendo el emblema genérico usado antes de tener
la marca real.
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter

VINO = (122, 31, 46)         # --vino
VINO_HONDO = (78, 18, 25)    # --vino-hondo
BARRO = (193, 89, 46)        # --barro
BARRO_TENUE = (232, 177, 142)  # --barro-tenue
OLIVA = (107, 122, 69)       # --oliva
PAPEL = (255, 251, 243)      # --papel
TINTA = (36, 26, 22)         # --tinta

FONT_BOLD = "C:/Windows/Fonts/georgiab.ttf"
REAL_ICON_MASK = "assets/img/logo/real-icon-mask.png"


def real_icon_rgba(fg=PAPEL):
    """Convierte la máscara B/N real (negro = trazo) en una capa RGBA con
    el trazo en `fg` y el resto transparente, lista para recortar/pegar
    sobre cualquier fondo de color."""
    mask = Image.open(REAL_ICON_MASK).convert("L")
    alpha = mask.point(lambda p: 255 - p)  # negro (trazo) -> alpha alto
    layer = Image.new("RGBA", mask.size, fg + (0,))
    layer.putalpha(alpha)
    return layer


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

    icon = real_icon_rgba(PAPEL)
    target_w = int(S * 0.66)
    ratio = target_w / icon.width
    icon = icon.resize((target_w, int(icon.height * ratio)), Image.LANCZOS)
    ix = (S - icon.width) // 2
    iy = int(S * 0.5) - icon.height // 2
    layer.alpha_composite(icon, (ix, iy))

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
    overlay = overlay.filter(ImageFilter.GaussianBlur(60))
    img.paste(Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB"), (0, 0))
    img = img.convert("RGBA")

    cx, cy, r = 150, 150, 78
    badge = Image.new("RGBA", img.size, (0, 0, 0, 0))
    bd = ImageDraw.Draw(badge)
    bd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=PAPEL + (255,))
    icon = real_icon_rgba(VINO)
    target_w = int(r * 1.5)
    ratio = target_w / icon.width
    icon = icon.resize((target_w, int(icon.height * ratio)), Image.LANCZOS)
    badge.alpha_composite(icon, (cx - icon.width // 2, cy - icon.height // 2))
    img = Image.alpha_composite(img, badge).convert("RGB")
    d = ImageDraw.Draw(img)

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
