# LIVE AUTHORITY SNAPSHOT — SWR-W01-TODAY

Classification: `CONTROLLER_PRE_RESOLVED_MISSION_OVERLAY__READ_ONLY__NO_LIVE_DRIVE_DISCOVERY_REQUIRED`

This mission projection was built after the required live W01 Controller boot on 2026-09-26. It does not replace or mutate live governance.

## Exact source binding
- Repository: `hamad933/cep-writer-baseline-repo`
- Product/source HEAD: `25a5f13c55096b7c4c8ef51100256a856cff75f5`
- Product/source tree: `dd0315926270ec1f6571b82566dcdab3d65267f9`
- Canonical Product source identity: `b8b5e4a5797eb48b4cb8ae10439ff7dca5d8e2c900cb782b4802f69b21e23b7a / 289 files`
- Candidate branch: `writer/surface-w01-today`
- Capsule transport branch: `capsule/surface-w01-today`

## Exact POST-DS01 execution-matrix row
```csv
Today,W01,SWR-W01-TODAY,writer/surface-w01-today,NONE,YES,COV-W01,ESCALATE_GLOBAL_SHARED
```

## W01 ownership / collision boundary
W01 contains separate Today and Shell Surface Writers only. This Writer owns **Today** only. W02-W05 domain ownership is not assigned here. Shared/global owners stay shared.
If a correction requires a shared/prohibited owner, return:
`SHARED_OWNER_ESCALATION:<owner>:<consumer>:<exact symptom>:<required behavior>:<falsification>`

## Exact Surface identity / oracle ceiling
Today: daily orchestration/command projection over domain-owned truth; CENTER `OrchestrationProjectionWorkbench`; commands `today.resume`, `today.refresh`, `today.filter`, `today.why`. Exact Presentation reference: `cep-writer/references/visual/00_TODAY/CEP_TODAY_MAIN_ORCHESTRATION_REFERENCE.png`, Drive `1JGkV1QP4m7ZIiFpcE_nJuRFIAXLjavC6`, SHA-256 `3f75eac759efd920cfb2600766c7719d1754359326bc5a3df5508bee864dd617`, `OWNER_CONFIRMED_FINAL_REFERENCE`. It does not grant domain/provider/acceptance authority.

## Current applicable findings
- `CBF-002` P0: Browser Back can restore route while losing governed Today filter semantic context; seam is shared `GlobalShellNavigationOwner` and is escalation-only here.
- `CBF-003` P0: domain BOTTOM can exist while shared `BottomDeepWorkOwner` has zero providers; no per-Surface workaround.
- Identity-matrix rescue: UNAVAILABLE must not render AVAILABLE_EMPTY; generic panes must not erase Today identity; `today.why` requires exact selected recommendation/version.

These are current falsification inputs, not permission to mutate shared owners. Reproduce against the exact source before changing Product.

## Data/provider truth
Today is a DS01 target (`YES`). DS01 is deterministic/resettable/non-production/non-canonical acceptance data only. Use DS01 for populated Presentation inspection while also proving normal Product truth; never make DS01 default Product provider/data authority.

## Owner decisions
`mission-overlay/APPLICABLE_OWNER_DECISIONS.csv` is an exact selected-row projection from the live Owner register (Drive `1GF70xX-eGWNmp8VaK_gjTRrAAVq0bihh`) at capsule-build time.
Binding highlights: OD-055 zero-loss Surface identity; OD-059 shared mechanics do not override Surface semantics; OD-060 no unadmitted dependency expansion; OD-066 mission candidate branch/no self-promotion; OD-067 closed read set/no broad discovery; OD-072/073 truthful local-first visual evidence; OD-074/075 Controller-prepared capsule; OD-081 carrier isolation.


## Machine-resolved oracle bindings
- SurfaceProfile: `cep-writer/references/surface-profiles/today.json` — SHA-256 `a9313a4c8d429ada7f76224df9192e3de750ac46f21be1da8034c96677bce47c`.
- ORACLE-005: current Owner decisions are pre-resolved into `mission-overlay/APPLICABLE_OWNER_DECISIONS.csv`; Writer live Drive discovery is not required.
- ORACLE-009: Today exact visual reference `cep-writer/references/visual/00_TODAY/CEP_TODAY_MAIN_ORCHESTRATION_REFERENCE.png`, SHA-256 `3f75eac759efd920cfb2600766c7719d1754359326bc5a3df5508bee864dd617`, `OWNER_CONFIRMED_FINAL_REFERENCE`.
- ORACLE-010: `cep-writer/references/CEP_FINAL_VISUAL_INTERACTION_CONTRACT.md`, SHA-256 `20bf151fba9d69255e54cd724d0efb5dc6e485b91aedf2795e1a6497cf40aa8d`.
- ORACLE-013: exact Today identity-matrix row is projected above; source SHA-256 `28d558d8f116a2ef27ae1938fcffa1528f98fda9d4950935f4d3e7232830ae40`.
- Oracle index: `cep-writer/references/ORACLE_INDEX.json`, SHA-256 `d20b55611a91a041d916b67b2fd559bfeb77eb72be0ee94f10112538bf02c4b4`.
