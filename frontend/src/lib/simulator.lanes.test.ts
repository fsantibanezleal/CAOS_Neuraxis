// The browser simulation is its own execution lane (sizing boundary B13, decided 2026-10-20): its episode carries lane `browser` and no host
// effects, the Engine view names that lane as the browser's virtual workspace and a committed record as a canonical measured run, and the
// simulation is not a replay of the committed episode (decision parity is not a property of the product; the lanes are deliberately distinct).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CASES, VARIANT_IDS } from '../data/registry';
import { COPY } from '../i18n';
import { advanceSimulation, startSimulation } from './simulator';
import { DEFAULT_PARAMETERS } from './types';

/** The label the lane selector of the Engine view shows for a lane (Workbench.tsx: t.browser, t.canonical). */
export const laneLabel = (lane: 'browser' | 'canonical', lang: 'en' | 'es') => COPY[lang][lane];

describe('the browser simulation is its own lane', () => {
  it('every case and variant of M01 and M02 runs on lane browser with no host effects', () => {
    for (const method of ['M01', 'M02'])
      for (const c of CASES)
        for (const variant of VARIANT_IDS) {
          let s = startSimulation(c.id, method, variant, 17, DEFAULT_PARAMETERS);
          for (let i = 0; i < 40 && !['completed', 'failed'].includes(s.episode.status); i++)
            s = advanceSimulation(s);
          const where = `${method}/${c.id}/${variant}`;
          expect(s.episode.lane, where).toBe('browser');
          expect(s.episode.metrics.host_effects, where).toBe(0);
          expect(s.episode.provenance.host_effects, where).toBe(false);
          expect(s.episode.provenance.engine, where).toBe('neuraxis-browser-fsm-v1');
          expect(s.episode.run_id, where).toMatch(/^browser-/);
        }
  });

  it('the view labels the browser episode as the virtual workspace and a committed record as a measured run, in both languages', () => {
    expect(laneLabel('browser', 'en')).toMatch(/virtual/i);
    expect(laneLabel('browser', 'es')).toMatch(/virtual/i);
    expect(laneLabel('canonical', 'en')).toMatch(/measured/i);
    expect(laneLabel('canonical', 'es')).toMatch(/medida/i);
    for (const lang of ['en', 'es'] as const) {
      expect(laneLabel('browser', lang)).not.toBe(laneLabel('canonical', lang));
      expect(laneLabel('browser', lang)).not.toMatch(/measured|medida|record|registro|replay/i);
      expect(laneLabel('canonical', lang)).not.toMatch(/virtual/i);
    }
    // the view shows the simulation for the browser lane and the loaded record, unchanged, for every other lane
    const workbench = readFileSync(new URL('../pages/Workbench.tsx', import.meta.url), 'utf8');
    expect(workbench).toContain(
      "const episode = lane === 'browser' ? simulation.episode : record;",
    );
    expect(workbench).toContain('<option value="browser" disabled={!method.browser}>');
    expect(workbench).toContain('{t.browser}');
    expect(workbench).toContain('<option value="canonical">{t.canonical}</option>');
  });

  it('the simulator reaches no host: it imports no network, API or file module', () => {
    const source = readFileSync(new URL('./simulator.ts', import.meta.url), 'utf8');
    expect(source).not.toMatch(
      /\bfetch\(|operationAPI|from '\.\.\/api|from 'node:|XMLHttpRequest|WebSocket/,
    );
  });
});
