export const CLIPBOARD_TRUST_CONTRACT=Object.freeze({
  id:'StructuredClipboardContract',
  version:'1.0.0',
  compatibility:'SEMVER',
  owner:'Structured Family',
  canonicalOwner:'StructuredClipboardTrustOwner',
  payloadKind:'cep.structured-fragment',
  payloadVersion:1,
  policyRevision:'structured-clipboard-trust-w2b-r1'
});

export const CLIPBOARD_TRUST_POLICY=Object.freeze({
  maxPayloadRoots:128,
  htmlTrustPolicy:'REJECT_UNSAFE_HTML',
  recursiveIdentityReseed:true,
  mutationMode:'edit-only',
  allowClipboardDOMIdentity:false
});
