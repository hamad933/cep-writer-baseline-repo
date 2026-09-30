#!/usr/bin/env python3
"""Ink/density metric for W03-SCENARIOS: same edge-ink formula on reference and candidate bytes,
plus per-region breakdown (topbar / left / center / right) for L2 comparison."""
import hashlib, json, os, sys
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
REF = os.path.join(ROOT, 'cep-writer/references/visual/02_SIMULATION_AND_ENTERPRISE/02_SCENARIOS/Cybersecurity Scenario Timeline Dashboard(1).png')
OUT_DIR = os.path.join(os.path.dirname(__file__), 'evidence', sys.argv[1] if len(sys.argv) > 1 else 'evidence')

def ink(im):
    im = im.convert('L'); w, h = im.size; px = im.load()
    tot = edge = 0
    for y in range(1, h - 1):
        for x in range(1, w - 1):
            tot += 1
            gx = abs(px[x + 1, y] - px[x - 1, y]); gy = abs(px[x, y + 1] - px[x, y - 1])
            if gx + gy > 24: edge += 1
    return round(edge / max(tot, 1), 4)

REGIONS = {'topbar': (0, 0, 1505, 120), 'left': (0, 180, 310, 1045),
           'center': (310, 180, 1085, 1045), 'right': (1085, 180, 1505, 1045)}

ref = Image.open(REF)
ref_ink = ink(ref)
ref_regions = {k: ink(ref.crop(v)) for k, v in REGIONS.items()}

frames = []
for name in sorted(os.listdir(OUT_DIR)):
    if not name.endswith('.png'): continue
    path = os.path.join(OUT_DIR, name)
    data = open(path, 'rb').read()
    im = Image.open(path)
    entry = {'file': name, 'path': os.path.relpath(path, ROOT), 'sha256': hashlib.sha256(data).hexdigest(),
             'bytes': len(data), 'dims': f'{im.size[0]}x{im.size[1]}', 'ink': ink(im)}
    if im.size == (1505, 1045) and '-en-' in name:
        entry['regions'] = {k: ink(im.crop(v)) for k, v in REGIONS.items()}
        entry['ratios'] = {k: round(entry['regions'][k] / ref_regions[k], 2) for k in REGIONS}
        entry['ratio'] = round(entry['ink'] / ref_ink, 2)
    frames.append(entry)

receipt = {'schemaVersion': 1, 'proof': 'W03-SCENARIOS-INK',
           'reference': os.path.relpath(REF, ROOT), 'referenceInk': ref_ink, 'referenceRegions': ref_regions,
           'metric': 'edge-ink fraction: |dx|+|dy|>24 over interior pixels', 'frames': frames}
with open(os.path.join(OUT_DIR, 'INK.json'), 'w') as fh: json.dump(receipt, fh, indent=1)
print(json.dumps({'referenceInk': ref_ink, 'frames': len(frames),
                  'en1505': [f for f in frames if f.get('ratio')]}, indent=1))
