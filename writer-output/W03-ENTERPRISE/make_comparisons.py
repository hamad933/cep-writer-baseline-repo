#!/usr/bin/env python3
"""ENT-1 re-dispatch #2 — L1..L4 comparison composites at exact current source.

Method (VISUAL_EXECUTION_STANDARD §5.1):
  L1 whole surface · L2 region/pane · L3 component · L4 micro detail
Reference = construction authority (AR/RTL 1503x1046 CURRENT_FINAL_REFERENCE).
Candidate = FRESH ent1-rev1 capture at commit 766ab95 / tree 5926fac.

Every composite is byte-hashed into evidence/comparisons/manifest.json so a later
image-channel read can be checked against ground truth (VD-008).

Writes: writer-output/W03-ENTERPRISE/evidence/comparisons/*.png + manifest.json
"""
import hashlib
import json
import os
from datetime import datetime, timezone

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
EV = os.path.join(ROOT, "writer-output", "W03-ENTERPRISE", "evidence")
OUT = os.path.join(EV, "comparisons")
os.makedirs(OUT, exist_ok=True)

REF = os.path.join(ROOT, "cep-writer/references/visual/02_SIMULATION_AND_ENTERPRISE/"
                         "01_ENTERPRISE_DIGITAL_TWIN/Enterprise Cybersecurity Topology Dashboard.png")
REF2 = os.path.join(ROOT, "cep-writer/references/visual/02_SIMULATION_AND_ENTERPRISE/"
                          "01_ENTERPRISE_DIGITAL_TWIN/CEP_ENTERPRISE_DIGITAL_TWIN_REVISION_BASELINE_REFERENCE.png")
COMMIT = "766ab95367dde5ce433a148cdecb602274fe6c0d"
TREE = "5926fac34eaf680abbaf95bc18023cb6fd2ee868"
import sys
LABEL = sys.argv[1] if len(sys.argv) > 1 else "ent1-rev2"

manifest = []


def sha(p):
    h = hashlib.sha256()
    with open(p, "rb") as fh:
        for c in iter(lambda: fh.read(1 << 20), b""):
            h.update(c)
    return h.hexdigest()


def font(sz, bold=True):
    p = ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold
          else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
    return ImageFont.truetype(p, sz)


def emit(name, img, kind, note, sources):
    p = os.path.join(OUT, name)
    img.save(p)
    manifest.append({"file": os.path.relpath(p, ROOT), "sha256": sha(p), "width": img.width,
                     "height": img.height, "bytes": os.path.getsize(p), "kind": kind,
                     "note": note, "sources": sources})
    return p


def labelled(canvas, xy, img, title, sub, tcolor):
    d = ImageDraw.Draw(canvas)
    x, y = xy
    d.text((x + 6, y + 4), title, font=font(22), fill=tcolor)
    if sub:
        d.text((x + 6, y + 30), sub, font=font(16, False), fill=(170, 185, 200))
    canvas.paste(img, (x, y + 54))


ref = Image.open(REF).convert("RGB")
ref2 = Image.open(REF2).convert("RGB")


def cand(label, name):
    return Image.open(os.path.join(EV, label, name)).convert("RGB")


# ------------------------------------------------------------------ L1 whole surface
for tag, fname, label in [("rtl", "rtl-1503-topology.png", LABEL),
                          ("ltr", "ltr-1503-topology.png", LABEL)]:
    c = cand(label, fname)
    w = 1000
    rr = ref.resize((w, round(ref.height * w / ref.width)))
    cc = c.resize((w, round(c.height * w / c.width)))
    canvas = Image.new("RGB", (w * 2 + 24, max(rr.height, cc.height) + 70), (16, 24, 36))
    labelled(canvas, (0, 0), rr, "L1 REFERENCE (AR/RTL)", "sha " + sha(REF)[:16] + " 1503x1046", (255, 235, 0))
    labelled(canvas, (w + 24, 0), cc, f"L1 CANDIDATE {label}",
             "sha " + sha(os.path.join(EV, label, fname))[:16] + f" {c.width}x{c.height}", (0, 240, 200))
    emit(f"l1-ref-vs-candidate-{tag}.png", canvas, "L1_WHOLE_SURFACE",
         "Reference left, fresh current-source candidate right; whole-surface composition, "
         "hierarchy, pane organisation, density and identity.",
         [sha(REF), sha(os.path.join(EV, label, fname))])

