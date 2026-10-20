// Static layout checks over the product stylesheets, for the requirements whose gate is a browser measurement (EW-005 to EW-008,
// EW-010, OW-012). A browser is never started in `npm test` (ADR-0074): each check reads the rules a reader's viewport would apply
// and reports the declarations that would clip a control, cap the reading measure, trap the vertical scroll or hide the
// references. The measured gates in frontend/scripts/ stay the proof in a browser; these checks are what a planted rule meets in CI.
import { parseCss, type CssRule } from './support';

/** Reading-page roots: the product's own and the shell's, never the App workbench (`.nx-layout`, scoped to the desktop App). */
const READING = /(^|[\s>])(\.nx-doc(-pane|-section)?|\.nx-benchmark(-body)?|\.page-body|\.prose|\.measure|\.lede|\.caos-doc-[a-z-]+|\[data-doc-[a-z-]+\])(?![\w-])/;
const PAGE_ROOT = /^(html|body)$/;
const CONTROL = /(^|[\s>])(button|select|input|textarea|\.nx-button|\.btn|\.nx-control|\.tab|\[role="?tab"?\])(?![\w-])/;

/** Whether a rule's @media condition holds at a viewport width (height conditions are taken as holding). */
export function mediaApplies(media: string, vw: number): boolean {
  if (!media) return true;
  for (const m of media.matchAll(/\((max|min)-width:\s*([\d.]+)px\)/g)) {
    const n = Number(m[2]);
    if (m[1] === 'max' && vw > n) return false;
    if (m[1] === 'min' && vw < n) return false;
  }
  return true;
}
const active = (rules: CssRule[], vw: number) => rules.filter((r) => mediaApplies(r.media, vw));
const px = (value: string | undefined) => {
  const m = /^([\d.]+)px$/.exec(value ?? '');
  return m ? Number(m[1]) : undefined;
};
const FIXED_LENGTH = /^[\d.]+(px|vh|dvh|svh|rem|em)$/;
const describe = (r: CssRule) => `${r.selector}${r.media ? ` @media ${r.media}` : ''}`;

/** A fixed height with hidden or clipped overflow on a reading page, or a hidden overflow on the page root: the reader cannot scroll. */
export function scrollTraps(css: string, vw: number): string[] {
  const out: string[] = [];
  for (const r of active(parseCss(css), vw)) {
    const hidden = ['overflow', 'overflow-y'].some((k) => /^(hidden|clip)\b/.test(r.decl[k] ?? ''));
    if (!hidden) continue;
    const fixedHeight = ['height', 'max-height'].some((k) => FIXED_LENGTH.test(r.decl[k] ?? ''));
    if (READING.test(r.selector) && fixedHeight) out.push(`${describe(r)}: fixed height with hidden overflow`);
    if (PAGE_ROOT.test(r.selector)) out.push(`${describe(r)}: the page root hides its overflow`);
  }
  return out;
}

/** A custom width cap on a reading page: anything but the shell's own measure, 100% or none. */
export function widthCaps(css: string, vw: number): string[] {
  const out: string[] = [];
  for (const r of active(parseCss(css), vw)) {
    if (!READING.test(r.selector)) continue;
    for (const k of ['max-width', 'width']) {
      const v = r.decl[k];
      if (v && !/^(100%|none|auto|min-content|max-content|fit-content)$/.test(v) && !/^var\(--(maxw|maxw-wide|measure|measure-text)\)$/.test(v) && !/^min\(100%/.test(v))
        out.push(`${describe(r)}: ${k} ${v}`);
    }
  }
  return out;
}

/** A control whose fixed width cannot fit the viewport (a 16 px gutter on each side). */
export function wideControls(css: string, vw: number): string[] {
  const out: string[] = [];
  for (const r of active(parseCss(css), vw)) {
    if (!CONTROL.test(r.selector)) continue;
    for (const k of ['width', 'min-width']) {
      const n = px(r.decl[k]);
      if (n !== undefined && n > vw - 32) out.push(`${describe(r)}: ${k} ${n}px in a ${vw}px viewport`);
    }
  }
  return out;
}

/** The references block of a page or topic made unreachable: removed, invisible or moved out of the page. */
export function hiddenReferences(css: string, vw: number): string[] {
  const out: string[] = [];
  for (const r of active(parseCss(css), vw)) {
    if (!/(doc-references|data-doc-references|\.references|\.nx-doc-section)/.test(r.selector)) continue;
    const d = r.decl;
    const offscreen = ['top', 'left', 'inset-block-start', 'inset-inline-start'].some((k) => (px(d[k]) ?? 0) < 0 || /^-/.test(d[k] ?? ''));
    if (d.display === 'none' || d.visibility === 'hidden' || (/^(fixed|absolute)$/.test(d.position ?? '') && offscreen) || (d['max-height'] === '0' || d.height === '0'))
      out.push(`${describe(r)}: the references would not be reachable`);
  }
  return out;
}
