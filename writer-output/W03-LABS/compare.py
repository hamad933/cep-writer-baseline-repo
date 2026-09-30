#!/usr/bin/env python3
"""W03-LABS · L1/L2 region comparison: reference vs candidate (ink + OCR, same bytes).

Usage: python3 writer-output/W03-LABS/compare.py <candidate.png> [reference.png]
"""
import sys, json, hashlib, os, subprocess, tempfile
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
REF = os.path.join(ROOT, 'cep-writer/references/visual/02_SIMULATION_AND_ENTERPRISE/03_LABS/Cybersecurity Lab Task Graph Dashboard(2).png')

# Region boxes (x0,y0,x1,y1) — reference measured from its own pixels, candidate from its DOM probe.
REGIONS_REF = {
    'left':   (0, 182, 272, 1010),
    'center': (272, 182, 1085, 1010),
    'right':  (1085, 182, 1505, 1010),
    'toolbar': (272, 134, 1505, 182),
}
REGIONS_CAND = {
    'left':   (0, 182, 304, 1006),
    'center': (315, 182, 1074, 1006),
    'right':  (1085, 182, 1505, 1006),
    'toolbar': (315, 134, 1505, 182),
}


def sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(65536), b''):
            h.update(chunk)
    return h.hexdigest()


def ink(im):
    g = im.convert('L')
    hist = g.histogram()
    bg = max(range(len(hist)), key=lambda i: hist[i])
    px = list(g.getdata())
    return sum(1 for p in px if abs(p - bg) > 18) / max(1, len(px))


def ocr(im):
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp:
        im.save(tmp.name)
    out = subprocess.run(['tesseract', tmp.name, 'stdout'], capture_output=True, text=True).stdout
    os.unlink(tmp.name)
    return ' '.join(out.split())


def main():
    cand = sys.argv[1]
    ref = sys.argv[2] if len(sys.argv) > 2 else REF
    report = {'candidate': {'path': cand, 'sha256': sha256(cand), 'dims': '%dx%d' % Image.open(cand).size},
              'reference': {'path': ref, 'sha256': sha256(ref), 'dims': '%dx%d' % Image.open(ref).size},
              'regions': {}}
    ci, ri = Image.open(cand), Image.open(ref)
    for name in REGIONS_REF:
        rc, cc = ri.crop(REGIONS_REF[name]), ci.crop(REGIONS_CAND[name])
        report['regions'][name] = {
            'ref_ink': round(ink(rc), 4), 'cand_ink': round(ink(cc), 4),
            'ref_ocr_chars': len(ocr(rc)), 'cand_ocr_chars': len(ocr(cc)),
        }
    out = os.path.join(os.path.dirname(__file__), 'COMPARE.json')
    with open(out, 'w') as f:
        json.dump(report, f, indent=2)
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
