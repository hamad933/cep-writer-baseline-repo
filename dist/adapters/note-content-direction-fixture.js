import {InputDirectionResolver} from '../foundation/global/input-direction.js';
import {StructuredRichContentOwner} from '../foundation/structured/rich-content.js';

export function createNoteContentDirectionFixture({resolver=new InputDirectionResolver(),id='note-content-fixture',html='',dir=null}={}){
  const rich=new StructuredRichContentOwner({directionResolver:resolver});const initialized=resolver.initializeEmptyNoteContent({id,html,dir});
  return {owner:'NoteContentDirectionFixtureAdapter',stickyNoteWindowOwnerImplemented:false,content:initialized.content,resolution:initialized.resolution,project:()=>rich.projectBlock({id,type:'paragraph',html:initialized.content.html,dir:initialized.content.dir})};
}
