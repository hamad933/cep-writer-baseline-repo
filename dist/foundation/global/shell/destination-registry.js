                                       
                                    
                                                             
                                            
                         
                                 
                                                
                                                     
 
                                           
                        
                                       
                                                
                                                     
 

export const GLOBAL_SHELL_DESTINATION_REGISTRY_OWNER='GlobalShellDestinationRegistry';
export const GLOBAL_SHELL_AREA_BASELINE_OWNER='GlobalShellAreaBaseline';
const ID_PATTERN=/^[a-z0-9][a-z0-9._-]*$/i;
const AREA_PATTERN=/^W(?:0[1-5]|[1-5])$/;
const freezeDescriptor=(descriptor                           )                           =>Object.freeze({
  id:String(descriptor.id),
  area:String(descriptor.area),
  labels:Object.freeze({ar:String(descriptor.labels.ar),en:String(descriptor.labels.en)}),
  description:Object.freeze({ar:String(descriptor.description.ar),en:String(descriptor.description.en)})
});
const freezeArea=(descriptor                          )                          =>Object.freeze({
  id:descriptor.id,
  defaultSurfaceId:String(descriptor.defaultSurfaceId),
  labels:Object.freeze({ar:String(descriptor.labels.ar),en:String(descriptor.labels.en)}),
  description:Object.freeze({ar:String(descriptor.description.ar),en:String(descriptor.description.en)})
});

/**
 * Current five-destination functional baseline. The visual/navigation composition is deliberately
 * NOT frozen: these are semantic area identities for the current product baseline, not authority
 * to make the count immutable in future Owner decisions.
 */
export const CEP_GLOBAL_AREA_BASELINE=Object.freeze([
  freezeArea({id:'W01',defaultSurfaceId:'today',labels:{ar:'اليوم',en:'Today'},description:{ar:'استئناف العمل والإسقاطات اليومية',en:'Resume work and daily orchestration'}}),
  freezeArea({id:'W02',defaultSurfaceId:'library',labels:{ar:'المعرفة والتعلّم',en:'Knowledge & Learning'},description:{ar:'المعرفة والتعلّم والتحليل',en:'Knowledge, learning and analysis'}}),
  freezeArea({id:'W03',defaultSurfaceId:'enterprise',labels:{ar:'المحاكاة والمؤسسات',en:'Simulation & Enterprise'},description:{ar:'النمذجة والمحاكاة والتشغيل',en:'Modelling, simulation and operations'}}),
  freezeArea({id:'W04',defaultSurfaceId:'evidence',labels:{ar:'التقدم والأدلة',en:'Progress & Evidence'},description:{ar:'الأدلة والمراجعات والإتقان والملف',en:'Evidence, review, mastery and portfolio'}}),
  freezeArea({id:'W05',defaultSurfaceId:'health',labels:{ar:'النظام والعمليات',en:'System & Operations'},description:{ar:'الصحة والمعالجة والتحقق والتشغيل',en:'Health, processing, validation and operations'}})
]                                                            );

/** Descriptor/admission registry. Shell mechanics consume this registry and do not own surface membership. */
export class ShellDestinationRegistry{
  owner=GLOBAL_SHELL_DESTINATION_REGISTRY_OWNER;
  descriptors                                          ;
  defaultId                    ;
  byId                                       ;
  constructor(descriptors                                          ,{defaultId='library'}                    ={}){
    if(!Array.isArray(descriptors)||!descriptors.length)throw Error('GLOBAL_SHELL_DESTINATION_REGISTRY_EMPTY');
    const frozen                                  =[],seen=new Set        ();
    for(const source of descriptors){
      const descriptor=freezeDescriptor(source),id=descriptor.id;
      if(!ID_PATTERN.test(id)||id==='golden')throw Error('GLOBAL_SHELL_DESTINATION_ID_INVALID:'+id);
      if(!AREA_PATTERN.test(descriptor.area))throw Error('GLOBAL_SHELL_DESTINATION_AREA_INVALID:'+descriptor.area);
      if(!descriptor.labels.ar||!descriptor.labels.en||!descriptor.description.ar||!descriptor.description.en)throw Error('GLOBAL_SHELL_DESTINATION_COPY_REQUIRED:'+id);
      if(seen.has(id))throw Error('GLOBAL_SHELL_DESTINATION_DUPLICATE:'+id);
      seen.add(id);frozen.push(descriptor);
    }
    if(!seen.has(defaultId))throw Error('GLOBAL_SHELL_DEFAULT_DESTINATION_NOT_REGISTERED:'+defaultId);
    this.descriptors=Object.freeze(frozen);this.defaultId=defaultId;this.byId=new Map(this.descriptors.map(item=>[item.id,item]));
  }
  has(value       )                             {return this.byId.has(value)}
  get(value       ){return this.byId.get(value)||null}
  list(){return this.descriptors}
  area(value       ){return this.get(value)?.area||null}
  surfacesInArea(area       ){return this.descriptors.filter(item=>item.area===area)}
  globalAreas(){
    return CEP_GLOBAL_AREA_BASELINE.filter(area=>this.surfacesInArea(area.id).length>0).map(area=>{
      const fallback=this.surfacesInArea(area.id)[0]?.id||this.defaultId;
      return Object.freeze({...area,defaultSurfaceId:this.has(area.defaultSurfaceId)?area.defaultSurfaceId:fallback});
    });
  }
  descriptor(){return Object.freeze({
    owner:this.owner,
    defaultId:this.defaultId,
    count:this.descriptors.length,
    destinations:Object.freeze(this.descriptors.map(item=>Object.freeze({id:item.id,area:item.area}))),
    globalAreaBaselineOwner:GLOBAL_SHELL_AREA_BASELINE_OWNER,
    globalAreaBaselineCount:CEP_GLOBAL_AREA_BASELINE.length,
    destinationCountFrozen:false
  })}
}

export const DEFAULT_SHELL_DESTINATION_DESCRIPTORS=Object.freeze([
  Object.freeze({id:'library',area:'W02',labels:Object.freeze({ar:'المكتبة',en:'Library'}),description:Object.freeze({ar:'المعرفة والتحرير',en:'Knowledge & editor'})}),
  Object.freeze({id:'learn',area:'W02',labels:Object.freeze({ar:'التعلّم',en:'Learn'}),description:Object.freeze({ar:'التعلّم والممارسة',en:'Learning & practice'})}),
  Object.freeze({id:'visualize',area:'W02',labels:Object.freeze({ar:'التصوّر',en:'Visualize'}),description:Object.freeze({ar:'العلاقات والمنظورات',en:'Relations & views'})}),
  Object.freeze({id:'runs',area:'W03',labels:Object.freeze({ar:'التشغيل',en:'Runs'}),description:Object.freeze({ar:'التشغيل المحلي',en:'Local operations'})}),
  Object.freeze({id:'enterprise',area:'W03',labels:Object.freeze({ar:'المؤسسة',en:'Enterprise'}),description:Object.freeze({ar:'منظور المؤسسة',en:'Enterprise view'})})
]                                                             );
export const DEFAULT_SHELL_DESTINATION_REGISTRY=new ShellDestinationRegistry(DEFAULT_SHELL_DESTINATION_DESCRIPTORS,{defaultId:'library'});
export const createShellDestinationRegistry=(descriptors                                          ,options                    ={})=>new ShellDestinationRegistry(descriptors,options);
