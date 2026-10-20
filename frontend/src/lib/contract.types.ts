// The document contracts on the web side, and the readiness document. The types are GENERATED: contract.gen.ts comes
// from docs/contracts/api.openapi.json and the schema files of docs/contracts/schemas/ (ADR-0080 decision 2;
// `npm run contracts:types`, checked by `npm run build`). The names below are aliases of the generated types, never
// hand-written interfaces. The descriptors describe the top-level keys of each document at run time, and `satisfies`
// ties each descriptor to its generated type (a key added to or removed from a schema and not here fails `tsc`).
// contract.test.ts reads the committed documents and the provider tree against the descriptors in both directions,
// types included, so the pipeline cannot ship a shape the web does not read, and the web cannot read a key the
// pipeline does not write. Deeper structure is validated in full by tests/contracts (Python) against the same schemas.
import type { components } from './contract.gen';

type Schemas = components['schemas'];

/** Every reader-facing string is bilingual at the source. */
export type Text = Schemas['text'];

export type EpisodeIndex = Schemas['EpisodeIndex'];
export type EpisodeRef = EpisodeIndex['episodes'][number];
export type EpisodeDocument = Schemas['EpisodeDocument'];
export type Lineage = Schemas['Lineage'];
export type ResearchSummary = Schemas['ResearchSummary'];
export type BenchmarkAdequacy = Schemas['BenchmarkAdequacy'];
export type RoutingStudy = Schemas['RoutingStudy'];
export type SemanticTransferIndex = Schemas['SemanticTransferIndex'];
export type SemanticTransferReport = Schemas['SemanticTransferReport'];
export type OperationIndex = Schemas['OperationIndex'];
export type OperationIndexRun = OperationIndex['runs'][number];
export type OperationRunDocument = Schemas['OperationRunDocument'];
export type ReleaseManifest = Schemas['ReleaseManifest'];

/** The operations API (catalog row operations-api). */
export type RunSnapshot = Schemas['RunSnapshot'];
export type RunSummary = Schemas['RunSummary'];
export type RunNode = Schemas['RunNode'];
export type RunInput = Schemas['InputFile'];
export type RunHistory = Schemas['RunHistory'];

export type Readiness = Schemas['Readiness'];
export type ReadinessEntry = Readiness['contracts'][number];

/** The declared state of a catalog row (docs/contracts/catalog.md, Missing-data states). */
export type ContractState = ReadinessEntry['state'];

/** What served a catalog row in this build; null when nothing did. */
export type Provenance = NonNullable<ReadinessEntry['provenance']>;

/** A run-time description of a value: a primitive, a bilingual text, a value of a set, an array of a kind, an object,
 * a map, a kind that may also be null, or an object or array whose inside is checked by the Python contract tests. */
export type Kind =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'text'
  | 'record'
  | 'list'
  | { enum: (string | number)[] }
  | { array: Kind }
  | { object: Record<string, Kind> }
  | { map: Kind }
  | { nullable: Kind };

const VARIANTS = [
  'nominal',
  'delayed_observation',
  'duplicate_event',
  'stale_conflict',
  'unavailable_dependency',
  'boundary',
];
const STATUSES = ['succeeded', 'failed', 'cancelled'];
const DISPOSITIONS = ['checks_passed', 'attention_required', 'incomplete'];

export const EPISODE_REF = {
  case_id: 'string',
  method_id: 'string',
  path: 'string',
  run_id: 'string',
  seed: 'integer',
  sha256: 'string',
  status: { enum: STATUSES },
  variant: { enum: VARIANTS },
} satisfies Record<keyof EpisodeRef, Kind>;

const INDEX_KEYS = {
  aggregate_results: 'list',
  cases: 'list',
  episodes: { array: { object: EPISODE_REF } },
  generated_at: 'string',
  methods: 'list',
  provenance: 'record',
  schema_version: { enum: [1] },
} as const satisfies Record<keyof EpisodeIndex, Kind>;
export const EPISODE_INDEX = INDEX_KEYS satisfies Record<keyof EpisodeIndex, Kind>;
export const SEMANTIC_INDEX = INDEX_KEYS satisfies Record<keyof SemanticTransferIndex, Kind>;

