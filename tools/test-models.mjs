import {runModelTests} from '../dist/model-tests.js';
import {writeFile} from 'node:fs/promises';
const tests=runModelTests(),report={date:new Date().toISOString(),runtime:process.version,pass:tests.filter(t=>t.status==='PASS').length,fail:tests.filter(t=>t.status==='FAIL').length,tests};
await writeFile(new URL('../assurance/MODEL_TEST_RESULTS.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(report.fail)process.exitCode=1;
