#!/usr/bin/env python3
"""Shared-component visual evidence 2 — file-byte grounding for the F1..F5 proof.

For every PNG in writer-output/_coordinator/shared-component-fix2/evidence/{before,after}:
  - SHA-256, dimensions, byte length
  - per-file OCR (tesseract; sparse + single-line heading crops at x3)
  - ink / blank-band geometry (rows with no ink; longest blank run)
Plus filename-burned before/after composites per pair, and a heading start/end
clipping proof derived from the heading-crop OCR against the recorded rects.

The image channel is orientation-only as an acceptance oracle; every claim here
is grounded in these byte measures.
"""
import json, subprocess, hashlib, os, sys
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EV = os.path.join(ROOT, 'writer-output/_coordinator/shared-component-fix2/evidence')
COMPOSITES = os.path.join(EV, 'composites')

def ocr(img, psm):
    if img.size[0] < 2 or img.size[1] < 2:
        return ''
    tmp = '/tmp/opencode/ocr-evidence2.png'
    img.save(tmp)
    out = subprocess.run(['tesseract', tmp, 'stdout', '--psm', str(psm)], capture_output=True, text=True)
    return ' '.join(out.stdout.split())

def ink_geometry(img, threshold=24):
    g = img.convert('L')
    w, h = g.size
    px = g.load()
    step = max(1, w // 480)  # bounded sampling for speed
    rows = []
    ink = 0
    total = 0
    for y in range(h):
        row_ink = 0
        for x in range(0, w, step):
            v = px[x, y]
            total += 1
            if v > threshold:
                row_ink += 1
                ink += 1
        rows.append(row_ink > 0)
    blank_runs = []
    run = 0
    for r in rows:
        if not r:
            run += 1
        else:
            if run:
                blank_runs.append(run)
            run = 0
    if run:
        blank_runs.append(run)
    return {
        'inkRatio': round(ink / max(1, total), 4),
        'blankRows': sum(1 for r in rows if not r),
        'blankRowFraction': round(sum(1 for r in rows if not r) / h, 4),
        'longestBlankBandRows': max(blank_runs) if blank_runs else 0,
    }

def file_record(path):
    with open(path, 'rb') as fh:
        data = fh.read()
    img = Image.open(path)
    return {
        'file': os.path.basename(path),
        'sha256': hashlib.sha256(data).hexdigest(),
        'bytes': len(data),
        'width': img.size[0],
        'height': img.size[1],
        'ocrSparse': ocr(img, 11)[:400],
        **ink_geometry(img),
    }

def main():
    metrics = {}
    for label in ('before', 'after'):
        with open(os.path.join(EV, f'metrics-{label}.json')) as fh:
            metrics[label] = json.load(fh)

    index = {'schemaVersion': 1, 'proof': 'shared-component-visual-fix2-file-byte-evidence', 'frames': [], 'headingClippingProof': []}

    for label in ('before', 'after'):
        d = os.path.join(EV, label)
        for name in sorted(os.listdir(d)):
            if not name.endswith('.png'):
                continue
            rec = file_record(os.path.join(d, name))
            rec['label'] = label
            # heading crops from recorded rects (single-line OCR at x3)
            frame = next((f for f in metrics[label]['frames'] if f.get('metrics') and os.path.basename(f.get('file', '')) == name), None)
            crops = []
            if frame:
                img = Image.open(os.path.join(d, name))
                for h in frame['metrics']['headings']:
                    r = h.get('rect') or {}
                    if not r or r['width'] < 2 or r['height'] < 2:
                        continue
                    x0, y0 = max(0, r['x']), max(0, r['y'])
                    x1, y1 = min(img.size[0], r['x'] + r['width']), min(img.size[1], r['y'] + r['height'])
                    if x1 - x0 < 2 or y1 - y0 < 2:
                        continue
                    crop = img.crop((x0, y0, x1, y1)).resize(((x1 - x0) * 3, (y1 - y0) * 3))
                    text = ocr(crop, 7)
                    head = h['text'].split()[0] if h['text'] else ''
                    mid = h['text'][:12]
                    tail = h['text'][-14:]
                    crops.append({
                        'text': h['text'],
                        'direction': h['direction'],
                        'dirAttr': h.get('dirAttr'),
                        'ocr': text,
                        'headTokenVisible': bool(head) and head.lower() in text.lower(),
                        'headPrefixVisible': bool(mid) and mid.lower() in text.lower(),
                        'tailVisible': bool(tail) and tail.lower() in text.lower(),
                    })
            rec['headingCrops'] = crops
            index['frames'].append(rec)

    # focused clipping proof: same heading, before vs after
    def crops_for(label, name):
        rec = next(r for r in index['frames'] if r['label'] == label and r['file'] == name)
        return rec['headingCrops']
    for name in ('visualize-1440x1000-tree.png', 'rq-1440x1000-empty.png'):
        proof = {'frame': name, 'before': crops_for('before', name), 'after': crops_for('after', name)}
        index['headingClippingProof'].append(proof)

    # filename-burned composites per before/after pair
    os.makedirs(COMPOSITES, exist_ok=True)
    pairs = sorted(set(f['file'] for f in index['frames'] if f['label'] == 'before'))
    comp = []
    for name in pairs:
        b = Image.open(os.path.join(EV, 'before', name)).convert('RGB')
        a = Image.open(os.path.join(EV, 'after', name)).convert('RGB')
        w, h = b.size
        canvas = Image.new('RGB', (w * 2 + 12, h + 26), (10, 12, 16))
        canvas.paste(b, (0, 26))
        canvas.paste(a, (w + 12, 26))
        draw = ImageDraw.Draw(canvas)
        draw.text((6, 6), f'BEFORE {name}', fill=(255, 210, 120))
        draw.text((w + 18, 6), f'AFTER {name}', fill=(140, 255, 190))
        out = os.path.join(COMPOSITES, f'pair-{name}')
        canvas.save(out)
        data = open(out, 'rb').read()
        comp.append({'file': os.path.basename(out), 'pair': name, 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data), 'width': canvas.size[0], 'height': canvas.size[1]})
    index['composites'] = comp

    with open(os.path.join(EV, 'file-byte-evidence.json'), 'w') as fh:
        json.dump(index, fh, indent=2, ensure_ascii=False)
    print(f"frames={len(index['frames'])} composites={len(comp)} -> {os.path.join(EV, 'file-byte-evidence.json')}")

if __name__ == '__main__':
    main()
