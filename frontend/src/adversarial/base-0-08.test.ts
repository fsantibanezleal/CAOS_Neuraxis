// Planted-defect tests of the base-0-08 requirements (docs/design/features/base-0-08/validation.md, ADR-0075). Each test plants the
// defect its row states in a copy held in memory (a route table, a document, an SVG, a section) and shows that the check the
// requirement relies on reports it. The check is the gate's own where the product exports it; where the gate is a test body or a
// browser script, the check restates the gate's assertion and the first assertion of every test shows it passes on the clean copy.
import {
  APP_ROUTE,
  CitationsProvider,
  LANDING_ROUTE,
  Landing,
  STANDARD_ROUTES,
} from '@fasl-work/caos-app-shell';
import { readdirSync } from 'node:fs';
import { relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement, type ComponentType } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import executive from '../../../content/executive.json';
import App from '../App';
import { CITATIONS } from '../data/citations';
import type { ContentSection } from '../data/content.types';
import { experiments } from '../data/experiments';
import { implementation } from '../data/implementation';
import { introduction } from '../data/introduction';
import { methodology } from '../data/methodology';
import { paragraphSources } from '../data/paragraph-sources';
import { IntroductionPage } from '../pages/Introduction';
import { read } from './support';

const ORDER = [
  '/app',
  '/introduction',
  '/methodology',
  '/implementation',
  '/experiments',
  '/benchmark',
];

// ---- BR-002: the route table and the header order
const tableProblems = (paths: string[]) => {
  const out: string[] = [];
  for (const p of ORDER) if (!paths.includes(p)) out.push(`missing route ${p}`);
  const present = paths.filter((p) => ORDER.includes(p));
  if (present.join() !== ORDER.filter((p) => present.includes(p)).join())
    out.push('routes out of order');
  if (paths[0] !== '/app') out.push(`the App is not first (${paths[0]})`);
  return out;
};
const headerAnchors = (html: string) => [
  ...html.matchAll(/<a [^>]*href="(\/[a-z]*)(?:[?#][^"]*)?"[^>]*>[^<]*<\/a>/g),
];
const headerProblems = (html: string) => {
  const hrefs = headerAnchors(html).map((m) => m[1]);
  const seen = ORDER.map((p) => hrefs.indexOf(p));
  const out = ORDER.filter((_, i) => seen[i] < 0).map((p) => `no header link for ${p}`);
  const found = seen.filter((i) => i >= 0);
  if (found.join() !== [...found].sort((a, b) => a - b).join())
    out.push('header links out of order');
  return out;
};
const pageAt = (path: string) =>
  renderToString(createElement(MemoryRouter, { initialEntries: [path] }, createElement(App)));

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

// ---- BR-005: the record of the base
const TEMPLATE_RECORD = /^CAOS_PRODUCT_TEMPLATE (\d+\.\d{2}\.\d{3}) \(tag v\1\)$/;
const recordProblems = (templateVersion: string, target: string, deployFiles: string[]) => {
  const out: string[] = [];
  if (!TEMPLATE_RECORD.test(templateVersion.trim()))
    out.push('.template-version is not in the template format');
  if (target.trim() !== 'vps')
    out.push(`deploy/TARGET is "${target.trim().replace(/\n/g, ' / ')}", not the one place vps`);
  if (deployFiles.filter((f) => /^TARGET/i.test(f)).length !== 1)
    out.push('more than one deploy place file');
  return out;
};

// ---- BR-007: the executive view while it is open
const executiveOpenProblems = (page: string) =>
  ['data-glossary', 'class="equation', 'data-doc-section', 'data-area'].filter((marker) =>
    page.includes(marker),
  );
