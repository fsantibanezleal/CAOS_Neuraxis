import { describe,expect,it } from 'vitest';
import { advanceSimulation,cancelSimulation,startSimulation } from '../lib/simulator';
import { DEFAULT_PARAMETERS } from '../lib/types';
import { CASES } from '../data/registry';
import { normalizeEpisode } from '../api/artifacts';
import { introduction } from '../data/introduction';
import { methodology } from '../data/methodology';
import { implementation } from '../data/implementation';
import { experiments } from '../data/experiments';
import { CITATIONS } from '../data/citations';
import katex from 'katex';
import {contentDigest,parseRecipe} from '../components/Workspace';
import {nextObservedFeature} from '../components/EffectEvidence';
const params={...DEFAULT_PARAMETERS,reliability:1,noise:0,concurrency:1};
function execute(id:string,method='M01',variant='nominal'){let s=startSimulation(id,method,variant,17,params);for(let i=0;i<30&&!['completed','failed'].includes(s.episode.status);i++)s=advanceSimulation(s);return s;}
describe('virtual execution semantics',()=>{
 it('terminates all twenty nominal workflows using both actual exact policies',()=>{for(const c of CASES)for(const m of ['M01','M02']){const s=execute(c.id,m);expect(s.episode.status,`${c.id}/${m}`).toBe('completed');expect(s.episode.metrics.host_effects).toBe(0);}});
 it('replays the same causal sequence from the same seed and settings',()=>expect(execute('C11')).toEqual(execute('C11')));
 it('preserves already observed effects after cancellation and admits no more actions',()=>{let s=startSimulation('C01','M01','nominal',17,params);for(let i=0;i<3;i++)s=advanceSimulation(s);const resources=structuredClone(s.episode.resources);s=cancelSimulation(s);expect(s.episode.resources).toEqual(resources);expect(advanceSimulation(s)).toEqual(s);expect(s.episode.status).toBe('cancelled');});
 it('retains unknown outcome without a fabricated residual',()=>{let s=advanceSimulation(startSimulation('C06','M01','nominal',17,params));s.fault=true;s=advanceSimulation(s);expect(s.episode.decisions.at(-1)?.status).toBe('unknown');expect(s.episode.decisions.at(-1)?.effect_observed).toBeUndefined();expect(s.episode.decisions.at(-1)?.residual).toBeUndefined();expect(s.episode.decisions.at(-1)?.action).toBe('reconcile');});
 it('rejects absent trained browser policy instead of relabeling an exact policy',()=>expect(()=>startSimulation('C01','M05','nominal',17,params)).toThrow());
 it('denies malformed imports and preserves scientific probability metadata',()=>{expect(()=>normalizeEpisode({decisions:[]})).toThrow();const episode=execute('C01').episode;const imported=normalizeEpisode({...episode,decisions:[{...episode.decisions[0],uncertainty:{confidence:.8,target:'demonstration_action',safety_bound:false}}]});expect(imported.decisions[0].detail?.probability_evidence).toEqual({confidence:.8,target:'demonstration_action',safety_bound:false});expect(imported.decisions[0].uncertainty).toBeUndefined();});
 it('rejects malformed candidate probabilities and resource identities',()=>{const e=execute('C01').episode;for(const candidate of [{action:{tool:'write'},allowed:true},{action:'write',probability:2},{action:'write',score:Infinity}])expect(()=>normalizeEpisode({...e,decisions:[{...e.decisions[0],candidates:[candidate]}]})).toThrow();expect(()=>normalizeEpisode({...e,resources:[{id:42}]})).toThrow();expect(normalizeEpisode({...e,schema_version:1}).schema_version).toBe(1);});
 it('pairs effect predictions with later observed state and leaves a missing terminal observation absent',()=>{const e=execute('C01').episode;e.events=[{sequence:1,state:{attempts:0,confirmed:false}},{sequence:2,state:{attempts:3,confirmed:true}}];const decision={...e.decisions[0],sequence:1};expect(nextObservedFeature(e,decision,'attempts')).toBe(.3);expect(nextObservedFeature(e,decision,'confirmed')).toBe(1);expect(nextObservedFeature(e,{...decision,sequence:2},'confirmed')).toBeUndefined();});
});
describe('authored native recipe contract',()=>{
 it('hashes the exact UTF-8 content and accepts a causal dependency chain',async()=>{const digest=await contentDigest('abc');expect(digest).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');const step={id:'write',tool:'file.write',arguments:{path:'a.txt',content:'abc'},verify:{path:'a.txt',sha256:digest}};const recipe={schema_version:1,steps:[step,{...step,id:'read',tool:'file.read',arguments:{path:'a.txt'},depends_on:['write']}]};expect(parseRecipe(JSON.stringify(recipe)).steps).toHaveLength(2);});
 it('rejects missing verification and dependencies on future or duplicate steps',()=>{const step={id:'a',tool:'file.write',arguments:{},verify:{path:'a.txt',sha256:'0'.repeat(64)}};for(const steps of [[{...step,verify:{path:'a.txt'}}],[{...step,depends_on:['future']}],[step,step],[]])expect(()=>parseRecipe(JSON.stringify({schema_version:1,steps}))).toThrow();});
});
describe('scientific content contracts',()=>{
 it('renders every actual equation without a KaTeX parse error',()=>{for(const page of [introduction,methodology,implementation,experiments])for(const section of page.sections)for(const eq of section.equations)expect(()=>katex.renderToString(eq.tex,{throwOnError:true}),`${section.id}: ${eq.tex}`).not.toThrow();});
 it('resolves every section citation to a DOI or primary URL',()=>{const ids=new Map(CITATIONS.map(c=>[c.id,c]));for(const page of [introduction,methodology,implementation,experiments])for(const section of page.sections){expect(section.paragraphs.length).toBeGreaterThanOrEqual(2);for(const id of section.refs)expect(ids.get(id)?.doi??ids.get(id)?.url,id).toBeTruthy();}});
 it('covers the full method-family depth and bilingual mathematical captions',()=>{expect(methodology.sections).toHaveLength(6);for(const section of methodology.sections){expect(section.paragraphs.length).toBeGreaterThanOrEqual(4);expect(section.equations.length).toBeGreaterThanOrEqual(2);for(const eq of section.equations){expect(eq.caption.en.length).toBeGreaterThan(90);expect(eq.caption.es.length).toBeGreaterThan(90);}}});
});
