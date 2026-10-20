import { cpSync,existsSync,mkdirSync,readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const derived=fileURLToPath(new URL('../../data/derived/',import.meta.url));
const destination=fileURLToPath(new URL('../public/data/',import.meta.url));
// The readiness document (docs/contracts/catalog.md, row readiness): the views read it to say what each surface serves,
// so a build without a readable one stops here (python data-pipeline/run.py readiness writes it).
const readinessPath=`${derived}readiness.json`;
let readiness=null;
try{readiness=JSON.parse(readFileSync(readinessPath,'utf8'));}catch(error){console.error(`[copy-data] readiness.json is missing or unreadable at ${readinessPath}: run python data-pipeline/run.py readiness (${error.message})`);process.exit(1);}
if(!Array.isArray(readiness?.contracts)||!readiness.contracts.length){console.error(`[copy-data] ${readinessPath} has no contracts list`);process.exit(1);}
if(existsSync(`${derived}/index.json`)){mkdirSync(destination,{recursive:true});cpSync(derived,destination,{recursive:true});console.log('[copy-data] copied canonical evidence');}
else console.log('[copy-data] canonical evidence not present; runtime will report unavailable');
const operations=fileURLToPath(new URL('../../data/operations/',import.meta.url));
const operationsDestination=fileURLToPath(new URL('../public/operations/',import.meta.url));
if(existsSync(`${operations}/index.json`)){mkdirSync(operationsDestination,{recursive:true});cpSync(operations,operationsDestination,{recursive:true});console.log('[copy-data] copied executed compound operations');}
