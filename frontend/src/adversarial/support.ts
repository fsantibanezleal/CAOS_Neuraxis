// Shared helpers of the planted-defect suite (ADR-0075): read the committed tree, parse the product CSS, render in a language.
// Every plant works on a copy held in memory; nothing here writes to disk.
import { useLangStore } from '@fasl-work/caos-app-shell';
import { readFileSync } from 'node:fs';

const repo = new URL('../../../', import.meta.url);
export const read = (path: string) => readFileSync(new URL(path, repo), 'utf8');
export const readJSON = <T = any>(path: string): T => JSON.parse(read(path)) as T;

export interface CssRule {
  media: string;
  selector: string;
  decl: Record<string, string>;
}
/** The rules of a stylesheet with the @media condition they sit in ('' at the top level). Comments are dropped. */
export function parseCss(css: string): CssRule[] {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const rules: CssRule[] = [];
  const walk = (src: string, media: string) => {
    let i = 0;
    while (i < src.length) {
      const open = src.indexOf('{', i);
      if (open < 0) break;
      const head = src.slice(i, open).trim();
      let depth = 1;
      let j = open + 1;
      while (j < src.length && depth > 0) {
        depth += src[j] === '{' ? 1 : src[j] === '}' ? -1 : 0;
        j++;
      }
      const body = src.slice(open + 1, j - 1);
      if (head.startsWith('@media')) walk(body, head.slice(6).trim());
      else if (!head.startsWith('@')) {
        const decl: Record<string, string> = {};
        for (const d of body.split(';')) {
          const k = d.indexOf(':');
          if (k > 0) decl[d.slice(0, k).trim().toLowerCase()] = d.slice(k + 1).trim().toLowerCase();
        }
        for (const selector of head.split(',')) rules.push({ media, selector: selector.trim(), decl });
      }
      i = j;
    }
  };
  walk(text, '');
  return rules;
}
export const productCss = () => read('frontend/src/neuraxis.css') + '\n' + read('frontend/src/operations.css');

/**
 * Renders a component on the server with the shell language set to `lang`. A server render reads the language from the store's
 * initial state (the shell loads it once from localStorage), so the initial state is set here and put back afterwards.
 * `prepare` runs before the render (to preset localSession); `load` imports the component.
 */
export async function renderIn(
  lang: 'en' | 'es',
  load: () => Promise<{ default: unknown }>,
  options: { props?: Record<string, unknown>; route?: string; prepare?: () => Promise<void> } = {},
): Promise<string> {
  const initial = useLangStore.getInitialState() as { lang: 'en' | 'es' };
  const before = initial.lang;
  initial.lang = lang;
  try {
    await options.prepare?.();
    const [{ createElement }, { renderToString }, { MemoryRouter }, mod] = await Promise.all([
      import('react'),
      import('react-dom/server'),
      import('react-router-dom'),
      load(),
    ]);
    return renderToString(
      createElement(
        MemoryRouter,
        { initialEntries: [options.route ?? '/'] },
        createElement(mod.default as never, options.props ?? {}),
      ),
    );
  } finally {
    initial.lang = before;
  }
}
