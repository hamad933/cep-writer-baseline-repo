import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const files=['stack/native-typescript/surfaces/enterprise/index.ts','stack/native-typescript/surfaces/enterprise/presentation.ts','stack/native-typescript/adapters/enterprise/domain.ts','stack/native-typescript/adapters/w03-enterprise.ts'];
const source=files.map(f=>readFileSync(path.join(root,f),'utf8')).join('\n');
for(const ownerName of ['WorkspacePaneLayoutOwner','SpatialInteractionKernel','RelationInteractionOwner','ReusableToolbarTemplateOwner','ContextInspectorHost','SemanticCommandBus']) { const forbidden=`class ${ownerName}`; assert.equal(source.includes(forbidden),false,`duplicate shared owner: ${forbidden}`); }
assert.ok(source.includes("from '../../foundation/spatial.js'"),'Enterprise presentation must consume the shared Spatial owner');
assert.ok(source.includes("from '../foundation/relations.js'"),'Enterprise adapter must consume the shared RelationDomainAdapter');
console.log('S10 duplicate-owner scan: PASS');
