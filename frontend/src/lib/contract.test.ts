// The consumer side of the document contracts (ADR-0080): the committed documents against the web's declared
// shape, in both directions, types included. The same assertions run on two roots, the committed `data/` and the
// provider tree `docs/contracts/fixtures/data/` (the swap tests of the catalog rows). An absent root or document is
// a failure naming its path, never a pass. The second part is the API contract test of the operations routes against
// docs/contracts/api.openapi.json: the generated response bodies are the types the app names.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, expectTypeOf } from 'vitest';
import type { paths } from './contract.gen';
import {
  BENCHMARK_ADEQUACY,
  conform,
  EPISODE,
  EPISODE_INDEX,
  EPISODE_REF,
  LINEAGE,
  OPERATION_INDEX,
  OPERATION_RUN,
  READINESS,
  RESEARCH_SUMMARY,
  ROUTING_STUDY,
  SEMANTIC_INDEX,
  SEMANTIC_REPORT,
  type BenchmarkAdequacy,
  type EpisodeDocument,
  type EpisodeIndex,
  type Lineage,
  type OperationIndex,
  type OperationRunDocument,
  type Readiness,
  type RunSnapshot,
  type RunSummary,
  type SemanticTransferReport,
} from './contract.types';
import type { OperationNode, OperationRun, OperationSummary } from './operations';
import type { ArtifactIndex, Episode } from './types';

const repo = new URL('../../../', import.meta.url);
const roots = {
  'data (the committed documents)': new URL('data/', repo),
  'docs/contracts/fixtures/data (the provider)': new URL('docs/contracts/fixtures/data/', repo),
};
const catalogUrl = new URL('docs/contracts/catalog.md', repo);

/** The row ids of the `## Contracts` table of the catalog, in order. */
function catalogIds(): string[] {
  const ids: string[] = [];
  let inTable = false;
  for (const line of readFileSync(catalogUrl, 'utf8').split(/\r?\n/)) {
    if (line.startsWith('## ')) {
      inTable = line.trim() === '## Contracts';
      continue;
    }
    if (inTable && line.startsWith('|')) {
      const cell = line.split('|')[1].trim();
      if (cell !== 'id' && !/^-+$/.test(cell)) ids.push(cell);
    }
  }
  return ids;
}

function readFrom(root: URL, rel: string): unknown {
  const url = new URL(rel, root);
  if (!existsSync(url)) throw new Error(`missing committed document: ${fileURLToPath(url)}`);
  return JSON.parse(readFileSync(url, 'utf8'));
}

/** At most `n` evenly spaced names of a directory (the committed tree holds 14,400 episodes). */
function sample(dir: URL, n: number): string[] {
  if (!existsSync(dir)) throw new Error(`missing committed directory: ${fileURLToPath(dir)}`);
  const names = readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort();
  expect(names.length, fileURLToPath(dir)).toBeGreaterThan(0);
  const step = Math.max(1, Math.floor(names.length / n));
  return names.filter((_, i) => i % step === 0).slice(0, n);
}

