export type Lang = 'en' | 'es';
export type Bilingual = { en: string; es: string };
export type Lane = 'browser' | 'canonical' | 'native' | 'imported';
export type Parameters = { latency_ms: number; reliability: number; budget_ms: number; threshold: number; noise: number; concurrency: number };
export interface CaseSpec { id: string; name: Bilingual; family: Bilingual; goal: Bilingual; actions: string[]; resource: string }
export interface MethodSpec { id: string; name: Bilingual; family: number; learned: boolean; browser: boolean; description: Bilingual }
export interface Candidate { action: string; score?: number; probability?: number; allowed: boolean; reason?: string }
export interface Decision { sequence: number; timestamp_ms: number; event_kind: string; action: string; status: string; candidates: Candidate[]; reason: string; uncertainty?: number; threshold?: number; effect_predicted?: number; effect_observed?: number; residual?: number; budget_remaining_ms?: number; delegation_id?: string; resource_version?: number; resource?: string; detail?: Record<string, unknown> }
export interface Resource { id: string; kind: string; version: number; status: string; value?: string; owner?: string }
export interface Episode { schema_version: string | number; run_id: string; case_id: string; method_id: string; variant: string; seed: number; lane: string; parameters: Partial<Parameters> & {max_steps?:number}; status: string; events: unknown[]; decisions: Decision[]; resources: Resource[]; metrics: Record<string, unknown>; provenance: Record<string, unknown> }
export interface ArtifactIndex { schema_version?: string; generated_at?: string; provenance?: Record<string, unknown>; methods?: unknown[]; cases?: unknown[]; episodes?: unknown; aggregate_results?: unknown; [key: string]: unknown }
export const DEFAULT_PARAMETERS: Parameters = { latency_ms: 80, reliability: 0.94, budget_ms: 3000, threshold: 0.75, noise: 0.08, concurrency: 2 };
