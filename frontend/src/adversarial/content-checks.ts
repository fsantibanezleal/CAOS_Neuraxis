// The content checks of the scientific pages (EW-003, OW-011): every equation parses, every section ends on resolvable references,
// and every reference is a full bibliographic entry. They restate the assertions of src/test/simulation.test.ts and
// src/data/citations.test.ts over data passed in, so a planted copy can be checked beside the real one.
import katex from 'katex';
import { CITATIONS } from '../data/citations';
import type { ContentPage } from '../data/content.types';
import { experiments } from '../data/experiments';
import { implementation } from '../data/implementation';
import { introduction } from '../data/introduction';
import { methodology } from '../data/methodology';

export const PAGES: Record<string, ContentPage> = {
  introduction,
  methodology,
  implementation,
  experiments,
};
export const KNOWN = new Set(CITATIONS.map((c) => c.id));

export function contentProblems(pages: Record<string, ContentPage>, known: Set<string>): string[] {
  const out: string[] = [];
  for (const [name, page] of Object.entries(pages))
    for (const s of page.sections) {
      for (const eq of s.equations) {
        try {
          katex.renderToString(eq.tex, { throwOnError: true });
        } catch {
          out.push(`${name}/${s.id}: equation does not parse`);
        }
      }
      if (s.refs.length === 0) out.push(`${name}/${s.id}: no final reference`);
      for (const id of s.refs)
        if (!known.has(id)) out.push(`${name}/${s.id}: final reference ${id} is not defined`);
    }
  return out;
}

/** A reference is a full entry when it has a label, the citation text and a DOI or a primary URL. */
export function entryProblems(
  items: Array<{ id: string; label?: unknown; citation?: unknown; doi?: string; url?: string }>,
): string[] {
  const out: string[] = [];
  for (const c of items) {
    if (!c.label) out.push(`${c.id}: no label`);
    if (!c.citation) out.push(`${c.id}: no bibliographic entry`);
    if (!c.doi && !c.url) out.push(`${c.id}: no DOI or URL`);
  }
  return out;
}
