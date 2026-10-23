import http from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('./dist/', import.meta.url));
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json; charset=utf-8','.txt':'text/plain; charset=utf-8'};
const server = http.createServer(async (req,res) => {
  try {
    if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405);return res.end();}
    const url = new URL(req.url,'http://localhost');
    const path = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
    if (path.includes('..') || path.includes('\\')) throw Error('Invalid path');
    const file = await realpath(resolve(root, '.'+path));
    if (!file.startsWith(root.endsWith(sep)?root:root+sep)) throw Error('Invalid path');
    const bytes = await readFile(file);
    res.writeHead(200, {'Content-Type':types[extname(file)] || 'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
    res.end(req.method === 'HEAD' ? undefined : bytes);
  } catch {res.writeHead(404);res.end('Not found');}
});
const port = Number(process.env.PORT) || 3015;
server.listen(port,'127.0.0.1',()=>console.log(`Aetherwild: http://localhost:${port}`));