export const EPISODE = {
  case_id: 'string',
  decisions: 'list',
  events: 'list',
  lane: { enum: ['owned-real-software', 'owned-structural-transfer', 'owned-semantic-transfer'] },
  method_id: 'string',
  metrics: 'record',
  parameters: 'record',
  planner_work: 'record',
  policy_errors: 'list',
  provenance: 'record',
  resources: 'list',
  run_id: 'string',
  schema_version: { enum: [1] },
  seed: 'integer',
  status: { enum: STATUSES },
  variant: { enum: VARIANTS },
} satisfies Record<keyof EpisodeDocument, Kind>;

export const LINEAGE = {
  checkpoint_sha256: { map: 'string' },
  inference_device: 'string',
  native_binary: 'record',
  native_source_sha256: { map: 'string' },
  packages: { map: 'string' },
  planner: 'record',
  platform: 'string',
  python: 'string',
  source_sha256: { map: 'string' },
  spec_sha256: 'string',
  torch_inference_threads: 'integer',
} satisfies Record<keyof Lineage, Kind>;

export const RESEARCH_SUMMARY = {
  ablations: 'record',
  audit_sha256: 'string',
  completed_episodes: 'integer',
  core: 'record',
  external: 'record',
  generated_at: 'string',
  kind: { enum: ['reflexmesh-corrected-science'] },
  limits: { array: 'string' },
  native_parity: 'record',
  paired_M12_minus_method: 'record',
  routing: 'record',
  schema_version: { enum: [1] },
  training: 'record',
  transfer: 'record',
  transition_validation: 'record',
  verdict: 'string',
} satisfies Record<keyof ResearchSummary, Kind>;

export const BENCHMARK_ADEQUACY = {
  case_variant_method_cells: 'integer',
  episodes_checked: 'integer',
  index_sha256: 'string',
  interpretation: 'string',
  m12_failures: 'list',
  methods: 'list',
  perfect_methods: { array: 'string' },
  schema_version: { enum: [1] },
  scope: 'string',
  seed_variable_cells: 'integer',
} satisfies Record<keyof BenchmarkAdequacy, Kind>;

export const ROUTING_STUDY = {
  algorithm: 'string',
  calibration_planner_budget: 'integer',
  calibration_positives: 'integer',
  features: 'string',
  fit_positives: 'integer',
  held_out_predictions: 'list',
  limits: 'string',
  model_sha256: 'string',
  schema_version: { enum: [1] },
  scope: 'string',
  selected_threshold: 'number',
  source: 'record',
  split: 'record',
  status: 'string',
  test: 'record',
  test_positives: 'integer',
} satisfies Record<keyof RoutingStudy, Kind>;

export const SEMANTIC_REPORT = {
  by_family: 'list',
  episodes_checked: 'integer',
  index_sha256: 'string',
  lineage_signature: 'string',
  m12_paired: 'record',
  methods: 'list',
  perfect_methods: 'list',
  schema_version: { enum: [1] },
  scope: 'string',
  seed_variable_cells: 'integer',
} satisfies Record<keyof SemanticTransferReport, Kind>;

export const OPERATION_INDEX_RUN = {
  concurrency: 'integer',
  disposition: { enum: DISPOSITIONS },
  files: 'integer',
  findings: 'integer',
  journal_sequence: 'integer',
  model_calls: 'integer',
  native_receipts: 'integer',
  path: 'string',
  run_id: 'string',
  seed: 'integer',
  sha256: 'string',
  status: { enum: STATUSES },
  task: { enum: ['data', 'release', 'source'] },
  variant: 'string',
  verified_nodes: 'integer',
  wall_ms: 'number',
} satisfies Record<keyof OperationIndexRun, Kind>;

