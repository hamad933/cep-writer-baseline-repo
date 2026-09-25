await import('../dist/tests/post-c03/D07/d07-today-presentation-authority-tests.js');
if(process.exitCode)throw Error('D07_PRIMARY_FALSIFICATION_FAILED');
await import('../dist/tests/rescue/S07_W01_W02_SHELL_TODAY/s07-contracts.test.js');
await import('../dist/tests/rescue/CG3_W01_W02_COVERAGE/cg3-w01-w02-coverage.test.js');
console.log(JSON.stringify({suite:'D07_STALE_HARNESS_AND_SHELL_AUTHORITY',pass:true,normalProductTruth:'TODAY_PROVIDER_UNBOUND',destinationCountFrozen:false,shellVisualAuthority:'REOPENED__NO_FINAL_SHELL_VISUAL_CLAIM'}));
