import {readdir,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const walk=async root=>(await Promise.all((await readdir(root,{withFileTypes:true})).map(async e=>e.isDirectory()?walk(root+'/'+e.name):[root+'/'+e.name]))).flat();
const files=await walk('public');
for(const file of files){assert(!/(?:^|\/)(?:data\.js|roi-data\.js|guia-rdc-1002\.pdf|paid-content\.sql|\.env(?:\..*)?)$/.test(file),'Private file in export: '+file);if(/\.(js|html|css|json|txt)$/.test(file)){const text=await readFile(file,'utf8');assert(!/\$aact_(?:prod|hml)_[A-Za-z0-9_]{20,}|sb_secret_[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{30,}/.test(text),'Secret-like value in export: '+file);}}
const home=await readFile('public/index.html','utf8'),login=await readFile('public/entrar/index.html','utf8'),portal=await readFile('public/entrar/portal.js','utf8');
assert(home.includes('href="/entrar/"'));
assert(login.includes('id="portal"'));
assert(portal.includes('guia_access_status')&&portal.includes('guia_paid_content'));
console.log('Verified public interface: sales page + authenticated member shell, without paid datasets.');
