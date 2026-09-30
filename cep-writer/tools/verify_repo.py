#!/usr/bin/env python3
from pathlib import Path
import hashlib
import json
import subprocess
import sys

root = Path(__file__).resolve().parents[2]
manifest_path = root / "cep-writer" / "WRITER_INPUT_MANIFEST.json"
man = json.loads(manifest_path.read_text(encoding="utf-8"))


def git(*args):
    return subprocess.check_output(
        ["git", *args],
        cwd=root,
        text=True,
    ).strip()


if man.get("noRequiredLiveDriveFetch") is not True:
    print("LIVE_DRIVE_DEPENDENCY_NOT_ALLOWED")
    sys.exit(2)


# ------------------------------------------------------------
# Current carrier / required local Writer inputs
# ------------------------------------------------------------
bad = []

for entry in man["entries"]:
    path = root / entry["path"]

    if not path.is_file():
        bad.append((entry["path"], "MISSING"))
        continue

    data = path.read_bytes()
    got = (len(data), hashlib.sha256(data).hexdigest())
    expected = (entry["size"], entry["sha256"])

    if got != expected:
        bad.append(
            (
                entry["path"],
                "HASH_SIZE_MISMATCH",
                got,
                expected,
            )
        )

if bad:
    print("REQUIRED_INPUT_MISMATCH", bad[:10])
    sys.exit(2)


# ------------------------------------------------------------
# Immutable canonical Product source
#
# The canonical Product identity belongs to the immutable
# productSourceParentCommit, NOT to the current correction carrier.
# ------------------------------------------------------------
parent_commit = man["productSourceParentCommit"]
expected_parent_tree = man["productSourceParentTree"]

try:
    actual_parent_tree = git(
        "rev-parse",
        f"{parent_commit}^{{tree}}",
    )
except subprocess.CalledProcessError:
    print("PRODUCT_SOURCE_PARENT_UNAVAILABLE", parent_commit)
    sys.exit(2)

if actual_parent_tree != expected_parent_tree:
    print(
        "PRODUCT_SOURCE_PARENT_TREE_MISMATCH",
        actual_parent_tree,
        expected_parent_tree,
    )
    sys.exit(2)


paths = git(
    "ls-tree",
    "-r",
    "--name-only",
    parent_commit,
    "--",
    "stack/native-typescript",
).splitlines()

rows = []

for full_path in paths:
    prefix = "stack/native-typescript/"

    if not full_path.startswith(prefix):
        print("PRODUCT_SOURCE_PATH_MISMATCH", full_path)
        sys.exit(2)

    relative_path = full_path[len(prefix):]

    try:
        data = subprocess.check_output(
            ["git", "show", f"{parent_commit}:{full_path}"],
            cwd=root,
        )
    except subprocess.CalledProcessError:
        print("PRODUCT_SOURCE_BLOB_UNAVAILABLE", full_path)
        sys.exit(2)

    rows.append(
        (
            relative_path,
            len(data),
            hashlib.sha256(data).hexdigest(),
        )
    )

rows.sort(key=lambda row: row[0])

stream = "".join(
    f"{path}\0{size}\0{sha}\n"
    for path, size, sha in rows
).encode()

canonical_sha = hashlib.sha256(stream).hexdigest()

if (
    canonical_sha != man["productCanonicalSourceSha256"]
    or len(rows) != man["productCanonicalSourceFiles"]
):
    print(
        "PRODUCT_CANONICAL_SOURCE_IDENTITY_MISMATCH",
        canonical_sha,
        len(rows),
        man["productCanonicalSourceSha256"],
        man["productCanonicalSourceFiles"],
    )
    sys.exit(2)


print(
    json.dumps(
        {
            "status": "PASS",
            "requiredInputs": len(man["entries"]),
            "productCanonicalSourceSha256": canonical_sha,
            "productCanonicalSourceFiles": len(rows),
            "productSourceParentCommit": parent_commit,
            "productSourceParentTree": actual_parent_tree,
            "canonicalSourceUsesParentCommit": True,
            "currentCarrierIsNotCanonicalSource": True,
            "noRequiredLiveDriveFetch": True,
        },
        indent=2,
    )
)
