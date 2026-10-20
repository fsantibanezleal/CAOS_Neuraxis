// The browser simulation is its own execution lane (sizing boundary B13, decided 2026-10-20): its episode carries lane `browser` and no host
// effects, the Engine view names that lane as the browser's virtual workspace and a committed record as a canonical measured run, and the
// simulation is not a replay of the committed episode (decision parity is not a property of the product; the lanes are deliberately distinct).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CASES, VARIANT_IDS } from '../data/registry';
import { advanceSimulation, startSimulation } from './simulator';
import { DEFAULT_PARAMETERS } from './types';
import {
  episodeLaneProblems,
  laneLabel,
  laneViewProblems,
  type LaneEpisode,
} from './simulator.lanes.checks';

describe('the browser simulation is its own lane', () => {
  it('every case and variant of M01 and M02 runs on lane browser with no host effects', () => {
    for (const method of ['M01', 'M02'])
      for (const c of CASES)
        for (const variant of VARIANT_IDS) {
          let s = startSimulation(c.id, method, variant, 17, DEFAULT_PARAMETERS);
          for (let i = 0; i < 40 && !['completed', 'failed'].includes(s.episode.status); i++)
            s = advanceSimulation(s);
          expect(
            episodeLaneProblems(s.episode as LaneEpisode),
            `${method}/${c.id}/${variant}`,
          ).toEqual([]);
        }
  });

  it('the view labels the browser episode as the virtual workspace and a committed record as a measured run, in both languages', () => {
    const workbench = readFileSync(new URL('../pages/Workbench.tsx', import.meta.url), 'utf8');
    expect(
      laneViewProblems(
        { en: laneLabel('browser', 'en'), es: laneLabel('browser', 'es') },
        { en: laneLabel('canonical', 'en'), es: laneLabel('canonical', 'es') },
        workbench,
      ),
    ).toEqual([]);
  });

  it('the simulator reaches no host: it imports no network, API or file module', () => {
    const source = readFileSync(new URL('./simulator.ts', import.meta.url), 'utf8');
    expect(source).not.toMatch(
      /\bfetch\(|operationAPI|from '\.\.\/api|from 'node:|XMLHttpRequest|WebSocket/,
    );
  });
});
