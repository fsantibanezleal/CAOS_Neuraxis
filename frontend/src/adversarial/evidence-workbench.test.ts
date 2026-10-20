// Planted-defect tests of the evidence-workbench requirements (docs/design/features/evidence-workbench/validation.md, ADR-0075).
// The browser gates of this feature (frontend/scripts/verify-*.mjs) are measured in Chromium and are not run by `npm test`
// (ADR-0074). The plants for them are made on what those gates read: the product stylesheets (css-checks.ts), the shell's
// text-width function, and the measurements the gate compares.
import { widestLabel } from '@fasl-work/caos-app-shell';
import { createHash, webcrypto } from 'node:crypto';
import katex from 'katex';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadEpisode } from '../api/artifacts';
import { CITATIONS } from '../data/citations';
import type { ContentPage } from '../data/content.types';
import { experiments } from '../data/experiments';
import { implementation } from '../data/implementation';
import { introduction } from '../data/introduction';
import { methodology } from '../data/methodology';
import { COPY } from '../i18n';
import { hiddenReferences, scrollTraps, wideControls, widthCaps } from './css-checks';
import { productCss, read } from './support';

const sha256 = (bytes: string) => createHash('sha256').update(bytes).digest('hex');
const serve = (bytes: string) => {
  vi.stubGlobal('crypto', webcrypto);
  vi.stubGlobal('fetch', vi.fn(async () => new Response(bytes, { headers: { 'Content-Type': 'application/json' } })));
};

// ---- EW-003: a section's equations parse and its final references resolve
const contentProblems = (pages: Record<string, ContentPage>, known: Set<string>) => {
  const out: string[] = [];
  for (const [name, page] of Object.entries(pages))
    for (const s of page.sections) {
      for (const eq of s.equations) {
        try {
          katex.renderToString(eq.tex, { throwOnError: true });
        } catch {
          out.push(`${name}/${s.id}: equation does not parse`);
        }
      }
      if (s.refs.length === 0) out.push(`${name}/${s.id}: no final reference`);
      for (const id of s.refs) if (!known.has(id)) out.push(`${name}/${s.id}: final reference ${id} is not defined`);
    }
  return out;
};
const PAGES = { introduction, methodology, implementation, experiments };
const KNOWN = new Set(CITATIONS.map((c) => c.id));

// ---- EW-004: the evidence view is presented as 240 pairs only when the index holds every method-case pair
type Entry = { method_id: string; case_id: string; variant: string; seed: number };
const pairs = (episodes: Entry[]) => new Set(episodes.map((e) => `${e.method_id}/${e.case_id}`));
const pairProblems = (episodes: Entry[]) => {
  const have = pairs(episodes);
  const out: string[] = [];
  for (let m = 1; m <= 12; m++)
    for (let c = 1; c <= 20; c++) {
      const key = `M${String(m).padStart(2, '0')}/C${String(c).padStart(2, '0')}`;
      // the gate selects the nominal episode of seed 40000 for each pair
      if (!episodes.some((e) => `${e.method_id}/${e.case_id}` === key && e.variant === 'nominal' && e.seed === 40000)) out.push(`no nominal episode for ${key}`);
    }
  return { presentedPairs: have.size, problems: out, presentedAs240: have.size === 240 && out.length === 0 };
};

// ---- EW-005: a control wider than a 360 px viewport, in both languages
const unbreakableWidths = (copy: Record<string, string>, px = 14) =>
  Object.entries(copy)
    .filter(([, text]) => typeof text === 'string')
    .map(([key, text]) => ({ key, width: widestLabel(text.split(/\s+/), px) }));
const clippedLabels = (copy: Record<'en' | 'es', Record<string, string>>, viewport: number) => {
  const out: string[] = [];
  for (const lang of ['en', 'es'] as const)
    for (const { key, width } of unbreakableWidths(copy[lang])) if (width > viewport - 32) out.push(`${lang}: "${key}" has an unbreakable run of ${Math.round(width)}px in a ${viewport}px viewport`);
  return out;
};

