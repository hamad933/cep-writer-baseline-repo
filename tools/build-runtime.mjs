import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripTypeScriptTypes } from 'node:module';

const modulePath = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(modulePath), '..');
const canonicalSource = path.join(root, 'stack', 'native-typescript');
const defaultDestination = path.join(root, 'dist');

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function assertOneWayDestination(sourceRoot, destinationRoot) {
  const source = path.resolve(sourceRoot);
  const destination = path.resolve(destinationRoot);
  if (destination === source || destination.startsWith(`${source}${path.sep}`)) {
    throw Error(`CANONICAL_SOURCE_WRITE_FORBIDDEN:${destination}`);
  }
}

export function buildRuntime({ sourceRoot = canonicalSource, destinationRoot = defaultDestination } = {}) {
  const source = path.resolve(sourceRoot);
  const destination = path.resolve(destinationRoot);
  assertOneWayDestination(source, destination);

  const sourceFiles = walk(source).filter((file) => file.endsWith('.ts')).sort();
  const assetFiles = walk(source).filter((file) => file.endsWith('.css')).sort();
  const expectedJs = new Set(sourceFiles.map((file) => path.relative(source, file).replace(/\.ts$/, '.js')));
  let removedStale = 0;

  for (const output of walk(destination).filter((file) => file.endsWith('.js'))) {
    const relative = path.relative(destination, output);
    if (!expectedJs.has(relative)) {
      fs.rmSync(output, { force: true });
      removedStale += 1;
    }
  }

  let written = 0;
  for (const input of sourceFiles) {
    const relative = path.relative(source, input).replace(/\.ts$/, '.js');
    const output = path.join(destination, relative);
    const generated = stripTypeScriptTypes(fs.readFileSync(input, 'utf8'), { mode: 'strip' });
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, generated);
    written += 1;
  }

  let copiedAssets = 0;
  for (const input of assetFiles) {
    const relative = path.relative(source, input);
    const output = path.join(destination, relative);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.copyFileSync(input, output);
    copiedAssets += 1;
  }

  return {
    pass: true,
    authority: 'CANONICAL_SOURCE_TO_GENERATED_ONLY',
    source: path.relative(root, source).replaceAll(path.sep, '/'),
    destination: path.relative(root, destination).replaceAll(path.sep, '/'),
    written,
    copiedAssets,
    removedStale
  };
}

const invokedAsScript = process.argv[1] && path.resolve(process.argv[1]) === modulePath;
if (invokedAsScript) console.log(JSON.stringify(buildRuntime(), null, 2));
