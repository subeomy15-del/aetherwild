import {readdir,readFile,access} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url));
async function walk(dir){const entries=await readdir(dir,{withFileTypes:true});const files=[];for(const entry of entries){const path=resolve(dir,entry.name);if(entry.isDirectory())files.push(...await walk(path));else files.push(path);}return files;}
const files=(await walk(resolve(root,'dist/src'))).filter(p=>p.endsWith('.js'));
let failures=0;
for(const file of files){
 const check=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
 if(check.status!==0){console.error(check.stderr);failures++;}
 const source=await readFile(file,'utf8');
 for(const match of source.matchAll(/(?:\bimport\s+(?:[^'";]*?\s+from\s+)?|\bexport\s+[^'";]*?\s+from\s+)["']([^"']+)["']/g)){
  if(!match[1].startsWith('.'))continue;
  try{await access(resolve(dirname(file),match[1]));}catch{console.error(`Missing import: ${file}: ${match[1]}`);failures++;}
 }
}
const index=await readFile(resolve(root,'dist/index.html'),'utf8');
for(const match of index.matchAll(/(?:src|href)=["'](\.\/[^"]+)["']/g)){
 try{await access(resolve(root,'dist',match[1]));}catch{console.error(`Missing entry asset: ${match[1]}`);failures++;}
}
if(failures){console.error(`${failures} source check(s) failed.`);process.exitCode=1;}else console.log(`Checked syntax and local imports for ${files.length} source modules.`);
