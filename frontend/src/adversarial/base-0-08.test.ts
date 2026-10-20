// Planted-defect tests of the base-0-08 requirements (docs/design/features/base-0-08/validation.md, ADR-0075). Each test plants the
// defect its row states in a copy held in memory and runs the requirement's own gate function on it. The gate functions are exported
// by the gate test modules (App.test.tsx, base-record.test.ts, documentation.test.tsx, executive.test.ts, illustrations.test.ts,
// citations.test.ts, areas.test.ts, simulator.lanes.test.ts), so importing them also runs those modules' tests in this file. BR-003's
// gate is a browser script; its plant runs the shell's own Landing function and is a gate of the requirement beside it.
import { APP_ROUTE, CitationsProvider, LANDING_ROUTE, Landing } from '@fasl-work/caos-app-shell';
import { readdirSync } from 'node:fs';
import { relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement, createElement as h, type ComponentType } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import executive from '../../../content/executive.json';
import App from '../App';
import { headerOrderProblems } from '../App.test';
import { deployPlaceProblems, templateRecordProblems } from '../base-record.test';
import { languageProblems, vendorProblems } from '../content/executive.test';
import { colourProblems, labelProblems } from '../content/illustrations.test';
import { CITATIONS } from '../data/citations';
import { duplicateIds, undefinedIds, unreferencedIds } from '../data/citations.test';
import { reproducibilityProblems } from '../data/areas.test';
import type { ContentSection } from '../data/content.types';
import { experiments } from '../data/experiments';
import { implementation } from '../data/implementation';
import { introduction } from '../data/introduction';
import { methodology } from '../data/methodology';
import { paragraphSources } from '../data/paragraph-sources';
import { COPY } from '../i18n';
import { episodeLaneProblems, laneViewProblems } from '../lib/simulator.lanes.test';
import { advanceSimulation, startSimulation } from '../lib/simulator';
import { DEFAULT_PARAMETERS } from '../lib/types';
import { executiveOpenProblems } from '../pages/documentation.test';
import { IntroductionPage } from '../pages/Introduction';
import { read } from './support';

const pageAt = (path: string) =>
  renderToString(createElement(MemoryRouter, { initialEntries: [path] }, createElement(App)));
const headerAnchors = (html: string) => [
  ...html.matchAll(/<a [^>]*href="(\/[a-z]*)(?:[?#][^"]*)?"[^>]*>[^<]*<\/a>/g),
];

// ---- BR-003: the forward of an old App link (the shell's own Landing function, evaluated with a planted copy of its source)
const landingSource = Landing.toString();
const forwardWith = (source: string, search: string, hash: string): string => {
  const make = new Function(
    'useLocation',
    'jsx',
    'Navigate',
    'APP_ROUTE',
    'LANDING_ROUTE',
    `return (${source});`,
  );
  const component = make(
    () => ({ pathname: '/', search, hash }),
    (_: unknown, props: { to: string }) => props.to,
    'Navigate',
    APP_ROUTE,
    LANDING_ROUTE,
  );
  return component() as string;
};
const lostParts = (from: { search: string; hash: string }, to: string) => {
  const target = new URL(to, 'http://x');
  const lost = [...new URLSearchParams(from.search).keys()]
    .filter((k) => !target.searchParams.has(k))
    .map((k) => `query key ${k}`);
  if (from.hash && target.hash !== from.hash) lost.push('hash');
  if (target.pathname !== APP_ROUTE) lost.push(`path ${target.pathname}`);
  return lost;
};

const renderIntroduction = (initial?: 'technical') =>
  renderToString(
    createElement(
      MemoryRouter,
      null,
      h(
        CitationsProvider as ComponentType<{ items: typeof CITATIONS }>,
        { items: CITATIONS },
        createElement(IntroductionPage, {
          data: executive,
          base: '/',
          ...(initial ? { initial } : {}),
        }),
      ),
    ),
  );

const ILLUSTRATIONS = ['pain', 'situation', 'proposal'].map(
  (n) => [n, read(`frontend/public/executive/${n}.svg`)] as const,
);

// the source text the citation gate searches for references (as citations.test.ts builds it)
const srcRoot = fileURLToPath(new URL('../', import.meta.url));
const sourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = `${dir}${entry.name}`;
    if (entry.isDirectory()) return sourceFiles(`${path}/`);
    return /\.(ts|tsx)$/.test(entry.name) && !/\.test\.(ts|tsx)$/.test(entry.name) ? [path] : [];
  });
