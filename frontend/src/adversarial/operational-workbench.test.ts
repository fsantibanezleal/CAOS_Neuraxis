// Planted-defect tests of the operational-workbench requirements (docs/design/features/operational-workbench/validation.md, ADR-0075).
// The components are rendered on the server (no browser, ADR-0074) and the plants are made on the markup, the session they read,
// the stylesheets and the documents they show; the measured browser gates stay in frontend/scripts/.
import { createHash, webcrypto } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadEpisode } from '../api/artifacts';
import { CITATIONS } from '../data/citations';
import type { ContentPage } from '../data/content.types';
import { KNOWN, PAGES, contentProblems, entryProblems } from './content-checks';
import { scrollTraps } from './css-checks';
import { productCss, read, readJSON, renderIn } from './support';

// ---- OW-001: the first screen names a task, its inputs and its expected output
const FIRST_SCREEN = {
  en: { task: 'Task<select>', input: 'op-input-card', output: 'Expected deliverables' },
  es: { task: 'Tarea<select>', input: 'op-input-card', output: 'Entregables esperados' },
} as const;
const firstScreenProblems = (html: string, lang: 'en' | 'es') => {
  const out: string[] = [];
  if (!html.includes(`<label class="nx-control">${FIRST_SCREEN[lang].task}`)) out.push(`${lang}: no task`);
  if (!html.includes(`class="${FIRST_SCREEN[lang].input}"`)) out.push(`${lang}: no input`);
  if (!html.includes(`<span>${FIRST_SCREEN[lang].output}</span>`)) out.push(`${lang}: no expected output`);
  return out;
};

