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
const params={...DEFAULT_PARAMETERS,reliability:1,noise:0,concurrency:1};
function execute(id:string,method='M01',variant='nominal'){let s=startSimulation(id,method,variant,17,params);for(let i=0;i<30&&!['completed','failed'].includes(s.episode.status);i++)s=advanceSimulation(s);return s;}
describe('virtual execution semantics',()=>{
 it('terminates all twenty nominal workflows using both actual exact policies',()=>{for(const c of CASES)for(const m of ['M01','M02']){const s=execute(c.id,m);expect(s.episode.status,`${c.id}/${m}`).toBe('completed');expect(s.episode.metrics.host_effects).toBe(0);}});
 it('replays the same causal sequence from the same seed and settings',()=>expect(execute('C11')).toEqual(execute('C11')));
 it('preserves already observed effects after cancellation and admits no more actions',()=>{let s=startSimulation('C01','M01','nominal',17,params);for(let i=0;i<3;i++)s=advanceSimulation(s);const resources=structuredClone(s.episode.resources);s=cancelSimulation(s);expect(s.episode.resources).toEqual(resources);expect(advanceSimulation(s)).toEqual(s);expect(s.episode.status).toBe('cancelled');});
 it('retains unknown outcome without a fabricated residual',()=>{let s=advanceSimulation(startSimulation('C06','M01','nominal',17,params));s.fault=true;s=advanceSimulation(s);expect(s.episode.decisions.at(-1)?.status).toBe('unknown');expect(s.episode.decisions.at(-1)?.effect_observed).toBeUndefined();expect(s.episode.decisions.at(-1)?.residual).toBeUndefined();expect(s.episode.decisions.at(-1)?.action).toBe('reconcile');});
 it('rejects absent trained browser policy instead of relabeling an exact policy',()=>expect(()=>startSimulation('C01','M05','nominal',17,params)).toThrow());
 it('denies malformed imports and preserves scientific probability metadata',()=>{expect(()=>normalizeEpisode({decisions:[]})).toThrow();const episode=execute('C01').episode;const imported=normalizeEpisode({...episode,decisions:[{...episode.decisions[0],uncertainty:{confidence:.8,target:'demonstration_action',safety_bound:false}}]});expect(imported.decisions[0].detail?.probability_evidence).toEqual({confidence:.8,target:'demonstration_action',safety_bound:false});expect(imported.decisions[0].uncertainty).toBeUndefined();});
});
describe('scientific content contracts',()=>{
 it('renders every actual equation without a KaTeX parse error',()=>{for(const page of [introduction,methodology,implementation,experiments])for(const section of page.sections)for(const eq of section.equations)expect(()=>katex.renderToString(eq.tex,{throwOnError:true}),`${section.id}: ${eq.tex}`).not.toThrow();});
 it('resolves every section citation to a DOI or primary URL',()=>{const ids=new Map(CITATIONS.map(c=>[c.id,c]));for(const page of [introduction,methodology,implementation,experiments])for(const section of page.sections){expect(section.paragraphs.length).toBeGreaterThanOrEqual(2);for(const id of section.refs)expect(ids.get(id)?.doi??ids.get(id)?.url,id).toBeTruthy();}});
 it('covers the full method-family depth and bilingual mathematical captions',()=>{expect(methodology.sections).toHaveLength(6);for(const section of methodology.sections){expect(section.paragraphs.length).toBeGreaterThanOrEqual(4);expect(section.equations.length).toBeGreaterThanOrEqual(2);for(const eq of section.equations){expect(eq.caption.en.length).toBeGreaterThan(90);expect(eq.caption.es.length).toBeGreaterThan(90);}}});
});