# ------------------------------------------------------------------ L2 region / pane
# Candidate region boxes measured live by d-ledger-probe.mjs at 1440x1000 and by
# capture.mjs probe at 1503x1046 (see receipt-ent1-rev1.json probe.regions).
CAND_BOXES = {
    "left":   (13, 218, 300, 1036),
    "center": (315, 218, 1075, 1036),  # identity header + mode bar + canvas
    "right":  (1090, 218, 1495, 640),
    "top":    (315, 210, 1075, 380),
}
REF_BOXES = {
    "left":   (18, 200, 252, 1040),
    "center": (252, 200, 1080, 1040),
    "right":  (1080, 310, 1503, 1040),
    "top":    (240, 130, 1495, 300),
}
rows = []
for key in ["top", "left", "center", "right"]:
    r = ref.crop(REF_BOXES[key])
    c = cand(LABEL, "rtl-1503-topology.png").crop(CAND_BOXES[key])
    w = 620
    rr = r.resize((w, max(1, round(r.height * w / r.width))))
    cc = c.resize((w, max(1, round(c.height * w / c.width))))
    h = max(rr.height, cc.height)
    row = Image.new("RGB", (w * 2 + 16, h), (16, 24, 36))
    row.paste(rr, (0, 0))
    row.paste(cc, (w + 16, 0))
    rows.append((key, row))
head = 44
canvas = Image.new("RGB", (rows[0][1].width + 8, sum(r.height + head + 8 for _, r in rows) + 8), (16, 24, 36))
d = ImageDraw.Draw(canvas)
y = 4
for key, row in rows:
    d.text((6, y), f"L2 REGION: {key}   REF (left)  |  CANDIDATE "+LABEL+" AR/RTL (right)",
           font=font(20), fill=(140, 210, 255))
    canvas.paste(row, (4, y + head))
    y += row.height + head + 8
emit("l2-regions-ref-vs-candidate.png", canvas, "L2_REGION_PANE",
     "Region-by-region comparison: top/header, left structure, centre work, right context.",
     [sha(REF), sha(os.path.join(EV, LABEL, "rtl-1503-topology.png"))])

# ------------------------------------------------------------------ L3 component
def crop(img, box, w):
    c = img.crop(box)
    return c.resize((w, max(1, round(c.height * w / c.width))))

ref_img = ref
cand_rtl = cand(LABEL, "rtl-1503-topology.png")
cand_ltr = cand(LABEL, "ltr-1503-topology.png")
comps = [
    ("identity header", (255, 170, 1060, 300), (315, 210, 1075, 380)),
    ("work tabs + tools", (255, 215, 760, 265), (315, 372, 1072, 456)),
    ("structure list", (18, 205, 252, 470), (13, 238, 300, 500)),
    ("node cards", (330, 330, 950, 560), (330, 470, 1060, 960)),
    ("right context", (1080, 320, 1495, 640), (1090, 238, 1495, 640)),
]
panels = []
for name, rbox, cbox in comps:
    rr = crop(ref_img, rbox, 560)
    cc = crop(cand_ltr, cbox, 560)
    h = max(rr.height, cc.height)
    row = Image.new("RGB", (560 * 2 + 12, h + 30), (16, 24, 36))
    d = ImageDraw.Draw(row)
    d.text((4, 4), f"L3 COMPONENT: {name}  — REF (left) | CANDIDATE "+LABEL+" EN/LTR (right)",
           font=font(16), fill=(140, 210, 255))
    row.paste(rr, (0, 30))
    row.paste(cc, (572, 30))
    panels.append(row)
