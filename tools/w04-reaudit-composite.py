#!/usr/bin/env python3
"""W04 visual re-audit composites (governance §10: self-identifying evidence).

The harness image channel is quarantined as an acceptance oracle
(`controller/12_execution/11_evidence_channel_integrity.md` §4.2), so every composite BURNS its
own identity into the pixels:

    header line .... proof, candidate label, generation timestamp
    panel captions . filename + SHA-256 (16) + viewport + state + role (REFERENCE / BEFORE / AFTER)

A composite therefore proves which files it was built from even when it is viewed through an
unreliable channel. The authoritative record is `MANIFEST.json` next to the composites, which
carries the full digests.

Usage:
    python3 tools/w04-reaudit-composite.py
"""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
BASE = ROOT / "writer-output" / "W04" / "reaudit-evidence"
OUT = BASE / "composites"
REF_DIR = ROOT / "cep-writer" / "references" / "visual" / "03_PROGRESS_AND_EVIDENCE"
CANDIDATE = "WORKTREE_VARIANT remediation (W04 surface record presentation)"
PANEL_H = 520
GAP = 10
MARGIN = 12

REFERENCES = {
    "evidence": REF_DIR / "01_EVIDENCE_INTAKE" / "Cybersecurity Evidence Dashboard in Arabic(1).png",
    "reviews": REF_DIR / "02_REVIEWS" / "Cybersecurity Evidence Review Dashboard.png",
    "mastery": REF_DIR / "03_MASTERY" / "Arabic Cybersecurity Mastery Dashboard.png",
    "portfolio": REF_DIR / "04_PORTFOLIO" / "Cybersecurity Portfolio Evidence Dashboard.png",
}


def sha256_of(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 16), b""):
            h.update(chunk)
    return h.hexdigest()


def load_font(size: int):
    try:
        return ImageFont.load_default(size=size)
    except TypeError:  # Pillow < 10
        return ImageFont.load_default()


FONT = load_font(16)
FONT_BIG = load_font(22)


def panel(image_path: Path, role: str, caption: str) -> Image.Image:
    with Image.open(image_path) as im:
        rgb = im.convert("RGB")
        width, height = rgb.size
        scale = PANEL_H / height
        resized = rgb.resize((max(1, int(width * scale)), PANEL_H), Image.LANCZOS)
    canvas = Image.new("RGB", (resized.width + 4, PANEL_H + 62), (8, 12, 22))
    canvas.paste(resized, (2, 60))
    draw = ImageDraw.Draw(canvas)
    draw.rectangle([0, 0, canvas.width - 1, 58], fill=(16, 24, 42))
    draw.text((8, 6), f"[{role}] {caption}", font=FONT, fill=(120, 220, 255))
    draw.text((8, 30), f"sha256 {sha256_of(image_path)[:16]} · {width}x{height}", font=FONT, fill=(150, 160, 180))
    return canvas


def build(surface: str, state: str, viewport: str, members) -> Path | None:
    panels = [panel(path, role, caption) for (path, role, caption) in members]
    total_w = sum(p.width for p in panels) + GAP * (len(panels) - 1) + MARGIN * 2
    header_h = 74
    out = Image.new("RGB", (total_w, PANEL_H + 62 + header_h), (6, 9, 17))
    draw = ImageDraw.Draw(out)
    draw.text((MARGIN, 10), f"W04 VISUAL RE-AUDIT COMPOSITE · {surface} · {viewport} · state={state}", font=FONT_BIG, fill=(240, 244, 255))
    draw.text((MARGIN, 40), f"{CANDIDATE} · generated {datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')} · roles: REFERENCE (CURRENT_FINAL_REFERENCE) | BEFORE | AFTER", font=FONT, fill=(150, 160, 180))
    x = MARGIN
    for p in panels:
        out.paste(p, (x, header_h))
        x += p.width + GAP
    OUT.mkdir(parents=True, exist_ok=True)
    name = f"{surface}-{viewport}-{state}.png"
    path = OUT / name
    out.save(path, optimize=True)
    return path


def main() -> int:
    before = {f["file"]: f for f in json.loads((BASE / "before" / "CAPTURE_RECEIPT.json").read_text())["frames"]}
    after = json.loads((BASE / "after" / "CAPTURE_RECEIPT.json").read_text())["frames"]
    manifest = {"schemaVersion": 1, "proof": "w04-reaudit-composites", "generatedAt": datetime.now(timezone.utc).isoformat(), "composites": []}
    built = 0
    for frame in after:
        surface, viewport, state = frame["surface"], frame["viewport"], frame["state"]
        members = []
        if surface in REFERENCES:
            members.append((REFERENCES[surface], "REFERENCE", REFERENCES[surface].name))
        if frame["file"] in before:
            members.append((BASE / "before" / frame["file"], "BEFORE", frame["file"]))
        members.append((BASE / "after" / frame["file"], "AFTER", frame["file"]))
        path = build(surface, state, viewport, members)
        built += 1
        manifest["composites"].append({
            "file": f"composites/{path.name}",
            "sha256": sha256_of(path),
            "bytes": path.stat().st_size,
            "surface": surface, "viewport": viewport, "state": state,
            "sources": [{"role": role, "file": str(p), "sha256": sha256_of(p)} for p, role, _ in members],
        })
    (OUT / "MANIFEST.json").write_text(json.dumps(manifest, indent=2))
    print(f"built {built} self-identifying composites -> {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
