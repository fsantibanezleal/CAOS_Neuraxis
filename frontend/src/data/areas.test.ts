// The area contract (ADR-0017 section 2.1, gate check ADR-0017.2, shell 0.15.0): every section of every documentation page declares
// an area from the vocabulary of ITS page (the shell's DOC_AREAS), a Methodology section also a kind, and the Introduction's five
// technical sections reach their floors from the data in both languages. The floors the gate measures on the page itself are
// measured by `npm run gate`; this keeps the data they are drawn from.
import { DOC_AREAS } from '@fasl-work/caos-app-shell';
import { describe, expect, it } from 'vitest';
import type { ContentPage } from './content.types';
import { experiments } from './experiments';
import { implementation } from './implementation';
import { introduction } from './introduction';
import { methodology } from './methodology';
import { glossaryEntries } from '../pages/Science';

const pages: Array<[string, ContentPage]> = [
  ['/introduction', introduction],
  ['/methodology', methodology],
  ['/implementation', implementation],
  ['/experiments', experiments],
];
const LANGS = ['en', 'es'] as const;
const words = (t: string) => t.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

describe('every section declares its area', () => {
  for (const [route, page] of pages) {
    it(`${route}: each section names an area of the page's vocabulary`, () => {
      const vocabulary: readonly string[] = DOC_AREAS[route as keyof typeof DOC_AREAS];
      for (const s of page.sections) {
        expect(typeof s.area, `${s.id} has no area`).toBe('string');
        expect(vocabulary, `${s.id}: area ${s.area} is not an area of ${route}`).toContain(s.area);
      }
    });
  }

  it('Methodology: every section is a method with a kind, classical or learned, and at least two are learned', () => {
    for (const s of methodology.sections) {
      expect(s.area, s.id).toBe('method');
      expect(['classical', 'learned'], s.id).toContain(s.kind);
    }
    expect(methodology.sections.filter((s) => s.kind === 'learned').length).toBeGreaterThanOrEqual(
      2,
    );
  });

  it('adversarial: only Methodology carries a kind', () => {
    for (const [route, page] of pages.filter(([r]) => r !== '/methodology'))
      for (const s of page.sections) expect(s.kind, `${route} ${s.id}`).toBeUndefined();
  });

  it('adversarial: an area outside the vocabulary of its page would be caught (an Introduction area is no Methodology area)', () => {
    expect(DOC_AREAS['/methodology']).not.toContain('math' as never);
    expect(DOC_AREAS['/introduction']).not.toContain('method' as never);
  });
});

describe('the Introduction data reaches its floors in both languages', () => {
  const byArea = (area: string) => introduction.sections.filter((s) => s.area === area);

  it('its sections are the five areas, each once, in the order problem, principles, math, pipeline, honesty', () => {
    expect(introduction.sections.map((s) => s.area)).toEqual([
      'problem',
      'principles',
      'math',
      'pipeline',
      'honesty',
    ]);
  });

  it('problem and principles: at least two paragraphs of 40 words or more', () => {
    for (const area of ['problem', 'principles'])
      for (const lang of LANGS)
        expect(
          byArea(area)
            .flatMap((s) => s.paragraphs)
            .filter((p) => words(p[lang]) >= 40).length,
          `${area} ${lang}`,
        ).toBeGreaterThanOrEqual(2);
  });

  it('math: a captioned equation and at least ten glossary items with a term and a definition', () => {
    const [math] = byArea('math');
    expect(math.equations.length).toBeGreaterThanOrEqual(1);
    const entries = glossaryEntries(math.symbols ?? []);
    expect(entries.length).toBeGreaterThanOrEqual(10);
    for (const lang of LANGS)
      for (const e of entries) {
        expect(e.term[lang], lang).toMatch(/[\p{L}\p{N}]/u);
        expect(e.definition[lang], lang).toMatch(/[\p{L}\p{N}]/u);
      }
  });

  it('pipeline: at least four ordered steps', () => {
    for (const lang of LANGS)
      expect(
        (byArea('pipeline')[0].steps ?? []).filter((s) => /[\p{L}\p{N}]/u.test(s[lang])).length,
        lang,
      ).toBeGreaterThanOrEqual(4);
  });

  it('honesty: one dense paragraph at least, and one limit for the one honest callout', () => {
    const [honesty] = byArea('honesty');
    for (const lang of LANGS) {
      expect(
        honesty.paragraphs.filter((p) => words(p[lang]) >= 40).length,
        lang,
      ).toBeGreaterThanOrEqual(1);
      expect(honesty.limit[lang].length).toBeGreaterThan(20);
    }
  });

  it('the page: at least three captioned equations, a figure per section and a lede of 35 words or more', () => {
    const equations = introduction.sections.flatMap((s) => s.equations);
    expect(equations.length).toBeGreaterThanOrEqual(3);
    for (const e of equations)
      for (const lang of LANGS) expect(e.caption[lang].length).toBeGreaterThan(10);
    for (const s of introduction.sections)
      for (const lang of LANGS) expect(s.figure[lang].length).toBeGreaterThan(10);
    for (const lang of LANGS) expect(words(introduction.lede[lang])).toBeGreaterThanOrEqual(35);
  });

  it('both languages carry the same content: every glossary symbol has its term and definition in Spanish too', () => {
    for (const s of introduction.sections) {
      for (const p of s.paragraphs) expect(p.es.length).toBeGreaterThan(40);
      for (const sym of s.symbols ?? []) expect(sym.es.includes(': '), sym.es).toBe(true);
    }
  });
});