canvas = Image.new("RGB", (panels[0].width, sum(p.height + 6 for p in panels) + 6), (16, 24, 36))
y = 3
for p in panels:
    canvas.paste(p, (0, y))
    y += p.height + 6
emit("l3-components-ref-vs-candidate.png", canvas, "L3_COMPONENT",
     "Component-level comparison: identity header, work tabs + tool cluster, structure list, "
     "node cards, right context.",
     [sha(REF), sha(os.path.join(EV, LABEL, "ltr-1503-topology.png"))])

# ------------------------------------------------------------------ L4 micro
micro = [
    ("node card typography", (340, 676, 640, 816), (330, 330, 610, 470)),
    ("tab row / modebar", (315, 372, 1072, 456), (255, 215, 840, 265)),
    ("state chips", (315, 300, 700, 345), (255, 235, 700, 285)),
]
panels = []
for name, cbox, rbox in micro:
    cc = crop(cand_ltr, cbox, 700)
    rr = crop(ref_img, rbox, 700)
    h = max(rr.height, cc.height)
    row = Image.new("RGB", (700, h * 2 + 64), (16, 24, 36))
    d = ImageDraw.Draw(row)
    d.text((4, 4), f"L4 MICRO: {name} — CANDIDATE "+LABEL+" (top)", font=font(16), fill=(0, 240, 200))
    row.paste(cc, (0, 28))
    d.text((4, 40 + h), f"L4 MICRO: {name} — REFERENCE (bottom)", font=font(16), fill=(255, 235, 0))
    row.paste(rr, (0, 64 + h))
    panels.append(row)
canvas = Image.new("RGB", (panels[0].width, sum(p.height + 6 for p in panels) + 6), (16, 24, 36))
y = 3
for p in panels:
    canvas.paste(p, (0, y))
    y += p.height + 6
emit("l4-micro-ref-vs-candidate.png", canvas, "L4_MICRO_DETAIL",
     "Micro-detail: node card typography, tab row, state chips — candidate above, reference below.",
     [sha(REF), sha(os.path.join(EV, LABEL, "ltr-1503-topology.png"))])

# ------------------------------------------------------------------ responsive + RTL evidence index
index = []
for label, name, vp, loc, dirn in [
    (LABEL, "ltr-1440-topology.png", "1440x1000", "en", "ltr"),
    (LABEL, "rtl-1440-topology.png", "1440x1000", "ar", "rtl"),
    (LABEL, "ltr-1024-topology.png", "1024x900", "en", "ltr"),
    (LABEL, "rtl-1024-topology.png", "1024x900", "ar", "rtl"),
    (LABEL, "ltr-1440-selected.png", "1440x1000", "en", "ltr"),
    (LABEL, "rtl-1440-selected.png", "1440x1000", "ar", "rtl"),
    (LABEL, "ltr-1440-revisions.png", "1440x1000", "en", "ltr"),
    (LABEL, "rtl-1440-revisions.png", "1440x1000", "ar", "rtl"),
]:
    p = os.path.join(EV, label, name)
    index.append({"file": os.path.relpath(p, ROOT), "sha256": sha(p), "viewport": vp,
                  "locale": loc, "dir": dirn, "bytes": os.path.getsize(p)})

with open(os.path.join(OUT, "manifest.json"), "w") as fh:
    json.dump({"schemaVersion": 1, "unit": "W03-ENTERPRISE", "commit": COMMIT, "tree": TREE,
               "generatedAt": datetime.now(timezone.utc).isoformat(),
               "reference": {"path": os.path.relpath(REF, ROOT), "sha256": sha(REF)},
               "composites": manifest, "requiredViewportMatrix": index}, fh, indent=2)

for m in manifest:
    print(f"{m['kind']:22} {m['file']} {m['sha256'][:16]} {m['width']}x{m['height']}")
print("required viewport matrix frames:", len(index))
