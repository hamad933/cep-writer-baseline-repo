#!/usr/bin/env python3
"""W02-VISUALIZE capture pixel analysis (vision-channel-independent verification).

Purpose: verify that the hash-bound captures actually contain what the DOM probes claim,
using region ink-coverage and pre/post pixel diffs. Written because the session vision
channel returned a mismatched image for one capture (incident recorded in HANDOFF.md);
no claim below depends on eyeballing the PNG through the assistant image reader.
"""
import hashlib, json, os, sys
from PIL import Image, ImageChops

HERE = os.path.dirname(os.path.abspath(__file__))
CAP = os.path.join(HERE, 'captures')

def sha(p):
    h = hashlib.sha256()
    with open(p, 'rb') as f:
        for chunk in iter(lambda: f.read(65536), b''):
            h.update(chunk)
    return h.hexdigest()

def ink(img, box, bg_tol=42):
    """Fraction of pixels in box that differ from the pane background (approx darkest tone)."""
    crop = img.crop(box).convert('RGB')
    px = list(crop.getdata())
    if not px:
        return 0.0
    # background = most common quantized color
    from collections import Counter
    q = Counter(((r >> 3) << 6 | (g >> 3) << 3 | (b >> 3)) for r, g, b in px)
    bg = q.most_common(1)[0][0]
    bg_r, bg_g, bg_b = ((bg >> 6) & 0x1f) << 3, ((bg >> 3) & 0x1f) << 3, (bg & 0x1f) << 3
    hit = sum(1 for r, g, b in px if abs(r - bg_r) + abs(g - bg_g) + abs(b - bg_b) > bg_tol)
    return round(hit / len(px), 4)

def report(name):
    p = os.path.join(CAP, name)
    im = Image.open(p)
    w, h = im.size
    regions = {}
    if (w, h) == (1440, 1000):
        regions = {
            'leftPane': (0, 180, 315, 960),
            'centerPane': (315, 180, 1015, 960),
            'rightPane': (1015, 180, 1440, 960),
            'pathLaneBand': (330, 545, 1000, 730),
            'canvasToolbarBand': (0, 130, 1440, 205),
        }
    elif (w, h) == (1024, 900):
        regions = {
            'leftPane': (0, 180, 315, 880),
            'centerPane': (315, 180, 1015, 880),
            'rightPane': (1015, 180, 1024, 880),
        }
    out = {'file': name, 'dims': [w, h], 'bytes': os.path.getsize(p), 'sha256': sha(p),
           'ink': {k: ink(im, box) for k, box in regions.items()}}
    return out, im

def diff(a, b, box=None):
    ia = Image.open(os.path.join(CAP, a)).convert('RGB')
    ib = Image.open(os.path.join(CAP, b)).convert('RGB')
    if ia.size != ib.size:
        return {'pair': [a, b], 'identical': False, 'reason': 'size mismatch', 'sizes': [ia.size, ib.size]}
    if box:
        ia, ib = ia.crop(box), ib.crop(box)
    d = ImageChops.difference(ia, ib)
    hist = d.convert('L').histogram()
    total = sum(hist)
    changed = total - hist[0]
    strong = sum(hist[16:])
    return {'pair': [a, b], 'box': box, 'changedFraction': round(changed / total, 5),
            'strongChangedFraction': round(strong / total, 5), 'identical': changed == 0}

names = sorted(n for n in os.listdir(CAP) if n.startswith(('ev-', 'wt1-')) and n.endswith('.png'))
results = [report(n)[0] for n in names]

comparisons = [
    # PATH fix: the lane band must change (clipped card now fully rendered)
    diff('wt1-path-ar-1440-20261002T050849Z-fe1bb98d.png', 'ev-path-ar-1440-20261002T055425Z-1aa046bc.png', (330, 545, 1000, 730)),
    # bilingual toolbar: canvas toolbar band must change
    diff('wt1-canvas-ar-1440-20261002T050903Z-fe1bb98d.png', 'ev-canvas-ar-1440-20261002T055435Z-1aa046bc.png', (0, 130, 1440, 205)),
    # label guard: graph canvas area must change
    diff('wt1-graph-ar-1440-20261002T050832Z-fe1bb98d.png', 'ev-graph-ar-1440-20261002T055429Z-1aa046bc.png', (315, 395, 1015, 955)),
    # TREE unchanged by the last source edits (same pixels = no collateral change)
    diff('wt1-tree-ar-1440-20261002T050824Z-fe1bb98d.png', 'ev-tree-ar-1440-20261002T055417Z-1aa046bc.png'),
    # locale: AR vs EN must not be the same rendering
    diff('ev-tree-ar-1440-20261002T055417Z-1aa046bc.png', 'ev-tree-en-1440-20261002T055421Z-1aa046bc.png'),
    # determinism: WT capture and candidate capture of the same state
    diff('wt1-tree-en-1440-20261002T050913Z-fe1bb98d.png', 'ev-tree-en-1440-20261002T055421Z-1aa046bc.png'),
]

# crops for Controller audit (kept small; region of each fix)
crop_dir = os.path.join(HERE, 'crops')
os.makedirs(crop_dir, exist_ok=True)
crops = [
    ('ev-path-ar-1440-20261002T055425Z-1aa046bc.png', (330, 540, 1000, 735), 'fix-path-lane-ar-1440.png'),
    ('wt1-path-ar-1440-20261002T050849Z-fe1bb98d.png', (330, 540, 1000, 735), 'before-path-lane-ar-1440.png'),
    ('ev-canvas-ar-1440-20261002T055435Z-1aa046bc.png', (0, 130, 1440, 205), 'fix-canvas-toolbar-ar-1440.png'),
    ('wt1-canvas-ar-1440-20261002T050903Z-fe1bb98d.png', (0, 130, 1440, 205), 'before-canvas-toolbar-ar-1440.png'),
    ('ev-graph-ar-1440-20261002T055429Z-1aa046bc.png', (315, 395, 1015, 955), 'fix-graph-canvas-ar-1440.png'),
    ('wt1-graph-ar-1440-20261002T050832Z-fe1bb98d.png', (315, 395, 1015, 955), 'before-graph-canvas-ar-1440.png'),
]
crop_records = []
for src, box, out in crops:
    p = os.path.join(CAP, src)
    if not os.path.exists(p):
        continue
    dst = os.path.join(crop_dir, out)
    Image.open(p).crop(box).save(dst)
    crop_records.append({'file': f'writer-output/W02-VISUALIZE/crops/{out}', 'from': src, 'box': list(box), 'sha256': sha(dst)})

report_data = {'captures': results, 'comparisons': comparisons, 'crops': crop_records}
out_path = os.path.join(HERE, 'CAPTURE_ANALYSIS.json')
with open(out_path, 'w') as f:
    json.dump(report_data, f, indent=1)
print(json.dumps(report_data, indent=1))
