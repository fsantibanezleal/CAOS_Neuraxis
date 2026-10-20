import type { Bilingual } from '../lib/types';
export interface Formula {
  tex: string;
  caption: Bilingual;
}
/** The kind of a Methodology method (ADR-0017 section 2.1): the shell renders it as `data-method-kind`. */
export type MethodKind = 'classical' | 'learned';
export interface ContentSection {
  id: string;
  /** The area the section covers, from the vocabulary of its page (the shell's DOC_AREAS; ADR-0017 section 2.1). */
  area: string;
  /** Methodology only: whether the method is classical or learned. */
  kind?: MethodKind;
  title: Bilingual;
  paragraphs: Bilingual[];
  equations: Formula[];
  refs: string[];
  limit: Bilingual;
  nodes: Bilingual[];
  figure: Bilingual;
  symbols?: Bilingual[];
  steps?: Bilingual[];
  table?: { headers: Bilingual[]; rows: Bilingual[][] };
}
export interface ContentPage {
  title: Bilingual;
  lede: Bilingual;
  sections: ContentSection[];
}
