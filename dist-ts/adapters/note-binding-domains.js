import {createDomainBindingInputAdapter} from '../foundation/notes/note-binding.js';

export const LIBRARY_NOTE_BINDING_INPUT_ADAPTER=createDomainBindingInputAdapter({
  id:'LibraryNoteBindingInputAdapter',domainKind:'library',surfaceId:'library',allowedSourceFields:['documentId','objectId','blockId','sourceRange']
});
export const LEARN_NOTE_BINDING_INPUT_ADAPTER=createDomainBindingInputAdapter({
  id:'LearnNoteBindingInputAdapter',domainKind:'learn',surfaceId:'learn',allowedSourceFields:['documentId','objectId','blockId','sourceRange']
});
export const SPATIAL_NOTE_BINDING_INPUT_ADAPTER=createDomainBindingInputAdapter({
  id:'SpatialNoteBindingInputAdapter',domainKind:'spatial',surfaceId:'visualize',allowedSourceFields:['objectId','sourceRange']
});

const present=(object,key,value)=>{if(value!==undefined&&value!==null)object[key]=value;return object};

export function libraryNoteBindingInput({noteId,documentId,kuId,objectId,blockId,selection,sourceRange,route,availability,sourceLabel,sourceMetadata,contextMetadata,revisions}={}){
  const source={};present(source,'documentId',documentId??kuId);present(source,'objectId',objectId);present(source,'blockId',blockId);present(source,'sourceRange',sourceRange??selection);
  const input={noteId,domainKind:'library',surfaceId:'library',source,route,availability};
  if(documentId!==undefined&&kuId!==undefined)input.sourceDocumentId=kuId;
  for(const [key,value] of Object.entries({sourceLabel,sourceMetadata,contextMetadata,revisions}))if(value!==undefined)input[key]=value;
  return LIBRARY_NOTE_BINDING_INPUT_ADAPTER.input(input);
}

export function learnNoteBindingInput({noteId,documentId,objectId,blockId,sourceRange,route,availability,sourceLabel,sourceMetadata,contextMetadata,revisions}={}){
  const source={};present(source,'documentId',documentId);present(source,'objectId',objectId);present(source,'blockId',blockId);present(source,'sourceRange',sourceRange);
  const input={noteId,domainKind:'learn',surfaceId:'learn',source,route,availability};
  for(const [key,value] of Object.entries({sourceLabel,sourceMetadata,contextMetadata,revisions}))if(value!==undefined)input[key]=value;
  return LEARN_NOTE_BINDING_INPUT_ADAPTER.input(input);
}

export function spatialNoteBindingInput({noteId,objectId,sourceRange,route,availability,sourceLabel,sourceMetadata,contextMetadata,revisions}={}){
  const source={};present(source,'objectId',objectId);present(source,'sourceRange',sourceRange);
  const input={noteId,domainKind:'spatial',surfaceId:'visualize',source,route,availability};
  for(const [key,value] of Object.entries({sourceLabel,sourceMetadata,contextMetadata,revisions}))if(value!==undefined)input[key]=value;
  return SPATIAL_NOTE_BINDING_INPUT_ADAPTER.input(input);
}

export function libraryDonorNoteBindingInput(note,{availability={state:'available',evidence:{kind:'CURRENT_LIBRARY_FIXTURE'}},sourceLabel}={}){
  return libraryNoteBindingInput({noteId:note.id,kuId:note.binding.kuId,blockId:note.binding.blockId,selection:note.binding.selection??undefined,route:note.binding.route,availability,sourceLabel});
}
