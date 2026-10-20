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
    const svg = load(name);
    const ok = /^(none|currentColor|var\((--color-[a-z0-9-]+)\))$/;
    for (const [, tag, rest] of tags(svg)) {
      for (const p of ['fill', 'stroke']) {
        const v = attr(rest, p);
        if (v === undefined) continue;
        expect(v, `<${tag} ${p}="${v}">`).toMatch(ok);
      }
    }
    expect(svg).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/);
    for (const m of svg.matchAll(/var\((--color-[a-z0-9-]+)\)/g)) {
      expect(defined.has(m[1]), `${m[1]} is not defined by the shell`).toBe(true);
    }
  });

  it('labels: every text has data-lang en or es, the sets match, size 22 or more, no font-family', () => {
    const all = texts(load(name));
    expect(all.length).toBeGreaterThan(6);
    const by: Record<string, string[]> = { en: [], es: [] };
    for (const t of all) {
      const lang = attr(t.open, 'data-lang');
      expect(['en', 'es'], `text "${t.body}"`).toContain(lang);
      by[lang as string].push(t.body);
      expect(Number(attr(t.open, 'font-size')), `text "${t.body}"`).toBeGreaterThanOrEqual(22);
      expect(t.open).not.toMatch(/font-family/);
      expect(t.body.trim().length).toBeGreaterThan(0);
      expect(t.body).not.toMatch(/[\u2014\u2192]/);
    }
    expect(by.en.length).toBe(by.es.length);
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
