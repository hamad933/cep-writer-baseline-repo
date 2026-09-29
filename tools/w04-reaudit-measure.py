#!/usr/bin/env python3
"""W04 visual re-audit measurement (R3 / R7 of governance §8).

Reads ONLY file bytes. For every PNG under writer-output/W04/reaudit-evidence/<label>/:

  * SHA-256 + PIL dimensions                  (identity / responsive proof)
  * ink ratio                                 (share of pixels differing from the modal
                                               background colour by > threshold)
  * blank horizontal bands                    (contiguous row runs whose ink ratio is
                                               below `--blank-threshold`; blank-band
                                               geometry is the "unexplained whitespace"
                                               measure governance §7 requires)
  * per-file OCR word count + key-string hits (tesseract, English tessdata; Arabic copy is
                                               not OCR-able with the installed language set
                                               and is therefore reported as `ocrArabic: n/a`)

Usage:
    python3 tools/w04-reaudit-measure.py --label before
    python3 tools/w04-reaudit-measure.py --label after  --keys evidence,reviews,mastery,portfolio

Writes MEASURES.json next to the captured frames.
"""
import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
BASE = ROOT / "writer-output" / "W04" / "reaudit-evidence"

# Key strings that must be present for a state to be considered materially rendered.
# Each entry: surface -> state -> [strings that SHOULD be found by OCR (English copy only)].
KEY_STRINGS = {
    "evidence": {
        "*": ["Evidence workbench"],
        "candidate-submitted": ["SUBMITTED", "FOR", "INTAKE"],
        "admitted-immutable": ["ADMITTED"],
    },
    "reviews": {
        "*": ["Reviews workbench"],
        "in-review-with-findings": ["IN", "REVIEW"],
        "ready-for-decision": ["READY", "FOR", "DECISION"],
        "decision-issued": ["ACCEPT", "WITH", "LIMITATIONS"],
    },
    "mastery": {
        "*": ["Mastery"],
        "fixture-mastered": ["MASTERED"],
        "fixture-second-row": ["INSUFFICIENT", "EVIDENCE"],
    },
    "portfolio": {
        "*": ["Portfolio"],
        "assembly-one-reference": ["Re", "audit"],
        "assembly-two-references": ["Re", "audit"],
    },
}


def sha256_of(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 16), b""):
            h.update(chunk)
    return h.hexdigest()


def image_measures(path: Path, blank_threshold: float, rects: dict | None = None):
    with Image.open(path) as im:
        width, height = im.size
        rgb = im.convert("RGB")
        pixels = list(rgb.getdata())
    total = len(pixels)
    # modal background colour
    common = Counter(pixels).most_common(1)[0]
    bg, bg_count = common[0], common[1]
    grid = bytearray(total)
    for i, (r, g, b) in enumerate(pixels):
        if (abs(r - bg[0]) + abs(g - bg[1]) + abs(b - bg[2])) > 45:
            grid[i] = 1
    ink_ratio = sum(grid) / total
    row_ink = [sum(grid[row * width:(row + 1) * width]) / width for row in range(height)]
    bands = _bands(row_ink, blank_threshold)
    result = {
        "width": width,
        "height": height,
        "backgroundColour": "#%02x%02x%02x" % bg,
        "backgroundShare": round(bg_count / total, 4),
        "inkRatio": round(ink_ratio, 4),
        "blankBands40pxPlus": bands,
        "blankBandCount": len(bands),
        "blankBandPixels": sum(b["height"] for b in bands),
        "blankBandShare": round(sum(b["height"] for b in bands) / height, 4),
        "longestBlankBand": max((b["height"] for b in bands), default=0),
        "regions": {},
    }
    for sel, rect in (rects or {}).items():
        if not rect or rect["width"] <= 0 or rect["height"] <= 0:
            continue
        # Inset by 6px so a pane's 1px frame / scrollbar column, which runs the full height,
        # cannot suppress every blank-band detection.
        x0, y0 = max(0, rect["x"] + 6), max(0, rect["y"] + 4)
        x1 = min(width, rect["x"] + rect["width"] - 6)
        y1 = min(height, rect["y"] + rect["height"] - 4)
        if x1 <= x0 or y1 <= y0:
            continue
        # Region ink is measured against the REGION's own modal colour: a pane background
        # differs from the page background and must not count as ink.
        region_pixels = [
            pixels[y * width + x] for y in range(y0, y1) for x in range(x0, x1)
        ]
        rbg = Counter(region_pixels).most_common(1)[0][0]
        region_ink = []
        region_total = 0
        region_hits = 0
        for y in range(y0, y1):
            hits = 0
            for x in range(x0, x1):
                r, g, b = pixels[y * width + x]
                if (abs(r - rbg[0]) + abs(g - rbg[1]) + abs(b - rbg[2])) > 45:
                    hits += 1
            width_r = x1 - x0
            region_hits += hits
            region_total += width_r
            region_ink.append(hits / width_r)
        rbands = _bands(region_ink, blank_threshold)
        result["regions"][sel] = {
            "x": x0, "y": y0, "width": x1 - x0, "height": y1 - y0,
            "backgroundColour": "#%02x%02x%02x" % rbg,
            "inkRatio": round(region_hits / region_total, 4),
            "longestBlankBand": max((b["height"] for b in rbands), default=0),
            "blankBandShare": round(sum(b["height"] for b in rbands) / max(1, y1 - y0), 4),
        }
    return result


