# Repository / Product Boundary

Repository root contains:
- the exact Product parent files; and
- the repo-only `cep-writer/` execution context.

`cep-writer/` MUST NOT be copied into a Product candidate ZIP. Use `cep-writer/tools/export_product.py` to create a clean Product working/export tree. The Product canonical source identity remains derived from `stack/native-typescript/`; repository-only files do not alter that identity.

Do not delete or rewrite Product lineage/evidence files merely because they are old. Their presence is Product-package lineage. Do not treat them as current authority unless the mission explicitly says so.
