// W01-TODAY partial runtime build: transpiles ONLY this unit's owned sources into dist/.
// Used when the shared `tools/build-runtime.mjs` is blocked by another writer's
// in-flight source error. Writes the same output the sanctioned build would produce,
// for W01-TODAY owned files only. Serialized through tools/writer-serial.sh.
import { stripTypeScriptTypes } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const FILES = [
  'stack/native-typescript/surfaces/today/presentation.ts',
  'stack/native-typescript/surfaces/today/surface.ts',
  'stack/native-typescript/adapters/today/domain.ts',
  'stack/native-typescript/adapters/today/acceptance-data.ts'
];
const written = [];
for (const src of FILES) {
  const out = resolve('dist', src.replace(/^stack\/native-typescript\//, '').replace(/\.ts$/, '.js'));
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, stripTypeScriptTypes(readFileSync(src, 'utf8'), { mode: 'strip' }));
  written.push(out);
}
console.log(JSON.stringify({ partialBuild: 'W01-TODAY', written }, null, 2));