const renderIntroduction = (initial?: 'technical') =>
  renderToString(
    createElement(
      MemoryRouter,
      null,
      createElement(
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

// ---- BR-009: no vendor name, both languages
const NAMED = [
  'Claude',
  'Anthropic',
  'Opus',
  'Sonnet',
  'Haiku',
  'GPT',
  'OpenAI',
  'ChatGPT',
  'Gemini',
  'Google',
  'Llama',
  'Meta AI',
  'Qwen',
  'DeepSeek',
  'Mistral',
  'Grok',
  'xAI',
  'Microsoft',
  'Amazon',
  'LangChain',
  'LangGraph',
  'Temporal',
];
const executiveContentProblems = (doc: any) => {
  const out: string[] = [];
  const body = JSON.stringify({
    ...doc,
    sources: doc.sources.map((s: any) => ({ title: s.title, note: s.note })),
  });
  for (const n of NAMED) if (new RegExp(`\\b${n}\\b`).test(body)) out.push(`names ${n}`);
  const walk = (node: unknown, path: string): void => {
    if (Array.isArray(node)) node.forEach((v, i) => walk(v, `${path}[${i}]`));
    else if (node && typeof node === 'object') {
      const o = node as Record<string, unknown>;
      if (typeof o.en === 'string' && typeof o.es === 'string' && Object.keys(o).length === 2) {
        if (!(o.en.trim() && o.es.trim())) out.push(`${path} lacks a language`);
        return;
      }
      for (const [k, v] of Object.entries(o)) walk(v, `${path}.${k}`);
    }
  };
  walk(doc, 'executive');
  return out;
};

// ---- BR-010: the illustrations
const ILLUSTRATIONS = ['pain', 'situation', 'proposal'].map(
  (n) => [n, read(`frontend/public/executive/${n}.svg`)] as const,
);
const illustrationProblems = (svg: string) => {
  const out: string[] = [];
  if (/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/.test(svg)) out.push('a literal colour');
  for (const m of svg.matchAll(/<text\b([^>]*)>/g)) {
    const size = Number(/font-size\s*=\s*"([^"]*)"/.exec(m[1])?.[1]);
    if (!(size >= 22)) out.push(`a label of size ${size}`);
  }
  return out;
};

// ---- BR-014: the citations
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
const usedIds = new Set(
  [introduction, methodology, implementation, experiments].flatMap((p) =>
    p.sections.flatMap((s) => [...s.refs, ...(paragraphSources[s.id] ?? []).flat()]),
  ),
);
const citationProblems = (items: Array<{ id: string }>, used: Set<string>) => {
  const ids = items.map((c) => c.id);
  const out = ids.filter((id, i) => ids.indexOf(id) !== i).map((id) => `duplicate id ${id}`);
  const defined = new Set(ids);
  for (const id of used) if (!defined.has(id)) out.push(`undefined id ${id}`);
  for (const id of ids)
    if (!referencingText.includes(`'${id}'`) && !referencingText.includes(`"${id}"`))
      out.push(`orphan id ${id}`);
  return out;
};

// ---- BR-015: the reproducibility area
const words = (t: string) => t.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
const reproducibilityProblems = (section: ContentSection) => {
  const out: string[] = [];
  for (const lang of ['en', 'es'] as const) {
    if (section.paragraphs.filter((p) => words(p[lang]) >= 40).length < 2)
      out.push(`${lang}: fewer than two dense paragraphs`);
    if (section.limit[lang].length <= 20) out.push(`${lang}: no limit`);
    if ((section.steps ?? []).length < 4) out.push(`${lang}: fewer than four steps`);
  }
  if ((section.table?.rows.length ?? 0) < 4) out.push('fewer than four table rows');
  return out;
};

describe('base-0-08 planted defects', () => {
  it('adversarial: a route table whose App is not first, or that lacks a route, is rejected', () => {
    const paths: string[] = STANDARD_ROUTES.map((r) => r.path);
    expect(tableProblems(paths)).toEqual([]);
    expect(headerProblems(pageAt('/introduction'))).toEqual([]);
    const moved = [paths[1], paths[0], ...paths.slice(2)];
    expect(tableProblems(moved)).toEqual([
      'routes out of order',
      'the App is not first (/introduction)',
    ]);
    expect(tableProblems(paths.filter((p) => p !== '/benchmark'))).toEqual([
      'missing route /benchmark',
    ]);
    // the rendered header: the App link moved after the Introduction link, and the Benchmark link removed
    const page = pageAt('/introduction');
    const anchors = headerAnchors(page);
    const [app, intro] = [anchors[0], anchors[1]];
    const bench = anchors.find((m) => m[1] === '/benchmark')!;
    expect(app[1]).toBe('/app');
    const swapped = page
      .replace(app[0], '@@A@@')
      .replace(intro[0], app[0])
      .replace('@@A@@', intro[0]);
    expect(headerProblems(swapped)).toEqual(['header links out of order']);
    expect(headerProblems(page.replace(bench[0], ''))).toEqual(['no header link for /benchmark']);
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
    expect(recordProblems(record, target, files)).toEqual([]);
    expect(
      recordProblems('{"template":"CAOS_PRODUCT_TEMPLATE","version":"0.08.002"}', target, files),
    ).toEqual(['.template-version is not in the template format']);
    expect(recordProblems('CAOS_PRODUCT_TEMPLATE 0.08.002', target, files)).toHaveLength(1);
    expect(recordProblems(record, 'vps\nnetlify\n', files)).toEqual([
      'deploy/TARGET is "vps / netlify", not the one place vps',
    ]);
    expect(recordProblems(record, target, [...files, 'TARGET.netlify'])).toEqual([
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
    expect(executiveContentProblems(executive)).toEqual([]);
    const vendor = structuredClone(executive) as any;
    const firstAction = vendor.proposal.actions[0];
    firstAction.action.en = `${firstAction.action.en} with Claude`;
    expect(executiveContentProblems(vendor)).toEqual(['names Claude']);
    const noSpanish = structuredClone(executive) as any;
    noSpanish.pain.figures[0].heading.es = '';
    expect(executiveContentProblems(noSpanish)).toEqual([
      'executive.pain.figures[0].heading lacks a language',
    ]);
  });

  it('adversarial: a hex fill or a label under size 22 in an illustration fails the test', () => {
    for (const [name, svg] of ILLUSTRATIONS) expect(illustrationProblems(svg), name).toEqual([]);
    const pain = ILLUSTRATIONS[0][1];
    const fill = pain.replace(/fill="var\(--color-[a-z0-9-]+\)"/, 'fill="#ff0000"');
    expect(fill).not.toBe(pain);
    expect(illustrationProblems(fill)).toEqual(['a literal colour']);
    const small = pain.replace(/(<text\b[^>]*font-size=")\d+(")/, '$120$2');
    expect(small).not.toBe(pain);
    expect(illustrationProblems(small)).toEqual(['a label of size 20']);
  });

  it('adversarial: a planted orphan citation and a duplicate id each fail', () => {
    expect(citationProblems(CITATIONS, usedIds)).toEqual([]);
    const first = CITATIONS[0].id;
    expect(citationProblems([...CITATIONS, CITATIONS[0]], usedIds)).toEqual([
      `duplicate id ${first}`,
    ]);
    expect(citationProblems([...CITATIONS, { id: 'zz-planted-orphan' }], usedIds)).toEqual([
      'orphan id zz-planted-orphan',
    ]);
    expect(citationProblems(CITATIONS, new Set([...usedIds, 'zz-undefined']))).toEqual([
      'undefined id zz-undefined',
    ]);
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
});
