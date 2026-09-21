import {writeFile,readFile} from 'node:fs/promises';
import {runAnalyticalCompareCorrectionTests} from '../dist/analytical-compare-correction-tests.js';
import {canonicalSourceIdentity} from './source-tree-identity.mjs';
const root=new URL('../',import.meta.url),source=await canonicalSourceIdentity(root),tests=runAnalyticalCompareCorrectionTests();
const contract=await readFile(new URL('../stack/native-typescript/foundation/contracts/analysis-provider.ts',import.meta.url),'utf8');
const compare=await readFile(new URL('../stack/native-typescript/foundation/analytical/compare.ts',import.meta.url),'utf8');
const staticChecks=[
 {id:'pair-canonicalized-before-resolve',pass:compare.indexOf('_canonicalizeSuppliedPair(pair)')<compare.indexOf('provider.resolve(canonicalPair.left.ref)')},
 {id:'pair-id-rederived-and-checked',pass:/ANALYTICAL_PAIR_ID_DRIFT/.test(compare)&&/pairIdFor\(descriptor,leftKey,rightKey\)/.test(compare)},
 {id:'keys-rederived-and-checked',pass:/ANALYTICAL_PAIR_LEFT_KEY_DRIFT/.test(compare)&&/ANALYTICAL_PAIR_RIGHT_KEY_DRIFT/.test(compare)},
 {id:'error-receipt-does-not-claim-forged-id',pass:/pairId:pair\?\.pairId\|\|'UNVERIFIED'/.test(compare)&&/suppliedPairId/.test(compare)},
 {id:'duplicate-field-path-rejected',pass:/ANALYTICAL_DUPLICATE_FIELD_PATH/.test(contract)},
 {id:'non-deterministic-values-rejected',pass:/ANALYTICAL_FIELD_VALUE_NON_DETERMINISTIC/.test(contract)&&/Number\.isFinite/.test(contract)},
 {id:'ref-key-collision-monitored',pass:/ANALYTICAL_PROVIDER_REF_KEY_COLLISION/.test(contract)&&/ANALYTICAL_PROVIDER_REF_KEY_NON_DETERMINISTIC/.test(contract)},
 {id:'collision-safe-identity-helper',pass:/canonicalAnalyticalIdentityKey/.test(contract)&&/ACID1:/.test(contract)}
];
const status=tests.fail===0&&staticChecks.every(x=>x.pass)?'PASS':'FAIL',report={schemaVersion:1,kind:'E17_ANALYTICAL_COMPARE_BOUNDED_CORRECTION_PROOF',status,candidateOnly:true,controllerAccepted:false,canonicalSourceSha256:source.sha256,canonicalSourceFiles:source.files,summary:{total:tests.total,pass:tests.pass,fail:tests.fail},staticChecks,tests:tests.tests};
await writeFile(new URL('../assurance/E17_ANALYTICAL_COMPARE_BOUNDED_CORRECTION_PROOF.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status,canonicalSourceSha256:source.sha256,canonicalSourceFiles:source.files,tests:report.summary,static:{total:staticChecks.length,pass:staticChecks.filter(x=>x.pass).length}},null,2));
if(status!=='PASS')process.exitCode=1;
