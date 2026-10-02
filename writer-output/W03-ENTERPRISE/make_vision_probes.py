#!/usr/bin/env python3
"""ENT-1 re-dispatch #2 — fresh vision-channel probes for CP-003 VV-01 / VV-02 / VV-03.

Every artifact is generated from EXACT CURRENT source evidence (capture label `ent1-rev1`,
commit 766ab95367dde5ce433a148cdecb602274fe6c0d / tree 5926fac34eaf680abbaf95bc18023cb6fd2ee868)
or from the two registered reference PNGs, and is recorded with byte ground truth
(path + sha256 + dims + bytes) so an image-channel read can be checked against those bytes
instead of being trusted on sight (visual-fidelity-review / VD-008).

Usage:  python3 writer-output/W03-ENTERPRISE/make-vision_probes.py   (see file name below)
Writes: writer-output/W03-ENTERPRISE/evidence/vision-probes/*.png + manifest.json
"""
import hashlib
import json
import os
import sys
from datetime import datetime, timezone

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
EV = os.path.join(ROOT, "writer-output", "W03-ENTERPRISE", "evidence")
OUT = os.path.join(EV, "vision-probes")
os.makedirs(OUT, exist_ok=True)

COMMIT = "766ab95367dde5ce433a148cdecb602274fe6c0d"
TREE = "5926fac34eaf680abbaf95bc18023cb6fd2ee868"

REF_A = os.path.join(
    ROOT, "cep-writer/references/visual/02_SIMULATION_AND_ENTERPRISE/"
         "01_ENTERPRISE_DIGITAL_TWIN/Enterprise Cybersecurity Topology Dashboard.png")
REF_B = os.path.join(
    ROOT, "cep-writer/references/visual/02_SIMULATION_AND_ENTERPRISE/"
         "01_ENTERPRISE_DIGITAL_TWIN/CEP_ENTERPRISE_DIGITAL_TWIN_REVISION_BASELINE_REFERENCE.png")
CAND = os.path.join(EV, "ent1-rev1", "ltr-1503-topology.png")

manifest = []


def sha256_file(p):
    h = hashlib.sha256()
    with open(p, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def dims(p):
    with open(p, "rb") as fh:
        b = fh.read(32)
    return b[16:20].to_bytes(4, "big").hex(), b[20:24].to_bytes(4, "big").hex()


def record(path, kind, note, embed=None):
    d = {}
    with open(path, "rb") as fh:
        head = fh.read(24)
    w = int.from_bytes(head[16:20], "big")
    h = int.from_bytes(head[20:24], "big")
    d.update({
        "file": os.path.relpath(path, ROOT),
        "sha256": sha256_file(path),
        "width": w,
        "height": h,
        "bytes": os.path.getsize(path),
        "kind": kind,
        "note": note,
    })
    if embed:
        d["embeddedText"] = embed
    manifest.append(d)
    return d


def font(sz):
    for cand in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ):
        if os.path.exists(cand):
            return ImageFont.truetype(cand, sz)
    return ImageFont.load_default(size=sz)


# --------------------------------------------------------------- VV-01 fresh canary
nonce = sys.argv[1] if len(sys.argv) > 1 else "8417"
W, H = 640, 220
img = Image.new("RGB", (W, H), (200, 0, 160))
d = ImageDraw.Draw(img)
lines = [
    (f"ENT1 VV01 CANARY {nonce}", (255, 235, 0), 44),
    (f"NONCE {nonce} FRESH 766AB95", (255, 255, 255), 34),
    ("MAGENTA 200 0 160", (0, 255, 220), 30),
]
y = 18
for text, col, sz in lines:
    d.text((24, y), text, font=font(sz), fill=col)
    y += sz + 22
p = os.path.join(OUT, f"vv01-canary-{nonce}.png")
img.save(p)
record(p, "VV-01_CANARY",
       "Fresh magenta canary minted in THIS session. A correct image-channel read returns this "
       "text on a magenta field; returning an application screenshot = the VD-008 mismatch again.",
       embed=[t for t, _, _ in lines])

