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

type LaneEpisode = {
  lane: string;
  run_id: string;
  metrics: Record<string, unknown>;
  provenance: Record<string, unknown>;
};
/** The episode check of BR-036, exported so the planted-defect suite runs the gate's own function. */
export function episodeLaneProblems(episode: LaneEpisode): string[] {
  const out: string[] = [];
  if (episode.lane !== 'browser') out.push(`the simulation carries lane ${episode.lane}`);
  if (episode.metrics.host_effects !== 0 || episode.provenance.host_effects !== false)
    out.push('a host effect on the browser lane');
  if (episode.provenance.engine !== 'neuraxis-browser-fsm-v1')
    out.push('the engine is not the browser state machine');
  if (!/^browser-/.test(episode.run_id)) out.push('the run id is not a browser run id');
  return out;
}

/** The view check of BR-036, exported for the same reason: the lane labels and the episode the view shows. */
export function laneViewProblems(
  browserLabel: { en: string; es: string },
  measuredLabel: { en: string; es: string },
  workbench: string,
): string[] {
  const out: string[] = [];
  for (const lang of ['en', 'es'] as const) {
    if (
      !/virtual/i.test(browserLabel[lang]) ||
      /measured|medida|record|registro|replay/i.test(browserLabel[lang])
    )
      out.push(`${lang}: the browser lane is not labelled as the virtual workspace`);
    if (!/measured|medida/i.test(measuredLabel[lang]) || /virtual/i.test(measuredLabel[lang]))
      out.push(`${lang}: the committed record is not labelled as a measured run`);
    if (browserLabel[lang] === measuredLabel[lang])
      out.push(`${lang}: the two lanes share a label`);
  }
  if (!workbench.includes("const episode = lane === 'browser' ? simulation.episode : record;"))
    out.push('the view does not keep the simulation and the record apart');
  if (
    !workbench.includes('<option value="browser" disabled={!method.browser}>') ||
    !workbench.includes('{t.browser}')
  )
    out.push('the browser lane is not offered under its own label');
  if (!workbench.includes('<option value="canonical">{t.canonical}</option>'))
    out.push('the committed record is not offered under its own label');
  return out;
}

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
