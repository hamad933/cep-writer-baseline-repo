from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = ROOT / "stack" / "native-typescript"
DONOR = (
    SOURCE_ROOT
    / "foundation"
    / "presentation-carrier"
    / "CEP_LIBRARY_EDITOR_EXECUTABLE_BLUEPRINT_v1.2.17_ACCEPTED_DESIGN_REFERENCE.html"
)
OUTPUT_ROOT = ROOT / "dist"

EXPECTED_DONOR_BYTES = 672_893
EXPECTED_DONOR_SHA256 = "ea66b58ef122bf2f8ca23fd0aa9e461b07da11ea7390c451902e4b1592d396fd"
EXPECTED_OUTPUTS = {
    "index.html": "da0d1bf40e9a33cb097c8595ae1f81f3f605374b75b43cc074aa7fc6e897dfff",
    "foundation/donor.css": "bb3b29f51beda272d5118b9329a44250c896c0143d7ea593ec59419b02d93689",
    "reference/CEP_LIBRARY_EDITOR_EXECUTABLE_BLUEPRINT_v1.2.17_ACCEPTED_DESIGN_REFERENCE.html": EXPECTED_DONOR_SHA256,
}


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def write_generated(relative_path: str, value: str | bytes) -> dict[str, object]:
    output = OUTPUT_ROOT / relative_path
    output.parent.mkdir(parents=True, exist_ok=True)
    payload = value.encode("utf-8") if isinstance(value, str) else value
    output.write_bytes(payload)
    digest = sha256_bytes(payload)
    expected = EXPECTED_OUTPUTS[relative_path]
    if digest != expected:
        raise RuntimeError(
            f"ZERO_DELTA_CARRIER_HASH_MISMATCH:{relative_path}:{digest}:{expected}"
        )
    return {
        "path": relative_path,
        "bytes": len(payload),
        "sha256": digest,
        "classification": "GOVERNED_GENERATED_DERIVATION",
    }


def main() -> None:
    donor_bytes = DONOR.read_bytes()
    donor_sha256 = sha256_bytes(donor_bytes)
    if len(donor_bytes) != EXPECTED_DONOR_BYTES or donor_sha256 != EXPECTED_DONOR_SHA256:
        raise RuntimeError(
            f"IMMUTABLE_DONOR_IDENTITY_MISMATCH:{len(donor_bytes)}:{donor_sha256}"
        )
    if "dist" in DONOR.relative_to(ROOT).parts:
        raise RuntimeError("GENERATED_OUTPUT_INPUT_FORBIDDEN")

    raw = donor_bytes.decode("utf-8")
    styles = re.findall(r"<style[^>]*>(.*?)</style>", raw, re.S)
    script = re.search(r"<script>\s*(\(\(\)=>\{.*?\}\)\(\);)\s*</script>", raw, re.S)
    if script is None:
        raise RuntimeError("ACCEPTED_DONOR_EXECUTABLE_SCRIPT_NOT_FOUND")

    html = raw[: script.start()] + raw[script.end() :]
    html = re.sub(r"<style[^>]*>.*?</style>", "", html, flags=re.S)
    html = html.replace(
        "</head>",
        '<link rel="stylesheet" href="foundation/donor.css">'
        '<link rel="stylesheet" href="foundation/extensions.css">'
        '<link rel="stylesheet" href="foundation/global/tokens/scale.css"></head>',
    )
    html = html.replace(
        "</body>", '<script type="module" src="main.js"></script></body>'
    )
    html = re.sub(
        r"<title>.*?</title>",
        "<title>CEP Foundation — Local proof workbench</title>",
        html,
    )

    outputs = [
        write_generated("foundation/donor.css", "\n".join(styles)),
        write_generated("index.html", html),
        write_generated(
            "reference/CEP_LIBRARY_EDITOR_EXECUTABLE_BLUEPRINT_v1.2.17_ACCEPTED_DESIGN_REFERENCE.html",
            donor_bytes,
        ),
    ]
    print(
        json.dumps(
            {
                "pass": True,
                "policy": "IMMUTABLE_ACCEPTED_DONOR_TO_ZERO_DELTA_CARRIER_OUTPUTS",
                "input": {
                    "path": DONOR.relative_to(ROOT).as_posix(),
                    "bytes": len(donor_bytes),
                    "sha256": donor_sha256,
                    "classification": "IMMUTABLE_ACCEPTED_DONOR_INPUT",
                },
                "outputs": outputs,
                "dist_inputs": [],
            },
            indent=2,
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
