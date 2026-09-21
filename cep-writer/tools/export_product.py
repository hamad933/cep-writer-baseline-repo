#!/usr/bin/env python3
from pathlib import Path
import argparse, shutil

ap=argparse.ArgumentParser()
ap.add_argument('destination')
args=ap.parse_args()
root=Path(__file__).resolve().parents[2]
dst=Path(args.destination).resolve()
if dst.exists():
    if any(dst.iterdir()): raise SystemExit('REFUSE_NONEMPTY_DESTINATION')
else: dst.mkdir(parents=True)
for p in root.iterdir():
    if p.name in {'cep-writer','.git','node_modules'}: continue
    q=dst/p.name
    if p.is_dir(): shutil.copytree(p,q,symlinks=True)
    else: shutil.copy2(p,q)
print(dst)
