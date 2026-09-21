import {readFile,writeFile} from 'node:fs/promises';
import {canonicalSourceIdentity} from './source-tree-identity.mjs';
const root=new URL('../',import.meta.url);const r=p=>readFile(new URL(p,root),'utf8');
const [kernel,contract,bridge,structured,runtime,tests]=await Promise.all([
 r('stack/native-typescript/foundation/structured/selection-kernel.ts'),r('stack/native-typescript/foundation/structured/selection-contract.ts'),r('stack/native-typescript/foundation/structured/selection-dom-bridge.ts'),r('stack/native-typescript/foundation/structured.ts'),r('stack/native-typescript/foundation/accepted-runtime.ts'),r('stack/native-typescript/model-tests.ts')
]);
const checks=[];const check=(id,condition,detail)=>checks.push({id,status:condition?'PASS':'FAIL',detail});
check('owner.single-kernel-class',(kernel.match(/class\s+StructuredSelectionKernel\b/g)||[]).length===1,'exactly one canonical StructuredSelectionKernel class');
check('owner.compatibility-facade-only',structured.includes('export class StructuredSelectionModel extends StructuredSelectionKernel {')&&structured.includes('constructor(readDocument,{readRevision=()=>null,treeKernel=STRUCTURED_TREE_KERNEL}={}){super({readDocument,readRevision,treeKernel});}'),'legacy StructuredSelectionModel is constructor-only facade extending canonical owner');
check('owner.adapter-instantiates-kernel',(structured.match(/new\s+StructuredSelectionKernel\s*\(/g)||[]).length===1,'StructuredDocumentDomainAdapter creates the canonical selection owner once');
check('owner.no-donor-block-selection-state',!runtime.includes('state.transient.blockSelection'),'accepted Library runtime has no donor blockSelection state owner');
check('owner.library-delegation',['selectBlocks?.','selectBlockRange?.','toggleSelectedBlock?.','selectedFragmentIdentity?.','selectionBookmark?.','projectSelectionBookmark?.'].every(token=>runtime.includes(token)),'Library selection branches delegate through Structured adapter');
check('dom.kernel-has-no-dom-authority',!/(window\.|globalThis\.|getSelection\(|createRange\(|NodeFilter|HTMLElement|DOMRange|anchorNode|focusNode)/.test(kernel),'canonical kernel contains no DOM node/range APIs');
check('dom.bridge-projection-only',bridge.includes("this.authority='PROJECTION_ONLY'")&&/getSelection|selection|createRange|TreeWalker|NodeFilter/.test(bridge),'DOM behavior is isolated to explicit projection-only bridge');
check('dom.contract-declares-projection-only',contract.includes("domAuthority:'projection-only'"),'selection contract declares DOM projection-only authority');
check('scope.no-clipboard-implementation',!/(ClipboardService|navigator\.clipboard|ClipboardEvent|writeText|readText|clipboardData)/.test(kernel+contract+bridge),'new selection owner modules implement no clipboard transport/payload path');
check('scope.no-keyboard-owner',!/(keydown|keyup|KeyboardEvent|keymap|shortcut)/i.test(kernel+contract+bridge),'new selection owner modules implement no Structured keyboard owner');
check('scope.no-library-domain-metadata',!/(kuTree|knowledgeUniverse|searchState|libraryState)/i.test(kernel+contract+bridge),'canonical selection owner stores no Library KU/search metadata');
check('semantics.tree-aware',kernel.includes('this.treeKernel.walk')&&kernel.includes('this.treeKernel.pathFor'),'canonical order and subtree normalization use StructuredTreeKernel');
check('semantics.ancestor-coverage',contract.includes('ancestor-dominates-descendants-with-explicit-coverage')&&kernel.includes('coveredBlockIds'),'ancestor/subtree rule explicitly preserves coverage without double-counting');
check('semantics.inline-logical',kernel.includes('anchorOffset')&&kernel.includes('focusOffset')&&kernel.includes('direction'),'inline selection stores logical offsets and direction');
check('tests.required-selection-cases',['structured.selection-tree-canonical-order','structured.selection-range-nested','structured.selection-collapsed-toggle','structured.selection-inline-projection','structured.selection-stale-repair','structured.selection-no-history-side-effect','structured.selection-unknown-negative','structured.selection-real-consumers'].every(id=>tests.includes(id)),'all Lane B required model scenarios exist');
const sourceIdentity=await canonicalSourceIdentity(root);const out={schemaVersion:1,kind:'FW_B_STRUCTURED_SELECTION_OWNERSHIP_NEGATIVE_GATES',status:checks.every(x=>x.status==='PASS')?'PASS':'FAIL',generatedAt:new Date().toISOString(),sourceIdentity,checks};
await writeFile(new URL('assurance/FW_B_SELECTION_OWNERSHIP_GATES.json',root),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out,null,2));if(out.status!=='PASS')process.exitCode=1;
