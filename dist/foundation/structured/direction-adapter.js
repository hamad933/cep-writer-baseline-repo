import {InputDirectionResolver} from '../global/input-direction.js';

export const STRUCTURED_DIRECTION_ADAPTER_CONTRACT=Object.freeze({id:'StructuredDirectionAdapter',version:'1.0.0',owner:'Structured Family',policyRevision:'structured-direction-adapter-w4c-r1'});

export class StructuredDirectionAdapter{
  constructor(resolver=new InputDirectionResolver()){if(!(resolver instanceof InputDirectionResolver)&&resolver?.owner!=='InputDirectionResolver')throw Error('INPUT_DIRECTION_RESOLVER_REQUIRED');this.owner='StructuredDirectionAdapter';this.contract=STRUCTURED_DIRECTION_ADAPTER_CONTRACT;this.resolver=resolver;}
  resolveBlock(block,{fallbackDirection=null}={}){return this.resolver.resolve({persistedDirection:block?.dir,content:block?.type==='code'?(block?.codeText??block?.html??''):(block?.html??block?.title??''),fallbackDirection,surface:'structured',blockId:block?.id||null});}
  initializeEmptyBlock(block,options={}){return this.resolver.initializeEmptyStructuredBlock(block,options);}
}
