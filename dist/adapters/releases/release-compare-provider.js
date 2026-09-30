import {createAnalyticalProviderBoundary} from '../../foundation/contracts/analysis-provider.js';
                                                                              

const clone=   (value  )  =>structuredClone(value);
const text=(value        )=>typeof value==='string'&&value.length>0;

export const RELEASE_COMPARE_PROVIDER_ID='releases.exact-candidate.v1';

export function releaseCandidateRef(row                 )                    {
  return Object.freeze({candidateId:row.candidateId,commitSHA:row.commitSHA,treeSHA:row.treeSHA,artifactDigest:row.artifactDigest});
}

export function createReleaseCompareProvider(resolveCandidate                                                 ){
  return createAnalyticalProviderBoundary({
    descriptor:{
      providerId:RELEASE_COMPARE_PROVIDER_ID,
      domainKind:'release-candidate',
      schemaVersion:'1.0.0',
      comparatorVersion:'1.0.0',
      identityShape:'candidateId+commitSHA+treeSHA+artifactDigest'
    },
    validateExactRef(ref    ){
      if(!ref||!text(ref.candidateId)||!text(ref.commitSHA)||!text(ref.treeSHA)||!text(ref.artifactDigest))throw Error('RELEASE_COMPARE_EXACT_REF_REQUIRED');
      return {candidateId:ref.candidateId,commitSHA:ref.commitSHA,treeSHA:ref.treeSHA,artifactDigest:ref.artifactDigest};
    },
    refKey(ref                    ){return `${ref.candidateId}@${ref.commitSHA}:${ref.treeSHA}:${ref.artifactDigest}`;},
    resolve(ref                    ){
      const row=resolveCandidate(ref);
      if(!row)return {state:'MISSING',reason:'Exact ReleaseCandidate identity is not present.',reasonCode:'RELEASE_CANDIDATE_EXACT_REF_MISSING',provenanceRefs:[clone(ref)]};
      const evidence=row.evidenceBinding??null;
      return {
        state:'RESOLVED',objectId:row.candidateId,revisionId:row.artifactDigest,schemaVersion:'1.0.0',
        fields:[
          {path:'identity.commitSHA',label:'Commit SHA',type:'digest',present:true,value:row.commitSHA,provenanceRefs:[clone(ref)]},
          {path:'identity.treeSHA',label:'Tree SHA',type:'digest',present:true,value:row.treeSHA,provenanceRefs:[clone(ref)]},
          {path:'identity.artifactDigest',label:'Artifact digest',type:'digest',present:true,value:row.artifactDigest,provenanceRefs:[clone(ref)]},
          {path:'technical.state',label:'Technical readiness',type:'state',present:true,value:row.state,provenanceRefs:evidence?[clone(evidence)]:[]},
          {path:'technical.evidenceDigest',label:'Evidence digest',type:'digest',present:Boolean(row.evidenceDigest),...(row.evidenceDigest?{value:row.evidenceDigest}:{}),provenanceRefs:evidence?[clone(evidence)]:[]},
          {path:'authorization.state',label:'Owner authorization',type:'state',present:true,value:row.authorization,provenanceRefs:[]},
          {path:'deployment.state',label:'Deployment observation',type:'state',present:true,value:row.deployment,provenanceRefs:[]},
          {path:'deployment.observedAt',label:'Deployment observed at',type:'timestamp',present:Boolean(row.deploymentObservedAt),...(row.deploymentObservedAt?{value:row.deploymentObservedAt}:{}),provenanceRefs:[]}
        ],
        provenanceRefs:evidence?[clone(evidence)]:[clone(ref)],
        domainContext:{technicalReadinessIsAuthorization:false,authorizationIsDeployment:false,deploymentIsObservedNotInferred:true}
      };
    },
    preflightCompatibility(){return {compatible:true,reason:'',reasonCode:'',comparatorVersion:'1.0.0'};}
  });
}
