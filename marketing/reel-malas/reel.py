"""Reel do Instagram das malas de crochet (1080x1920, 30 fps).

Correr a partir da raiz do repositório:
    python3 marketing/reel-malas/reel.py
Gera marketing/reel-malas/reel-malas.mp4 e a capa capa.jpg. Precisa de Pillow e ffmpeg.
"""
import math
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
W, H, FPS = 1080, 1920, 30

LIME = (205, 230, 70)
PINK = (238, 82, 150)
CREAM = (245, 240, 230)
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)


def font(name, size):
    if name.startswith('syne'):
        return ImageFont.truetype(str(HERE / f'{name}-normal.woff'), size)
    return ImageFont.truetype(f'/usr/share/fonts/opentype/inter/{name}.otf', size)


F_HERO = font('syne-latin-800', 118)
F_BIG = font('syne-latin-800', 150)
F_OUT = font('syne-latin-800', 84)
F_MID = font('syne-latin-700', 64)
F_TAG = font('Inter-Bold', 34)
F_TXT = font('Inter-Medium', 46)
F_SMALL = font('Inter-SemiBold', 38)

group = Image.open(HERE / 'fotos/malas-todas.jpg').convert('RGB')
pink = Image.open(HERE / 'fotos/mala-m-rosa.jpg').convert('RGB')
green = Image.open(HERE / 'fotos/mala-s-verde.jpg').convert('RGB')

logo_src = Image.open(ROOT / 'public/images/site/logo.png').convert('RGBA')


def tint(img, color):
    out = Image.new('RGBA', img.size, color + (0,))
    out.putalpha(img.getchannel('A'))
    return out


LOGO_W = 760
logo = tint(logo_src, CREAM).resize((LOGO_W, round(LOGO_W * logo_src.height / logo_src.width)), Image.LANCZOS)


# ---------- easing / animação ----------
def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def ease_out(x):
    x = clamp(x)
    return 1 - (1 - x) ** 3


def ease_in_out(x):
    x = clamp(x)
    return x * x * (3 - 2 * x)


def back_out(x):
    x = clamp(x)
    c1 = 1.70158
    c3 = c1 + 1
    return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2


# ---------- desenho ----------
def ken_burns(img, t, z0, z1, f0, f1):
    """Recorta a imagem em 9:16 com zoom z e foco f=(x, y) em fração da imagem."""
    z = z0 + (z1 - z0) * ease_in_out(t)
    fx = f0[0] + (f1[0] - f0[0]) * ease_in_out(t)
    fy = f0[1] + (f1[1] - f0[1]) * ease_in_out(t)
    iw, ih = img.size
    base = min(iw / W, ih / H)  # cover
    bw, bh = W * base / z, H * base / z
    cx = clamp(fx * iw, bw / 2, iw - bw / 2)
    cy = clamp(fy * ih, bh / 2, ih - bh / 2)
    box = (cx - bw / 2, cy - bh / 2, cx + bw / 2, cy + bh / 2)
    return img.resize((W, H), Image.BICUBIC, box=box)


GRAD_CACHE = {}


def shade(frame, top=1000, bottom=1700, strength=0.82):
    """Escurece de y=top (transparente) a y=bottom (forte); top > bottom escurece o topo."""
    key = (top, bottom, strength)
    if key not in GRAD_CACHE:
        g = Image.new('L', (1, H), 0)
        for y in range(H):
            a = clamp((y - top) / (bottom - top)) ** 1.3 * strength
            g.putpixel((0, y), int(255 * a))
        GRAD_CACHE[key] = g.resize((W, H))
    return Image.composite(Image.new('RGB', (W, H), (0, 0, 0)), frame, GRAD_CACHE[key])


def put_text(frame, xy, text, fnt, fill, p, rise=50, anchor='la', shadow=True):
    """Texto que sobe e aparece com p em [0, 1]."""
    if p <= 0:
        return
    e = ease_out(p)
    x, y = xy
    y = y + (1 - e) * rise
    alpha = int(255 * clamp(p * 1.6))
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    if shadow:
        sh = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(sh).text((x, y + 4), text, font=fnt, fill=(0, 0, 0, int(alpha * 0.45)), anchor=anchor)
        sh = sh.filter(ImageFilter.GaussianBlur(8))
        frame.paste(sh, (0, 0), sh)
    d.text((x, y), text, font=fnt, fill=fill + (alpha,), anchor=anchor)
    frame.paste(layer, (0, 0), layer)