export const OPERATION_INDEX = {
  boundary: 'string',
  engine: 'string',
  platform: 'string',
  policy: { enum: ['verified-operation-fsm'] },
  runs: { array: { object: OPERATION_INDEX_RUN } },
  schema_version: { enum: [1] },
  seeds: 'integer',
  source_sha256: { map: 'string' },
  study: 'string',
} satisfies Record<keyof OperationIndex, Kind>;

export const OPERATION_RUN = {
  artifacts: 'record',
  disposition: { enum: DISPOSITIONS },
  engine: 'string',
  events: 'list',
  findings: 'list',
  input_sha256: 'string',
  inputs: 'list',
  metrics: 'record',
  nodes: 'list',
  policy: { enum: ['verified-operation-fsm'] },
  schema_version: { enum: [1] },
  scope: 'string',
  status: { enum: STATUSES },
  task: { enum: ['data', 'release', 'source'] },
} satisfies Record<keyof OperationRunDocument, Kind>;

export const READINESS_ENTRY = {
  id: 'string',
  version: 'string',
  status: { enum: ['real', 'active'] },
  provenance: { nullable: { enum: ['real', 'stub', 'simulator', 'fixture', 'baseline'] } },
  state: { enum: ['available', 'partial', 'stale', 'provider', 'training', 'missing'] },
  reason: { nullable: 'text' },
  missing: { array: 'string' },
} satisfies Record<keyof ReadinessEntry, Kind>;

export const READINESS = {
  schema: { enum: ['neuraxis.readiness/v1'] },
  product_version: 'string',
  catalog_sha256: 'string',
  contracts: { array: { object: READINESS_ENTRY } },
} satisfies Record<keyof Readiness, Kind>;

/** Every way `value` departs from `kind`, with its path; empty when it conforms. Booleans are not numbers. */
export function conform(value: unknown, kind: Kind, path = '$'): string[] {
  if (kind === 'string') return typeof value === 'string' ? [] : [`${path}: expected a string`];
  if (kind === 'number')
    return typeof value === 'number' && Number.isFinite(value)
      ? []
      : [`${path}: expected a finite number`];
  if (kind === 'integer') return Number.isInteger(value) ? [] : [`${path}: expected an integer`];
  if (kind === 'boolean') return typeof value === 'boolean' ? [] : [`${path}: expected a boolean`];
  if (kind === 'text') return conform(value, { object: { en: 'string', es: 'string' } }, path);
  if (kind === 'record')
    return typeof value === 'object' && value !== null && !Array.isArray(value)
      ? []
      : [`${path}: expected an object`];
  if (kind === 'list') return Array.isArray(value) ? [] : [`${path}: expected an array`];
  if ('enum' in kind)
    return kind.enum.includes(value as string | number)
      ? []
      : [`${path}: expected one of ${kind.enum.join(', ')}`];
  if ('nullable' in kind) return value === null ? [] : conform(value, kind.nullable, path);
  if ('array' in kind) {
    if (!Array.isArray(value)) return [`${path}: expected an array`];
    return value.flatMap((v, i) => conform(v, kind.array, `${path}[${i}]`));
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    return [`${path}: expected an object`];
  const obj = value as Record<string, unknown>;
  if ('map' in kind)
    return Object.entries(obj).flatMap(([k, v]) => conform(v, kind.map, `${path}.${k}`));
  const want = Object.keys(kind.object);
  const out = [
    ...want
      .filter((k) => !(k in obj))
      .map((k) => `${path}.${k}: declared by the web, not written by the pipeline`),
    ...Object.keys(obj)
      .filter((k) => !want.includes(k))
      .map((k) => `${path}.${k}: written by the pipeline, not declared by the web`),
  ];
  for (const k of want) if (k in obj) out.push(...conform(obj[k], kind.object[k], `${path}.${k}`));
  return out;
}
