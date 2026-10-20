// The executive view's data file (content/executive.json, contract `executive`): valid against the shell's schema 2.0.0 and its
// writing limits through the shell's own validator, the 4 C's in their order, the cause weights, the owners as roles, the
// sources by id, the illustrations under frontend/public/, the four flip groups as small cards, and no model or vendor name.
import { readFileSync } from 'node:fs';
import { FLIP_LIMITS, FOUR_CS, validateExecutive } from '@fasl-work/caos-app-shell';
import { describe, expect, it } from 'vitest';

type Bi = { en: string; es: string };
type Lang = keyof Bi;
const LANGS: Lang[] = ['en', 'es'];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const executive: any = JSON.parse(readFileSync(new URL('../../../content/executive.json', import.meta.url), 'utf8'));

const words = (t: string) => t.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

/** The labels the shell prints on the back of a card, so a back is counted as the gate counts it. */
const LABELS = {
  cost: { en: 'Cost', es: 'Costo' },
  measure: { en: 'Measured by', es: 'Se mide por' },
  decides: { en: 'Decides', es: 'Decide' },
  needs: { en: 'Needs', es: 'Necesita' },
  achieves: { en: 'Achieves', es: 'Logra' },
  fallsShort: { en: 'Falls short', es: 'Se queda corto' },
} satisfies Record<string, Bi>;

type Row = Record<string, Bi>;
type Group = { rows: Row[]; title: (r: Row) => Bi; back: (r: Row, i: number) => Array<[Bi | null, Bi]>; extra: number };
const FLIP_GROUPS: Record<string, Group> = {
  'pain.bearers': { rows: executive.pain.bearers, title: (r) => r.who, back: (r) => [[LABELS.cost, r.cost], [LABELS.measure, r.measure]], extra: 0 },
  'situation.roles': { rows: executive.situation.roles, title: (r) => r.role, back: (r) => [[LABELS.decides, r.decides], [LABELS.needs, r.needs]], extra: 0 },
  'situation.state_of_the_art': {
    rows: executive.situation.state_of_the_art,
    title: (r) => r.approach,
    back: (r) => [[LABELS.achieves, r.achieves], [LABELS.fallsShort, r.falls_short]],
    extra: 2, // the label "Source" and its numbered mark
  },
  'proposal.four_cs': { rows: executive.proposal.four_cs, title: (r) => r.c, back: (r, i) => [[null, FOUR_CS[i].definition], [null, r.applies]], extra: 0 },
};

/** Counts of every flip card, one entry per card and language. */
export function flipCounts() {
  const out: Array<{ path: string; lang: Lang; title: number; back: number }> = [];
  for (const [path, g] of Object.entries(FLIP_GROUPS)) {
    g.rows.forEach((row, i) => {
      for (const lang of LANGS) {
        const back = g.back(row, i).reduce((n, [label, t]) => n + (label ? words(label[lang]) : 0) + words(t[lang]), 0) + g.extra;
        out.push({ path: `${path}[${i}]`, lang, title: words(g.title(row)[lang]), back });
      }
    });
  }
  return out;
}

const citations = (): string[] => {
  const out: string[] = [];
  const walk = (n: unknown) => {
    if (Array.isArray(n)) n.forEach(walk);
    else if (n && typeof n === 'object') {
      for (const [k, v] of Object.entries(n)) {
        if (k === 'source' && typeof v === 'string') out.push(v);
        else walk(v);
      }
    }
  };
  walk({ ...executive, sources: undefined });
  return out;
};

/** Model and vendor names: the agents the long-workflow benchmark paper evaluates, the model families of the routing and
 * guardrail papers of the dossier, and the vendors behind them. The view says "the best agent". */
const NAMED = [
  'Claude', 'Anthropic', 'Opus', 'Sonnet', 'Haiku', 'GPT', 'OpenAI', 'ChatGPT', 'Gemini', 'Google', 'Llama', 'Meta AI', 'Qwen',
  'DeepSeek', 'Mistral', 'Grok', 'xAI', 'Microsoft', 'Amazon', 'LangChain', 'LangGraph', 'Temporal',
];