// ---- OW-006: a node shows only what was measured for it
type Node = { id: string; state: string; history: unknown[]; title: { en: string; es: string }; depends_on: string[]; output: string; error: null };
const hasReceipt = (node: Node) => node.history.some((h) => (h as { kind?: string }).kind === 'effect');
const inventedStatuses = (html: string, nodes: Node[]) => {
  const out: string[] = [];
  const shown = [...html.matchAll(/<button class="op-node[^"]*" data-state="([a-z_]+)"/g)];
  const succeeded = shown.filter((m) => m[1] === 'succeeded').length;
  const measured = nodes.filter(hasReceipt).length;
  if (succeeded > measured) out.push(`${succeeded - measured} node(s) shown as succeeded without a receipt`);
  if (html.includes('Output produced and checked') && !nodes.some(hasReceipt)) out.push('an output is claimed as produced and checked');
  if (html.includes('Native receipt') && !nodes.some(hasReceipt)) out.push('a native receipt is shown');
  return out;
};

// ---- OW-008: a matched run is shown only after its bytes match the digest of the index
const sha256 = (bytes: string) => createHash('sha256').update(bytes).digest('hex');
const loadsMatchedRunsThroughTheDigestCheck = (source: string) => /loadEpisode\(/.test(source) && !/\bfetch\(/.test(source);

// ---- OW-009: every control has an accessible name
const unnamedControls = (html: string): string[] => {
  const out: string[] = [];
  const tokens = [...html.matchAll(/<(\/?)(button|select|input|textarea|label)\b([^>]*)>/gi)];
  let labels = 0;
  tokens.forEach((t, i) => {
    const [, close, tag, attrs] = t;
    const name = tag.toLowerCase();
    if (name === 'label') {
      labels += close ? -1 : 1;
      return;
    }
    if (close) return;
    if (/\btype="(hidden|file)"/.test(attrs) || /\bhidden(=|\s|$)/.test(attrs)) return;
    if (/\baria-label="[^"]+"/.test(attrs) || /\baria-labelledby="[^"]+"/.test(attrs)) return;
    if (name === 'button') {
      const end = tokens.slice(i + 1).find((x) => x[1] && x[2].toLowerCase() === 'button');
      const text = html
        .slice(t.index! + t[0].length, end?.index ?? t.index! + t[0].length)
        .replace(/<svg[\s\S]*?<\/svg>/g, '')
        .replace(/<[^>]+>/g, '')
        .trim();
      if (!text && !/\btitle="[^"]+"/.test(attrs)) out.push(`button without a name: ${t[0].slice(0, 70)}`);
    } else if (labels <= 0 && !/\btitle="[^"]+"/.test(attrs)) out.push(`${name} without a label: ${t[0].slice(0, 70)}`);
  });
  return out;
};

// ---- OW-013: the selected mode and the cancellation handle survive a route change
const restoresRunAcrossRoutes = (workspaceHtml: string) =>
  /<button class="nx-button"(?! disabled)[^>]*>(?:<svg(?:(?!<\/svg>)[\s\S])*<\/svg>)?Cancel<\/button>/.test(workspaceHtml);
const keepsModeInTheUrl = (source: string) => /deepLinkView="mode"/.test(source) && /localSession\.mode = id/.test(source);
const keepsSessionAcrossRoutes = (source: string) =>
  /useState<WorkflowRun \| null>\(\(saved\?\.run as WorkflowRun\) \?\? null\)/.test(source) &&
  /localSession\.workspace = \{ recipe, run \}/.test(source);

const doc = readJSON('data/operations/data-compound-70000.json') as { inputs: unknown[]; nodes: Node[] };

afterEach(() => vi.unstubAllGlobals());

describe('operational-workbench planted defects', () => {
  it('adversarial: a first screen without task, input or expected output is rejected', async () => {
    const pages = { en: await renderIn('en', () => import('../components/Operations')), es: await renderIn('es', () => import('../components/Operations')) };
    for (const lang of ['en', 'es'] as const) expect(firstScreenProblems(pages[lang], lang), lang).toEqual([]);
    const en = pages.en;
    expect(firstScreenProblems(en.replace('<label class="nx-control">Task<select>', '<label class="nx-control">Mode<select>'), 'en')).toEqual(['en: no task']);
    expect(firstScreenProblems(en.replace('class="op-input-card"', 'class="op-x"'), 'en')).toEqual(['en: no input']);
    expect(firstScreenProblems(en.replace('<span>Expected deliverables</span>', '<span></span>'), 'en')).toEqual(['en: no expected output']);
    expect(firstScreenProblems(pages.es.replace('<span>Entregables esperados</span>', ''), 'es')).toEqual(['es: no expected output']);
  });

  it('adversarial: a node without a receipt shows nothing invented', async () => {
    const unreceipted = doc.nodes.map((n) => ({ ...n, history: [], state: 'pending' }));
    const session = async (nodes: Node[]) => {
      const { localSession } = await import('../lib/session');
      localSession.operations = { task: 'data', variant: 'compound', seed: 70000, files: doc.inputs, nodes, uploaded: false, run: null };
    };
    const clean = await renderIn('en', () => import('../components/Operations'), { prepare: () => session(unreceipted) });
    expect(clean).toContain('This action receives only its declared inputs');
    expect(inventedStatuses(clean, unreceipted)).toEqual([]);
    // the recorded nodes, which do carry receipts, are not flagged
    const measured = await renderIn('en', () => import('../components/Operations'), { prepare: () => session(doc.nodes) });
    expect(doc.nodes.every(hasReceipt)).toBe(true);
    expect(inventedStatuses(measured, doc.nodes)).toEqual([]);
    // planted: the same nodes without receipts, but marked succeeded and with an output claimed in the inspector
    const claimed = doc.nodes.map((n) => ({ ...n, history: [], state: 'succeeded' }));
    const lying = await renderIn('en', () => import('../components/Operations'), { prepare: () => session(claimed) });
    expect(inventedStatuses(lying, claimed)).toEqual([`${claimed.length} node(s) shown as succeeded without a receipt`]);
    expect(inventedStatuses(`${clean}<div class="op-inspector-stat">Output produced and checked</div><summary>Native receipt</summary>`, unreceipted)).toEqual([
      'an output is claimed as produced and checked',
      'a native receipt is shown',
    ]);
  });

  it('adversarial: a matched run that fails its digest is not shown', async () => {
    const index = readJSON('data/derived/index.json') as { episodes: Array<Record<string, any>> };
    const [first, second] = index.episodes;
    const bytes = (ref: Record<string, any>) => read(`data/derived/${ref.path}`);
    const serve = (body: string) => {
      vi.stubGlobal('crypto', webcrypto);
      vi.stubGlobal('fetch', vi.fn(async () => new Response(body, { headers: { 'Content-Type': 'application/json' } })));
    };
    // clean: both matched runs load against their digests
    for (const ref of [first, second]) {
      expect(sha256(bytes(ref))).toBe(ref.sha256);
      serve(bytes(ref));
      expect((await loadEpisode(ref as never)).run_id).toBe(ref.run_id);
    }
    // planted: the episode bytes differ from the index digest by one byte, so the pair is rejected and nothing is shown
    const changed = bytes(second).replace('"status"', '"Status"');
    expect(changed).not.toBe(bytes(second));
    serve(changed);
    await expect(Promise.all([loadEpisode(second as never)])).rejects.toThrow('SHA-256 mismatch');
    // the investigation view loads its matched runs through that check, and a copy that reads them raw is caught
    const source = read('frontend/src/components/Investigations.tsx');
    expect(loadsMatchedRunsThroughTheDigestCheck(source)).toBe(true);
    expect(loadsMatchedRunsThroughTheDigestCheck(source.replace(/loadEpisode\(r!, abort\.signal\)/, 'fetch(r!.path).then((x) => x.json())'))).toBe(false);
  });

  it('adversarial: a control without an accessible name in both languages is reported', async () => {
    const pages = { en: await renderIn('en', () => import('../components/Operations')), es: await renderIn('es', () => import('../components/Operations')) };
    expect(unnamedControls(pages.en)).toEqual([]);
    expect(unnamedControls(pages.es)).toEqual([]);
    const planted = (html: string, lang: string) => {
      const out = html.replace('<div class="op-input-card">', '<div class="op-input-card"><button class="op-x"><svg viewBox="0 0 1 1"></svg></button><select><option>a</option></select>');
      expect(out, lang).not.toBe(html);
      return out;
    };
    // planted in one language only: the other language stays clean
    expect(unnamedControls(planted(pages.es, 'es'))).toHaveLength(2);
    expect(unnamedControls(planted(pages.es, 'es'))[0]).toContain('button without a name');
    expect(unnamedControls(planted(pages.es, 'es'))[1]).toContain('select without a label');
    expect(unnamedControls(pages.en)).toEqual([]);
    expect(unnamedControls(planted(pages.en, 'en'))).toHaveLength(2);
  });

  it('adversarial: a missing full entry or an unreadable equation fails the page check', () => {
    expect(contentProblems(PAGES, KNOWN)).toEqual([]);
    expect(entryProblems(CITATIONS)).toEqual([]);
    const copy = structuredClone(PAGES) as Record<string, ContentPage>;
    const section = copy.experiments.sections[0];
    const dropped = section.refs[0];
    const without = new Set([...KNOWN].filter((id) => id !== dropped));
    expect(contentProblems(copy, without)).toEqual(expect.arrayContaining([`experiments/${section.id}: final reference ${dropped} is not defined`]));
    copy.implementation.sections[0].equations[0].tex = '\\begin{matrix} a';
    expect(contentProblems(copy, KNOWN)).toEqual([`implementation/${copy.implementation.sections[0].id}: equation does not parse`]);
    const stripped = CITATIONS.map((c, i) => (i === 0 ? { ...c, citation: '' } : c));
    expect(entryProblems(stripped)).toEqual([`${CITATIONS[0].id}: no bibliographic entry`]);
  });

  it('adversarial: a page that traps vertical scrolling is reported', () => {
    const css = productCss();
    for (const vw of [1280, 390]) expect(scrollTraps(css, vw), String(vw)).toEqual([]);
    const desktop = `${css}\nbody { overflow: hidden; }`;
    expect(scrollTraps(desktop, 1280)).toEqual(['body: the page root hides its overflow']);
    expect(scrollTraps(desktop, 390)).toEqual(['body: the page root hides its overflow']);
    const phone = `${css}\n@media (max-width: 760px) { .nx-doc { height: 100dvh; overflow-y: clip; } }`;
    expect(scrollTraps(phone, 390)).toEqual(['.nx-doc @media (max-width: 760px): fixed height with hidden overflow']);
    expect(scrollTraps(phone, 1280)).toEqual([]);
  });

  it('adversarial: a route change that drops the mode or the cancel handle is caught', async () => {
    const run = { run_id: 'r1', status: 'running', events: [], workflow: {} };
    const render = (workspace: Record<string, unknown> | undefined) =>
      renderIn('en', () => import('../components/Workspace'), {
        props: { token: 'token', onBack: () => undefined },
        prepare: async () => {
          const { localSession } = await import('../lib/session');
          localSession.workspace = workspace;
        },
      });
    // clean: the session kept across the route change restores the active run with its Cancel control enabled
    expect(restoresRunAcrossRoutes(await render({ recipe: '{}', run }))).toBe(true);
    // planted: the session reset by the route change, and a run already finished
    expect(restoresRunAcrossRoutes(await render(undefined))).toBe(false);
    expect(restoresRunAcrossRoutes(await render({ recipe: '{}', run: { ...run, status: 'succeeded' } }))).toBe(false);
    // the source that keeps them: the session effect and the restored initial state, and the mode in the URL
    const workspace = read('frontend/src/components/Workspace.tsx');
    expect(keepsSessionAcrossRoutes(workspace)).toBe(true);
    expect(keepsSessionAcrossRoutes(workspace.replace('localSession.workspace = { recipe, run };', ''))).toBe(false);
    const workbench = read('frontend/src/pages/OperationsWorkbench.tsx');
    expect(keepsModeInTheUrl(workbench)).toBe(true);
    expect(keepsModeInTheUrl(workbench.replace('deepLinkView="mode"', ''))).toBe(false);
    expect(keepsModeInTheUrl(workbench.replace('localSession.mode = id', ''))).toBe(false);
  });
});
