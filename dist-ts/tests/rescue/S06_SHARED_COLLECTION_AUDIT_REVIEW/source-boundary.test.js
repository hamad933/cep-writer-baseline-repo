import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('family host contains no W04/W05-specific authority copy and no family-owned surface allowlist',()=>{
  const host=readFileSync('stack/native-typescript/foundation/review/family-host.ts','utf8');
  const admission=readFileSync('stack/native-typescript/foundation/review/family-admission.ts','utf8');
  assert.doesNotMatch(host,/Technical findings and provenance records remain domain-owned evidence/);
  assert.doesNotMatch(host,/formal review finding/);
  assert.doesNotMatch(admission,/Object\.freeze\(\['audit','validation'\]\)/);
  assert.match(host,/Domain records, vocabulary, lifecycle, mutations, provider truth, and authority remain outside this family/);
  assert.match(admission,/authorizedSurfaces:'NOT_OWNED_BY_SHARED_FAMILY'/);
});