describe('the executive view data file', () => {
  it('is valid against schema 2.0.0 and its writing limits', () => {
    const problems = validateExecutive(executive);
    expect(problems.map((p: { path: string; message: string }) => `${p.path}: ${p.message}`)).toEqual([]);
  });

  it("has the 4 C's as Choice, Context, Cost, Control, in that order, in both languages", () => {
    expect(executive.proposal.four_cs.map((c: { c: Bi }) => c.c)).toEqual([
      { en: 'Choice', es: 'Elección' },
      { en: 'Context', es: 'Contexto' },
      { en: 'Cost', es: 'Costo' },
      { en: 'Control', es: 'Control' },
    ]);
  });

  it('weights the causes in whole percents that add to at most 100', () => {
    const w: number[] = executive.pain.causes.map((c: { weight: number }) => c.weight);
    expect(w.every((x) => Number.isInteger(x) && x >= 1)).toBe(true);
    expect(w.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(100);
  });

  it('names every action owner as a role of the current situation, in both languages', () => {
    const roles: Bi[] = executive.situation.roles.map((r: { role: Bi }) => r.role);
    for (const a of executive.proposal.actions as { owner: Bi }[]) {
      expect(roles.some((r) => r.en === a.owner.en && r.es === a.owner.es), a.owner.en).toBe(true);
    }
  });

  it('cites only sources that exist, cites every source, and names at most six per sub-tab', () => {
    const ids: string[] = executive.sources.map((s: { id: string }) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    const cited = new Set(citations());
    for (const c of cited) expect(ids, c).toContain(c);
    for (const id of ids) expect(cited.has(id), id).toBe(true);
    const per: Record<string, string[]> = {
      pain: executive.pain.figures.map((f: { source: string }) => f.source),
      context: executive.context.evidence.map((e: { source: string }) => e.source),
      situation: [...executive.situation.state_of_the_art.map((a: { source: string }) => a.source), executive.situation.status.source],
      trends: executive.trends.items.map((t: { signal: { source: string } }) => t.signal.source),
    };
    for (const [tab, list] of Object.entries(per)) expect(new Set(list).size, tab).toBeLessThanOrEqual(6);
    for (const s of executive.sources as { url: string }[]) expect(s.url).toMatch(/^https:\/\/\S+$/);
  });

  it('puts the three illustrations under frontend/public/', () => {
    expect(Object.keys(executive.illustrations).sort()).toEqual(['pain', 'proposal', 'situation']);
    for (const name of ['pain', 'situation', 'proposal']) {
      const file = executive.illustrations[name].file as string;
      expect(file).toBe(`executive/${name}.svg`);
      expect(file.startsWith('/') || file.includes('..')).toBe(false);
    }
  });

  it('keeps every flip card small in both languages (shell gate G16)', () => {
    const counts = flipCounts();
    expect(counts.length).toBe(2 * (5 + 5 + 5 + 4));
    for (const c of counts) {
      expect(c.title, `${c.path} ${c.lang} title`).toBeLessThanOrEqual(FLIP_LIMITS.title[c.lang]);
      expect(c.back, `${c.path} ${c.lang} back`).toBeLessThanOrEqual(FLIP_LIMITS.back[c.lang]);
    }
  });

  it('carries both languages in every text', () => {
    const walk = (n: unknown, path: string): void => {
      if (Array.isArray(n)) n.forEach((v, i) => walk(v, `${path}[${i}]`));
      else if (n && typeof n === 'object') {
        const o = n as Record<string, unknown>;
        if (typeof o.en === 'string' && typeof o.es === 'string' && Object.keys(o).length === 2) {
          expect(Boolean(o.en.trim() && o.es.trim()), path).toBe(true);
          return;
        }
        for (const [k, v] of Object.entries(o)) walk(v, `${path}.${k}`);
      }
    };
    walk(executive, 'executive');
  });

  it('names no model, no AI vendor and no client (the view says "the best agent")', () => {
    const body = JSON.stringify({ ...executive, sources: executive.sources.map((s: { title: Bi; note?: Bi }) => ({ title: s.title, note: s.note })) });
    for (const n of NAMED) expect(body, n).not.toMatch(new RegExp(`\\b${n}\\b`));
    expect(body).not.toMatch(/\b(our client|nuestro cliente|this product|este producto|Neuraxis)\b/i);
  });

  it('holds no item the research marks unverified', () => {
    expect(JSON.stringify(executive)).not.toMatch(/\b351\b|Gartner|McKinsey|Omnibus/);
  });
});
