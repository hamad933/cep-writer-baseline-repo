/**
 * W03-LABS · static server for the writer-private capture site (never serves shared `dist/`).
 * Usage: node writer-output/W03-LABS/serve-site.mjs --port 4173 --root /tmp/opencode/labs-site
 */
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,relative,isAbsolute} from 'node:path';

const args=process.argv.slice(2);
const arg=n=>{const i=args.indexOf(n);return i>=0?args[i+1]:null};
const root=resolve(arg('--root')||'/tmp/opencode/labs-site');
const port=Number(arg('--port'))||0;

const mime=Object.freeze({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'});
const contained=pathname=>{const raw=decodeURIComponent(pathname)==='/'?'index.html':decodeURIComponent(pathname).slice(1),file=resolve(root,raw),rel=relative(root,file);if(rel&&!rel.startsWith('..')&&!isAbsolute(rel))return file;throw Error('invalid path')};

const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost'),file=contained(url.pathname),body=await readFile(file);
    res.writeHead(200,{'content-type':mime[extname(file).toLowerCase()]||'application/octet-stream','cache-control':'no-store','x-content-type-options':'nosniff'});
    res.end(body);
  }catch{res.writeHead(404,{'content-type':'text/plain; charset=utf-8'});res.end('Not found')}
});
server.listen(port,'127.0.0.1',()=>console.log(JSON.stringify({root,port:server.address().port})));
