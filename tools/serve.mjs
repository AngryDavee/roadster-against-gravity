import {createServer} from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../'+(process.env.ROADSTER_APP||'app'));
const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.mp4':'video/mp4','.webm':'video/webm'};
const port=Number(process.env.ROADSTER_PORT||4174);
createServer(async(req,res)=>{
  try {
    let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(pathname==='/favicon.ico'){res.writeHead(204);return res.end();}
    if(pathname.endsWith('/'))pathname+='index.html';
    const file=path.resolve(root,'.'+pathname);
    if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
    const s=await stat(file);const headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','Accept-Ranges':'bytes'};
    const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    if(range){const start=Number(range[1]),end=Math.min(Number(range[2]||s.size-1),s.size-1);if(start>end||start>=s.size){res.writeHead(416);return res.end();}res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${s.size}`,'Content-Length':end-start+1});createReadStream(file,{start,end}).pipe(res);}
    else{res.writeHead(200,{...headers,'Content-Length':s.size});createReadStream(file).pipe(res);}
  }catch {res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Roadster: http://localhost:${port}`));
