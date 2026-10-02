#!/usr/bin/env python3
"""W03-LABS · pixel-truth reader for one rect of a capture (writer-local instrument).

Computes grayscale stddev / mean / ink for the exact rect measured from the same page
the screenshot was taken from, optionally crops the rect as its own image-identity artifact,
and optionally OCRs the rect with tesseract when the binary is available.

Usage:
  python3 writer-output/W03-LABS/pixelcheck.py <png> <x> <y> <w> <h> [--crop out.png] [--ocr]

Output: one JSON object on stdout.
"""
import sys, json, os, subprocess, tempfile, shutil

from PIL import Image, ImageOps


def stats(im):
    g = im.convert('L')
    px = list(g.tobytes())
    n = len(px)
    mean = sum(px) / n
    var = sum((p - mean) ** 2 for p in px) / n
    hist = g.histogram()
    bg = max(range(len(hist)), key=lambda i: hist[i])
    ink = sum(1 for p in px if abs(p - bg) > 18) / n
    return {'stddev': round(var ** 0.5, 2), 'mean': round(mean, 2), 'ink': round(ink, 4), 'bg': bg}


def ocr(im):
    """Read the rect with tesseract.

    Preprocessing is fixed and reported, not fitted per run: grayscale → invert when the
    surface is dark (light text on dark card) → 3x upscale → autocontrast, then page mode 6
    (block) before 3 (auto). A 142x95 card crop only resolves with that treatment; the mode
    and page mode actually used are returned so the read stays reproducible.
    """
    if not shutil.which('tesseract'):
        return {'available': False, 'text': '', 'prep': None, 'psm': None}
    g = im.convert('L')
    data = g.tobytes()
    mean = sum(data) / len(data)
    inverted = mean < 128
    if inverted:
        g = ImageOps.invert(g)
    g = g.resize((g.width * 3, g.height * 3), Image.LANCZOS)
    g = ImageOps.autocontrast(g)
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp:
        g.save(tmp.name)
    prep = f"{'invert' if inverted else 'gray'}+x3+autocontrast"
    try:
        for psm in ('6', '3'):
            out = subprocess.run(['tesseract', tmp.name, 'stdout', '--psm', psm], capture_output=True, text=True, timeout=60)
            text = ' '.join(out.stdout.split())
            if text:
                return {'available': True, 'text': text, 'prep': prep, 'psm': psm}
        return {'available': True, 'text': '', 'prep': prep, 'psm': '6,3 both empty'}
    finally:
        os.unlink(tmp.name)


def main():
    png, x, y, w, h = sys.argv[1], *[int(float(v)) for v in sys.argv[2:6]]
    rest = sys.argv[6:]
    crop_out = None
    want_ocr = False
    i = 0
    while i < len(rest):
        if rest[i] == '--crop':
            crop_out = rest[i + 1]
            i += 2
        elif rest[i] == '--ocr':
            want_ocr = True
            i += 1
        else:
            i += 1
    if not os.path.exists(png):
        print(json.dumps({'error': 'PNG_NOT_FOUND', 'path': png}))
        sys.exit(2)
    im = Image.open(png).convert('RGB')
    box = (x, y, x + w, y + h)
    if any(box[i] < 0 for i in (0, 1)) or box[2] > im.width or box[3] > im.height:
        print(json.dumps({'error': 'RECT_OUT_OF_FRAME', 'rect': list(box), 'frame': [im.width, im.height]}))
        sys.exit(3)
    crop = im.crop(box)
    report = {'path': png, 'rect': list(box), 'frame': [im.width, im.height], **stats(crop)}
    if crop_out:
        os.makedirs(os.path.dirname(os.path.abspath(crop_out)), exist_ok=True)
        crop.save(crop_out)
        report['crop'] = crop_out
    if want_ocr:
        report['ocr'] = ocr(crop)
    print(json.dumps(report))


if __name__ == '__main__':
    main()
