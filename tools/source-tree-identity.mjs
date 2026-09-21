import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

export async function canonicalSourceIdentity(root) {
  const sourceRoot = new URL('stack/' + 'native-typescript/', root);
  const rows = [];
  const walk = async (directory, prefix = '') => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const relative = prefix + entry.name;
      const url = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
      if (entry.isDirectory()) await walk(url, relative + '/');
      else {
        const bytes = await readFile(url);
        rows.push({ path: relative, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
      }
    }
  };
  await walk(sourceRoot);
  rows.sort((a,b)=>a.path.localeCompare(b.path));
  const sha256 = createHash('sha256').update(rows.map(row=>`${row.path}\0${row.bytes}\0${row.sha256}\n`).join('')).digest('hex');
  return { sha256, files: rows.length, rows };
}
