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
    "index.html": "2e6e1aefefe7074ef2eef97239db82a2291d320d1d7e680515e3e9197643402a",
    "foundation/donor.css": "bb3b29f51beda272d5118b9329a44250c896c0143d7ea593ec59419b02d93689",
    "reference/CEP_LIBRARY_EDITOR_EXECUTABLE_BLUEPRINT_v1.2.17_ACCEPTED_DESIGN_REFERENCE.html": EXPECTED_DONOR_SHA256,
}

CANONICAL_INITIAL_SHELL = (
    '<header class="foundation-shell" data-owner="GlobalShellNavigationOwner" '
    'data-presentation="global-shell-navigation" data-shell-host="GlobalShellNavigationOwner" '
    'aria-busy="true">'
    '<div class="global-shell-primary" data-shell-region="primary">'
    '<a class="global-shell-brand" href="?surface=today" data-shell-destination="today" aria-label="CEP · مساحة CEP الشخصية">'
    '<span class="global-shell-brandmark" aria-hidden="true">C</span>'
    '<span class="global-shell-brandcopy"><strong>CEP</strong><small>مساحة CEP الشخصية</small></span></a>'
    '<nav class="global-shell-destinations" tabindex="-1" aria-label="وجهات CEP" data-shell-destination-count="5" data-shell-route-count="23" data-shell-destination-count-frozen="false">'
    '<a class="global-shell-destination" href="?surface=today" data-shell-area="W01" data-shell-destination="today" aria-current="page"><span class="global-shell-destination-label">اليوم</span><bdi class="global-shell-area-token" dir="ltr">W01</bdi></a>'
    '<a class="global-shell-destination" href="?surface=library" data-shell-area="W02" data-shell-destination="library"><span class="global-shell-destination-label">المعرفة والتعلم</span><bdi class="global-shell-area-token" dir="ltr">W02</bdi></a>'
    '<a class="global-shell-destination" href="?surface=runs" data-shell-area="W03" data-shell-destination="runs"><span class="global-shell-destination-label">المحاكاة والمؤسسات</span><bdi class="global-shell-area-token" dir="ltr">W03</bdi></a>'
    '<a class="global-shell-destination" href="?surface=results" data-shell-area="W04" data-shell-destination="results"><span class="global-shell-destination-label">التقدم والأدلة</span><bdi class="global-shell-area-token" dir="ltr">W04</bdi></a>'
    '<a class="global-shell-destination" href="?surface=configuration" data-shell-area="W05" data-shell-destination="configuration"><span class="global-shell-destination-label">النظام والعمليات</span><bdi class="global-shell-area-token" dir="ltr">W05</bdi></a>'
    '</nav>'
    '<div class="global-shell-tools" aria-label="أدوات عامة">'
    '<button class="btn global-shell-tool" type="button" data-foundation-command="foundation.palette" aria-label="بحث أو أمر"><span aria-hidden="true">⌘</span><span>بحث أو أمر</span><bdi class="global-shell-shortcut" dir="ltr">Ctrl K</bdi></button>'
    '<button class="btn global-shell-tool global-shell-settings" type="button" data-foundation-command="foundation.settings" aria-label="الإعدادات"><span aria-hidden="true">⚙</span><span>الإعدادات</span></button>'
    '</div></div>'
    '<div class="global-shell-contextbar" data-shell-region="context">'
    '<div class="global-shell-context-title"><span>المساحة الحالية</span><bdi dir="ltr">W01</bdi><strong>اليوم</strong><small>استئناف العمل والإسقاطات الحالية</small></div>'
    '<nav class="global-shell-area-nav" aria-label="تنقل W01"><a class="global-shell-context-link" href="?surface=today" data-shell-destination="today" aria-current="page">اليوم</a></nav>'
    '<div class="global-shell-history" aria-label="سجل التنقل">'
    '<button class="btn" type="button" data-shell-history="back" aria-label="رجوع" title="رجوع">←</button>'
    '<button class="btn" type="button" data-shell-history="forward" aria-label="تقدّم" title="تقدّم">→</button>'
    '<span class="global-shell-local">محلي · مالك واحد</span>'
    '</div></div></header>'
)


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
    html = re.sub(r"<body(?:\s+[^>]*)?>", '<body data-global-shell-owner="GlobalShellNavigationOwner">', html, count=1)
    html = re.sub(r'<header aria-label="التنقل العام" class="global">[\s\S]*?</header>', CANONICAL_INITIAL_SHELL, html, count=1)
    html = re.sub(r'(<h1[^>]*id="documentTitle"[^>]*>)(.*?)(</h1>)', r'\1Personal CEP Workspace\3', html, flags=re.S)
    neutral_block = '<article class="block block-bootstrap" data-bootstrap="true"><div class="blockcontent"><div class="blockbody" data-editable-block="true" dir="auto">Loading CEP workspace…</div></div></article>'
    html = re.sub(r'(<div[^>]*id="blockList"[^>]*>)(.*?)(</div>\s*<div class="gap")', rf'\1{neutral_block}\3', html, flags=re.S)
    neutral_banner = '<div class="bmain"><div class="crumbs"><span>CEP</span><span>›</span><span>Workspace</span><span>›</span><bdi dir="ltr" id="bannerKuId">KU-D05-0021</bdi></div><div class="titlerow"><h1 class="title" data-editable="title" id="bannerTitle">Personal CEP Workspace</h1><span class="badge accent"><span class="dot"></span>وحدة معرفة</span></div><div class="secondary"><span>المحتوى قابل للتحرير في وضع التحرير.</span><span>بيانات المصدر والهوية للقراءة فقط.</span></div><div class="tags"><span class="badge">Web / API</span><span class="badge">Authorization</span><span class="badge ok">سياق مكتمل</span></div></div>'
    html = re.sub(r'(<section[^>]*id="topBanner"[^>]*>)(.*?)(</section>)', rf'\1{neutral_banner}\3', html, flags=re.S)

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
