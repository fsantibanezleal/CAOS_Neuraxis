// The executive view's three illustrations (ADR-0017 section 2.1, conventions/problem-context-first.md): hand-authored SVG,
// coloured by the shell's theme tokens only, bilingual labels at size 22 or more, the pain animated with its reduced-motion block.
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const NAMES = ['pain', 'situation', 'proposal'] as const;
const dir = new URL('../../public/executive/', import.meta.url);
const shellCss = readFileSync(
  new URL('../../node_modules/@fasl-work/caos-app-shell/styles.css', import.meta.url),
  'utf8',
);
const defined = new Set([...shellCss.matchAll(/(--color-[a-z0-9-]+)\s*:/g)].map((m) => m[1]));

const load = (name: string) => readFileSync(new URL(`${name}.svg`, dir), 'utf8');
const attr = (tag: string, name: string) =>
  new RegExp(String.raw`(?:^|\s)${name}\s*=\s*"([^"]*)"`).exec(tag)?.[1];
const tags = (svg: string) => [...svg.matchAll(/<([a-zA-Z][\w:-]*)\b([^>]*?)\/?>/g)];
const texts = (svg: string) =>
  [...svg.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)].map((m) => ({
    open: m[1],
    body: m[2].replace(/<[^>]+>/g, ''),
  }));

/** The colour check of BR-010, exported so the planted-defect suite runs the gate's own function. */
export function colourProblems(svg: string): string[] {
  const out: string[] = [];
  const ok = /^(none|currentColor|var\((--color-[a-z0-9-]+)\))$/;
  for (const [, tag, rest] of tags(svg)) {
    for (const p of ['fill', 'stroke']) {
      const v = attr(rest, p);
      if (v !== undefined && !ok.test(v)) out.push(`<${tag} ${p}="${v}"`);
    }
  }
  if (/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/.test(svg)) out.push('a literal colour');
  for (const m of svg.matchAll(/var\((--color-[a-z0-9-]+)\)/g))
    if (!defined.has(m[1])) out.push(`${m[1]} is not defined by the shell`);
  return out;
}

/** The label check of BR-010 (language, matching sets, size 22 or more, no font-family), exported for the same reason. */
export function labelProblems(svg: string): string[] {
  const out: string[] = [];
  const all = texts(svg);
  if (all.length <= 6) out.push('fewer than seven labels');
  const by: Record<string, string[]> = { en: [], es: [] };
  for (const t of all) {
    const lang = attr(t.open, 'data-lang');
    if (lang !== 'en' && lang !== 'es') out.push(`text "${t.body}" has no language`);
    else by[lang].push(t.body);
    if (!(Number(attr(t.open, 'font-size')) >= 22))
      out.push(`text "${t.body}" has a label of size ${attr(t.open, 'font-size')}`);
    if (/font-family/.test(t.open)) out.push(`text "${t.body}" sets a font-family`);
    if (t.body.trim().length === 0) out.push('an empty label');
    if (/[\u2014\u2192]/.test(t.body)) out.push(`text "${t.body}" holds a banned character`);
  }
  if (by.en.length !== by.es.length) out.push('the language sets differ');
  return out;
}

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