for (const [label, root] of Object.entries(roots)) {
  describe(`documents: ${label} is exactly what the web declares`, () => {
    const read = (rel: string): unknown => readFrom(root, rel);

    it('the episode index conforms, and every episode reference conforms', () => {
      const index = read('derived/index.json') as EpisodeIndex;
      expect(conform(index, { object: EPISODE_INDEX })).toEqual([]);
      expect(index.schema_version).toBe(1);
      expect(index.episodes.length).toBeGreaterThan(0);
      for (const ref of index.episodes) expect(conform(ref, { object: EPISODE_REF })).toEqual([]);
    });
    it('sampled episodes conform and match the index entry that lists them', () => {
      const index = read('derived/index.json') as EpisodeIndex;
      for (const name of sample(new URL('derived/episodes/', root), 40)) {
        const episode = read(`derived/episodes/${name}`) as EpisodeDocument;
        expect(conform(episode, { object: EPISODE }), name).toEqual([]);
        const ref = index.episodes.find((r) => r.path === `episodes/${name}`);
        expect(ref, `${name} is listed by the index`).toBeDefined();
        expect(episode.run_id).toBe(ref!.run_id);
        expect(episode.case_id).toBe(ref!.case_id);
        expect(episode.method_id).toBe(ref!.method_id);
      }
    });
    it('the lineage conforms', () => {
      expect(conform(read('derived/lineage.json') as Lineage, { object: LINEAGE })).toEqual([]);
    });
    it('the evidence documents conform', () => {
      expect(conform(read('derived/research.json'), { object: RESEARCH_SUMMARY })).toEqual([]);
      const adequacy = read('derived/benchmark-adequacy.json') as BenchmarkAdequacy;
      expect(conform(adequacy, { object: BENCHMARK_ADEQUACY })).toEqual([]);
      expect(adequacy.perfect_methods.length).toBeLessThanOrEqual(adequacy.methods.length);
      expect(
        conform(read('derived/semantic-routing-study/analysis.json'), { object: ROUTING_STUDY }),
      ).toEqual([]);
    });
    it('the semantic-transfer index, its episodes and its report conform', () => {
      const index = read('derived/semantic-transfer/index.json') as EpisodeIndex;
      expect(conform(index, { object: SEMANTIC_INDEX })).toEqual([]);
      const report = read('derived/semantic-transfer/report.json') as SemanticTransferReport;
      expect(conform(report, { object: SEMANTIC_REPORT })).toEqual([]);
      for (const name of sample(new URL('derived/semantic-transfer/episodes/', root), 20)) {
        expect(
          conform(read(`derived/semantic-transfer/episodes/${name}`), { object: EPISODE }),
          name,
        ).toEqual([]);
      }
    });
    it('the operation index and every run it lists conform', () => {
      const index = read('operations/index.json') as OperationIndex;
      expect(conform(index, { object: OPERATION_INDEX })).toEqual([]);
      expect(index.runs.length).toBeGreaterThan(0);
      for (const row of index.runs) {
        const run = read(`operations/${row.path}`) as OperationRunDocument;
        expect(conform(run, { object: OPERATION_RUN }), row.path).toEqual([]);
        expect(run.status).toBe(row.status);
        expect(run.disposition).toBe(row.disposition);
        expect(run.findings.length).toBe(row.findings);
      }
    });
    it('the readiness document conforms and lists the catalog rows but readiness, in order', () => {
      const r = read('derived/readiness.json') as Readiness;
      expect(conform(r, { object: READINESS })).toEqual([]);
      expect(r.schema).toBe('neuraxis.readiness/v1');
      expect(r.contracts.map((e) => e.id)).toEqual(catalogIds().filter((id) => id !== 'readiness'));
    });
  });
}

describe('the two roots are two trees', () => {
  it('the provider tree is smaller than the committed tree and has the same layout', () => {
    const [committed, provider] = Object.values(roots);
    const a = (readFrom(committed, 'derived/index.json') as EpisodeIndex).episodes.length;
    const b = (readFrom(provider, 'derived/index.json') as EpisodeIndex).episodes.length;
    expect(a).toBeGreaterThan(b);
    expect(b).toBeGreaterThan(0);
  });
  it('an absent root fails naming its path', () => {
    expect(() => readFrom(new URL('data-nowhere/', repo), 'derived/index.json')).toThrow(
      /missing committed document: .*data-nowhere/,
    );
  });
});

describe('the checker', () => {
  const provider = Object.values(roots)[1];
  const firstEpisode = () =>
    readFrom(
      provider,
      `derived/episodes/${sample(new URL('derived/episodes/', provider), 1)[0]}`,
    ) as Record<string, unknown>;
  it('adversarial: a boolean is not an integer, extra and missing keys and an enum value outside the set are named', () => {
    const problems = conform(
      { seed: true, extra: 1, status: 'nope' },
      { object: { seed: 'integer', status: { enum: ['succeeded'] }, run_id: 'string' } },
    ).join('\n');
    expect(problems).toMatch(/seed: expected an integer/);
    expect(problems).toMatch(/extra: written by the pipeline, not declared/);
    expect(problems).toMatch(/run_id: declared by the web, not written/);
    expect(problems).toMatch(/status: expected one of succeeded/);
  });
  it('adversarial: a drifted episode is rejected', () => {
    const episode = firstEpisode();
    expect(conform({ ...episode, lane: 'browser' }, { object: EPISODE }).join()).toMatch(
      /lane: expected one of/,
    );
    const { seed: _seed, ...without } = episode;
    expect(conform(without, { object: EPISODE }).join()).toMatch(/seed: declared by the web/);
    expect(conform({ ...episode, seed: '3' }, { object: EPISODE }).join()).toMatch(
      /seed: expected an integer/,
    );
  });
  it('a nullable kind accepts null and still checks a value', () => {
    expect(conform(null, { nullable: 'number' })).toEqual([]);
    expect(conform('2', { nullable: 'number' }).join('')).toMatch(/expected a finite number/);
  });
  it('the catalog table is parsed: thirteen rows, readiness and operations-api among them', () => {
    const ids = catalogIds();
    expect(ids).toHaveLength(13);
    expect(ids).toContain('readiness');
    expect(ids).toContain('operations-api');
  });
});

