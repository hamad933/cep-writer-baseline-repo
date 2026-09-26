import assert from 'node:assert/strict';
import {W04PortfolioDomain,createPortfolioCompareProvider,createW04PortfolioDemoRecords} from '../../../adapters/portfolio/domain.js';
import {createPortfolioSurfaceComposition,PORTFOLIO_PRESENTATION_DEFAULTS} from '../../../surfaces/portfolio/composition.js';
import {AnalyticalCompareOwner} from '../../../foundation/analytical/compare.js';
import {createReviewDecisionPresentationSnapshot} from '../../../foundation/review/decision.js';

// Normal Product truth is empty; deterministic demo data must be requested explicitly.
const empty=new W04PortfolioDomain();assert.equal(empty.records.length,0);assert.equal(empty.export().members.length,0);
const d=new W04PortfolioDomain(createW04PortfolioDemoRecords());

// Removing a membership mutates curation only and preserves the exact canonical source reference.
const source=d.get('member-1').sourceRef,revision=d.get('member-1').revisionId;
const removed=d.curate({action:'remove',id:'member-1',expectedRevisionId:revision});
assert.equal(removed.ok,true);assert.equal(removed.sourcePreserved,true);assert.equal(removed.removed.sourceRef,source);assert.equal(removed.receipt.canonicalSourceWrite,false);assert.equal(removed.receipt.canonicalSourceDelete,false);

// Unapproved Project/Learning Objective grouping is held, not invented from demo IDs.
const target=d.get('member-2'),before=JSON.stringify(target);
const unresolved=d.group('member-2','unapproved',{expectedRevisionId:target.revisionId});
assert.equal(unresolved.code,'AUTHORITY_DECISION_REQUIRED');assert.equal(unresolved.mutated,false);assert.equal(JSON.stringify(d.get('member-2')),before);assert.equal(d.get('member-2').groupingRef,null);

// Exact refs only; source provider truth determines source disposition when it is available.
const resolver={inspect:ref=>ref==='ev-withdrawn@r9'?{digest:'sha256:withdrawn',rowCount:1,state:'SOURCE_WITHDRAWN'}:{digest:'sha256:active',rowCount:2,state:'RESOLVABLE'}};
const observed=new W04PortfolioDomain([], {sourceResolver:resolver});
const bad=observed.curate({action:'add',member:{id:'bad',refType:'Evidence',sourceRef:'not-exact'}});assert.equal(bad.code,'EXACT_SOURCE_REF_REQUIRED');
const add=observed.curate({action:'add',member:{id:'member-withdrawn',revisionId:'pm-w1',refType:'Evidence',sourceRef:'ev-withdrawn@r9',title:'Withdrawn source'}});
assert.equal(add.ok,true);assert.equal(add.record.state,'SOURCE_WITHDRAWN');assert.equal(add.receipt.canonicalSourceCopy,false);
const addProject=observed.curate({action:'add',member:{id:'member-project',revisionId:'pm-p1',refType:'Project',sourceRef:'project-alpha@p7',title:'Project output'}});assert.equal(addProject.ok,true);assert.equal(addProject.record.state,'RESOLVABLE');

// Curation metadata is local and export remains a projection of refs + disposition, never canonical source payload.
const curated=observed.updateCuration('member-project',{order:4,caption:'Selected project output',annotation:'Portfolio note'},{expectedRevisionId:'pm-p1'});assert.equal(curated.ok,true);assert.equal(curated.receipt.canonicalSourceWrite,false);
const exp=observed.export();assert.equal(exp.canonicalPublication,false);assert.equal(exp.members.find(x=>x.id==='member-project').curation.order,4);assert.equal(exp.members.find(x=>x.id==='member-withdrawn').sourceDisposition,'SOURCE_WITHDRAWN');assert.equal(JSON.stringify(exp).includes('canonicalEvidence'),false);assert.equal(JSON.stringify(exp).includes('evidenceClaim'),false);

