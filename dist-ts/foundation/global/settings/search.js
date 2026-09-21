export const SETTINGS_CENTER_SEARCH_OWNER='SettingsCenterOwner';
export const SETTINGS_CENTER_SEARCH_POLICY=Object.freeze({normalization:'NFKC_CASEFOLD_DIACRITIC_STABLE',tokenPolicy:'ALL_TOKENS',sortPolicy:'SCORE_GROUP_SECTION_ITEM_ID'});

const ARABIC_DIACRITICS=/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;
export function normalizeSettingsSearchText(value=''){
  return String(value??'').normalize('NFKC').replace(ARABIC_DIACRITICS,'').replace(/ـ/g,'').toLocaleLowerCase('en-US').replace(/\s+/g,' ').trim();
}
const tokens=query=>normalizeSettingsSearchText(query).split(' ').filter(Boolean);
const itemText=(section,item)=>normalizeSettingsSearchText([section.groupLabel,section.label,item.id,item.label,item.key,item.value,item.effectiveValue,item.chord,item.commandId,item.sourceOwner,item.searchableText].filter(value=>value!==undefined&&value!==null).join(' '));
const sectionText=section=>normalizeSettingsSearchText([section.groupLabel,section.label,section.id,section.sourceOwner].join(' '));
function score(query,section,item,text){
  if(!query)return 100;
  const sectionValue=sectionText(section),itemLabel=normalizeSettingsSearchText(item.label||''),itemId=normalizeSettingsSearchText(item.id||'');
  if(itemLabel===query||itemId===query||sectionValue===query)return 0;
  if(itemLabel.startsWith(query)||sectionValue.startsWith(query))return 1;
  if(itemLabel.includes(query)||sectionValue.includes(query))return 2;
  if(text.includes(query))return 3;
  return 9;
}

export function searchSettingsSections(sections=[],query=''){
  const normalizedQuery=normalizeSettingsSearchText(query),required=tokens(normalizedQuery),rows=[];
  for(const section of sections){
    for(let itemIndex=0;itemIndex<section.items.length;itemIndex+=1){
      const item=section.items[itemIndex],text=itemText(section,item);
      if(required.length&&!required.every(token=>text.includes(token)))continue;
      rows.push(Object.freeze({
        id:`${section.id}::${item.id}`,
        sectionId:section.id,
        sectionLabel:section.label,
        groupId:section.groupId,
        groupLabel:section.groupLabel,
        groupOrder:section.groupOrder,
        sectionOrder:section.order,
        itemIndex,
        itemId:item.id,
        itemLabel:item.label,
        kind:item.kind,
        score:score(normalizedQuery,section,item,text),
        sourceOwner:item.sourceOwner||section.sourceOwner,
        matchText:text
      }));
    }
  }
  rows.sort((a,b)=>a.score-b.score||a.groupOrder-b.groupOrder||a.sectionOrder-b.sectionOrder||a.itemIndex-b.itemIndex||a.id.localeCompare(b.id));
  return Object.freeze(rows);
}
