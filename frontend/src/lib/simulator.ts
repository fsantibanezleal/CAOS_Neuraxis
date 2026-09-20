import { CASES } from '../data/registry';
import type { Decision, Episode, Parameters } from './types';
export interface Simulation { episode: Episode; stage: number; attempts: number; fault: boolean; acquired: boolean; observed: boolean; random: number; refreshes: number }
export function startSimulation(caseId:string,methodId:string,variant:string,seed:number,parameters:Parameters):Simulation {
 if(!['M01','M02'].includes(methodId))throw new Error('Browser simulation supports exact policies only');
 const spec=CASES.find(c=>c.id===caseId);if(!spec)throw new Error('Unknown case');
 return {stage:0,attempts:0,fault:false,acquired:false,observed:false,random:seed>>>0,refreshes:0,episode:{schema_version:'neuraxis.episode.v1',run_id:`browser-${caseId}-${methodId}-${seed}`,case_id:caseId,method_id:methodId,variant,seed,lane:'browser',parameters:{...parameters},status:'ready',events:[],decisions:[],resources:[{id:spec.resource,kind:spec.resource.includes('process')?'process':'virtual-object',version:1,status:'unobserved',value:JSON.stringify({content:caseId==='C03'?'invalid-record':'input',committed:false}),owner:undefined}],metrics:{},provenance:{engine:'neuraxis-browser-fsm-v1',environment:'deterministic virtual workspace',clock:'simulated milliseconds',policy:methodId==='M01'?'guarded finite-state machine':'reactive behavior tree',probability_status:'not emitted',host_effects:false}}};
}
function random(s:Simulation){s.random=(Math.imul(s.random,1664525)+1013904223)>>>0;return s.random/4294967296;}
export function advanceSimulation(previous:Simulation):Simulation {
 const s=structuredClone(previous);const e=s.episode;if(['completed','failed','cancelled'].includes(e.status))return s;
 const spec=CASES.find(c=>c.id===e.case_id)!;const p=e.parameters as Parameters;const resource=e.resources[0];const seq=e.decisions.length;const priorTime=e.decisions.at(-1)?.timestamp_ms??0;
 const jitter=0.75+random(s)*0.5;const delay=Math.round(p.latency_ms*jitter*(e.variant==='delayed_observation'?3:1));const now=priorTime+Math.max(1,delay);let action=spec.actions[s.stage]??'verify';let status='applied';let reason='registered preconditions satisfied';let observedEffect=0;let expectedEffect=0;
 const budget=Math.max(0,p.budget_ms-now);const terminal=()=>{e.status='failed';status='deadline_exceeded';action='stop';reason='deadline exhausted before dispatch';};
 if(budget<=0){terminal();}
 else if(!s.observed){action='observe';s.observed=true;resource.status='observed';s.stage=1;reason='resource snapshot bound to current revision';}
 else if(s.fault){s.fault=false;action=e.case_id==='C06'?'reconcile':'refresh';status='unknown';resource.status='outcome_unknown';reason='injected failure: no success inferred from timeout';s.attempts++;}
 else if(e.variant==='stale_conflict'&&s.refreshes===0){action='refresh';s.refreshes++;resource.version++;status='stale_prevented';reason='expected revision mismatched; refreshed before effect';}
 else if(e.variant==='duplicate_event'&&s.refreshes===0){action='deduplicate';s.refreshes++;status='duplicate_prevented';reason='event identifier already observed; no effect repeated';}
 else if((e.variant==='boundary'||e.case_id==='C15')&&s.refreshes===0){action='isolate';s.refreshes++;status='denied';reason='untrusted payload cannot extend authority';}
 else if(p.noise>0&&random(s)<p.noise&&s.refreshes<2){action='refresh';s.refreshes++;status='insufficient_evidence';reason='noisy observation requires a second source';}
 else if(p.threshold>0.96&&s.refreshes<2){action='refresh';s.refreshes++;status='below_threshold';reason='priority below configured acceptance threshold';}
 else if((e.case_id==='C11'||p.concurrency>2)&&!s.acquired){action='lease';s.acquired=true;resource.owner='controller';status='lease_acquired';reason=`versioned lease admitted after ${p.concurrency-1} competitors`;}
 else if(e.variant==='unavailable_dependency'||random(s)>p.reliability){action=s.attempts>=2?'stop':'retry';s.attempts++;status=s.attempts>2?'failed':'tool_failed';reason='observed adapter failure; bounded retry policy';if(s.attempts>2)e.status='failed';else if(e.method_id==='M02')s.stage=Math.max(1,s.stage-1);}
 else {s.attempts=0;s.stage++;expectedEffect=['observe','validate','inspect','diagnose','wait','verify','collect','refresh','reject'].includes(action)?0:1;observedEffect=expectedEffect;
  if(action==='verify'){status=resource.status==='outcome_unknown'?'unresolved':'verified';if(status==='verified'){e.status='completed';resource.status='verified';}else{e.status='failed';}}
  else if(action==='delegate'){resource.status='delegated';resource.owner='specialist';}
  else if(action==='cancel'){resource.status='terminated';resource.value=JSON.stringify({running:false,cancelled:true});}
  else if(action==='release'){resource.owner=undefined;resource.status='available';}
  else if(action==='reject'||action==='isolate'){resource.status='quarantined';}
  else if(expectedEffect){resource.version++;resource.status=action==='quarantine'?'quarantined':'updated';resource.value=JSON.stringify({operation:action,committed:true,revision:resource.version,case:e.case_id});}
  else if(action==='validate'){resource.status=e.case_id==='C03'?'invalid':'validated';}
  reason=`${action} completed against revision ${resource.version}`;
 }
 const candidates=Array.from(new Set([spec.actions[Math.min(s.stage,spec.actions.length-1)],action,'refresh','wait','stop'])).map(a=>({action:a,score:a===action?1:0.25,allowed:a==='stop'||a==='wait'||a==='refresh'||s.observed,reason:a===action?'selected exact branch':'alternative registered branch'}));
 const d:Decision={sequence:seq,timestamp_ms:now,event_kind:seq===0?'snapshot':status==='unknown'?'tool_timeout':'tool_outcome',action,status,candidates,reason,threshold:p.threshold,effect_predicted:expectedEffect,effect_observed:status==='unknown'?undefined:observedEffect,residual:status==='unknown'?undefined:Math.abs(expectedEffect-observedEffect),budget_remaining_ms:budget,resource_version:resource.version,resource:resource.id,delegation_id:action==='delegate'||action==='collect'?`subgoal-${e.case_id}`:undefined,detail:{stage:s.stage,attempts:s.attempts,resources:structuredClone(e.resources),host_effects:false}};
 e.decisions.push(d);e.events.push({event_id:`${e.run_id}-${seq}`,sequence:seq,type:d.event_kind,timestamp_ms:now,resource_version:resource.version});if(!['completed','failed'].includes(e.status))e.status='running';
 e.metrics={success:e.status==='completed',decision_count:e.decisions.length,virtual_duration_ms:now,planner_calls:e.decisions.filter(x=>x.action==='delegate').length,denied_actions:e.decisions.filter(x=>x.status==='denied').length,unknown_outcomes:e.decisions.filter(x=>x.status==='unknown').length,host_effects:0};return s;
}
export function cancelSimulation(previous:Simulation):Simulation {const s=structuredClone(previous);if(['completed','failed','cancelled'].includes(s.episode.status))return s;s.episode.status='cancelled';s.episode.decisions.push({sequence:s.episode.decisions.length,timestamp_ms:s.episode.decisions.at(-1)?.timestamp_ms??0,event_kind:'cancel_request',action:'cancel',status:'cancelled',candidates:[],reason:'new admissions stopped; prior effects preserved',budget_remaining_ms:s.episode.decisions.at(-1)?.budget_remaining_ms});return s;}