// Grouping becomes writable only through an exact approved registry provider.
const groupingAuthority={descriptor:()=>({providerId:'approved.grouping.registry',registryId:'portfolio-groups',revision:'r7',authority:'APPROVED_GROUPING_REGISTRY'}),resolve:id=>id==='grp-approved'?{state:'APPROVED',id,kind:'Capability'}:{state:'UNKNOWN',id}};
const groupedDomain=new W04PortfolioDomain(createW04PortfolioDemoRecords(),{groupingAuthority});const groupTarget=groupedDomain.get('member-2');
assert.equal(groupedDomain.group(groupTarget.id,'grp-unknown',{expectedRevisionId:groupTarget.revisionId}).code,'GROUPING_AUTHORITY_UNAVAILABLE');
const grouped=groupedDomain.group(groupTarget.id,'grp-approved',{expectedRevisionId:groupTarget.revisionId});assert.equal(grouped.ok,true);assert.equal(grouped.record.groupingState,'REGISTRY_BOUND');assert.equal(grouped.receipt.registryRevision,'r7');

// AnalyticalCompare is a central shared owner; Portfolio only contributes its provider.
const ac=new AnalyticalCompareOwner(),p=createPortfolioCompareProvider(groupedDomain);ac.registerProvider(p);const [a,b]=groupedDomain.records;const pair=ac.createPair({left:{providerId:p.descriptor().providerId,ref:{id:a.id,revisionId:a.revisionId}},right:{providerId:p.descriptor().providerId,ref:{id:b.id,revisionId:b.revisionId}}});assert.notEqual(ac.comparePair(pair).state,'ERROR');

// Review/Decision is consumed as a read-only shared projection; Portfolio never gains formal decision write authority.
const reviewDecision=createReviewDecisionPresentationSnapshot({id:'decision-projection-1',title:'Evidence review outcome',summary:'Read-only projection',state:'READ_ONLY',stateLabel:'Read only',direction:'auto',locale:'en',labels:{family:'Review decision',unavailable:'Unavailable'},sections:[{id:'evidence',label:'Evidence',entries:[{id:'ev-1',label:'Accepted evidence ref',detail:'ev-alpha@r1',tone:'info'}]}],outcomes:[{id:'decision',label:'Decision',entry:{id:'d-1',label:'ACCEPT',detail:'Projection only',tone:'neutral'}}],sourceNote:'Shared ReviewDecision presentation snapshot'});
const composition=createPortfolioSurfaceComposition({domain:groupedDomain,analyticalCompareOwner:ac,reviewDecisionProjection:reviewDecision,presentationPreferences:{locale:'en',direction:'ltr',theme:'light',layout:'compact'}});
assert.equal(composition.reviewDecisionProjection,reviewDecision);assert.equal(composition.truth.canonicalReviewDecisionWriteAuthority,false);assert.equal(composition.truth.reviewDecisionProjection,'READ_ONLY_SHARED_PROJECTION');

// Arabic/RTL/dark/dashboard remain safe defaults, while effective presentation can be customized.
assert.deepEqual(PORTFOLIO_PRESENTATION_DEFAULTS,{locale:'ar',direction:'rtl',theme:'dark',layout:'evidence-dashboard'});assert.equal(composition.presentation.defaults.direction,'rtl');assert.equal(composition.presentation.effective.direction,'ltr');assert.equal(composition.presentation.effective.theme,'light');assert.equal(composition.presentation.immutableProductLaw,false);assert.equal(composition.truth.presentationDefaultsAreProductLaw,false);

console.log(JSON.stringify({surface:'portfolio',pass:true,normalDefault:'EMPTY',members:groupedDomain.records.length,grouping:unresolved.code,sourceDisposition:add.record.state,reviewDecision:'READ_ONLY_SHARED_PROJECTION',customizablePresentation:true}));
