// Planted-defect tests of the benchmark-adequacy requirements (docs/design/features/benchmark-adequacy/validation.md, ADR-0075).
import { createHash, webcrypto } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadEpisode, loadVerifiedIndex } from '../api/artifacts';
import { implementation } from '../data/implementation';
import { read, renderIn } from './support';

// ---- BA-003: what the default route says about its policy
const STATEMENTS = {
  en: {
    routing: 'Routing here is deterministic: the first dependency-ready registered action runs.',
    noLearned: 'does not invoke the learned gate or an LLM',
  },
  es: {
    routing:
      'Aquí la selección es determinista: se ejecuta la primera acción registrada con dependencias listas.',
    noLearned: 'no usa el umbral aprendido ni un LLM',
  },
} as const;
const routeProblems = (html: string, lang: 'en' | 'es') => {
  const out: string[] = [];
  if (!html.includes(STATEMENTS[lang].routing))
    out.push(`${lang}: no deterministic ready-action statement`);
  if (!html.includes(STATEMENTS[lang].noLearned))
    out.push(`${lang}: no statement that the learned gate and the language model are not used`);
  if (/ReadyPolicy[^<]{0,80}(learned controller|controlador aprendido)/i.test(html))
    out.push(`${lang}: ReadyPolicy is called learned`);
  return out;
};
const readyPolicyParagraph = (section: { paragraphs: Array<{ en: string; es: string }> }) =>
  section.paragraphs.find((p) => p.en.includes('ReadyPolicy'));
const policyTextProblems = (p: { en: string; es: string } | undefined) => {
  if (!p) return ['no paragraph names ReadyPolicy'];
  const out: string[] = [];
  if (!p.en.includes('ReadyPolicy')) out.push('en: ReadyPolicy not named');
  if (!/dependency-ready action/.test(p.en)) out.push('en: no dependency-ready action');
  if (!/does not invoke the fitted allocation gate or a language model/.test(p.en))
    out.push('en: learned gate or language model not excluded');
  if (!/dependencias listas/.test(p.es)) out.push('es: no dependency-ready action');
  if (!/no invoca el umbral de asignación ajustado ni un modelo de lenguaje/.test(p.es))
    out.push('es: learned gate or language model not excluded');
  if (/learned controller|controlador aprendido/i.test(`${p.en} ${p.es}`))
    out.push('ReadyPolicy is called learned');
  return out;
};

// ---- BA-004: the browser hash-checks the semantic trace before it shows it
const sha256 = (bytes: string) => createHash('sha256').update(bytes).digest('hex');
const serve = (bytes: string) => {
  vi.stubGlobal('crypto', webcrypto);
  const fetcher = vi.fn(
    async () => new Response(bytes, { headers: { 'Content-Type': 'application/json' } }),
  );
  vi.stubGlobal('fetch', fetcher);
  return fetcher;
};

afterEach(() => vi.unstubAllGlobals());

describe('benchmark-adequacy planted defects', () => {
  it('adversarial: a default route that omits ReadyPolicy or calls it learned is rejected', async () => {
    const pages = {
      en: await renderIn('en', () => import('../components/Operations')),
      es: await renderIn('es', () => import('../components/Operations')),
    };
    for (const lang of ['en', 'es'] as const)
      expect(routeProblems(pages[lang], lang), lang).toEqual([]);
    const section = implementation.sections.find((s) => readyPolicyParagraph(s))!;
    expect(policyTextProblems(readyPolicyParagraph(section))).toEqual([]);

    // planted: the statement removed from the route, then the policy called a learned controller
    const stripped = pages.en
      .replace(STATEMENTS.en.routing, '')
      .replace(STATEMENTS.en.noLearned, '');
    expect(routeProblems(stripped, 'en')).toEqual([
      'en: no deterministic ready-action statement',
      'en: no statement that the learned gate and the language model are not used',
    ]);
    expect(
      routeProblems(pages.es.replace(STATEMENTS.es.noLearned, 'usa el umbral aprendido'), 'es'),
    ).toEqual(['es: no statement that the learned gate and the language model are not used']);
    expect(routeProblems(`${pages.en}<p>ReadyPolicy is a learned controller</p>`, 'en')).toEqual([
      'en: ReadyPolicy is called learned',
    ]);

    // planted: the documentation paragraph without the ReadyPolicy name, and with the gate not excluded
    const original = readyPolicyParagraph(section)!;
    expect(
      policyTextProblems({ en: original.en.replace('ReadyPolicy', 'The policy'), es: original.es }),
    ).toEqual(['en: ReadyPolicy not named']);
    expect(policyTextProblems(undefined)).toEqual(['no paragraph names ReadyPolicy']);
    expect(
      policyTextProblems({
        en: original.en.replace(
          'does not invoke the fitted allocation gate or a language model',
          'is a learned controller',
        ),
        es: original.es,
      }),
    ).toEqual(['en: learned gate or language model not excluded', 'ReadyPolicy is called learned']);
  });

  it('adversarial: a semantic trace with one changed byte is refused before display', async () => {
    const index = JSON.parse(read('data/derived/semantic-transfer/index.json')) as {
      episodes: Array<Record<string, any>>;
    };
    const ref = index.episodes[0];
    const bytes = read(`data/derived/semantic-transfer/${ref.path}`);
    const reference = { ...ref, path: `semantic-transfer/${ref.path}` } as Parameters<
      typeof loadEpisode
    >[0];
    // clean: the committed bytes match the index digest and the trace loads
    expect(sha256(bytes)).toBe(ref.sha256);
    serve(bytes);
    expect((await loadEpisode(reference)).run_id).toBe(ref.run_id);
    // planted: one byte of the trace changed, the digest of the index left alone
    const at = bytes.indexOf('"status"');
    const flipped = bytes.slice(0, at + 1) + 'S' + bytes.slice(at + 2);
    expect(flipped).not.toBe(bytes);
    expect(flipped.length).toBe(bytes.length);
    serve(flipped);
    await expect(loadEpisode(reference)).rejects.toThrow('SHA-256 mismatch');
    // planted: one byte of the separate index changed, the digest of the report left alone
    const indexBytes = read('data/derived/semantic-transfer/index.json');
    serve(indexBytes);
    expect(
      (await loadVerifiedIndex('semantic-transfer/index.json', sha256(indexBytes))).episodes.length,
    ).toBe(index.episodes.length);
    serve(indexBytes.replace('M01', 'M02'));
    await expect(
      loadVerifiedIndex('semantic-transfer/index.json', sha256(indexBytes)),
    ).rejects.toThrow('SHA-256 mismatch');
  });
});
