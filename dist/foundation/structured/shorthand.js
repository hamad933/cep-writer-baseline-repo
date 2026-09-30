export const STRUCTURED_SHORTHAND_CONTRACT=Object.freeze({
  id:'StructuredShorthandRouter',
  version:'1.0.0',
  role:'pure-routing-table',
  semanticOwner:'StructuredInputKeymapOwner',
  mutationOwner:'StructuredMutationKernel',
  policyTag:'structured-input-shorthand-v1'
});

export const STRUCTURED_SHORTHAND_RULES=Object.freeze([
  Object.freeze({marker:'#',to:'h2',id:'heading-primary'}),
  Object.freeze({marker:'##',to:'h2',id:'heading-secondary'}),
  Object.freeze({marker:'###',to:'h3',id:'heading-tertiary'}),
  Object.freeze({marker:'-',to:'bullet',id:'bullet-dash'}),
  Object.freeze({marker:'*',to:'bullet',id:'bullet-star'}),
  Object.freeze({marker:'1.',to:'number',id:'number-one'}),
  Object.freeze({marker:'>',to:'quote',id:'quote'}),
  Object.freeze({marker:'```',to:'code',id:'code-fence'})
]);

export function resolveStructuredShorthand({key,beforeText='',afterText='',blockType='paragraph',compositionActive=false,rules=STRUCTURED_SHORTHAND_RULES}={}){
  if(compositionActive||key!==' '||blockType!=='paragraph')return null;
  const marker=String(beforeText);
  const rule=rules.find(item=>item.marker===marker);
  if(!rule)return null;
  return Object.freeze({contract:STRUCTURED_SHORTHAND_CONTRACT,ruleId:rule.id,marker:rule.marker,to:rule.to,sourceHtml:String(afterText||''),sourceText:String(afterText||'')});
}