// ---- EW-010: a route's document must not be wider than the viewport (the comparison of verify-layout.mjs)
type Measure = { route: string; lang: string; theme: string; docW: number; vw: number };
const fitProblems = (measures: Measure[]) =>
  measures.filter((m) => m.docW > m.vw + 1).map((m) => `${m.route} ${m.lang} ${m.theme}: the document is ${m.docW}px wide in a ${m.vw}px viewport`);

afterEach(() => vi.unstubAllGlobals());

describe('evidence-workbench planted defects', () => {
  it('adversarial: a trace with changed bytes or a wrong identity is refused', async () => {
    const index = JSON.parse(read('data/derived/index.json')) as { episodes: Array<Record<string, any>> };
    const ref = index.episodes[0];
    const bytes = read(`data/derived/${ref.path}`);
    const reference = ref as Parameters<typeof loadEpisode>[0];
    expect(sha256(bytes)).toBe(ref.sha256);
    serve(bytes);
    expect((await loadEpisode(reference)).run_id).toBe(ref.run_id);
    // planted: one byte changed under the digest of the index
    const at = bytes.indexOf('"status"');
    const flipped = bytes.slice(0, at + 1) + 'S' + bytes.slice(at + 2);
    serve(flipped);
    await expect(loadEpisode(reference)).rejects.toThrow('SHA-256 mismatch');
    // planted: correct bytes under their own digest, but the index entry names another method
    serve(bytes);
    await expect(loadEpisode({ ...reference, method_id: 'M99', sha256: sha256(bytes) })).rejects.toThrow('identity mismatch: method_id');
    await expect(loadEpisode({ ...reference, seed: (ref.seed as number) + 1 })).rejects.toThrow('identity mismatch: seed');
  });

  it('adversarial: an unparsable equation and a missing final reference are reported', () => {
    expect(contentProblems(PAGES, KNOWN)).toEqual([]);
    const copy = structuredClone(PAGES) as Record<string, ContentPage>;
    const section = copy.methodology.sections[0];
    section.equations[0].tex = '\\frac{a}{';
    copy.introduction.sections[0].refs = [];
    copy.experiments.sections[0].refs = ['zz-not-defined'];
    expect(contentProblems(copy, KNOWN)).toEqual([
      `introduction/${copy.introduction.sections[0].id}: no final reference`,
      `methodology/${section.id}: equation does not parse`,
      `experiments/${copy.experiments.sections[0].id}: final reference zz-not-defined is not defined`,
    ]);
  });

  it('adversarial: results with one pair missing are not presented as 240', () => {
    const index = JSON.parse(read('data/derived/index.json')) as { episodes: Entry[] };
    const clean = pairProblems(index.episodes);
    expect(clean).toEqual({ presentedPairs: 240, problems: [], presentedAs240: true });
    const without = index.episodes.filter((e) => !(e.method_id === 'M05' && e.case_id === 'C07'));
    expect(without.length).toBeLessThan(index.episodes.length);
    expect(pairProblems(without)).toEqual({ presentedPairs: 239, problems: ['no nominal episode for M05/C07'], presentedAs240: false });
    // the pair is present but its nominal episode of seed 40000 is not: the view still has nothing to show for it
    const noNominal = index.episodes.filter((e) => !(e.method_id === 'M01' && e.case_id === 'C01' && e.variant === 'nominal' && e.seed === 40000));
    expect(pairProblems(noNominal)).toEqual({ presentedPairs: 240, problems: ['no nominal episode for M01/C01'], presentedAs240: false });
  });

  it('adversarial: a control clipped at a narrow viewport is detected', () => {
    const css = productCss();
    expect(wideControls(css, 360)).toEqual([]);
    expect(clippedLabels(COPY as never, 360)).toEqual([]);
    // planted: a button with a fixed 420px minimum width, and a control label of one unbreakable 70-character word in Spanish
    expect(wideControls(`${css}\n.nx-button { min-width: 420px; }`, 360)).toEqual(['.nx-button: min-width 420px in a 360px viewport']);
    expect(wideControls(`${css}\n@media (min-width: 900px) { select { width: 500px; } }`, 360)).toEqual([]);
    const planted = structuredClone(COPY) as unknown as Record<'en' | 'es', Record<string, string>>;
    planted.es.run = 'Ejecutar'.padEnd(70, 'x');
    planted.en.run = 'Run'.padEnd(70, 'x');
    const found = clippedLabels(planted, 360);
    expect(found).toHaveLength(2);
    expect(found.map((f) => f.slice(0, 15))).toEqual(['en: "run" has a', 'es: "run" has a']);
  });

  it('adversarial: a reading page with a fixed height is unreachable', () => {
    const css = productCss();
    for (const vw of [360, 1280]) expect(scrollTraps(css, vw)).toEqual([]);
    const planted = `${css}\n.nx-doc-section { height: 100vh; overflow: hidden; }`;
    for (const vw of [360, 1280]) expect(scrollTraps(planted, vw)).toEqual(['.nx-doc-section: fixed height with hidden overflow']);
    // a hidden overflow without a fixed height is not a trap, and the App workbench keeps its scoped containment
    expect(scrollTraps(`${css}\n.nx-doc-section { overflow: hidden; }`, 1280)).toEqual([]);
    expect(scrollTraps(`${css}\n.nx-layout { height: 100vh; overflow: hidden; }`, 1280)).toEqual([]);
  });

  it('adversarial: a custom section width cap is reported', () => {
    const css = productCss();
    expect(widthCaps(css, 1280)).toEqual([]);
    expect(widthCaps(`${css}\n.nx-doc-section { max-width: 520px; }`, 1280)).toEqual(['.nx-doc-section: max-width 520px']);
    expect(widthCaps(`${css}\n.nx-doc-section { max-width: var(--maxw); }`, 1280)).toEqual([]);
    expect(widthCaps(`${css}\n@media (max-width: 760px) { .nx-benchmark { width: 300px; } }`, 360)).toEqual(['.nx-benchmark @media (max-width: 760px): width 300px']);
  });

  it('adversarial: references outside the viewport are reported', () => {
    const css = productCss();
    for (const vw of [390, 1280]) expect(hiddenReferences(css, vw)).toEqual([]);
    const moved = `${css}\n@media (max-width: 760px) { .caos-doc-references { position: fixed; top: -9999px; } }`;
    expect(hiddenReferences(moved, 390)).toEqual(['.caos-doc-references @media (max-width: 760px): the references would not be reachable']);
    expect(hiddenReferences(moved, 1280)).toEqual([]);
    expect(hiddenReferences(`${css}\n.nx-doc-section { display: none; }`, 390)).toEqual(['.nx-doc-section: the references would not be reachable']);
    // the data side: a section whose final reference is gone has nothing to reach
    const copy = structuredClone(PAGES) as Record<string, ContentPage>;
    copy.methodology.sections[1].refs = [];
    expect(contentProblems(copy, KNOWN)).toEqual([`methodology/${copy.methodology.sections[1].id}: no final reference`]);
  });

  it('adversarial: a route wider than the viewport is reported', () => {
    const routes = ['/introduction', '/methodology', '/implementation', '/experiments', '/benchmark'];
    const fitting: Measure[] = routes.flatMap((route) =>
      ['en', 'es'].flatMap((lang) => ['light', 'dark'].map((theme) => ({ route, lang, theme, docW: 360, vw: 360 }))),
    );
    expect(fitProblems(fitting)).toEqual([]);
    // planted in each language and theme: the same route 40px wider than the viewport
    const wide = fitting.map((m) => (m.route === '/benchmark' ? { ...m, docW: 400 } : m));
    expect(fitProblems(wide)).toEqual([
      '/benchmark en light: the document is 400px wide in a 360px viewport',
      '/benchmark en dark: the document is 400px wide in a 360px viewport',
      '/benchmark es light: the document is 400px wide in a 360px viewport',
      '/benchmark es dark: the document is 400px wide in a 360px viewport',
    ]);
    expect(fitProblems([{ route: '/app', lang: 'en', theme: 'dark', docW: 361, vw: 360 }])).toEqual([]);
  });
});
