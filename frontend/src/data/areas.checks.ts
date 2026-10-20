// The floors of BR-015, kept out of the test module so the gate test and the planted-defect suite both import them.
import type { ContentPage } from './content.types';

const LANGS = ['en', 'es'] as const;
const words = (t: string) => t.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

/** The floors of BR-015, exported so the planted-defect suite runs the gate's own function. */
export function reproducibilityProblems(section: ContentPage['sections'][number]): string[] {
  const out: string[] = [];
  for (const lang of LANGS) {
    if (section.paragraphs.filter((p) => words(p[lang]) >= 40).length < 2)
      out.push(`${lang}: fewer than two dense paragraphs`);
    if (section.limit[lang].length <= 20) out.push(`${lang}: no limit`);
    if ((section.steps ?? []).length < 4) out.push(`${lang}: fewer than four steps`);
  }
  if ((section.table?.rows.length ?? 0) < 4) out.push('fewer than four table rows');
  return out;
}
