// The citation contract: one id names one reference, every id a page writes is defined, and no reference is defined that nothing
// cites. The references of each documentation page live in their own module (citations/<page>.ts, only what that page uses), so
// the page units write disjoint files; citations.ts keeps the shared ones and composes CITATIONS.
import { readdirSync, readFileSync } from 'node:fs';
import { relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CITATIONS } from './citations';
import { BENCHMARK_CITATIONS } from './citations/benchmark';
import { EXPERIMENTS_CITATIONS } from './citations/experiments';
import { IMPLEMENTATION_CITATIONS } from './citations/implementation';
import { INTRODUCTION_CITATIONS } from './citations/introduction';
import { METHODOLOGY_CITATIONS } from './citations/methodology';
import { experiments } from './experiments';
import { implementation } from './implementation';
import { introduction } from './introduction';
import { methodology } from './methodology';
import { paragraphSources } from './paragraph-sources';

const pageModules = {
  introduction: INTRODUCTION_CITATIONS,
  methodology: METHODOLOGY_CITATIONS,
  implementation: IMPLEMENTATION_CITATIONS,
  experiments: EXPERIMENTS_CITATIONS,
  benchmark: BENCHMARK_CITATIONS,
};
const pages = { introduction, methodology, implementation, experiments };

const ids = CITATIONS.map((c) => c.id);
const used = (page: (typeof pages)[keyof typeof pages]) =>
  new Set(page.sections.flatMap((s) => [...s.refs, ...(paragraphSources[s.id] ?? []).flat()]));

const srcRoot = fileURLToPath(new URL('../', import.meta.url));
const sourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = `${dir}${entry.name}`;
    if (entry.isDirectory()) return sourceFiles(`${path}/`);
    return /\.(ts|tsx)$/.test(entry.name) && !/\.test\.(ts|tsx)$/.test(entry.name) ? [path] : [];
  });
const referencingText = sourceFiles(srcRoot)
  .filter((file) => !/^data\/citations(\.ts|\/)/.test(relative(srcRoot, file).split(sep).join('/')))
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n');

/** The three id checks of BR-014, exported so the planted-defect suite runs the gate's own functions. */
export const duplicateIds = (list: string[]): string[] =>
  list.filter((id, i) => list.indexOf(id) !== i);
export const undefinedIds = (list: string[], named: Set<string>): string[] => {
  const defined = new Set(list);
  return [...named].filter((id) => !defined.has(id));
};
export const unreferencedIds = (list: string[], text: string): string[] =>
  list.filter((id) => !text.includes(`'${id}'`) && !text.includes(`"${id}"`));

describe('citations', () => {
  it('every citation id is unique', () => {
    expect(duplicateIds(ids)).toEqual([]);
  });

  it('every citation carries a label, a text and a DOI or a URL', () => {
    for (const c of CITATIONS) {
      expect(c.label, c.id).toBeTruthy();
      expect(c.citation, c.id).toBeTruthy();
      expect(Boolean(c.doi || c.url), c.id).toBe(true);
    }
  });

  it('every id a page section or a paragraph names is defined', () => {
    for (const [name, page] of Object.entries(pages))
      expect(undefinedIds(ids, used(page)), name).toEqual([]);
  });

  it('no citation is defined that nothing references', () => {
    expect(unreferencedIds(ids, referencingText)).toEqual([]);
  });

  it('the page modules hold only what their page uses, and no other page uses it (disjoint write scopes)', () => {
    for (const [name, module] of Object.entries(pageModules)) {
      for (const c of module) {
        for (const [other, page] of Object.entries(pages)) {
          if (other !== name)
            expect(used(page).has(c.id), `${c.id} of ${name} is also used by ${other}`).toBe(false);
        }
        if (name in pages)
          expect(
            used(pages[name as keyof typeof pages]).has(c.id),
            `${c.id} is not used by ${name}`,
          ).toBe(true);
      }
    }
  });

  it('CITATIONS is the shared references plus every page module, each id once', () => {
    const fromModules = Object.values(pageModules).flatMap((m) => m.map((c) => c.id));
    expect(ids.length).toBeGreaterThan(fromModules.length);
    expect(ids).toEqual(expect.arrayContaining(fromModules));
  });

  it('the product release in the neuraxis2026 citation is VERSION, not a literal', () => {
    const own = CITATIONS.find((c) => c.id === 'neuraxis2026');
    const version = readFileSync(new URL('../../../VERSION', import.meta.url), 'utf8').trim();
    expect(own?.citation).toContain(`release ${version}`);
  });
});