def pill(frame, xy, text, fnt, bg, fg, p, anchor_center=False, rot=0):
    """Etiqueta em pílula que entra com um pequeno salto."""
    if p <= 0:
        return
    s = back_out(p)
    tw = fnt.getbbox(text)[2]
    pad_x, h = 30, 66
    w = tw + pad_x * 2
    tag = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(tag)
    d.rounded_rectangle((0, 0, w - 1, h - 1), radius=h // 2, fill=bg + (255,))
    d.text((w / 2, h / 2 + 1), text, font=fnt, fill=fg, anchor='mm')
    if rot:
        tag = tag.rotate(rot, resample=Image.BICUBIC, expand=True)
    sw, sh = max(1, int(tag.width * s)), max(1, int(tag.height * s))
    tag = tag.resize((sw, sh), Image.BICUBIC)
    a = tag.getchannel('A').point(lambda v: int(v * clamp(p * 2)))
    tag.putalpha(a)
    x, y = xy
    if anchor_center:
        x -= sw // 2
    frame.paste(tag, (int(x), int(y - sh // 2)), tag)


def progress_bar(frame, t_total, dur):
    d = ImageDraw.Draw(frame)
    d.rectangle((0, 0, int(W * t_total / dur), 8), fill=LIME)


# ---------- cenas ----------
def scene_intro(t, d):
    """Todas as malas no preto, com zoom lento e o título."""
    frame = Image.new('RGB', (W, H), BLACK)
    z = 1.0 + 0.10 * ease_in_out(t / d)
    gw = int(W * 1.04 * z)
    gh = round(gw * group.height / group.width)
    g = group.resize((gw, gh), Image.BICUBIC)
    gy = 360 - (gh - round(W * 1.04 * group.height / group.width)) // 2
    frame.paste(g, ((W - gw) // 2, gy))
    pill(frame, (W / 2, 300), 'NOVIDADE', F_TAG, LIME, BLACK, (t - 0.25) / 0.5, anchor_center=True, rot=-3)
    put_text(frame, (W / 2, 1440), 'Malas de', F_HERO, CREAM, (t - 0.55) / 0.6, anchor='ma')
    put_text(frame, (W / 2, 1565), 'crochet', F_HERO, CREAM, (t - 0.7) / 0.6, anchor='ma')
    put_text(frame, (W / 2, 1720), 'feitas à mão, uma a uma', F_TXT, LIME, (t - 1.0) / 0.6, anchor='ma')
    return frame


def scene_product(img, f0, f1, name, line, price, accent, y=1280):
    def render(t, d):
        frame = ken_burns(img, t / d, 1.05, 1.22, f0, f1)
        frame = shade(frame) if y > H / 2 else shade(frame, 900, 150, 0.75)
        pill(frame, (80, y), price, F_MID, accent, BLACK, (t - 0.35) / 0.5, rot=-3)
        put_text(frame, (80, y + 70), name, F_BIG, WHITE, (t - 0.2) / 0.6)
        put_text(frame, (84, y + 250), line, F_TXT, CREAM, (t - 0.55) / 0.6)
        return frame
    return render


SWATCHES = [(232, 107, 38), (157, 107, 205), PINK, CREAM, (132, 168, 52), (35, 35, 38), LIME]


def scene_outro(t, d):
    frame = Image.new('RGB', (W, H), BLACK)
    # bolinhas das cores, a entrar uma a uma
    r, gap = 46, 128
    x0 = W / 2 - gap * (len(SWATCHES) - 1) / 2
    for i, c in enumerate(SWATCHES):
        p = (t - 0.1 - i * 0.08) / 0.45
        if p <= 0:
            continue
        s = back_out(p)
        rr = r * s
        cx, cy = x0 + i * gap, 560
        dd = ImageDraw.Draw(frame)
        dd.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), fill=c, outline=(70, 70, 70) if c == (35, 35, 38) else None, width=3)
    put_text(frame, (W / 2, 680), 'Escolhe', F_OUT, CREAM, (t - 0.5) / 0.6, anchor='ma', shadow=False)
    put_text(frame, (W / 2, 775), 'as cores', F_OUT, CREAM, (t - 0.6) / 0.6, anchor='ma', shadow=False)
    put_text(frame, (W / 2, 870), 'à tua maneira', F_OUT, LIME, (t - 0.75) / 0.6, anchor='ma', shadow=False)
    pill(frame, (W / 2, 1060), 'Personalizada desde 25€', F_TAG, PINK, WHITE, (t - 1.1) / 0.5, anchor_center=True, rot=2)
    # logo
    p = ease_out((t - 1.5) / 0.7)
    if p > 0:
        lg = logo.copy()
        lg.putalpha(lg.getchannel('A').point(lambda v: int(v * p)))
        frame.paste(lg, ((W - lg.width) // 2, int(1250 + (1 - p) * 40)), lg)
    put_text(frame, (W / 2, 1560), 'mekie-planet.com', F_MID, WHITE, (t - 1.9) / 0.6, anchor='ma', shadow=False)
    put_text(frame, (W / 2, 1650), 'Link na bio', F_SMALL, (170, 170, 170), (t - 2.1) / 0.6, anchor='ma', shadow=False)
    return frame


SCENES = [
    (4.0, scene_intro),
    (3.8, scene_product(pink, (0.72, 0.55), (0.80, 0.68), 'Mala M', 'Para levar ao ombro', '35€', LIME)),
    (3.8, scene_product(green, (0.45, 0.62), (0.43, 0.78), 'Mala S', 'Na mão ou no pulso', '25€', PINK, y=330)),
    (4.4, scene_outro),
]
XFADE = 0.35


def main():
    out = HERE / 'reel-malas.mp4'
    total = sum(d for d, _ in SCENES)
    n = int(round(total * FPS))
    proc = subprocess.Popen([
        'ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart',
        str(out)], stdin=subprocess.PIPE)
    starts = []
    acc = 0.0
    for d, _ in SCENES:
        starts.append(acc)
        acc += d
    cover_saved = False
    for i in range(n):
        T = i / FPS
        k = max(j for j, s in enumerate(starts) if s <= T + 1e-9)
        d, fn = SCENES[k]
        frame = fn(T - starts[k], d)
        # transição: a cena seguinte entra por cima nos últimos XFADE segundos
        if k + 1 < len(SCENES) and T > starts[k] + d - XFADE:
            nd, nfn = SCENES[k + 1]
            nxt = nfn(T - starts[k + 1] if T >= starts[k + 1] else 0.0, nd)
            a = ease_in_out((T - (starts[k] + d - XFADE)) / XFADE)
            frame = Image.blend(frame, nxt, a)
        progress_bar(frame, T, total)
        if not cover_saved and T >= 2.6:
            frame.save(HERE / 'capa.jpg', quality=92)
            cover_saved = True
        proc.stdin.write(frame.tobytes())
    proc.stdin.close()
    proc.wait()
    print(out, f'{total:.1f}s', n, 'frames')


if __name__ == '__main__':
    main()
