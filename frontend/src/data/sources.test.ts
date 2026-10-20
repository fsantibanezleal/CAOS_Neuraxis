// The paragraph attribution is split per page (data/sources/<page>.ts, one file per documentation page, so the page units write
// disjoint files) and paragraph-sources.ts composes it. This contract test keeps three things: the composition is exactly the
// map the single file held before the split (PREVIOUS, frozen here), each page file names only the sections of its own page, and
// paragraph-sources.ts holds no attribution of its own.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { experiments } from './experiments';
import { implementation } from './implementation';
import { introduction } from './introduction';
import { methodology } from './methodology';
import { paragraphSources } from './paragraph-sources';
import { BENCHMARK_SOURCES } from './sources/benchmark';
import { EXPERIMENTS_SOURCES } from './sources/experiments';
import { IMPLEMENTATION_SOURCES } from './sources/implementation';
import { INTRODUCTION_SOURCES } from './sources/introduction';
import { METHODOLOGY_SOURCES } from './sources/methodology';

const PREVIOUS: Record<string, string[][]> = {
  problem: [['lu2024'], ['reflexmesh2026'], ['reflexmesh2026']],
  biology: [
    ['bago2017', 'melnikoff2018'],
    ['lee2014', 'tseng2007', 'mante2013', 'murray2014', 'mcclelland1995'],
    ['heston2020', 'daw2011', 'yu2005'],
  ],
  formal: [
    ['sutton1999', 'reflexmesh2026'],
    ['daw2005', 'kool2016'],
  ],
  workflow: [['reflexmesh2026', 'amershi2019'], ['reflexmesh2026']],
  honesty: [
    ['typesafe2026', 'typesafeconfidence2026'],
    ['reflexmesh2026', 'agarwal2021'],
  ],
  exact: [
    ['reflexmesh2026'],
    ['behaviortree2026', 'reflexmesh2026'],
    ['sutton1999'],
    ['reflexmesh2026'],
  ],
  supervised: [
    ['reflexmesh2026'],
    ['chen2016', 'reflexmesh2026'],
    ['guo2017'],
    ['guo2017', 'reflexmesh2026'],
  ],
  sequential: [
    ['cho2014', 'ross2011'],
    ['li2010'],
    ['schulman2017', 'huang2020', 'maskableppo2026'],
    ['reflexmesh2026'],
  ],
  modelbased: [
    ['reflexmesh2026'],
    ['reflexmesh2026'],
    ['tseng2007', 'rao1999'],
    ['reflexmesh2026'],
  ],
  slow: [
    ['reflexmesh2026'],
    ['zhang2025', 'reflexmesh2026'],
    ['reflexmesh2026'],
    ['bago2017', 'melnikoff2018'],
  ],
  metacontrol: [
    ['madras2018', 'reflexmesh2026'],
    ['reflexmesh2026'],
    ['lee2014', 'murray2014', 'mcclelland1995'],
    ['agarwal2021', 'kool2016'],
  ],
  runtime: [['reflexmesh2026', 'pyo32026'], ['reflexmesh2026']],
  features: [['reflexmesh2026'], ['reflexmesh2026']],
  classical: [
    ['reflexmesh2026', 'chen2016'],
    ['guo2017', 'li2010'],
  ],
  recurrent: [
    ['reflexmesh2026', 'cho2014'],
    ['onnx2026', 'reflexmesh2026'],
  ],
  planning: [['reflexmesh2026'], ['reflexmesh2026'], ['reflexmesh2026']],
  browser: [['neuraxis2026'], ['neuraxis2026', 'amershi2019'], ['neuraxis2026'], ['neuraxis2026']],
  pipeline: [['reflexmesh2026', 'ross2011', 'guo2017'], ['reflexmesh2026']],
  deployment: [['neuraxis2026'], ['reflexmesh2026'], ['neuraxis2026'], ['reflexmesh2026']],
  reproducibility: [['neuraxis2026'], ['reflexmesh2026'], ['neuraxis2026']],
  design: [['reflexmesh2026'], ['agarwal2021', 'lu2024'], ['reflexmesh2026']],
  splits: [['ross2011', 'guo2017'], ['reflexmesh2026'], ['agarwal2021']],
  metrics: [['reflexmesh2026'], ['reflexmesh2026'], ['guo2017']],
  robustness: [['reflexmesh2026'], ['reflexmesh2026'], ['lu2024']],
  ablations: [['reflexmesh2026'], ['agarwal2021'], ['kool2016', 'agarwal2021']],
  data: [['reflexmesh2026'], ['lu2024', 'barres2025'], ['reflexmesh2026']],
};

const perPage = {
  introduction: [INTRODUCTION_SOURCES, introduction],
  methodology: [METHODOLOGY_SOURCES, methodology],
  implementation: [IMPLEMENTATION_SOURCES, implementation],
  experiments: [EXPERIMENTS_SOURCES, experiments],
} as const;

describe('the per-page paragraph sources', () => {
  it('compose to exactly the map the single file held before the split', () => {
    expect(paragraphSources).toEqual(PREVIOUS);
    expect(Object.keys(paragraphSources).sort()).toEqual(Object.keys(PREVIOUS).sort());
  });

  it('each page file names only the sections of its own page, and every section of the page is named', () => {
    for (const [name, [sources, page]] of Object.entries(perPage)) {
      const own = page.sections.map((s) => s.id).sort();
      expect(Object.keys(sources).sort(), name).toEqual(own);
    }
  });

  it('the Benchmark page file exists for its page unit and carries no section of the other pages', () => {
    const others = new Set(Object.values(perPage).flatMap(([s]) => Object.keys(s)));
    for (const id of Object.keys(BENCHMARK_SOURCES)) expect(others.has(id), id).toBe(false);
  });

  it('adversarial: no section id is attributed in two pages', () => {
    const ids = [
      ...Object.values(perPage).flatMap(([s]) => Object.keys(s)),
      ...Object.keys(BENCHMARK_SOURCES),
    ];
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
  });

  it('paragraph-sources.ts only composes: it holds no attribution of its own', () => {
    const text = readFileSync(new URL('./paragraph-sources.ts', import.meta.url), 'utf8');
    expect(text).not.toMatch(/2026'|20\d\d'/);
    expect(text).toMatch(/\.\/sources\/introduction/);
  });
});