# --------------------------------------------------------------- VV-02 fresh side-by-side
ref = Image.open(REF_A).convert("RGB")
cand = Image.open(CAND).convert("RGB")
ref_sha = sha256_file(REF_A)[:16]
cand_sha = sha256_file(CAND)[:16]
PAD, LBL = 16, 64
label_h = 60
target_w = 1200
ref_r = ref.resize((target_w, round(ref.height * target_w / ref.width)))
cand_r = cand.resize((target_w, round(cand.height * target_w / cand.width)))
sbs = Image.new("RGB", (target_w + 2 * PAD, LBL + label_h + ref_r.height + label_h + cand_r.height + PAD), (18, 26, 38))
ds = ImageDraw.Draw(sbs)
f = font(30)
f2 = font(24)
ds.text((PAD, 16), "REFERENCE (construction authority) " + ref_sha + "  1503x1046",
        font=f, fill=(255, 235, 0))
sbs.paste(ref_r, (PAD, LBL))
y = LBL + ref_r.height
ds.text((PAD, y + 12), f"CANDIDATE ent1-rev1 @ {COMMIT[:12]} sha={cand_sha} 1503x1046",
        font=f, fill=(0, 255, 200))
sbs.paste(cand_r, (PAD, y + label_h))
p = os.path.join(OUT, "vv02-sbs-reference-vs-ent1-rev1.png")
sbs.save(p)
record(p, "VV-02_SIDE_BY_SIDE",
       "Fresh side-by-side built from the CURRENT-SOURCE candidate capture (ent1-rev1) and the "
       "registered CURRENT_FINAL_REFERENCE. A correct read shows a yellow REFERENCE label band on "
       "top and a cyan CANDIDATE label band below it, each followed by a 1503x1046 dashboard image.",
       embed=[f"REFERENCE {ref_sha}", f"CANDIDATE ent1-rev1 {cand_sha}"])

# --------------------------------------------------------------- VV-03 fresh current-source crops
# (a) centre/top crop of the current-source frame: structure lives in the shell LEFT pane,
#     NOT inside the stage — the exact property VV-03 got wrong (it returned an after1 frame).
crop = Image.open(CAND).convert("RGB").crop((0, 190, 1080, 760))
p = os.path.join(OUT, "vv03-crop-ltr-1503-topology-ent1-rev1.png")
crop.save(p)
c = record(p, "VV-03_CURRENT_SOURCE_CROP",
           "Crop of the FRESH ent1-rev1 frame (commit 766ab95). Correct read: a dark app shell with a "
           "left 'Enterprise structure' list, a centre topology canvas with node cards, a right context "
           "column and an 'Enterprise digital twin' header — with NO duplicated structure rail inside the stage.")

# --------------------------------------------------------------- shell-header delta (after5 vs ent1-rev1)
a5 = Image.open(os.path.join(EV, "after5", "ltr-1503-topology.png")).convert("RGB").crop((200, 0, 1200, 60))
e1 = Image.open(CAND).convert("RGB").crop((200, 0, 1200, 60))
delta = Image.new("RGB", (1000, 156), (18, 26, 38))
dd = ImageDraw.Draw(delta)
dd.text((8, 2), "AFTER5 d2b3e47 shell header", font=font(20), fill=(255, 200, 120))
delta.paste(a5, (0, 26))
dd.text((8, 90), "ENT1-REV1 766ab95 shell header", font=font(20), fill=(120, 220, 255))
delta.paste(e1, (0, 114))
p = os.path.join(OUT, "shell-header-delta-after5-vs-ent1-rev1.png")
delta.save(p)
record(p, "SHELL_HEADER_DELTA",
       "The ONLY pixel delta between after5 and ent1-rev1 on every overlapping LTR frame: shell "
       "destination row, y=0..45. Enterprise surface starts at y=218 — outside the delta. "
       "Shell chrome is SH-1-owned (read-only for ENT-1).")

# --------------------------------------------------------------- references (byte identity check)
record(REF_A, "REFERENCE_CURRENT_FINAL", "construction authority; never evidence of a result")
record(REF_B, "REFERENCE_OWNER_CONFIRMED_SUPPORTING", "construction authority; never evidence of a result")
record(CAND, "CURRENT_SOURCE_CANDIDATE_FRAME",
       f"ent1-rev1 fresh capture at {COMMIT} / {TREE}")

out = {
    "schemaVersion": 1,
    "unit": "W03-ENTERPRISE",
    "purpose": "CP-003 VV-01/02/03 fresh vision probes generated at exact current source",
    "commit": COMMIT,
    "tree": TREE,
    "generatedAt": datetime.now(timezone.utc).isoformat(),
    "manifest": manifest,
}
with open(os.path.join(OUT, "manifest.json"), "w") as fh:
    json.dump(out, fh, indent=2)
print(json.dumps(manifest, indent=2))
