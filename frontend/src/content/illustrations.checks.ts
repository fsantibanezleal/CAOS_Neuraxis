// The checks of BR-010, kept out of the test module so the gate tests and the planted-defect suite both import them.
import { readFileSync } from 'node:fs';

const shellCss = readFileSync(
  new URL('../../node_modules/@fasl-work/caos-app-shell/styles.css', import.meta.url),
  'utf8',
);
const defined = new Set([...shellCss.matchAll(/(--color-[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
export const attr = (tag: string, name: string) =>
  new RegExp(String.raw`(?:^|\s)${name}\s*=\s*"([^"]*)"`).exec(tag)?.[1];
export const tags = (svg: string) => [...svg.matchAll(/<([a-zA-Z][\w:-]*)\b([^>]*?)\/?>/g)];
export const texts = (svg: string) =>
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
