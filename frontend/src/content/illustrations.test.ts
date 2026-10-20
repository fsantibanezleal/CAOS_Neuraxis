// The executive view's three illustrations (ADR-0017 section 2.1, conventions/problem-context-first.md): hand-authored SVG,
// coloured by the shell's theme tokens only, bilingual labels at size 22 or more, the pain animated with its reduced-motion block.
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { attr, colourProblems, labelProblems } from './illustrations.checks';

const NAMES = ['pain', 'situation', 'proposal'] as const;
const dir = new URL('../../public/executive/', import.meta.url);
const load = (name: string) => readFileSync(new URL(`${name}.svg`, dir), 'utf8');
describe.each(NAMES)('the %s illustration', (name) => {
  it('exists and parses with a viewBox, a role, an English aria-label and a title', () => {
    expect(existsSync(new URL(`${name}.svg`, dir))).toBe(true);
    const svg = load(name);
    const root = /<svg\b[^>]*>/.exec(svg)?.[0] ?? '';
    expect(attr(root, 'viewBox')).toBe('0 0 800 480');
    expect(attr(root, 'role')).toBe('img');
    expect((attr(root, 'aria-label') ?? '').length).toBeGreaterThan(20);
    expect(svg).toMatch(/<title>[^<]+<\/title>/);
    expect(svg.trimEnd().endsWith('</svg>')).toBe(true);
    expect(svg.length).toBeLessThan(40 * 1024);
  });

  it('colours only by theme tokens, none or currentColor, and every token exists in the shell', () => {
    expect(colourProblems(load(name))).toEqual([]);
  });

  it('labels: every text has data-lang en or es, the sets match, size 22 or more, no font-family', () => {
    expect(labelProblems(load(name))).toEqual([]);
  });

  it('has no chart, image, link or event attribute, and no font-family at all', () => {
    const svg = load(name);
    expect(svg).not.toMatch(
      /data-chart|<image\b|<foreignObject|<script|\bhref\s*=|xlink:href|\son[a-z]+\s*=/i,
    );
    expect(svg).not.toMatch(/font-family/);
    expect(svg).not.toMatch(/[\u2014\u2192]/);
  });
});

describe('the animated pain illustration (shell gate G17)', () => {
  it('has keyframes, a reduced-motion block that stops them, and a loop of ten seconds at most', () => {
    const svg = load('pain');
    expect(svg).toMatch(/@keyframes\s+[\w-]+/);
    const block =
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?\})\s*\}/.exec(svg)?.[1] ?? '';
    expect(block).toMatch(/animation:\s*none/);
    for (const m of svg.matchAll(/animation-duration:\s*([\d.]+)s/g)) {
      expect(Number(m[1])).toBeLessThanOrEqual(10);
    }
  });

  it('the situation and the proposal are stills', () => {
    for (const n of ['situation', 'proposal']) expect(load(n)).not.toMatch(/@keyframes|<animate/);
  });
});

describe('the pain and the proposal share one floor', () => {
  it('draw the same fixed furniture at the same places', () => {
    const slots = (n: string) =>
      [...load(n).matchAll(/<g\b[^>]*data-fixed="([\w-]+)"[^>]*transform="([^"]+)"/g)].map(
        (m) => `${m[1]}@${m[2]}`,
      );
    expect(slots('pain').length).toBeGreaterThanOrEqual(8);
    expect(slots('proposal')).toEqual(slots('pain'));
  });
});