const referencingText = sourceFiles(srcRoot)
  .map((file) => relative(srcRoot, file).split(sep).join('/'))
  .filter((file) => !/^data\/citations(\.ts|\/)/.test(file))
  .map((file) => read(`frontend/src/${file}`))
  .join('\n');
const ids = CITATIONS.map((c) => c.id);
const usedIds = new Set(
  [introduction, methodology, implementation, experiments].flatMap((p) =>
    p.sections.flatMap((s) => [...s.refs, ...(paragraphSources[s.id] ?? []).flat()]),
  ),
);

describe('base-0-08 planted defects', () => {
  it('adversarial: a route table whose App is not first, or that lacks a route, is rejected', () => {
    const page = pageAt('/introduction');
    expect(headerOrderProblems(page)).toEqual([]);
    // planted: the App link moved after the Introduction link, and the Benchmark link removed
    const anchors = headerAnchors(page);
    const [app, intro] = [anchors[0], anchors[1]];
    const bench = anchors.find((m) => m[1] === '/benchmark')!;
    expect(app[1]).toBe('/app');
    const swapped = page
      .replace(app[0], '@@A@@')
      .replace(intro[0], app[0])
      .replace('@@A@@', intro[0]);
    expect(headerOrderProblems(swapped)).toEqual(['header links out of order']);
    expect(headerOrderProblems(page.replace(bench[0], ''))).toEqual([
      'no header link for /benchmark',
    ]);
  });

  it('adversarial: a forward that drops a query key or the hash is reported', () => {
    const from = { search: '?mode=investigations&incident=C07', hash: '#frag' };
    const clean = forwardWith(landingSource, from.search, from.hash);
    expect(clean).toBe('/app?mode=investigations&incident=C07#frag');
    expect(lostParts(from, clean)).toEqual([]);
    expect(landingSource).toContain('${search}');
    expect(landingSource).toContain('${hash}');
    const noSearch = forwardWith(landingSource.replace('${search}', ''), from.search, from.hash);
    expect(lostParts(from, noSearch)).toEqual(['query key mode', 'query key incident']);
    const noHash = forwardWith(landingSource.replace('${hash}', ''), from.search, from.hash);
    expect(lostParts(from, noHash)).toEqual(['hash']);
    expect(lostParts(from, '/app?mode=investigations#frag')).toEqual(['query key incident']);
  });

  it('adversarial: a template record in another format or a second deploy place is rejected', () => {
    const record = read('.template-version');
    const target = read('deploy/TARGET');
    const files = readdirSync(new URL('../../../deploy/', import.meta.url));
    expect(templateRecordProblems(record)).toEqual([]);
    expect(deployPlaceProblems(target, files)).toEqual([]);
    expect(
      templateRecordProblems('{"template":"CAOS_PRODUCT_TEMPLATE","version":"0.08.002"}'),
    ).toEqual(['.template-version is not in the template format']);
    expect(templateRecordProblems('CAOS_PRODUCT_TEMPLATE 0.08.002')).toHaveLength(1);
    expect(deployPlaceProblems('vps\nnetlify\n', files)).toEqual([
      'deploy/TARGET is "vps / netlify", not the one place vps',
    ]);
    expect(deployPlaceProblems(target, [...files, 'TARGET.netlify'])).toEqual([
      'more than one deploy place file',
    ]);
  });

  it('adversarial: the executive view open shows no equation, glossary or section', () => {
    const open = renderIntroduction();
    expect(open).toContain('data-executive-view');
    expect(executiveOpenProblems(open)).toEqual([]);
    // planted: the technical view open instead, and a glossary or an equation injected into the executive markup
    expect(executiveOpenProblems(renderIntroduction('technical'))).toEqual(
      expect.arrayContaining(['data-doc-section', 'data-area']),
    );
    expect(
      executiveOpenProblems(
        open.replace('data-executive-view', 'data-executive-view data-glossary'),
      ),
    ).toEqual(['data-glossary']);
    expect(executiveOpenProblems(open + '<div class="equation">x</div>')).toEqual([
      'class="equation',
    ]);
  });

  it('adversarial: a vendor name or a missing Spanish text in the executive file is reported', () => {
    expect(vendorProblems(executive)).toEqual([]);
    expect(languageProblems(executive)).toEqual([]);
    const vendor = structuredClone(executive) as any;
    const firstAction = vendor.proposal.actions[0];
    firstAction.action.en = `${firstAction.action.en} with Claude`;
    expect(vendorProblems(vendor)).toEqual(['names Claude']);
    const noSpanish = structuredClone(executive) as any;
    noSpanish.pain.figures[0].heading.es = '';
    expect(languageProblems(noSpanish)).toEqual([
      'executive.pain.figures[0].heading lacks a language',
    ]);
  });

  it('adversarial: a hex fill or a label under size 22 in an illustration fails the test', () => {
    for (const [name, svg] of ILLUSTRATIONS) {
      expect(colourProblems(svg), name).toEqual([]);
      expect(labelProblems(svg), name).toEqual([]);
    }
    const pain = ILLUSTRATIONS[0][1];
    const fill = pain.replace(/fill="var\(--color-[a-z0-9-]+\)"/, 'fill="#ff0000"');
    expect(fill).not.toBe(pain);
    expect(colourProblems(fill)).toEqual([
      '<path fill="#ff0000"'.replace('path', /<(\w+)[^>]*fill="#ff0000"/.exec(fill)![1]),
      'a literal colour',
    ]);
    const small = pain.replace(/(<text\b[^>]*font-size=")\d+(")/, '$120$2');
    expect(small).not.toBe(pain);
    const found = labelProblems(small);
    expect(found).toHaveLength(1);
    expect(found[0]).toMatch(/has a label of size 20$/);
  });

  it('adversarial: a planted orphan citation and a duplicate id each fail', () => {
    expect(duplicateIds(ids)).toEqual([]);
    expect(undefinedIds(ids, usedIds)).toEqual([]);
    expect(unreferencedIds(ids, referencingText)).toEqual([]);
    expect(duplicateIds([...ids, ids[0]])).toEqual([ids[0]]);
    expect(unreferencedIds([...ids, 'zz-planted-orphan'], referencingText)).toEqual([
      'zz-planted-orphan',
    ]);
    expect(undefinedIds(ids, new Set([...usedIds, 'zz-undefined']))).toEqual(['zz-undefined']);
  });

  it('adversarial: a reproducibility section without its limit or steps fails the area test', () => {
    const [clean] = implementation.sections.filter((s) => s.area === 'reproducibility');
    expect(reproducibilityProblems(clean)).toEqual([]);
    const thin: ContentSection = {
      ...clean,
      paragraphs: clean.paragraphs.slice(0, 1),
      limit: { en: '', es: '' },
      steps: [],
      table: undefined,
    };
    expect(reproducibilityProblems(thin)).toEqual(
      expect.arrayContaining([
        'en: fewer than two dense paragraphs',
        'es: no limit',
        'en: fewer than four steps',
        'fewer than four table rows',
      ]),
    );
    expect(
      reproducibilityProblems({ ...clean, limit: { en: 'short', es: clean.limit.es } }),
    ).toEqual(['en: no limit']);
  });

  it('adversarial: a browser episode presented as a replay, or a host effect on the browser lane, is caught', () => {
    let sim = startSimulation('C05', 'M02', 'stale_conflict', 17, DEFAULT_PARAMETERS);
    for (let i = 0; i < 40 && !['completed', 'failed'].includes(sim.episode.status); i++)
      sim = advanceSimulation(sim);
    const episode = sim.episode as unknown as Parameters<typeof episodeLaneProblems>[0];
    const browser = { en: COPY.en.browser, es: COPY.es.browser };
    const measured = { en: COPY.en.canonical, es: COPY.es.canonical };
    const workbench = read('frontend/src/pages/Workbench.tsx');
    expect(episodeLaneProblems(episode)).toEqual([]);
    expect(laneViewProblems(browser, measured, workbench)).toEqual([]);
    expect(episodeLaneProblems({ ...episode, lane: 'canonical' })).toEqual([
      'the simulation carries lane canonical',
    ]);
    expect(
      episodeLaneProblems({ ...episode, metrics: { ...episode.metrics, host_effects: 1 } }),
    ).toEqual(['a host effect on the browser lane']);
    expect(
      episodeLaneProblems({
        ...episode,
        provenance: { ...episode.provenance, host_effects: true },
      }),
    ).toEqual(['a host effect on the browser lane']);
    expect(laneViewProblems({ en: measured.en, es: browser.es }, measured, workbench)).toContain(
      'en: the browser lane is not labelled as the virtual workspace',
    );
    expect(laneViewProblems({ en: browser.en, es: measured.es }, measured, workbench)).toContain(
      'es: the browser lane is not labelled as the virtual workspace',
    );
    const replayed = workbench.replace(
      "const episode = lane === 'browser' ? simulation.episode : record;",
      'const episode = record ?? simulation.episode;',
    );
    expect(replayed).not.toBe(workbench);
    expect(laneViewProblems(browser, measured, replayed)).toEqual([
      'the view does not keep the simulation and the record apart',
    ]);
  });
});
