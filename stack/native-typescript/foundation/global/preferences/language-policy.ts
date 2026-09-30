/* LANGUAGE + DIRECTION POLICY — gap G-20 / VD-003.
 *
 * OWNER POLICY (final, non-negotiable):
 *   - Arabic and English are BOTH first-class product languages.
 *   - The active language is user-configurable through Settings.
 *   - There is NO permanent Arabic-first or English-first product authority.
 *   - A reference being Arabic/English does NOT make it the product default.
 *   - The document shell direction follows the ACTIVE PREFERENCE, never a baked default.
 *
 * Resolution order implemented here (single owner, no second resolver anywhere):
 *   1. explicit user preference  — ScopedPreferencesOwner override (`locale`, `chromeDirection`)
 *   2. browsing-context language environment — navigator.languages / document
 *   3. schema placeholder — ONLY reachable outside a browsing context (headless runtimes,
 *      unit fixtures). The product always runs inside a browsing context, so step 3 is never
 *      a product-language decision; it exists because a preference schema must publish a
 *      concrete, in-values `safeDefault` for validation and type checking.
 *
 * Direction is never independent authority either: `chromeDirection` may be pinned explicitly
 * by the user, otherwise it is DERIVED from the active locale. Nothing bakes `dir` into structure.
 */

export const LANGUAGE_POLICY_OWNER='LanguageDirectionPolicyOwner';
export const LANGUAGE_POLICY_CONTRACT=Object.freeze({
  id:LANGUAGE_POLICY_OWNER,
  version:'1.0.0',
  supportedLocales:Object.freeze(['ar','en']),
  productLanguageAuthority:null,
  privilegedProductLanguage:null,
  localeAuthority:'USER_PREFERENCE_THEN_BROWSING_CONTEXT_LANGUAGE_ENVIRONMENT',
  directionAuthority:'USER_CHROME_DIRECTION_THEN_DERIVED_FROM_ACTIVE_LOCALE',
  documentShellAuthority:'ACTIVE_LANGUAGE_PREFERENCE',
  stateClass:'RESOLVER_ONLY'
});

/** Schema placeholder. Not a product default: unreachable whenever a browsing context exists. */
export const SCHEMA_PLACEHOLDER_WITHOUT_BROWSING_CONTEXT='ar';
/** When the browsing context declares a language CEP does not ship, pick by DIRECTION of that
    language (one shipped locale is RTL, one is LTR) instead of preferring either language. */
const RTL_ENVIRONMENT_LANGUAGES=Object.freeze(['ar','he','fa','ur','ps','ku','dv','syr','ug','yi','sd','ckb']);

const supported=LANGUAGE_POLICY_CONTRACT.supportedLocales as readonly string[];
const supportedLocales=()=>[...supported];

export function localeDirection(locale){
  return locale==='ar'?'rtl':'ltr';
}

/** Language tags declared by the browsing context, or null when there is no browsing context. */
export function browsingContextLanguageTags(){
  try{
    const nav:any=(globalThis as any).navigator;
    const doc:any=(globalThis as any).document;
    if(!doc||!nav)return null;
    const raw=Array.isArray(nav.languages)&&nav.languages.length?nav.languages:(nav.language?[nav.language]:[]);
    const tags=raw.map(tag=>String(tag||'').trim().toLowerCase().replace('_','-')).filter(Boolean);
    return tags.length?tags:null;
  }catch{return null}
}

/** The language the user's own environment expresses. Never derived from a reference image. */
export function resolveSystemLocale(){
  const tags=browsingContextLanguageTags();
  if(!tags)return SCHEMA_PLACEHOLDER_WITHOUT_BROWSING_CONTEXT;
  for(const locale of supportedLocales()){
    if(tags.some(tag=>tag===locale||tag.startsWith(`${locale}-`)))return locale;
  }
  const primary=String(tags[0]||'').split('-')[0];
  return RTL_ENVIRONMENT_LANGUAGES.includes(primary)?'ar':'en';
}

export function systemLocaleSource(){
  const tags=browsingContextLanguageTags();
  if(!tags)return {source:'schema-placeholder-without-browsing-context',tags:[],locale:SCHEMA_PLACEHOLDER_WITHOUT_BROWSING_CONTEXT};
  return {source:'browsing-context-language-environment',tags:[...tags],locale:resolveSystemLocale()};
}

/** Effective locale: user override wins, otherwise the browsing context decides. */
export function resolveActiveLocale(preferences){
  try{
    const resolved=preferences?.resolve?.('locale');
    const preferred=resolved?.preferredValue;
    if(supported.includes(preferred))return {locale:preferred,source:resolved?.sourceScope==='default'?'environment':'user-preference',sourceScope:resolved?.sourceScope||'default',safeDefault:resolved?.safeDefault??preferred};
  }catch{/* fall through to environment */}
  const locale=resolveSystemLocale();
  return {locale,source:'environment',sourceScope:'default',safeDefault:locale};
}

/** Effective direction: explicit chrome pin wins, otherwise derived from the active locale. */
export function resolveActiveDirection(preferences){
  let configured=null;
  try{configured=preferences?.resolve?.('chromeDirection')?.preferredValue}catch{configured=null}
  if(configured==='rtl'||configured==='ltr')return {direction:configured,source:'user-preference',localeSource:resolveActiveLocale(preferences).source};
  const {locale,source}=resolveActiveLocale(preferences);
  return {direction:localeDirection(locale),source:`derived-from-locale:${source}`,localeSource:source};
}

/** Write the active preference onto the document shell. The shell never keeps a baked direction. */
export function applyDocumentShellLanguage(preferences){
  const root=(globalThis as any).document?.documentElement;
  if(!root)return {applied:false,code:'NO_DOCUMENT_SHELL'};
  const locale=resolveActiveLocale(preferences),direction=resolveActiveDirection(preferences);
  root.lang=locale.locale;
  root.dir=direction.direction;
  root.dataset.languageAuthority=locale.source;
  root.dataset.directionAuthority=direction.source;
  try{(globalThis as any).document.body?.setAttribute('data-foundation-direction',direction.direction)}catch{}
  return {applied:true,lang:locale.locale,dir:direction.direction,languageAuthority:locale.source,directionAuthority:direction.source};
}

/** Bilingual string helper used by every W05 presentation surface. */
export function pick(locale,pair){
  if(pair&&typeof pair==='object')return String(pair[locale]??pair.ar??pair.en??'');
  return String(pair??'');
}
