// The checks of BR-036, kept out of the test module so the gate tests and the planted-defect suite both import them.
import { COPY } from '../i18n';

/** The label the lane selector of the Engine view shows for a lane (Workbench.tsx: t.browser, t.canonical). */
export const laneLabel = (lane: 'browser' | 'canonical', lang: 'en' | 'es') => COPY[lang][lane];

export type LaneEpisode = {
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
