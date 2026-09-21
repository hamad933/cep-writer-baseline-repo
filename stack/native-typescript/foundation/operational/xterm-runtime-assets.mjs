import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../../../..'),installed=path.join(root,'node_modules','@xterm','xterm'),vendored=path.join(root,'stack','windows-platform','vendor','xterm'),pkg=fs.existsSync(installed)?installed:vendored,dest=path.join(root,'dist','vendor','xterm');
if(!fs.existsSync(pkg))throw Error('XTERM_ASSETS_UNAVAILABLE');fs.mkdirSync(dest,{recursive:true});
for(const [src,name] of [['lib/xterm.mjs','xterm.mjs'],['xterm.mjs','xterm.mjs'],['css/xterm.css','xterm.css'],['xterm.css','xterm.css'],['LICENSE','LICENSE'],['package.json','package.json']]){const from=path.join(pkg,src);if(!fs.existsSync(from))continue;const to=path.join(dest,name);if(!fs.existsSync(to))fs.copyFileSync(from,to)}
for(const name of ['xterm.mjs','xterm.css','LICENSE','package.json'])if(!fs.existsSync(path.join(dest,name)))throw Error('XTERM_ASSET_MISSING:'+name);
console.log(JSON.stringify({pass:true,source:pkg===installed?'@xterm/xterm':'managed-vendored-xterm',destination:'dist/vendor/xterm',assets:['xterm.mjs','xterm.css','LICENSE','package.json']}));
