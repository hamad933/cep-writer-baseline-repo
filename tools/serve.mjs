import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,relative,isAbsolute} from 'node:path';
const root=resolve(import.meta.dirname,'../dist');
const args=process.argv.slice(2),port=Number(args[args.indexOf('--port')+1])||Number(process.env.PORT)||4173;
const mime=Object.freeze({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'});
function contained(pathname){const raw=decodeURIComponent(pathname)==='/'?'index.html':decodeURIComponent(pathname).slice(1),file=resolve(root,raw),rel=relative(root,file);if(!rel||(!isAbsolute(rel)&&rel!=='..'&&!rel.startsWith(`..${process.platform==='win32'?'\\':'/'}`)))return file;throw Error('invalid path')}
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost'),file=contained(url.pathname),body=await readFile(file);res.writeHead(200,{'content-type':mime[extname(file).toLowerCase()]||'application/octet-stream','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(body)}catch{res.writeHead(404,{'content-type':'text/plain; charset=utf-8'});res.end('Not found')}});
server.listen(port,'0.0.0.0',()=>console.log(`Local proof server ready on port ${port}`));
