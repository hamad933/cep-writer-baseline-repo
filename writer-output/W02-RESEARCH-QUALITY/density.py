"""W02-RESEARCH-QUALITY pixel-density audit (L1/L2 evidence).

Measures real pixels of the hash-bound captures:
  - ink density per region (fraction of pixels that differ from the region's modal background)
  - largest empty rectangle inside each region (dead-zone detection)
  - palette / chroma presence (the surface must not read as flat grey)

Usage: python3 writer-output/W02-RESEARCH-QUALITY/density.py <capture-dir>
"""
import json
import sys
from pathlib import Path

from PIL import Image

REGIONS = {
    # name: (x0, y0, x1, y1) as fractions of the image, measured against the shared shell geometry
    'topchrome': (0.0, 0.0, 1.0, 0.165),
    'leftpane': (0.0, 0.175, 0.20, 0.955),
    'center': (0.21, 0.175, 0.71, 0.955),
    'rightpane': (0.72, 0.175, 1.0, 0.955),
    'bottom': (0.0, 0.955, 1.0, 1.0),
}


def largest_empty_rect(hist_rows, w, h, threshold=6):
    """Largest all-background rectangle. hist_rows[r][c] = 1 if pixel is 'ink' else 0."""
    best = (0, None)
    heights = [0] * w
    for r in range(h):
        row = hist_rows[r]
        for c in range(w):
            heights[c] = heights[c] + 1 if row[c] else 0
        stack = []
        for c in range(w + 1):
            cur = heights[c] if c < w else 0
            start = c
            while stack and stack[-1][1] > cur:
                idx, hgt = stack.pop()
                area = hgt * (c - idx)
                if area > best[0]:
                    best = (area, (idx, r - hgt + 1, c, r + 1))
                start = idx
            stack.append((start, cur))
    return best


def analyse(path: Path):
    img = Image.open(path).convert('RGB')
    W, H = img.size
    px = img.load()
    out = {'image': str(path), 'width': W, 'height': H, 'regions': {}}
    for name, (fx0, fy0, fx1, fy1) in REGIONS.items():
        x0, y0 = int(fx0 * W), int(fy0 * H)
        x1, y1 = int(fx1 * W), int(fy1 * H)
        w, h = x1 - x0, y1 - y0
        if w < 20 or h < 20:
            continue
        # modal background = median-ish colour sampled on a coarse grid
        samples = [px[x, y] for y in range(y0, y1, max(1, h // 40)) for x in range(x0, x1, max(1, w // 40))]
        samples.sort(key=lambda c: c[0] + c[1] + c[2])
        bg = samples[len(samples) // 2]
        ink = 0
        chroma = 0
        hist = []
        for y in range(y0, y1):
            row = []
            for x in range(x0, x1):
                c = px[x, y]
                d = abs(c[0] - bg[0]) + abs(c[1] - bg[1]) + abs(c[2] - bg[2])
                is_ink = 1 if d > 42 else 0
                ink += is_ink
                if max(c) - min(c) > 34:
                    chroma += 1
                row.append(is_ink)
            hist.append(row)
        total = w * h
        area, box = largest_empty_rect(hist, w, h)
        out['regions'][name] = {
            'box': [x0, y0, x1, y1],
            'bg': list(bg),
            'inkDensity': round(ink / total, 4),
            'chromaRatio': round(chroma / total, 4),
            'largestEmptyBox': list(box) if box else None,
            'largestEmptyFraction': round(area / total, 4) if box else None,
        }
    return out


def main():
    target = Path(sys.argv[1] if len(sys.argv) > 1 else 'writer-output/W02-RESEARCH-QUALITY/analysis')
    files = sorted(target.glob('*.png'))
    report = {'schemaVersion': 1, 'unit': 'W02-RESEARCH-QUALITY', 'surface': 'rq',
              'method': 'PIL pixel audit: ink density + chroma + largest empty rectangle per region',
              'files': []}
    for f in files:
        try:
            report['files'].append(analyse(f))
        except Exception as exc:  # keep the audit complete
            report['files'].append({'image': str(f), 'error': str(exc)})
    out = target / 'DENSITY.json'
    out.write_text(json.dumps(report, indent=2))
    for f in report['files']:
        if 'error' in f:
            print(f['image'], 'ERROR', f['error'])
            continue
        print(Path(f['image']).name)
        for name, r in f['regions'].items():
            print(f"  {name:<11} ink={r['inkDensity']:.3f} chroma={r['chromaRatio']:.3f} "
                  f"empty={r['largestEmptyFraction']:.3f} box={r['largestEmptyBox']}")
    print('written', out)


if __name__ == '__main__':
    main()
