#!/usr/bin/env python3
"""W02 evidence: burn an identifying label bar (source path + SHA-256 prefix + viewport)
into a PNG before it is opened/inspected, so an image read can never be mis-attributed.
Usage: w02-burn.py OUT.png [WxH] LABEL PATH [PATH...]"""
import hashlib, os, sys
from PIL import Image, ImageDraw, ImageFont


def font(size):
    for p in ("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
              "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def sha(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for c in iter(lambda: f.read(65536), b""):
            h.update(c)
    return h.hexdigest()


def main():
    out = sys.argv[1]
    rest = sys.argv[2:]
    scale = None
    if rest and "x" in rest[0] and rest[0].split("x")[0].isdigit():
        scale = tuple(int(v) for v in rest.pop(0).split("x"))
    label = rest.pop(0)
    paths = rest

    f = font(15)
    gap = 8
    imgs, labels = [], []
    for p in paths:
        im = Image.open(p).convert("RGB")
        if scale:
            im = im.resize(scale, Image.LANCZOS)
        imgs.append(im)
        labels.append(f"{label} :: {os.path.basename(p)} :: sha={sha(p)[:16]} :: {im.width}x{im.height}")

    d = ImageDraw.Draw(Image.new("RGB", (8, 8)))
    bar = 22 * len(labels) + 8
    w = max([sum(i.width for i in imgs) + gap * (len(imgs) - 1)]
            + [int(d.textlength(t, font=f)) + 14 for t in labels])
    h = max(i.height for i in imgs) + bar
    canvas = Image.new("RGB", (w, h), (16, 16, 20))
    d = ImageDraw.Draw(canvas)
    for i, t in enumerate(labels):
        d.text((6, 5 + i * 22), t, font=f, fill=(255, 240, 120))
    x = 6
    for im in imgs:
        canvas.paste(im, (x, bar))
        x += im.width + gap
    d.line([(0, bar - 3), (w, bar - 3)], fill=(255, 240, 120), width=3)
    canvas.save(out)
    print(out, canvas.size)


main()
