import { cpSync,existsSync,mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const derived=fileURLToPath(new URL('../../data/derived/',import.meta.url));
const destination=fileURLToPath(new URL('../public/data/',import.meta.url));
if(existsSync(`${derived}/index.json`)){mkdirSync(destination,{recursive:true});cpSync(derived,destination,{recursive:true});console.log('[copy-data] copied canonical evidence');}
else console.log('[copy-data] canonical evidence not present; runtime will report unavailable');
const operations=fileURLToPath(new URL('../../data/operations/',import.meta.url));
const operationsDestination=fileURLToPath(new URL('../public/operations/',import.meta.url));
if(existsSync(`${operations}/index.json`)){mkdirSync(operationsDestination,{recursive:true});cpSync(operations,operationsDestination,{recursive:true});console.log('[copy-data] copied executed compound operations');}
