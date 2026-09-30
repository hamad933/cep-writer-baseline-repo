export const STRUCTURED_RICH_SANITIZATION_POLICY=Object.freeze({
  revision:'structured-rich-sanitize-w4c-r1',
  allowTags:Object.freeze(['strong','b','em','i','u','s','code','bdi','br','mark']),
  codeClasses:Object.freeze(['inline-code']),
  bidiDirections:Object.freeze(['rtl','ltr']),
  stripWholeElements:Object.freeze(['script','style','iframe','object','embed','svg','math','template']),
  rejectActiveAttributeNames:true,
  portableKind:'cep.structured.rich-fragment',
  portableVersion:1
});

const escapeText=value=>String(value??'').replace(/&(?!(?:#\d+|#x[0-9a-f]+|[a-z][a-z0-9]+);)/gi,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\b(javascript|vbscript)\s*:/gi,'$1&#58;').replace(/data\s*:\s*text\/html/gi,'data&#58;text/html');
const escapeAttr=value=>String(value??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

export function sanitizeStructuredInlineHTML(input,policy=STRUCTURED_RICH_SANITIZATION_POLICY){
  let source=String(input??'').replace(/\u0000/g,'');const violations=[];
  for(const tag of policy.stripWholeElements){const re=new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}\\s*>`,'gi');if(re.test(source)){violations.push({code:'ACTIVE_ELEMENT_STRIPPED',tag});source=source.replace(re,'');}}
  const allow=new Set(policy.allowTags),voidTags=new Set(['br']);let out='',cursor=0;const tagRe=/<[^>]*>/g;let match;
  while((match=tagRe.exec(source))){out+=escapeText(source.slice(cursor,match.index));cursor=match.index+match[0].length;const token=match[0];const close=token.match(/^<\s*\/\s*([a-z0-9-]+)\s*>$/i);if(close){const name=close[1].toLowerCase();if(allow.has(name)&&!voidTags.has(name))out+=`</${name}>`;else violations.push({code:'TAG_STRIPPED',tag:name});continue;}const open=token.match(/^<\s*([a-z0-9-]+)([^>]*)>$/i);if(!open){out+=escapeText(token);violations.push({code:'MALFORMED_TAG_ESCAPED'});continue;}const name=open[1].toLowerCase();if(!allow.has(name)){violations.push({code:'TAG_STRIPPED',tag:name});continue;}const attrs=open[2]||'';let admitted='';if(name==='bdi'){const dir=attrs.match(/\bdir\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i);const value=(dir?.[1]??dir?.[2]??dir?.[3]??'').toLowerCase();if(policy.bidiDirections.includes(value))admitted=` dir="${escapeAttr(value)}"`;if(/\son[a-z0-9_-]+\s*=/i.test(attrs))violations.push({code:'EVENT_HANDLER_STRIPPED',tag:name});}
    else if(name==='code'){const cls=attrs.match(/\bclass\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i);const value=cls?.[1]??cls?.[2]??cls?.[3]??'';if(policy.codeClasses.includes(value))admitted=` class="${escapeAttr(value)}"`;if(/\son[a-z0-9_-]+\s*=/i.test(attrs))violations.push({code:'EVENT_HANDLER_STRIPPED',tag:name});}
    else if(/\son[a-z0-9_-]+\s*=|\b(?:style|srcdoc|href|src)\s*=/i.test(attrs))violations.push({code:'ACTIVE_ATTRIBUTE_STRIPPED',tag:name});
    out+=voidTags.has(name)?`<${name}>`:`<${name}${admitted}>`;
  }
  out+=escapeText(source.slice(cursor));
  const unsafeLeak=/<\/?(?:script|style|iframe|object|embed|svg|math|template)\b|\son[a-z0-9_-]+\s*=|javascript\s*:|vbscript\s*:/i.test(out);
  if(unsafeLeak)throw Error('STRUCTURED_RICH_SANITIZER_LEAK');
  return {html:out,changed:out!==String(input??''),safe:true,violations,policyRevision:policy.revision};
}
