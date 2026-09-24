import type { Bilingual } from '../lib/types';
export interface Formula {
  tex: string;
  caption: Bilingual;
}
export interface ContentSection {
  id: string;
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