def _bands(row_ink, threshold):
    bands = []
    start = None
    for y, ratio in enumerate(row_ink):
        if ratio < threshold:
            if start is None:
                start = y
        else:
            if start is not None and y - start >= 40:
                bands.append({"from": start, "to": y - 1, "height": y - start})
            start = None
    if start is not None and len(row_ink) - start >= 40:
        bands.append({"from": start, "to": len(row_ink) - 1, "height": len(row_ink) - start})
    return bands


def ocr_words(path: Path) -> dict:
    """Per-file OCR. Text is inverted first because every reference/current frame is dark."""
    try:
        with Image.open(path) as im:
            grey = im.convert("L")
            inverted = grey.point(lambda p: 255 - p)
            tmp = Path("/tmp/opencode/w04-ocr")
            tmp.mkdir(parents=True, exist_ok=True)
            out = tmp / (path.stem + ".png")
            inverted.save(out)
            proc = subprocess.run(
                ["tesseract", str(out), "stdout", "--psm", "6"],
                capture_output=True, text=True, timeout=180,
            )
            text = proc.stdout or ""
    except Exception as exc:  # pragma: no cover - measurement must not crash the loop
        return {"ocrError": str(exc), "words": 0, "text": ""}
    words = [w for w in re.split(r"\s+", text) if w.strip()]
    return {"words": len(words), "text": re.sub(r"\s+", " ", text).strip()[:4000]}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--label", default="current")
    parser.add_argument("--keys", default="")
    parser.add_argument("--blank-threshold", type=float, default=0.004)
    parser.add_argument("--reference", action="store_true",
                        help="measure the four CURRENT_FINAL_REFERENCE PNGs instead of a capture")
    args = parser.parse_args()

    if args.reference:
        refdir = ROOT / "cep-writer" / "references" / "visual" / "03_PROGRESS_AND_EVIDENCE"
        refs = {
            "evidence": refdir / "01_EVIDENCE_INTAKE" / "Cybersecurity Evidence Dashboard in Arabic(1).png",
            "reviews": refdir / "02_REVIEWS" / "Cybersecurity Evidence Review Dashboard.png",
            "mastery": refdir / "03_MASTERY" / "Arabic Cybersecurity Mastery Dashboard.png",
            "portfolio": refdir / "04_PORTFOLIO" / "Cybersecurity Portfolio Evidence Dashboard.png",
        }
        folder = BASE / "reference"
        folder.mkdir(parents=True, exist_ok=True)
        pngs = [p for p in refs.values() if p.is_file()]
        surface_of = {str(p): k for k, p in refs.items()}
        # Pane rectangles read off the 1505x1045 reference geometry (approximate to +/-6px).
        # They are used ONLY for region-level ink/blank density comparison; they are not a
        # pixel template for the implementation.
        def _rects(left_w, center_x, center_w, right_x, right_w):
            return {
                "#leftPane": {"x": 16, "y": 118, "width": left_w, "height": 826},
                "#centerPane": {"x": center_x, "y": 118, "width": center_w, "height": 826},
                "#rightPane": {"x": right_x, "y": 118, "width": right_w, "height": 826},
            }
        rects_by_file = {
            refs["evidence"].name: _rects(248, 275, 886, 1172, 316),
            refs["reviews"].name: _rects(215, 244, 893, 1150, 320),
            refs["mastery"].name: _rects(285, 314, 926, 1252, 238),
            refs["portfolio"].name: _rects(215, 244, 926, 1183, 307),
        }
    else:
        folder = BASE / args.label
        if not folder.is_dir():
            print(f"missing capture folder: {folder}", file=sys.stderr)
            return 2
        surface_of = {}
        labels = [s for s in args.keys.split(",") if s]
        pngs = sorted(folder.glob("*.png"))
        if labels:
            pngs = [p for p in pngs if p.name.split("-")[0] in labels]

    if not args.reference:
        rects_by_file = {}
        receipt = folder / "CAPTURE_RECEIPT.json"
        if receipt.is_file():
            for fr in json.loads(receipt.read_text()).get("frames", []):
                rects_by_file[fr["file"]] = fr.get("metrics", {}).get("rects")

    frames = []
    for png in pngs:
        name = png.name
        if args.reference:
            surface = surface_of[str(png)]
            viewport = "reference"
            state = "reference"
        else:
            parts = name[:-4].split("-")
            surface = parts[0]
            viewport = parts[1]
            state = "-".join(parts[2:])
        entry = {
            "file": name,
            "surface": surface,
            "viewport": viewport,
            "state": state,
            "sha256": sha256_of(png),
            "bytes": png.stat().st_size,
        }
        entry.update(image_measures(png, args.blank_threshold, rects_by_file.get(name)))
        entry.update(ocr_words(png))
        expected = []
        table = KEY_STRINGS.get(surface, {})
        if not args.reference:
            expected.extend(table.get("*", []))
            expected.extend(table.get(state, []))
        entry["ocrKeyStrings"] = {k: (k.lower() in entry.get("text", "").lower()) for k in expected}
        entry["ocrKeyStringsAllPresent"] = all(entry["ocrKeyStrings"].values()) if expected else None
        frames.append(entry)

    receipt = {
        "schemaVersion": 1,
        "proof": "w04-visual-reaudit-measures",
        "label": args.label,
        "groundTruth": "file bytes only (sha256 / PIL dimensions / pixel ink geometry / tesseract OCR)",
        "ocrEngine": "tesseract 5 eng tessdata; Arabic copy is not OCR-able with the installed language set",
        "blankThreshold": args.blank_threshold,
        "frameCount": len(frames),
        "frames": frames,
    }
    out = folder / ("MEASURES-reference.json" if args.reference else "MEASURES.json")
    out.write_text(json.dumps(receipt, indent=2))
    print(f"measured {len(frames)} frames -> {out}")
    for f in frames:
        print(
            f"  {f['file']}: {f['width']}x{f['height']} ink={f['inkRatio']:.3f} "
            f"blank={f['blankBandShare']:.3f} longestBlank={f['longestBlankBand']} "
            f"words={f['words']} keys={f['ocrKeyStringsAllPresent']}"
        )
        for sel, reg in (f.get("regions") or {}).items():
            if sel in ("#leftPane", "#rightPane", "#centerPane"):
                print(
                    f"      {sel}: ink={reg['inkRatio']:.4f} "
                    f"longestBlank={reg['longestBlankBand']} blankShare={reg['blankBandShare']:.3f}"
                )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
