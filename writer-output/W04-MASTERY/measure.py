#!/usr/bin/env python3
"""W04-MASTERY hash-bound visual measurement.

Reads ONLY PNG bytes (never the vision channel). For every frame:
  * sha256 + PIL dims                                    (image identity)
  * overall ink ratio (pixels differing from modal background)
  * per-pane ink ratio + largest contiguous blank band    (dead-zone / density measure)
  * per-pane tesseract OCR line count + word count        (content completeness)
  * key-string hits for the state under test

Pane geometry is read from the sibling CAPTURE_RECEIPT.json DOM probe (rects are captured in
the same page load that produced the frame), so the crop regions are bound to the frame.

Usage:  python3 writer-output/W04-MASTERY/measure.py <evidence-dir>
Writes MEASURES.json next to the frames.
"""
import hashlib
import json
import subprocess
import sys
from collections import Counter
from pathlib import Path

import warnings
warnings.filterwarnings('ignore')
from PIL import Image

THRESHOLD = 18


def ink_ratio(img, box=None):
    region = img.crop(box) if box else img
    region = region.convert("RGB")
    pixels = list(region.getdata())
    modal = Counter(pixels).most_common(1)[0][0]
    ink = sum(1 for p in pixels if max(abs(p[i] - modal[i]) for i in range(3)) > THRESHOLD)
    return round(ink / max(1, len(pixels)), 4)


def blank_bands(img, box, threshold=0.006):
    region = img.crop(box).convert("RGB")
    w, h = region.size
    px = region.load()
    row_ink = []
    for y in range(h):
        modal = None
        counts = Counter()
        for x in range(0, w, 2):
            counts[px[x, y]] += 1
        modal = counts.most_common(1)[0][0]
        row_ink.append(sum(1 for x in range(0, w, 2)
                           if max(abs(px[x, y][i] - modal[i]) for i in range(3)) > THRESHOLD) / max(1, w // 2))
    bands, start = [], None
    for y, value in enumerate(row_ink):
        if value < threshold:
            if start is None:
                start = y
        else:
            if start is not None and y - start >= 60:
                bands.append({"top": start, "height": y - start})
            start = None
    if start is not None and h - start >= 60:
        bands.append({"top": start, "height": h - start})
    return bands


def ocr(img, box=None):
    region = img.crop(box) if box else img
    path = Path("/tmp/opencode/w04/_ocr.png")
    path.parent.mkdir(parents=True, exist_ok=True)
    Image.frombytes("RGB", region.size, region.tobytes()).save(path, format="PNG")
    try:
        out = subprocess.run(["tesseract", str(path), "-", "-l", "eng"],
                             capture_output=True, text=True, timeout=120).stdout
    except Exception:
        return {"lines": 0, "words": 0, "text": ""}
    lines = [ln.strip() for ln in out.splitlines() if ln.strip()]
    return {"lines": len(lines), "words": sum(len(ln.split()) for ln in lines), "text": "\n".join(lines)}


KEY_STRINGS = ["Mastery workbench", "FIXTURE", "SYNTHETIC_DEMO_SEED", "Explainability structure",
               "Mastery judgment dimension", "Evaluation basis", "MASTERED", "REVALIDATION_REQUIRED",
               "How this workspace works", "Context that appears on selection"]


def main():
    directory = Path(sys.argv[1])
    receipt_path = directory / "CAPTURE_RECEIPT.json"
    receipt = json.loads(receipt_path.read_text()) if receipt_path.exists() else {"frames": []}
    rects_by_viewport = {f.get("viewport"): f.get("metrics", {}).get("rect", {}) for f in receipt.get("frames", [])}
    results = []
    for png in sorted(directory.glob("*.png")):
        sha = hashlib.sha256(png.read_bytes()).hexdigest()
        img = Image.open(png).convert("RGB")
        w, h = img.size
        rects = rects_by_viewport.get(f"{w}x{h}", {})
        entry = {"file": png.name, "sha256": sha, "dims": f"{w}x{h}",
                 "bytes": png.stat().st_size, "ink": ink_ratio(img)}
        for name in ("left", "center", "right"):
            r = rects.get(name)
            if not r or r.get("w", 0) <= 0 or r.get("h", 0) <= 0:
                entry[name] = {"box": None, "collapsed": True}
                continue
            box = (r["x"], r["y"], r["x"] + r["w"], r["y"] + r["h"])
            box = (max(0, box[0]), max(0, box[1]), min(w, box[2]), min(h, box[3]))
            text = ocr(img, box)
            entry[name] = {
                "box": box,
                "ink": ink_ratio(img, box),
                "blankBandsGE60px": blank_bands(img, box),
                "ocrLines": text["lines"], "ocrWords": text["words"],
            }
        centre_box = entry.get("center", {}).get("box")
        centre_text = ocr(img, centre_box)["text"] if centre_box else ""
        entry["keyHits"] = [k for k in KEY_STRINGS if k.lower() in centre_text.lower()]
        results.append(entry)
    (directory / "MEASURES.json").write_text(json.dumps({
        "proof": "w04-mastery-hash-bound-measure",
        "method": "sha256 + PIL + pixel ink + blank bands + tesseract OCR of the SAME bytes",
        "visionChannel": "NOT USED — stale-frame conflict observed 2026-09-30; see report",
        "frames": results,
    }, indent=2))
    for r in results:
        summary = {k: r.get(k) for k in ("file", "sha256", "dims", "ink")}
        for pane in ("left", "center", "right"):
            if pane in r:
                summary[pane] = {"ink": r[pane]["ink"], "blank": r[pane]["blankBandsGE60px"],
                                 "lines": r[pane]["ocrLines"], "words": r[pane]["ocrWords"]}
        summary["keyHits"] = r["keyHits"]
        print(json.dumps(summary, ensure_ascii=False))


if __name__ == "__main__":
    main()