// The types the app names are the generated types, or provably related to them where the app is wider on purpose.
// `tsc --noEmit` (npm run build) fails when a hand type and a schema part.
describe('the app types against the schemas', () => {
  it('ArtifactIndex is the generated episode index, OperationSummary the generated run summary', () => {
    expectTypeOf<ArtifactIndex>().toEqualTypeOf<EpisodeIndex>();
    expectTypeOf<OperationSummary>().toEqualTypeOf<RunSummary>();
  });
  it('the app Episode is wider than the generated one only where it must be (imported files)', () => {
    expectTypeOf<EpisodeDocument['run_id']>().toEqualTypeOf<Episode['run_id']>();
    expectTypeOf<EpisodeDocument['seed']>().toEqualTypeOf<Episode['seed']>();
    expectTypeOf<EpisodeDocument['variant']>().toMatchTypeOf<Episode['variant']>();
    expectTypeOf<EpisodeDocument['status']>().toMatchTypeOf<Episode['status']>();
    expectTypeOf<EpisodeDocument['lane']>().toMatchTypeOf<Episode['lane']>();
  });
  it('the operation run the service returns is the generated snapshot', () => {
    expectTypeOf<OperationRun>().toEqualTypeOf<RunSnapshot>();
    expectTypeOf<OperationNode>().toEqualTypeOf<RunSnapshot['nodes'][number]>();
  });
});

type Json<R, S extends number> =
  R extends Record<S, { content: { 'application/json': infer B } }> ? B : never;
type Responses<P extends keyof paths, M extends 'get' | 'post' | 'delete'> =
  paths[P] extends Record<M, { responses: infer R }> ? R : never;

describe('api: the generated response bodies are the types the app names (catalog row operations-api)', () => {
  const openapi = () =>
    JSON.parse(readFileSync(new URL('docs/contracts/api.openapi.json', repo), 'utf8')) as {
      paths: Record<string, Record<string, unknown>>;
      components: { schemas: { ConfigResponse: { required: string[] } } };
    };
  it('lists the nine routes of the service and no other', () => {
    const operations = Object.entries(openapi().paths).flatMap(([p, item]) =>
      Object.keys(item)
        .filter((m) => ['get', 'post', 'delete'].includes(m))
        .map((m) => `${m.toUpperCase()} ${p}`),
    );
    expect(operations.sort()).toEqual(
      [
        'GET /operations-api/config',
        'POST /operations-api/session',
        'GET /operations-api/fixture',
        'GET /operations-api/runs',
        'POST /operations-api/runs',
        'GET /operations-api/runs/{run_id}',
        'DELETE /operations-api/runs/{run_id}',
        'POST /operations-api/runs/{run_id}/cancel',
        'GET /operations-api/runs/{run_id}/export',
      ].sort(),
    );
  });
  it('200 bodies', () => {
    expectTypeOf<Json<Responses<'/operations-api/runs', 'get'>, 200>>().toEqualTypeOf<{
      runs: OperationSummary[];
    }>();
    expectTypeOf<
      Json<Responses<'/operations-api/runs/{run_id}', 'get'>, 200>
    >().toEqualTypeOf<OperationRun>();
    expectTypeOf<
      Json<Responses<'/operations-api/runs', 'post'>, 200>
    >().toEqualTypeOf<OperationRun>();
    expectTypeOf<
      Json<Responses<'/operations-api/runs/{run_id}/cancel', 'post'>, 200>
    >().toEqualTypeOf<OperationRun>();
  });
  it('the live /config example carries exactly the declared ConfigResponse keys', () => {
    const example = JSON.parse(
      readFileSync(new URL('docs/contracts/examples/operations-api-config.json', repo), 'utf8'),
    ) as Record<string, unknown>;
    expect(Object.keys(example).sort()).toEqual(
      [...openapi().components.schemas.ConfigResponse.required].sort(),
    );
  });
});
