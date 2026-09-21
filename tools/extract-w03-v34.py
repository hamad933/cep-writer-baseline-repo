"""Targeted extraction from sole v3.4 ZIP, never from earlier lineage."""
from pathlib import Path
import re,hashlib,json,zipfile
root=Path(__file__).resolve().parents[1]
zp=root.parent/'control_sources/CEP_EXECUTION_CONTROL_CENTER/04_WRITER_HANDOFFS/W03/CEP_W03_UNIFIED_EXECUTABLE_BLUEPRINT_SYSTEM_v3.4_OWNER_DIRECT_REVIEW_CORRECTED_CANDIDATE.zip'
assert hashlib.sha256(zp.read_bytes()).hexdigest()=='23b66696a9cc72cb343c74e70f380ccb248e1fbc378d8ce7839ba74111a3d716'
out=root/'dist/adapters/w03-v34';out.mkdir(exist_ok=True)
rows=[]
with zipfile.ZipFile(zp) as z:
 for surface in ['ENTERPRISE','SCENARIOS','LABS','RUNS','RESULTS']:
  name=f'W03_{surface}_EXECUTABLE_BLUEPRINT_v3.0_SUCCESSOR_CANDIDATE.html'
  member=min((n for n in z.namelist() if n.endswith('/'+name)),key=lambda n:n.count('/'))
  data=z.read(member);ss=re.findall(r'<script[^>]*>(.*?)</script>',data.decode(),re.S)
  target=root/'dist/reference/w03-v34'/name;target.parent.mkdir(exist_ok=True);target.write_bytes(data)
  row={'surface':surface,'zip_member':member,'sha256':hashlib.sha256(data).hexdigest(),'reference':str(target.relative_to(root)),'classification':'W03_V3_4_SAME_LINEAGE_VALUE_DOMAIN_REQUIREMENT_EVIDENCE_DONOR_NOT_AUTHORITY'}
  if surface=='RUNS':
   core=ss[1]; start=core.index('const copy=') if 'const copy=' in core else core.index('function copy')
   # Keep domain pure logic, exclude historical Dispatcher and presentation utilities from new ownership.
   core=core[core.index("'use strict';")+len("'use strict';"):core.index('class Dispatcher')]
   (out/'domain-kernel.js').write_text('// Extracted unmodified pure function bodies from v3.4 Runs inline script[1].\n'+core+'\nexport {validateRelation,requestRun,acknowledgeRun,completeRun,preflight,seal,replay};\n')
   s=ss[4];a=s.index('const fixture=');b=s.index('\n};',a)+3
   (out/'runs-fixture.js').write_text('// Exact v3.4 Runs inline script[4] fixture, historical assertions are source evidence.\nexport '+s[a:b]+'\n')
   row['extractions']=['inline-script[1]: pure domain kernel (Dispatcher excluded)','inline-script[4]: const fixture','inline-script[5]: W03RunDomain causal/lifecycle boundaries']
  if surface=='ENTERPRISE':
   s=ss[7];a=s.index('const nodes=');b=s.index('\n};',a)+3
   (out/'enterprise-fixture.js').write_text('// Exact v3.4 Enterprise inline script[7] nodes.\nexport '+s[a:b]+'\n')
   row['extractions']=['inline-script[7]: const nodes','inline-script[11]: interface mapping, enterpriseId, revisionId, twinId','inline-script[12]: ODR relation routes and current owner corrections']
  rows.append(row)
(root/'authority/W03_V34_TARGETED_INTAKE.json').write_text(json.dumps({'zip':str(zp.relative_to(root.parent)),'sha256':hashlib.sha256(zp.read_bytes()).hexdigest(),'previousFoundation':'857b7162bfbf45ee082861928f19bae994c8be5db51b0284dec8e56e5a5d69ac','sources':rows},indent=2))
print('Extracted latest five originals, two exact fixtures, pure domain kernel; no historical UI dispatcher mounted.')
